"""OTP collection helpers."""
from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone


def _generate_code() -> str:
    return str(random.randint(100_000, 999_999))


async def create_otp(db, email: str) -> str:
    """Delete existing OTPs for this email and create a fresh one. Returns the 6-digit code."""
    email = email.strip().lower()
    await db.otps.delete_many({"email": email})

    code = _generate_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    await db.otps.insert_one({
        "email": email,
        "code": code,
        "expiresAt": expires_at,
        "used": False,
    })
    return code


async def verify_otp(db, email: str, code: str) -> bool:
    """Return True and mark OTP used if code is valid and not expired."""
    email = email.strip().lower()
    doc = await db.otps.find_one({
        "email": email,
        "code": code.strip(),
        "used": False,
        "expiresAt": {"$gt": datetime.now(timezone.utc)},
    })
    if not doc:
        return False
    await db.otps.update_one({"_id": doc["_id"]}, {"$set": {"used": True}})
    return True
