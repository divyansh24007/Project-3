"""Structured logging setup using structlog and FastAPI request middleware."""

import json
import logging
import sys
import time
from typing import Any, Callable, Dict, Optional

try:
    import structlog
    _STRUCTLOG_AVAILABLE = True
except ImportError:
    _STRUCTLOG_AVAILABLE = False

try:
    from fastapi import Request, Response
    from starlette.middleware.base import BaseHTTPMiddleware
except ImportError:
    from starlette.requests import Request  # type: ignore
    from starlette.responses import Response  # type: ignore
    from starlette.middleware.base import BaseHTTPMiddleware  # type: ignore

from app.core.config import settings


class StandardLoggerWrapper:
    """Wrapper around standard library logger to support structlog-style key-value logging."""

    def __init__(self, logger_obj: logging.Logger):
        self._logger = logger_obj

    def _fmt(self, event: str, kwargs: Dict[str, Any]) -> str:
        if kwargs:
            try:
                extra = " " + json.dumps(kwargs, default=str)
            except Exception:
                extra = f" {kwargs}"
            return f"{event}{extra}"
        return event

    def info(self, event: str, **kwargs: Any) -> None:
        self._logger.info(self._fmt(event, kwargs))

    def warning(self, event: str, **kwargs: Any) -> None:
        self._logger.warning(self._fmt(event, kwargs))

    def error(self, event: str, **kwargs: Any) -> None:
        self._logger.error(self._fmt(event, kwargs))

    def debug(self, event: str, **kwargs: Any) -> None:
        self._logger.debug(self._fmt(event, kwargs))


def setup_logging() -> None:
    """Configure structured logging using structlog when present, or stdlib logging."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    if _STRUCTLOG_AVAILABLE:
        shared_processors = [
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(fmt="iso", utc=True),
        ]

        if settings.DEBUG:
            processors = shared_processors + [
                structlog.dev.ConsoleRenderer(colors=True)
            ]
        else:
            processors = shared_processors + [
                structlog.processors.dict_tracebacks,
                structlog.processors.JSONRenderer(),
            ]

        structlog.configure(
            processors=processors,
            logger_factory=structlog.PrintLoggerFactory(),
            wrapper_class=structlog.make_filtering_bound_logger(log_level),
            cache_logger_on_first_use=True,
        )

    # Standard library logging configuration
    logging.basicConfig(
        format="%(asctime)s [%(levelname)s] %(message)s",
        stream=sys.stdout,
        level=log_level,
    )


if _STRUCTLOG_AVAILABLE:
    logger = structlog.get_logger("aegisos")
else:
    logger = StandardLoggerWrapper(logging.getLogger("aegisos"))


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for structured HTTP request and response logging."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get("X-Request-ID", f"req-{time.time_ns()}")
        if _STRUCTLOG_AVAILABLE:
            structlog.contextvars.clear_contextvars()
            structlog.contextvars.bind_contextvars(
                request_id=request_id,
                path=request.url.path,
                method=request.method,
                client_ip=request.client.host if request.client else "unknown",
            )

        start_time = time.perf_counter()
        logger.info(
            "http_request_started",
            path=request.url.path,
            method=request.method,
        )

        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time-Ms"] = str(duration_ms)

            logger.info(
                "http_request_completed",
                status_code=response.status_code,
                duration_ms=duration_ms,
            )
            return response
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(
                "http_request_failed",
                error=str(exc),
                duration_ms=duration_ms,
                exc_info=True,
            )
            raise
