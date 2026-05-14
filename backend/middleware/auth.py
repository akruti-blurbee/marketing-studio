"""FastAPI auth dependency — validates Bearer access token."""
from __future__ import annotations

from fastapi import Cookie, Header, HTTPException, Request, status
from jose import ExpiredSignatureError, JWTError

from config.database import get_db
from models.user import find_user_by_id, safe_user
from utils.jwt_utils import verify_access_token


async def require_auth(
    request: Request,
    authorization: str | None = Header(default=None),
    access_token: str | None = Cookie(default=None),
) -> dict:
    """Inject the authenticated user dict into route handlers."""
    token: str | None = None

    # 1. Authorization: Bearer <token>
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
    # 2. Fallback: access_token cookie
    elif access_token:
        token = access_token

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    try:
        payload = verify_access_token(token)
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token expired.",
            headers={"X-Error-Code": "TOKEN_EXPIRED"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token.",
        )

    db = get_db()
    user = await find_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    if not user.get("isVerified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email first.",
        )

    return safe_user(user)
