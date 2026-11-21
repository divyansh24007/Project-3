"""Threat Intelligence API endpoints for Domains, IPs, and URLs."""

from typing import Any, Dict
from fastapi import APIRouter, Depends, Request
from app.core.config import settings
from app.core.security import get_optional_user, limiter
from app.schemas.requests import DomainIntelRequest, IPIntelRequest, URLIntelRequest
from app.schemas.responses import ThreatIntelResult
from app.services.threat_intel import ThreatIntelligenceService

intelligence_router = APIRouter()
intel_service = ThreatIntelligenceService()


@intelligence_router.post(
    "/domain",
    response_model=ThreatIntelResult,
    summary="Query domain threat reputation and DNS posture",
)
@limiter.limit(settings.RATE_LIMIT)
async def get_domain_intelligence(
    request: Request,
    payload: DomainIntelRequest,
    current_user: Dict[str, Any] = Depends(get_optional_user),
) -> ThreatIntelResult:
    """Analyze target domain against global threat feeds and abusive TLD heuristics."""
    result = intel_service.check_domain(payload.domain)
    return ThreatIntelResult(
        target=result.target,
        target_type=result.target_type,
        is_malicious=result.is_malicious,
        risk_score=result.risk_score,
        categories=result.categories,
        reputation=result.reputation,
        dns_records=result.dns_records,
        rdap_info=result.rdap_info,
        matched_rules=result.matched_rules,
        details=result.details,
    )


@intelligence_router.post(
    "/ip",
    response_model=ThreatIntelResult,
    summary="Inspect IP address against bulletproof hosts and SSRF hazards",
)
@limiter.limit(settings.RATE_LIMIT)
async def get_ip_intelligence(
    request: Request,
    payload: IPIntelRequest,
    current_user: Dict[str, Any] = Depends(get_optional_user),
) -> ThreatIntelResult:
    """Assess IP address reputation, Tor exit status, and private subnet ranges."""
    result = intel_service.check_ip(payload.ip)
    return ThreatIntelResult(
        target=result.target,
        target_type=result.target_type,
        is_malicious=result.is_malicious,
        risk_score=result.risk_score,
        categories=result.categories,
        reputation=result.reputation,
        dns_records=result.dns_records,
        rdap_info=result.rdap_info,
        matched_rules=result.matched_rules,
        details=result.details,
    )


@intelligence_router.post(
    "/url",
    response_model=ThreatIntelResult,
    summary="Query complete URL intelligence and download hazard ratings",
)
@limiter.limit(settings.RATE_LIMIT)
async def get_url_intelligence(
    request: Request,
    payload: URLIntelRequest,
    current_user: Dict[str, Any] = Depends(get_optional_user),
) -> ThreatIntelResult:
    """Evaluate full URL string, path depth, and hosted file risks."""
    result = intel_service.check_url(payload.url)
    return ThreatIntelResult(
        target=result.target,
        target_type=result.target_type,
        is_malicious=result.is_malicious,
        risk_score=result.risk_score,
        categories=result.categories,
        reputation=result.reputation,
        dns_records=result.dns_records,
        rdap_info=result.rdap_info,
        matched_rules=result.matched_rules,
        details=result.details,
    )
