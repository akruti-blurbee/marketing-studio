"""JWT utilities using python-jose."""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

from jose import ExpiredSignatureError, JWTError, jwt  # noqa: F401 — re-export for callers

_ACCESS_SECRET = ""
_REFRESH_SECRET = ""
ALGORITHM = "HS256"


def _secret(key: str, name: str) -> str:
    val = os.getenv(key, "")
    if not val:
        raise RuntimeError(f"{name} is not configured.")
    return val


def _parse_seconds(s: str) -> int:
    unit = s[-1]
    value = int(s[:-1])
    return {"s": 1, "m": 60, "h": 3_600, "d": 86_400}.get(unit, 86_400) * value


def _access_expires() -> str:
    return os.getenv("JWT_ACCESS_EXPIRES", "15m")


def _refresh_expires() -> str:
    return os.getenv("JWT_REFRESH_EXPIRES", "7d")


def sign_access_token(user_id: str) -> str:
    secret = _secret("JWT_SECRET", "JWT_SECRET")
    exp = datetime.now(timezone.utc) + timedelta(seconds=_parse_seconds(_access_expires()))
    return jwt.encode({"sub": user_id, "type": "access", "exp": exp}, secret, algorithm=ALGORITHM)


def sign_refresh_token(user_id: str) -> str:
    secret = _secret("JWT_REFRESH_SECRET", "JWT_REFRESH_SECRET")
    exp = datetime.now(timezone.utc) + timedelta(seconds=_parse_seconds(_refresh_expires()))
    return jwt.encode({"sub": user_id, "type": "refresh", "exp": exp}, secret, algorithm=ALGORITHM)


def verify_access_token(token: str) -> dict:
    secret = _secret("JWT_SECRET", "JWT_SECRET")
    payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
    if payload.get("type") != "access":
        raise JWTError("Invalid token type.")
    return payload


def verify_refresh_token(token: str) -> dict:
    secret = _secret("JWT_REFRESH_SECRET", "JWT_REFRESH_SECRET")
    payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
    if payload.get("type") != "refresh":
        raise JWTError("Invalid token type.")
    return payload


def refresh_expires_seconds() -> int:
    return _parse_seconds(_refresh_expires())
