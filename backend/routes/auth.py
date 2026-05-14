"""All authentication routes — mirrors the Node.js auth-backend exactly."""
from __future__ import annotations

import os
import re

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse, RedirectResponse
from jose import JWTError
from pydantic import BaseModel

from config.database import get_db
from middleware.auth import require_auth
from models.otp import create_otp, verify_otp
from models.user import (
    create_user,
    find_user_by_email,
    find_user_by_google_id,
    find_user_by_id,
    hash_password,
    hash_token,
    safe_user,
    update_user,
    verify_password,
    verify_token,
)
from utils.jwt_utils import (
    refresh_expires_seconds,
    sign_access_token,
    sign_refresh_token,
    verify_refresh_token,
)
from utils.mailer import send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])

# ── Google OAuth ───────────────────────────────────────────────────────────────

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
_IS_PROD = os.getenv("NODE_ENV", "development") == "production"


# ── Cookie helpers ─────────────────────────────────────────────────────────────

def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=_IS_PROD,
        samesite="strict" if _IS_PROD else "lax",
        max_age=refresh_expires_seconds(),
        path="/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key="refresh_token", path="/auth")


# ── Pydantic request bodies ────────────────────────────────────────────────────

class SignupBody(BaseModel):
    email: str
    password: str
    name: str = ""


class VerifyOtpBody(BaseModel):
    email: str
    code: str


class ResendOtpBody(BaseModel):
    email: str


class LoginBody(BaseModel):
    email: str
    password: str


# ── POST /auth/signup ──────────────────────────────────────────────────────────

@router.post("/signup")
async def signup(body: SignupBody, response: Response):
    if not body.email or not body.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    email = body.email.strip().lower()
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="Invalid email address.")
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    db = get_db()
    existing = await find_user_by_email(db, email)

    if existing and existing.get("isVerified"):
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists. Please log in.",
        )

    password_hash = hash_password(body.password)

    if existing and not existing.get("isVerified"):
        await update_user(db, str(existing["_id"]), passwordHash=password_hash, name=body.name.strip() or existing.get("name", ""))
    else:
        await create_user(db, email=email, password_hash=password_hash, name=body.name.strip())

    code = await create_otp(db, email)
    await send_otp_email(email, code)

    return {"message": "Verification code sent to your email.", "email": email}


# ── POST /auth/verify-otp ──────────────────────────────────────────────────────

@router.post("/verify-otp")
async def verify_otp_route(body: VerifyOtpBody, response: Response):
    if not body.email or not body.code:
        raise HTTPException(status_code=400, detail="Email and OTP code are required.")

    email = body.email.strip().lower()
    db = get_db()
    is_valid = await verify_otp(db, email, body.code)

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")

    user = await find_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please sign up again.")

    refresh_token = sign_refresh_token(str(user["_id"]))
    await update_user(
        db,
        str(user["_id"]),
        isVerified=True,
        refreshTokenHash=hash_token(refresh_token),
    )

    access_token = sign_access_token(str(user["_id"]))
    _set_refresh_cookie(response, refresh_token)

    # Re-fetch to get updated doc
    user = await find_user_by_id(db, str(user["_id"]))
    return {
        "message": "Email verified successfully.",
        "accessToken": access_token,
        "user": safe_user(user),
    }


# ── POST /auth/resend-otp ──────────────────────────────────────────────────────

@router.post("/resend-otp")
async def resend_otp(body: ResendOtpBody):
    if not body.email:
        raise HTTPException(status_code=400, detail="Email is required.")

    email = body.email.strip().lower()
    db = get_db()
    user = await find_user_by_email(db, email)

    if not user:
        raise HTTPException(status_code=404, detail="No account found for this email.")
    if user.get("isVerified"):
        raise HTTPException(status_code=400, detail="This email is already verified.")

    code = await create_otp(db, email)
    await send_otp_email(email, code)

    return {"message": "Verification code resent."}


# ── POST /auth/login ───────────────────────────────────────────────────────────

@router.post("/login")
async def login(body: LoginBody, response: Response):
    if not body.email or not body.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    email = body.email.strip().lower()
    db = get_db()
    user = await find_user_by_email(db, email)

    # Generic message to avoid email enumeration
    if not user or not user.get("passwordHash"):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not verify_password(body.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.get("isVerified"):
        code = await create_otp(db, email)
        await send_otp_email(email, code)
        raise HTTPException(
            status_code=403,
            detail="Email not verified. We've sent a new code to your email.",
            headers={"X-Error-Code": "UNVERIFIED", "X-Email": email},
        )

    access_token = sign_access_token(str(user["_id"]))
    refresh_token = sign_refresh_token(str(user["_id"]))

    await update_user(db, str(user["_id"]), refreshTokenHash=hash_token(refresh_token))
    _set_refresh_cookie(response, refresh_token)

    return {
        "message": "Logged in successfully.",
        "accessToken": access_token,
        "user": safe_user(user),
    }


# ── POST /auth/refresh ─────────────────────────────────────────────────────────

@router.post("/refresh")
async def refresh(response: Response, refresh_token: str | None = Cookie(default=None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token provided.")

    try:
        payload = verify_refresh_token(refresh_token)
    except JWTError:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")

    db = get_db()
    user = await find_user_by_id(db, payload["sub"])

    if not user or not user.get("refreshTokenHash"):
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Session not found. Please log in again.")

    if not verify_token(refresh_token, user["refreshTokenHash"]):
        # Token reuse detected — invalidate all sessions
        await update_user(db, str(user["_id"]), refreshTokenHash=None)
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Token reuse detected. Please log in again.")

    new_refresh = sign_refresh_token(str(user["_id"]))
    new_access = sign_access_token(str(user["_id"]))
    await update_user(db, str(user["_id"]), refreshTokenHash=hash_token(new_refresh))
    _set_refresh_cookie(response, new_refresh)

    # Re-fetch for safe response
    user = await find_user_by_id(db, str(user["_id"]))
    return {"accessToken": new_access, "user": safe_user(user)}


# ── POST /auth/logout ──────────────────────────────────────────────────────────

@router.post("/logout")
async def logout(response: Response, refresh_token: str | None = Cookie(default=None)):
    if refresh_token:
        try:
            payload = verify_refresh_token(refresh_token)
            db = get_db()
            user = await find_user_by_id(db, payload["sub"])
            if user:
                await update_user(db, str(user["_id"]), refreshTokenHash=None)
        except Exception:
            pass  # Token already invalid — still clear cookie

    _clear_refresh_cookie(response)
    return {"message": "Logged out successfully."}


# ── GET /auth/me ───────────────────────────────────────────────────────────────

@router.get("/me")
async def me(current_user: dict = Depends(require_auth)):
    return {"user": current_user}


# ── GET /auth/google ───────────────────────────────────────────────────────────

@router.get("/google")
async def google_login(request: Request):
    callback_url = str(request.url_for("google_callback"))
    return await oauth.google.authorize_redirect(request, callback_url)


# ── GET /auth/google/callback ──────────────────────────────────────────────────

@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request, response: Response):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    try:
        token_data = await oauth.google.authorize_access_token(request)
    except Exception:
        return RedirectResponse(url=f"{frontend_url}/login?error=google_failed")

    user_info = token_data.get("userinfo") or {}
    email = (user_info.get("email") or "").lower()
    google_id = user_info.get("sub", "")
    name = user_info.get("name", "")
    avatar = user_info.get("picture")

    if not email:
        return RedirectResponse(url=f"{frontend_url}/login?error=google_no_email")

    db = get_db()

    # Upsert: find by googleId or email
    user = await find_user_by_google_id(db, google_id)
    if not user:
        user = await find_user_by_email(db, email)

    if user:
        updates: dict = {"isVerified": True}
        if not user.get("googleId"):
            updates["googleId"] = google_id
        if not user.get("avatar") and avatar:
            updates["avatar"] = avatar
        if not user.get("name") and name:
            updates["name"] = name
        await update_user(db, str(user["_id"]), **updates)
        user = await find_user_by_id(db, str(user["_id"]))
    else:
        user = await create_user(
            db,
            email=email,
            name=name,
            google_id=google_id,
            avatar=avatar,
            is_verified=True,
        )

    access_token = sign_access_token(str(user["_id"]))
    refresh_tok = sign_refresh_token(str(user["_id"]))
    await update_user(db, str(user["_id"]), refreshTokenHash=hash_token(refresh_tok))

    # We need to set the cookie AND redirect — use a RedirectResponse with set-cookie
    redirect = RedirectResponse(
        url=f"{frontend_url}/auth/callback?token={access_token}",
        status_code=302,
    )
    redirect.set_cookie(
        key="refresh_token",
        value=refresh_tok,
        httponly=True,
        secure=_IS_PROD,
        samesite="strict" if _IS_PROD else "lax",
        max_age=refresh_expires_seconds(),
        path="/auth",
    )
    return redirect


# ── GET /auth/health ───────────────────────────────────────────────────────────

@router.get("/health")
async def health():
    from datetime import datetime, timezone
    return {"ok": True, "service": "adbee-auth", "ts": datetime.now(timezone.utc).isoformat()}
