"""Auth helpers for Emergent-managed Google OAuth.
REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
"""
from fastapi import Request, HTTPException, Response, Cookie
from datetime import datetime, timezone, timedelta
from typing import Optional
import httpx
import uuid

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


async def exchange_session(session_id: str) -> dict:
    """Call Emergent Auth to get user info + session_token."""
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(EMERGENT_AUTH_URL, headers={"X-Session-ID": session_id})
    if r.status_code != 200:
        raise HTTPException(401, "Invalid session")
    return r.json()


async def upsert_user(db, auth: dict) -> dict:
    """Create or update a user by email. Returns user doc (without _id)."""
    existing = await db.users.find_one({"email": auth["email"]}, {"_id": 0})
    if existing:
        await db.users.update_one(
            {"email": auth["email"]},
            {"$set": {
                "name": auth.get("name"),
                "picture": auth.get("picture"),
                "last_login": datetime.now(timezone.utc).isoformat(),
            }},
        )
        return existing
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    doc = {
        "user_id": user_id,
        "email": auth["email"],
        "name": auth.get("name"),
        "picture": auth.get("picture"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc.copy())
    return doc


async def store_session(db, user_id: str, session_token: str):
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })


def set_auth_cookie(response: Response, session_token: str):
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/",
    )


def clear_auth_cookie(response: Response):
    response.delete_cookie("session_token", path="/")


async def get_current_user(
    request: Request,
    db,
    session_token: Optional[str] = None,
) -> Optional[dict]:
    """Return user doc or None. Checks cookie first, then Authorization bearer."""
    token = session_token or request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("authorization", "")
        if auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1].strip()
    if not token:
        return None

    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        return None

    expires_at = sess["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None

    user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    return user


async def require_user(request: Request, db) -> dict:
    u = await get_current_user(request, db)
    if not u:
        raise HTTPException(401, "Not authenticated")
    return u
