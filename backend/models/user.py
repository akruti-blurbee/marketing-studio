"""User collection helpers — Motor + bcrypt."""
from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId
import bcrypt


# ── Hashing helpers ────────────────────────────────────────────────────────────

def _prepare_secret(secret: str) -> bytes:
    """Bcrypt limits to 72 bytes. Truncate manually to avoid ValueError."""
    encoded = secret.encode('utf-8')
    if len(encoded) > 72:
        return encoded[:72]
    return encoded


def hash_password(plain: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(_prepare_secret(plain), salt).decode('ascii')


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_prepare_secret(plain), hashed.encode('ascii'))
    except Exception:
        return False


def hash_token(token: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(_prepare_secret(token), salt).decode('ascii')


def verify_token(token: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_prepare_secret(token), hashed.encode('ascii'))
    except Exception:
        return False


# ── Safe serialisation ─────────────────────────────────────────────────────────

def safe_user(doc: dict) -> dict:
    """Return only safe, non-sensitive fields."""
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "email": doc["email"],
        "avatar": doc.get("avatar"),
        "isVerified": doc.get("isVerified", False),
        "createdAt": doc.get("createdAt", datetime.now(timezone.utc)).isoformat(),
    }


# ── DB helpers ─────────────────────────────────────────────────────────────────

def _now() -> datetime:
    return datetime.now(timezone.utc)


async def find_user_by_email(db, email: str) -> dict | None:
    return await db.users.find_one({"email": email.strip().lower()})


async def find_user_by_id(db, user_id: str) -> dict | None:
    try:
        return await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


async def find_user_by_google_id(db, google_id: str) -> dict | None:
    return await db.users.find_one({"googleId": google_id})


async def create_user(
    db,
    email: str,
    password_hash: str | None = None,
    name: str = "",
    google_id: str | None = None,
    avatar: str | None = None,
    is_verified: bool = False,
) -> dict:
    now = _now()
    doc = {
        "email": email.strip().lower(),
        "name": name.strip(),
        "passwordHash": password_hash,
        "googleId": google_id,
        "avatar": avatar,
        "isVerified": is_verified,
        "refreshTokenHash": None,
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def update_user(db, user_id: str, **fields) -> None:
    fields["updatedAt"] = _now()
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": fields})
