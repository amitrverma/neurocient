import asyncio
import os
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import delete, func, select


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]


async def test_auth_sessions_rotate_revoke_and_recover_on_postgres(monkeypatch):
    from app.Routes import auth_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import (
        AuthSession,
        PasswordResetToken,
        User,
        UserPreferences,
        UserRole,
    )
    from app.services.auth_security import digest_secret
    from app.utils.auth import create_access_token, create_refresh_token

    email = f"security-{uuid4()}@example.com"
    initial_password = "a long initial passphrase"
    replacement_password = "a different secure passphrase"
    final_password = "a final secure passphrase"
    auth_header = {
        auth_routes.AUTH_REQUEST_HEADER: auth_routes.AUTH_REQUEST_VALUE,
    }
    reset_tokens: list[str] = []

    async def capture_reset_email(recipient: str, token: str) -> bool:
        assert recipient == email
        reset_tokens.append(token)
        return True

    monkeypatch.setattr(auth_routes, "send_password_reset_email", capture_reset_email)
    monkeypatch.setattr(auth_routes, "track_event", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(auth_routes, "identify_user", lambda *_args, **_kwargs: None)

    app = FastAPI()
    app.include_router(auth_routes.router, prefix="/auth")
    transport = httpx.ASGITransport(app=app)

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            missing_marker = await client.post(
                "/auth/signup",
                json={"email": email, "password": initial_password},
            )
            assert missing_marker.status_code == 403, missing_marker.text

            weak = await client.post(
                "/auth/signup",
                headers=auth_header,
                json={"email": email, "password": "short"},
            )
            assert weak.status_code == 422

            signup = await client.post(
                "/auth/signup",
                headers=auth_header,
                json={"email": f"  {email.upper()}  ", "password": initial_password},
            )
            assert signup.status_code == 200
            assert signup.json()["user"]["email"] == email
            user_id = signup.json()["user"]["id"]

            async with httpx.AsyncClient(
                transport=transport,
                base_url="http://test",
            ) as legacy_client:
                legacy_access = await legacy_client.get(
                    "/auth/me",
                    headers={
                        "Authorization": (
                            "Bearer "
                            f"{create_access_token({'sub': user_id})}"
                        ),
                    },
                )
                assert legacy_access.status_code == 401
                legacy_refresh = await legacy_client.post(
                    "/auth/refresh",
                    headers={
                        **auth_header,
                        "Cookie": (
                            "refresh_token="
                            f"{create_refresh_token(user_id)}"
                        ),
                    },
                )
                assert legacy_refresh.status_code == 401

            first_refresh = client.cookies.get("refresh_token")
            assert first_refresh
            assert (await client.get("/auth/me")).status_code == 200

            rotated = await client.post("/auth/refresh", headers=auth_header)
            assert rotated.status_code == 200
            second_refresh = client.cookies.get("refresh_token")
            assert second_refresh and second_refresh != first_refresh

            async with httpx.AsyncClient(
                transport=transport,
                base_url="http://test",
            ) as replay_client:
                replay = await replay_client.post(
                    "/auth/refresh",
                    headers={
                        **auth_header,
                        "Cookie": f"refresh_token={first_refresh}",
                    },
                )
                assert replay.status_code == 409

            rotated_again = await client.post("/auth/refresh", headers=auth_header)
            assert rotated_again.status_code == 200

            async with AsyncSessionLocal() as session:
                consumed = await session.scalar(
                    select(AuthSession).where(
                        AuthSession.refresh_token_hash == digest_secret(first_refresh)
                    )
                )
                consumed.revoked_at = (
                    datetime.now(UTC).replace(tzinfo=None) - timedelta(seconds=10)
                )
                await session.commit()

            async with httpx.AsyncClient(
                transport=transport,
                base_url="http://test",
            ) as replay_client:
                delayed_replay = await replay_client.post(
                    "/auth/refresh",
                    headers={
                        **auth_header,
                        "Cookie": f"refresh_token={first_refresh}",
                    },
                )
                assert delayed_replay.status_code == 401

            revoked_replacement = await client.post(
                "/auth/refresh",
                headers=auth_header,
            )
            assert revoked_replacement.status_code == 401
            assert (await client.get("/auth/me")).status_code == 401

        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            login = await client.post(
                "/auth/login",
                headers=auth_header,
                json={"email": email.upper(), "password": initial_password},
            )
            assert login.status_code == 200
            copied_access = client.cookies.get("access_token")
            copied_refresh = client.cookies.get("refresh_token")

            async with httpx.AsyncClient(
                transport=transport,
                base_url="http://test",
            ) as logout_client:
                logout = await logout_client.post(
                    "/auth/logout",
                    headers={
                        **auth_header,
                        "Cookie": (
                            "refresh_token=malformed; "
                            f"access_token={copied_access}"
                        ),
                    },
                )
            assert logout.status_code == 200

            copied_me = await client.get(
                "/auth/me",
                headers={"Cookie": f"access_token={copied_access}"},
            )
            assert copied_me.status_code == 401
            copied_refresh_result = await client.post(
                "/auth/refresh",
                headers={
                    **auth_header,
                    "Cookie": f"refresh_token={copied_refresh}",
                },
            )
            assert copied_refresh_result.status_code == 401

        async with httpx.AsyncClient(transport=transport, base_url="http://test") as first:
            assert (
                await first.post(
                    "/auth/login",
                    headers=auth_header,
                    json={"email": email, "password": initial_password},
                )
            ).status_code == 200
            first_access = first.cookies.get("access_token")
            first_refresh = first.cookies.get("refresh_token")

        async with httpx.AsyncClient(transport=transport, base_url="http://test") as second:
            assert (
                await second.post(
                    "/auth/login",
                    headers=auth_header,
                    json={"email": email, "password": initial_password},
                )
            ).status_code == 200
            second_access = second.cookies.get("access_token")
            second_refresh = second.cookies.get("refresh_token")

        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            mismatched_logout = await client.post(
                "/auth/logout",
                headers={
                    **auth_header,
                    "Cookie": (
                        f"refresh_token={first_refresh}; "
                        f"access_token={second_access}"
                    ),
                },
            )
            assert mismatched_logout.status_code == 200
            for copied_access in (first_access, second_access):
                assert (
                    await client.get(
                        "/auth/me",
                        headers={"Cookie": f"access_token={copied_access}"},
                    )
                ).status_code == 401
            for copied_refresh in (first_refresh, second_refresh):
                assert (
                    await client.post(
                        "/auth/refresh",
                        headers={
                            **auth_header,
                            "Cookie": f"refresh_token={copied_refresh}",
                        },
                    )
                ).status_code == 401

        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            login = await client.post(
                "/auth/login",
                headers=auth_header,
                json={"email": email, "password": initial_password},
            )
            assert login.status_code == 200
            access_before_reset = client.cookies.get("access_token")

            missing_account = await client.post(
                "/auth/password-reset/request",
                headers=auth_header,
                json={"email": f"missing-{email}"},
            )
            reset_request = await client.post(
                "/auth/password-reset/request",
                headers=auth_header,
                json={"email": email.upper()},
            )
            assert missing_account.status_code == reset_request.status_code == 202
            assert missing_account.json() == reset_request.json()
            assert len(reset_tokens) == 1

            weak_reset = await client.post(
                "/auth/password-reset/confirm",
                headers=auth_header,
                json={"token": reset_tokens[0], "password": "too-short"},
            )
            assert weak_reset.status_code == 422

            reset = await client.post(
                "/auth/password-reset/confirm",
                headers=auth_header,
                json={"token": reset_tokens[0], "password": replacement_password},
            )
            assert reset.status_code == 200
            replay_reset = await client.post(
                "/auth/password-reset/confirm",
                headers=auth_header,
                json={"token": reset_tokens[0], "password": replacement_password},
            )
            assert replay_reset.status_code == 400

            revoked_after_reset = await client.get(
                "/auth/me",
                headers={"Cookie": f"access_token={access_before_reset}"},
            )
            assert revoked_after_reset.status_code == 401
            old_password = await client.post(
                "/auth/login",
                headers=auth_header,
                json={"email": email, "password": initial_password},
            )
            assert old_password.status_code == 401
            new_password = await client.post(
                "/auth/login",
                headers=auth_header,
                json={"email": email, "password": replacement_password},
            )
            assert new_password.status_code == 200
            access_before_concurrent_reset = client.cookies.get("access_token")

            monkeypatch.setattr(auth_routes, "PASSWORD_RESET_COOLDOWN_SECONDS", 0)
            second_reset_request = await client.post(
                "/auth/password-reset/request",
                headers=auth_header,
                json={"email": email},
            )
            assert second_reset_request.status_code == 202
            assert len(reset_tokens) == 2

            async def reset_once():
                async with httpx.AsyncClient(
                    transport=transport,
                    base_url="http://test",
                ) as concurrent_client:
                    return await concurrent_client.post(
                        "/auth/password-reset/confirm",
                        headers=auth_header,
                        json={
                            "token": reset_tokens[1],
                            "password": final_password,
                        },
                    )

            concurrent_resets = await asyncio.gather(reset_once(), reset_once())
            assert sorted(result.status_code for result in concurrent_resets) == [200, 400]

            revoked_by_concurrent_reset = await client.get(
                "/auth/me",
                headers={
                    "Cookie": f"access_token={access_before_concurrent_reset}",
                },
            )
            assert revoked_by_concurrent_reset.status_code == 401
            replaced_password = await client.post(
                "/auth/login",
                headers=auth_header,
                json={"email": email, "password": replacement_password},
            )
            assert replaced_password.status_code == 401
            final_login = await client.post(
                "/auth/login",
                headers=auth_header,
                json={"email": email, "password": final_password},
            )
            assert final_login.status_code == 200

            concurrent_refresh = client.cookies.get("refresh_token")

        async def refresh_once():
            async with httpx.AsyncClient(
                transport=transport,
                base_url="http://test",
            ) as concurrent_client:
                return await concurrent_client.post(
                    "/auth/refresh",
                    headers={
                        **auth_header,
                        "Cookie": f"refresh_token={concurrent_refresh}",
                    },
                )

        concurrent_results = await asyncio.gather(refresh_once(), refresh_once())
        assert sorted(result.status_code for result in concurrent_results) == [200, 409]

        async with AsyncSessionLocal() as session:
            user = await session.scalar(select(User).where(User.email == email))
            assert user is not None
            active_sessions = await session.scalar(
                select(func.count(AuthSession.id)).where(
                    AuthSession.user_id == user.id,
                    AuthSession.revoked_at.is_(None),
                )
            )
            assert active_sessions == 1
            assert await session.scalar(
                select(func.count(PasswordResetToken.id)).where(
                    PasswordResetToken.user_id == user.id,
                    PasswordResetToken.used_at.is_not(None),
                )
            ) == 2
    finally:
        async with AsyncSessionLocal() as session:
            user = await session.scalar(select(User).where(User.email == email))
            if user is not None:
                await session.execute(
                    delete(PasswordResetToken).where(
                        PasswordResetToken.user_id == user.id
                    )
                )
                await session.execute(
                    delete(AuthSession).where(AuthSession.user_id == user.id)
                )
                await session.execute(
                    delete(UserRole).where(UserRole.user_id == user.id)
                )
                await session.execute(
                    delete(UserPreferences).where(UserPreferences.user_id == user.id)
                )
                await session.execute(delete(User).where(User.id == user.id))
                await session.commit()
        await engine.dispose()
