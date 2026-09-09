"""Shared FastAPI dependencies: user-JWT auth + admin guards."""
from __future__ import annotations

import jwt
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.config import settings

_bearer = HTTPBearer(auto_error=False)

# Supabase now signs access tokens with an asymmetric key (ES256) and publishes
# the public key at the JWKS endpoint. Older projects/tokens use the HS256
# shared secret. We try asymmetric first, then fall back to the secret.
_jwks_client: PyJWKClient | None = (
    PyJWKClient(f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json")
    if settings.supabase_url
    else None
)


def _decode(token: str) -> dict:
    # 1. asymmetric (ES256 / RS256) via JWKS — current Supabase default
    if _jwks_client is not None:
        try:
            key = _jwks_client.get_signing_key_from_jwt(token).key
            return jwt.decode(token, key, algorithms=["ES256", "RS256"], audience="authenticated")
        except jwt.PyJWTError:
            pass  # fall through to HS256
        except Exception:  # noqa: BLE001 — JWKS fetch failure, network, etc.
            pass
    # 2. legacy shared-secret HS256
    if settings.supabase_jwt_secret:
        return jwt.decode(
            token, settings.supabase_jwt_secret, algorithms=["HS256"], audience="authenticated"
        )
    raise jwt.InvalidTokenError("no verification key available")


def current_user(creds: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> dict:
    """Verify a Supabase access token. Raises 401 if missing/invalid."""
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    try:
        payload = _decode(creds.credentials)
    except jwt.PyJWTError as exc:  # noqa: BLE001
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid token: {exc}") from exc
    return {"id": payload.get("sub"), "email": payload.get("email"), "claims": payload}


def optional_user(creds: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> dict | None:
    if creds is None:
        return None
    try:
        return current_user(creds)
    except HTTPException:
        return None


def require_admin(x_admin_token: str | None = Header(default=None)) -> None:
    if not settings.admin_api_token or x_admin_token != settings.admin_api_token:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin token required")


def require_dashboard_admin(user: dict = Depends(current_user)) -> dict:
    """Gate for the /admin dashboard: a valid Supabase login whose email is on
    the ADMIN_EMAILS allowlist."""
    email = (user.get("email") or "").lower()
    if not email or email not in settings.admin_emails_list:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not an admin account")
    return user
