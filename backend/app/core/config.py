"""Application configuration settings using pydantic-settings."""

import os
from functools import lru_cache
from typing import Any, List, Optional, Union
from pydantic import field_validator

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    from pydantic import BaseModel as BaseSettings  # type: ignore

    def SettingsConfigDict(**kwargs: Any) -> Any:  # type: ignore
        return kwargs


class Settings(BaseSettings):
    """AEGISOS global application settings."""

    # Project metadata
    PROJECT_NAME: str = "AEGISOS Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # AI Provider Keys
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    AI_PROVIDER: str = "gemini"  # "gemini", "groq", or "fallback"

    # Security & Tokens
    SECRET_KEY: str = "aegisos-super-secure-jwt-secret-key-production-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS Configuration
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "*",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Rate Limiting
    RATE_LIMIT: str = "60/minute"

    # ML Classifier Settings
    MODEL_CACHE_DIR: str = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "ml", "cached_models"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Return cached singleton instance of Settings."""
    return Settings()


settings = get_settings()
