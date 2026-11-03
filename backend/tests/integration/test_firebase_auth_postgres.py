import os
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import delete, select


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]


async def test_verified_google_user_is_provisioned_and_receives_session(monkeypatch):
    from app.Routes import auth_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import AuthSession, User, UserPreferences, UserRole, Waitlist

    email = f"google-{uuid4()}@example.test"
    google_id = f"google-{uuid4()}"

    async def no_enforce(*_args, **_kwargs):
        return None

    monkeypatch.setattr(auth_routes, "enforce", no_enforce)
    monkeypatch.setattr(
        auth_routes.firebase_auth,
        "verify_id_token",
        lambda *_args, **_kwargs: {
            "email": email,
            "email_verified": True,
            "name": "Google User",
            "uid": google_id,
            "firebase": {"sign_in_provider": "google.com"},
        },
    )
    monkeypatch.setattr(auth_routes, "track_event", lambda *_args, **_kwargs: None)

    app = FastAPI()
    app.include_router(auth_routes.router, prefix="/auth")
    transport = httpx.ASGITransport(app=app)
    headers = {auth_routes.AUTH_REQUEST_HEADER: auth_routes.AUTH_REQUEST_VALUE}

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            login = await client.post(
                "/auth/firebase-login",
                headers=headers,
                json={"idToken": "synthetic-token"},
            )

            assert login.status_code == 200
            assert login.json()["user"]["email"] == email
            assert login.json().get("preview") is not True
            assert client.cookies.get("access_token")
            assert client.cookies.get("refresh_token")

            me = await client.get("/auth/me")
            assert me.status_code == 200
            assert me.json()["email"] == email

            repeated = await client.post(
                "/auth/firebase-login",
                headers=headers,
                json={"idToken": "synthetic-token"},
            )
            assert repeated.status_code == 200
            assert repeated.json()["user"]["id"] == login.json()["user"]["id"]

        async with AsyncSessionLocal() as db:
            user = await db.scalar(select(User).where(User.email == email))
            assert user is not None
            assert user.google_id == google_id
            assert await db.scalar(
                select(UserPreferences).where(UserPreferences.user_id == user.id)
            ) is not None
            assert await db.scalar(select(Waitlist).where(Waitlist.email == email)) is None
    finally:
        async with AsyncSessionLocal() as db:
            user = await db.scalar(select(User).where(User.email == email))
            if user is not None:
                await db.execute(delete(AuthSession).where(AuthSession.user_id == user.id))
                await db.execute(delete(UserRole).where(UserRole.user_id == user.id))
                await db.execute(
                    delete(UserPreferences).where(UserPreferences.user_id == user.id)
                )
                await db.execute(delete(User).where(User.id == user.id))
            await db.execute(delete(Waitlist).where(Waitlist.email == email))
            await db.commit()
        await engine.dispose()
