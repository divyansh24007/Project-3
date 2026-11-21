"""Investigations Endpoints: History inspection, detail drilldown, and deletion."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from app.core.config import settings
from app.core.database import get_supabase_client
from app.core.security import get_current_user, limiter
from app.schemas.responses import InvestigationResponse, ThreatIndicatorResponse

investigations_router = APIRouter()


@investigations_router.get(
    "",
    response_model=List[InvestigationResponse],
    summary="List paginated investigations for authenticated user",
)
@limiter.limit(settings.RATE_LIMIT)
async def list_investigations(
    request: Request,
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page"),
    risk_level: Optional[str] = Query(default=None, description="Filter by risk level"),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[InvestigationResponse]:
    """Retrieve historical security investigations."""
    supabase = get_supabase_client()
    user_id = current_user.get("id")

    query = supabase.table("investigations").select("*")

    # If not admin/analyst role, restrict to current user
    if current_user.get("role") != "admin":
        query = query.eq("user_id", user_id)

    if risk_level:
        query = query.eq("risk_level", risk_level.lower())

    offset = (page - 1) * limit
    res = query.order("created_at", desc=True).offset(offset).limit(limit).execute()

    results: List[InvestigationResponse] = []
    for item in (res.data or []):
        results.append(
            InvestigationResponse(
                id=item["id"],
                user_id=item.get("user_id"),
                title=item.get("title", "Investigation"),
                input_type=item.get("input_type", "unknown"),
                input_data=item.get("input_data", ""),
                status=item.get("status", "completed"),
                risk_score=item.get("risk_score", 0.0),
                risk_level=item.get("risk_level", "safe"),
                summary=item.get("summary"),
                full_report=item.get("full_report", {}),
                threat_indicators=[],
                created_at=item.get("created_at", ""),
                updated_at=item.get("updated_at", ""),
            )
        )
    return results


@investigations_router.get(
    "/{investigation_id}",
    response_model=InvestigationResponse,
    summary="Get comprehensive investigation report with threat indicators",
)
@limiter.limit(settings.RATE_LIMIT)
async def get_investigation_detail(
    request: Request,
    investigation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> InvestigationResponse:
    """Retrieve specific investigation detail including all IoCs."""
    supabase = get_supabase_client()
    user_id = current_user.get("id")

    res = supabase.table("investigations").select("*").eq("id", investigation_id).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation with ID {investigation_id} not found.",
        )

    item = res.data[0]

    # Enforce tenant isolation unless admin
    if current_user.get("role") != "admin" and item.get("user_id") and item.get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized access to this investigation.",
        )

    # Fetch associated indicators
    ind_res = (
        supabase.table("threat_indicators")
        .select("*")
        .eq("investigation_id", investigation_id)
        .execute()
    )

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

    return InvestigationResponse(
        id=item["id"],
        user_id=item.get("user_id"),
        title=item.get("title", "Investigation"),
        input_type=item.get("input_type", "unknown"),
        input_data=item.get("input_data", ""),
        status=item.get("status", "completed"),
        risk_score=item.get("risk_score", 0.0),
        risk_level=item.get("risk_level", "safe"),
        summary=item.get("summary"),
        full_report=item.get("full_report", {}),
        threat_indicators=indicators,
        created_at=item.get("created_at", ""),
        updated_at=item.get("updated_at", ""),
    )


@investigations_router.delete(
    "/{investigation_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete investigation and associated indicators",
)
@limiter.limit(settings.RATE_LIMIT)
async def delete_investigation(
    request: Request,
    investigation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Permanently delete an investigation record."""
    supabase = get_supabase_client()
    user_id = current_user.get("id")

    res = supabase.table("investigations").select("id, user_id").eq("id", investigation_id).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation with ID {investigation_id} not found.",
        )

    item = res.data[0]
    if current_user.get("role") != "admin" and item.get("user_id") and item.get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to delete this investigation.",
        )

    # Delete indicators and investigation
    supabase.table("threat_indicators").delete().eq("investigation_id", investigation_id).execute()
    supabase.table("investigations").delete().eq("id", investigation_id).execute()

    return {"status": "success", "message": f"Investigation {investigation_id} deleted."}
