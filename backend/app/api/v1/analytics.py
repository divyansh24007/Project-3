"""Analytics Endpoints: High-level overview, threat breakdown, and timeline trends."""

from collections import Counter
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, Request
from app.core.config import settings
from app.core.database import get_supabase_client
from app.core.security import get_current_user, limiter
from app.schemas.responses import AnalyticsOverview, AnalyticsResponse

analytics_router = APIRouter()


@analytics_router.get(
    "/overview",
    response_model=AnalyticsOverview,
    summary="Dashboard overview metrics and risk KPIs",
)
@limiter.limit(settings.RATE_LIMIT)
async def get_analytics_overview(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> AnalyticsOverview:
    """Compute aggregate security scan numbers and mitigation stats."""
    supabase = get_supabase_client()
    user_id = current_user.get("id")

    query = supabase.table("investigations").select("*")
    if current_user.get("role") != "admin":
        query = query.eq("user_id", user_id)

    res = query.execute()
    data = res.data or []

    total_scans = len(data)
    threats_blocked = sum(1 for row in data if row.get("risk_level") in ("high", "critical"))
    clean_items = sum(1 for row in data if row.get("risk_level") in ("safe", "low"))
    critical_alerts = sum(1 for row in data if row.get("risk_level") == "critical")
    avg_score = round(sum(float(row.get("risk_score", 0.0)) for row in data) / total_scans, 2) if total_scans > 0 else 0.0

    return AnalyticsOverview(
        total_scans=total_scans,
        threats_blocked=threats_blocked,
        clean_items=clean_items,
        avg_risk_score=avg_score,
        critical_alerts=critical_alerts,
    )


@analytics_router.get(
    "/threats",
    summary="Categorical breakdown of detected threat vectors",
)
@limiter.limit(settings.RATE_LIMIT)
async def get_threat_distribution(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Return distribution of threat categories and risk levels."""
    supabase = get_supabase_client()
    user_id = current_user.get("id")

    query = supabase.table("investigations").select("risk_level, input_type, full_report")
    if current_user.get("role") != "admin":
        query = query.eq("user_id", user_id)

    res = query.execute()
    data = res.data or []

    risk_counter: Dict[str, int] = Counter([r.get("risk_level", "safe") for r in data])
    type_counter: Dict[str, int] = Counter([r.get("input_type", "unknown") for r in data])

    # Provide default keys if empty
    for k in ("safe", "low", "medium", "high", "critical"):
        risk_counter.setdefault(k, 0)

    category_counter: Dict[str, int] = {
        "phishing": 0,
        "upi_fraud": 0,
        "banking_scam": 0,
        "kyc_scam": 0,
        "job_scam": 0,
        "lottery_scam": 0,
        "legitimate": 0,
    }

    for r in data:
        report = r.get("full_report", {})
        findings = report.get("agent_findings", {})
        threat_cat = (
            findings.get("threat_detection_agent", {}).get("primary_threat") or
            findings.get("preliminary_scan", {}).get("threat_category") or
            "legitimate"
        )
        category_counter[threat_cat] = category_counter.get(threat_cat, 0) + 1

    return {
        "risk_levels": dict(risk_counter),
        "threat_categories": category_counter,
        "input_types": dict(type_counter),
        "total_analyzed": len(data),
    }


@analytics_router.get(
    "/history",
    summary="Investigation history timeline and log records",
)
@limiter.limit(settings.RATE_LIMIT)
async def get_analytics_history(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Return chronological timeline of scan evaluations."""
    supabase = get_supabase_client()
    user_id = current_user.get("id")

    query = supabase.table("investigations").select("id, title, input_type, risk_score, risk_level, summary, created_at")
    if current_user.get("role") != "admin":
        query = query.eq("user_id", user_id)

    res = query.order("created_at", desc=True).limit(50).execute()
    return res.data or []
