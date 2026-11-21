"""Settings Endpoints: User workbench preferences and notification controls."""

from typing import Any, Dict
from fastapi import APIRouter, Depends, Request
from app.core.config import settings
from app.core.database import get_supabase_client
from app.core.security import get_current_user, limiter
from app.schemas.requests import SettingsUpdateRequest
from app.schemas.responses import SettingsResponse

settings_router = APIRouter()


@settings_router.get(
    "",
    response_model=SettingsResponse,
    summary="Retrieve current user configuration and alert preferences",
)
@limiter.limit(settings.RATE_LIMIT)
async def get_settings(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> SettingsResponse:
    """Fetch user settings and notification channels."""
    supabase = get_supabase_client()
    user_id = current_user.get("id")

    user_settings_res = supabase.table("user_settings").select("*").eq("user_id", user_id).execute()
    notif_res = supabase.table("notification_preferences").select("*").eq("user_id", user_id).execute()

    cfg = user_settings_res.data[0] if user_settings_res.data else {}
    notif = notif_res.data[0] if notif_res.data else {}

    return SettingsResponse(
        user_id=str(user_id),
        theme=cfg.get("theme", "dark"),
        ai_analysis_depth=cfg.get("ai_analysis_depth", "standard"),
        auto_quarantine=cfg.get("auto_quarantine", False),
        telemetry_enabled=cfg.get("telemetry_enabled", True),
        notification_preferences={
            "email_alerts": notif.get("email_alerts", True),
            "push_alerts": notif.get("push_alerts", True),
            "sms_alerts": notif.get("sms_alerts", False),
            "min_severity_alert": notif.get("min_severity_alert", "medium"),
        },
        custom_config=cfg.get("custom_config", {}),
    )


@settings_router.put(
    "",
    response_model=SettingsResponse,
    summary="Update workbench parameters and notification settings",
)
@limiter.limit(settings.RATE_LIMIT)
async def update_settings(
    request: Request,
    payload: SettingsUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> SettingsResponse:
    """Modify user security preferences and alert delivery rules."""
    supabase = get_supabase_client()
    user_id = current_user.get("id")

    settings_updates = {}
    if payload.theme is not None:
        settings_updates["theme"] = payload.theme
    if payload.ai_analysis_depth is not None:
        settings_updates["ai_analysis_depth"] = payload.ai_analysis_depth
    if payload.auto_quarantine is not None:
        settings_updates["auto_quarantine"] = payload.auto_quarantine
    if payload.telemetry_enabled is not None:
        settings_updates["telemetry_enabled"] = payload.telemetry_enabled
    if payload.custom_config is not None:
        settings_updates["custom_config"] = payload.custom_config

    if settings_updates:
        supabase.table("user_settings").update(settings_updates).eq("user_id", user_id).execute()

    notif_updates = {}
    if payload.email_alerts is not None:
        notif_updates["email_alerts"] = payload.email_alerts
    if payload.push_alerts is not None:
        notif_updates["push_alerts"] = payload.push_alerts
    if payload.sms_alerts is not None:
        notif_updates["sms_alerts"] = payload.sms_alerts

    if notif_updates:
        supabase.table("notification_preferences").update(notif_updates).eq("user_id", user_id).execute()

    return await get_settings(request=request, current_user=current_user)
