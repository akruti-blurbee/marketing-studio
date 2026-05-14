"""MongoDB connection using Motor (async driver)."""
from __future__ import annotations

import os

from motor.motor_asyncio import AsyncIOMotorClient

import certifi
import dns.resolver

# Configure dnspython to use Google DNS to avoid local DNS timeouts
dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ['8.8.8.8']

_client: AsyncIOMotorClient | None = None
_db = None


async def connect_db() -> None:
    global _client, _db
    uri = os.getenv("MONGODB_URI")
    if not uri:
        raise RuntimeError("MONGODB_URI is not defined in environment variables.")

    _client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=10_000, tlsCAFile=certifi.where())
    db_name = os.getenv("MONGODB_DB", "Adbee")
    _db = _client[db_name]

    # Ensure indexes (safe to call repeatedly)
    await _db.otps.create_index("expiresAt", expireAfterSeconds=0, background=True)
    await _db.users.create_index("email", unique=True, background=True)
    await _db.users.create_index("googleId", sparse=True, background=True)

    print(f"MongoDB Atlas connected -> {db_name}")


async def close_db() -> None:
    global _client
    if _client:
        _client.close()
        print("MongoDB connection closed.")


def get_db():
    if _db is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _db
