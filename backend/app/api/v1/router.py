"""V1 API Router uniting all sub-routers under /api/v1."""

from fastapi import APIRouter
from app.api.v1.analytics import analytics_router
from app.api.v1.demo import demo_router
from app.api.v1.devices import devices_router
from app.api.v1.intelligence import intelligence_router
from app.api.v1.investigations import investigations_router
from app.api.v1.scan import scan_router
from app.api.v1.settings import settings_router

api_v1_router = APIRouter()

api_v1_router.include_router(scan_router, prefix="/scan", tags=["Scan"])
api_v1_router.include_router(investigations_router, prefix="/investigations", tags=["Investigations"])
api_v1_router.include_router(intelligence_router, prefix="/intelligence", tags=["Threat Intelligence"])
api_v1_router.include_router(devices_router, prefix="/devices", tags=["Devices"])
api_v1_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_v1_router.include_router(settings_router, prefix="/settings", tags=["Settings"])
api_v1_router.include_router(demo_router, prefix="/demo", tags=["Demo"])
