"""Scan Endpoints: Multi-vector threat analysis for URLs, messages, images, and QR payloads."""

import base64
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Request, UploadFile, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.agents.orchestrator import InvestigationResult, orchestrator
from app.core.config import settings
from app.core.database import get_supabase_client
from app.core.logging import logger
from app.core.security import get_current_user, get_optional_user, limiter
from app.schemas.requests import (
    ImageScanRequest,
    MessageScanRequest,
    QRScanRequest,
    URLScanRequest,
)
from app.schemas.responses import (
    RiskLevel,
    ScanResult,
    ScanStatus,
    ThreatCategory,
    ThreatIndicatorResponse,
)

scan_router = APIRouter()


async def save_investigation_record(inv: InvestigationResult) -> None:
    """Persist investigation and extracted indicators to Supabase."""
    try:
        supabase = get_supabase_client()
        inv_record = {
            "id": inv.investigation_id,
            "user_id": inv.user_id,
            "title": f"{inv.input_type.upper()} Scan: {inv.input_data[:50]}",
            "input_type": inv.input_type,
            "input_data": inv.input_data,
            "status": inv.status,
            "risk_score": inv.risk_score,
            "risk_level": inv.risk_level,
            "summary": inv.summary,
            "full_report": {
                "agent_findings": inv.agent_findings,
                "execution_time_ms": inv.execution_time_ms,
            },
            "created_at": inv.created_at,
            "updated_at": inv.created_at,
        }
        supabase.table("investigations").insert(inv_record).execute()

        # Insert indicators
        if inv.threat_indicators:
            indicators_payload = []
            for ind in inv.threat_indicators:
                indicators_payload.append({
                    "id": str(uuid.uuid4()),
                    "investigation_id": inv.investigation_id,
                    "indicator_type": ind.get("type", "unknown"),
                    "indicator_value": ind.get("value", "")[:1000],
                    "confidence": ind.get("confidence", 1.0),
                    "severity": ind.get("severity", "medium"),
                    "source": ind.get("source", "agent"),
                    "description": ind.get("description", ""),
                    "created_at": inv.created_at,
                })
            supabase.table("threat_indicators").insert(indicators_payload).execute()

        # Log security event if risk is high
        if inv.risk_level in ("high", "critical"):
            event_record = {
                "id": str(uuid.uuid4()),
                "user_id": inv.user_id,
                "event_type": "threat_blocked" if inv.risk_level == "critical" else "phishing_alert",
                "severity": inv.risk_level,
                "details": {
                    "investigation_id": inv.investigation_id,
                    "input_type": inv.input_type,
                    "risk_score": inv.risk_score,
                    "summary": inv.summary,
                },
                "created_at": inv.created_at,
            }
            supabase.table("security_events").insert(event_record).execute()

        logger.info("investigation_persisted", id=inv.investigation_id, risk_score=inv.risk_score)
    except Exception as exc:
        logger.error("persist_investigation_failed", error=str(exc))


def to_scan_result(inv: InvestigationResult) -> ScanResult:
    """Format InvestigationResult to standard ScanResult response."""
    indicators = [
        ThreatIndicatorResponse(
            type=ind.get("type", "unknown"),
            value=ind.get("value", ""),
            severity=ind.get("severity", "medium"),
            confidence=ind.get("confidence", 1.0),
            description=ind.get("description"),
            source=ind.get("source", "heuristics"),
        )
        for ind in inv.threat_indicators
    ]

    # Map threat category to enum safely
    cat_str = inv.threat_category.lower()
    valid_categories = {c.value for c in ThreatCategory}
    if cat_str not in valid_categories:
        cat_str = "unknown"

    return ScanResult(
        scan_id=inv.investigation_id,
        target=inv.input_data,
        target_type=inv.input_type,
        status=ScanStatus.COMPLETED,
        risk_score=inv.risk_score,
        risk_level=RiskLevel(inv.risk_level),
        threat_category=ThreatCategory(cat_str),
        summary=inv.summary,
        indicators=indicators,
        recommendations=inv.recommendations,
        details={
            "agent_findings": inv.agent_findings,
            "execution_time_ms": inv.execution_time_ms,
        },
        created_at=inv.created_at,
    )


@scan_router.post(
    "/url",
    response_model=ScanResult,
    summary="Scan URL for threats, phishing, and homograph spoofing",
)
@limiter.limit(settings.RATE_LIMIT)
async def scan_url(
    request: Request,
    payload: URLScanRequest,
    background_tasks: BackgroundTasks,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
) -> ScanResult:
    """Execute multi-agent inspection of target URL."""
    user_id = current_user.get("id") if current_user else None
    inv = await orchestrator.investigate(
        input_type="url",
        input_data=payload.url,
        user_id=user_id,
        metadata={"depth": payload.depth, "tags": payload.tags},
    )
    background_tasks.add_task(save_investigation_record, inv)
    return to_scan_result(inv)


@scan_router.post(
    "/message",
    response_model=ScanResult,
    summary="Scan text message for banking, UPI, KYC, and job scams",
)
@limiter.limit(settings.RATE_LIMIT)
async def scan_message(
    request: Request,
    payload: MessageScanRequest,
    background_tasks: BackgroundTasks,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
) -> ScanResult:
    """Execute social engineering and fraud analysis on message text."""
    user_id = current_user.get("id") if current_user else None
    inv = await orchestrator.investigate(
        input_type="message",
        input_data=payload.message,
        user_id=user_id,
        metadata={
            "sender": payload.sender,
            "channel": payload.channel,
            "metadata": payload.metadata,
        },
    )
    background_tasks.add_task(save_investigation_record, inv)
    return to_scan_result(inv)


@scan_router.post(
    "/image",
    response_model=ScanResult,
    summary="Upload image file or base64 stream for visual security analysis",
)
@limiter.limit(settings.RATE_LIMIT)
async def scan_image(
    request: Request,
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    payload: Optional[ImageScanRequest] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
) -> ScanResult:
    """Analyze uploaded screenshot or document for fraudulent QR codes and malicious text."""
    user_id = current_user.get("id") if current_user else None

    # Support either multipart file upload or JSON base64 body
    if file is not None:
        # Validate MIME type
        content_type = file.content_type or ""
        if not (content_type.startswith("image/") or file.filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Please upload a PNG, JPEG, or WebP image.",
            )
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds maximum permitted limit (10MB).",
            )
        b64_data = base64.b64encode(contents).decode("utf-8")
        filename = file.filename
    elif payload is not None and payload.image_base64:
        b64_data = payload.image_base64
        filename = payload.filename
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a multipart image file or image_base64 JSON payload is required.",
        )

    inv = await orchestrator.investigate(
        input_type="image",
        input_data=b64_data,
        user_id=user_id,
        metadata={"filename": filename},
    )
    background_tasks.add_task(save_investigation_record, inv)
    return to_scan_result(inv)


@scan_router.post(
    "/qr",
    response_model=ScanResult,
    summary="Scan QR code text or image for malicious UPI redirects",
)
@limiter.limit(settings.RATE_LIMIT)
async def scan_qr(
    request: Request,
    payload: QRScanRequest,
    background_tasks: BackgroundTasks,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
) -> ScanResult:
    """Inspect decoded QR string or QR image payload."""
    user_id = current_user.get("id") if current_user else None

    if payload.qr_content:
        inv = await orchestrator.investigate(
            input_type="qr",
            input_data=payload.qr_content,
            user_id=user_id,
        )
    elif payload.image_base64:
        inv = await orchestrator.investigate(
            input_type="image",
            input_data=payload.image_base64,
            user_id=user_id,
            metadata={"filename": "qr_code.png"},
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either qr_content string or image_base64.",
        )

    background_tasks.add_task(save_investigation_record, inv)
    return to_scan_result(inv)


@scan_router.get(
    "/{scan_id}",
    response_model=ScanResult,
    summary="Retrieve completed scan result by scan_id",
)
@limiter.limit(settings.RATE_LIMIT)
async def get_scan_result(
    request: Request,
    scan_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
) -> ScanResult:
    """Fetch stored investigation findings from Supabase."""
    supabase = get_supabase_client()
    res = supabase.table("investigations").select("*").eq("id", scan_id).execute()

    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan investigation with ID {scan_id} not found.",
        )

    row = res.data[0]

    # Fetch indicators
    ind_res = supabase.table("threat_indicators").select("*").eq("investigation_id", scan_id).execute()
    indicators = [
        ThreatIndicatorResponse(
            type=r.get("indicator_type", "unknown"),
            value=r.get("indicator_value", ""),
            severity=r.get("severity", "medium"),
            confidence=r.get("confidence", 1.0),
            description=r.get("description"),
            source=r.get("source", "heuristics"),
        )
        for r in (ind_res.data or [])
    ]

    return ScanResult(
        scan_id=row["id"],
        target=row["input_data"],
        target_type=row["input_type"],
        status=ScanStatus(row.get("status", "completed")),
        risk_score=row["risk_score"],
        risk_level=RiskLevel(row["risk_level"]),
        threat_category=ThreatCategory.UNKNOWN,
        summary=row.get("summary") or "Investigation completed.",
        indicators=indicators,
        recommendations=[],
        details=row.get("full_report", {}),
        created_at=row["created_at"],
    )
