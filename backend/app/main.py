"""AEGISOS FastAPI Backend: Central application initialization, middleware, routes, and lifecycle events."""

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, AsyncGenerator, Dict
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.logging import LoggingMiddleware, logger, setup_logging
from app.core.security import limiter
from app.ml.classifier import scam_classifier


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context: initialize logging and pre-train ML classifier."""
    setup_logging()
    logger.info("aegisos_startup", version=settings.VERSION, provider=settings.AI_PROVIDER)
    
    # Initialize / train ML scam classification model
    try:
        scam_classifier.ensure_trained()
        logger.info("ml_classifier_ready")
    except Exception as e:
        logger.error("ml_classifier_init_failed", error=str(e))

    yield

    logger.info("aegisos_shutdown")


def create_application() -> FastAPI:
    """Factory creating and configuring the primary FastAPI application."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="AEGISOS: AI-Powered Autonomous Cybersecurity Platform Backend",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Rate Limiting state and exception handler
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # CORS Configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Structured request logging
    app.add_middleware(LoggingMiddleware)

    # Include API Routers
    app.include_router(api_v1_router, prefix=settings.API_V1_STR)

    @app.get("/health", tags=["Health"], summary="Root health check")
    @app.get(f"{settings.API_V1_STR}/health", tags=["Health"], summary="V1 API health check")
    async def health_check() -> Dict[str, Any]:
        return {
            "status": "healthy",
            "version": settings.VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ai_provider": settings.AI_PROVIDER,
            "classifier_ready": scam_classifier._is_trained,
        }

    return app


app = create_application()
