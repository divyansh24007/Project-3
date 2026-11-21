"""Devices Endpoints: Device enrollment, inventory listing, and security status verification."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.core.config import settings
from app.core.database import get_supabase_client
from app.core.security import get_current_user, limiter
from app.schemas.requests import DeviceRegisterRequest
from app.schemas.responses import DeviceResponse

devices_router = APIRouter()


@devices_router.post(
    "/register",
    response_model=DeviceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register or update client device telemetry",
)
@limiter.limit(settings.RATE_LIMIT)
async def register_device(
    request: Request,
    payload: DeviceRegisterRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> DeviceResponse:
    """Enroll or refresh mobile device posture."""
    supabase = get_supabase_client()
    user_id = current_user.get("id")
    now_iso = datetime.now(timezone.utc).isoformat()

    # Check if device already exists with matching name and user
    existing = (
        supabase.table("devices")
        .select("*")
        .eq("user_id", user_id)
        .eq("device_name", payload.device_name)
        .execute()
    )

    if existing.data:
        device_id = existing.data[0]["id"]
        update_data = {
            "device_type": payload.device_type,
            "os_version": payload.os_version,
            "app_version": payload.app_version,
            "is_active": True,
            "last_active_at": now_iso,
            "security_posture": payload.security_posture or {},
        }
        supabase.table("devices").update(update_data).eq("id", device_id).execute()
        device_row = existing.data[0]
        device_row.update(update_data)
    else:
        device_id = str(uuid.uuid4())
        device_row = {
            "id": device_id,
            "user_id": user_id,
            "device_name": payload.device_name,
            "device_type": payload.device_type,
            "os_version": payload.os_version,
            "app_version": payload.app_version,
            "is_active": True,
            "last_active_at": now_iso,
            "security_posture": payload.security_posture or {},
            "created_at": now_iso,
        }
        supabase.table("devices").insert(device_row).execute()

    return DeviceResponse(
        id=device_row["id"],
        user_id=device_row["user_id"],
        device_name=device_row["device_name"],
        device_type=device_row["device_type"],
        os_version=device_row["os_version"],
        app_version=device_row["app_version"],
        is_active=device_row["is_active"],
        last_active_at=device_row["last_active_at"],
        security_status=device_row.get("security_posture", {}),
        created_at=device_row.get("created_at", now_iso),
    )


@devices_router.get(
    "",
    response_model=List[DeviceResponse],
    summary="List all enrolled devices for the user",
)
@limiter.limit(settings.RATE_LIMIT)
async def list_devices(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[DeviceResponse]:
    """Fetch active devices registered to the user profile."""
    supabase = get_supabase_client()
    user_id = current_user.get("id")

    query = supabase.table("devices").select("*")
    if current_user.get("role") != "admin":
        query = query.eq("user_id", user_id)

    res = query.order("last_active_at", desc=True).execute()

    return [
        DeviceResponse(
            id=d["id"],
            user_id=d["user_id"],
            device_name=d["device_name"],
            device_type=d["device_type"],
            os_version=d["os_version"],
            app_version=d["app_version"],
            is_active=d.get("is_active", True),
            last_active_at=d["last_active_at"],
            security_status=d.get("security_posture", {}),
            created_at=d.get("created_at", d["last_active_at"]),
        )
        for d in (res.data or [])
    ]


@devices_router.get(
    "/{device_id}/security",
    summary="Retrieve real-time security posture and alerts for specific device",
)
@limiter.limit(settings.RATE_LIMIT)
async def get_device_security_status(
    request: Request,
    device_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Compute security posture score and anomalies for target device."""
    supabase = get_supabase_client()
    user_id = current_user.get("id")

    dev_res = supabase.table("devices").select("*").eq("id", device_id).execute()
    if not dev_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device with ID {device_id} not found.",
        )

    device = dev_res.data[0]
    if current_user.get("role") != "admin" and device.get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to this device.",
        )

    posture = device.get("security_posture", {})
    is_rooted = posture.get("rooted", False)
    usb_debug = posture.get("usb_debugging", False)
    encryption = posture.get("encryption", "hardware")

    # Calculate posture health score (100 is best)
    health_score = 100.0
    threats = []
    if is_rooted:
        health_score -= 50.0
        threats.append("Device is rooted or jailbroken (integrity compromised)")
    if usb_debug:
        health_score -= 20.0
        threats.append("Developer USB debugging mode is active")
    if encryption == "none":
        health_score -= 30.0
        threats.append("Device storage is unencrypted")

    return {
        "device_id": device_id,
        "device_name": device["device_name"],
        "health_score": max(0.0, health_score),
        "posture_status": "healthy" if health_score >= 80 else "compromised" if health_score < 50 else "warning",
        "threats_detected": threats,
        "telemetry": posture,
        "last_checked": datetime.now(timezone.utc).isoformat(),
    }
