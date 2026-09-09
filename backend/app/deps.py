"""Shared FastAPI dependencies: user-JWT auth + admin-token guard."""
from __future__ import annotations

import jwt
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings

_bearer = HTTPBearer(auto_error=False)


def current_user(creds: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> dict:
    """Verify a Supabase access token. Raises 401 if missing/invalid."""
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    try:
        payload = jwt.decode(
            creds.credentials,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
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
