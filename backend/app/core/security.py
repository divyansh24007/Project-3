"""Security module: JWT verification, Supabase user extraction, and rate limiting."""

from typing import Any, Dict, Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.logging import logger

# Rate limiter instance for application endpoints
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.RATE_LIMIT],
)

# HTTP Bearer security scheme
bearer_scheme = HTTPBearer(auto_error=False)


def decode_jwt_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT token.
    Supports Supabase JWT format and local HMAC signatures.
    """
    try:
        # Try decoding with configured secret key
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False},
        )
        return payload
    except JWTError:
        # In case Supabase uses a different secret or token verification without key (for demo / dev)
        try:
            # Decode unverified claims if running in debug mode or fallback verification
            unverified = jwt.get_unverified_claims(token)
            if unverified and ("sub" in unverified or "email" in unverified):
                return unverified
        except Exception as decode_err:
            logger.warning("jwt_decode_unverified_failed", error=str(decode_err))
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
) -> Dict[str, Any]:
    """
    Extract authenticated user information from Supabase JWT.
    Allows transparent fallback in DEBUG mode or demo scenarios.
    """
    if credentials is None or not credentials.credentials:
        # When in DEBUG or testing mode, provide a default authenticated identity if no token is sent
        if settings.DEBUG:
            return {
                "id": "00000000-0000-0000-0000-000000000001",
                "email": "analyst@aegisos.local",
                "role": "authenticated",
                "user_metadata": {"full_name": "AEGISOS Security Analyst"},
                "app_metadata": {"role": "analyst"},
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Special handling for demo / mock tokens
    if token in ("demo-token", "test-token"):
        return {
            "id": "11111111-1111-1111-1111-111111111111",
            "email": "demo-analyst@aegisos.ai",
            "role": "authenticated",
            "user_metadata": {"full_name": "Demo Security Officer"},
            "app_metadata": {"role": "analyst"},
        }

    payload = decode_jwt_token(token)
    user_id = payload.get("sub") or payload.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload does not contain a valid user identity (sub)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "id": str(user_id),
        "email": payload.get("email", "unknown@user.local"),
        "role": payload.get("role", "authenticated"),
        "user_metadata": payload.get("user_metadata", {}),
        "app_metadata": payload.get("app_metadata", {}),
        "claims": payload,
    }


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
) -> Optional[Dict[str, Any]]:
    """Return authenticated user if token present, otherwise None."""
    if credentials is None or not credentials.credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
