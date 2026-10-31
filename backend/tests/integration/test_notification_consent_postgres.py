import asyncio
import os
import re
import threading
from datetime import UTC, datetime, timedelta
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


async def test_notification_consent_persistence_and_verification(monkeypatch):
    from app.Routes import preferences_route, webpush_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import AuthSession, User, UserPreferences, WebPushSubscription
    from app.utils.auth import issue_session

    user_id = uuid4()
    other_user_id = uuid4()
    email = f"consent-{user_id}@example.test"
    other_email = f"consent-{other_user_id}@example.test"
    phone = "+919876543210"
    captured_codes: list[str] = []

    def capture_verification(_number: str, message: str, **_kwargs) -> bool:
        match = re.search(r"\b([0-9]{6})\b", message)
        assert match is not None
        captured_codes.append(match.group(1))
        return True

    monkeypatch.setattr(settings, "CONSENT_VERIFICATION_SECRET", "v" * 32)
    monkeypatch.setattr(
        preferences_route,
        "send_whatsapp_message",
        capture_verification,
    )

    app = FastAPI()
    app.include_router(preferences_route.router, prefix="/user")
    app.include_router(webpush_routes.router, prefix="/api")
    transport = httpx.ASGITransport(app=app)

    async with AsyncSessionLocal() as session:
        session.add_all(
            [
                User(id=user_id, email=email),
                User(id=other_user_id, email=other_email),
                UserPreferences(user_id=user_id),
                UserPreferences(user_id=other_user_id),
            ]
        )
        await session.commit()
        tokens = await issue_session(session, user_id)
        other_tokens = await issue_session(session, other_user_id)

    headers = {"Authorization": f"Bearer {tokens.access}"}
    other_headers = {"Authorization": f"Bearer {other_tokens.access}"}

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            defaults = await client.get("/user/preferences", headers=headers)
            assert defaults.status_code == 200
            for field in (
                "nudge_enabled",
                "spot_reminder_enabled",
                "microchallenge_enabled",
                "push_enabled",
                "whatsapp_enabled",
                "whatsapp_verified",
            ):
                assert defaults.json()[field] is False

            forbidden = await client.patch(
                "/user/preferences",
                headers=headers,
                json={"nudge_enabled": True, "whatsapp_verified": True},
            )
            assert forbidden.status_code == 422
            unchanged = await client.get("/user/preferences", headers=headers)
            assert unchanged.json()["nudge_enabled"] is False
            assert unchanged.json()["whatsapp_verified"] is False

            explicit_null = await client.patch(
                "/user/preferences",
                headers=headers,
                json={"nudge_enabled": True, "push_enabled": None},
            )
            assert explicit_null.status_code == 422
            unchanged_after_null = await client.get("/user/preferences", headers=headers)
            assert unchanged_after_null.json()["nudge_enabled"] is False
            assert unchanged_after_null.json()["push_enabled"] is False

            enabled_purposes = await client.patch(
                "/user/preferences",
                headers=headers,
                json={
                    "nudge_enabled": True,
                    "spot_reminder_enabled": True,
                    "microchallenge_enabled": True,
                },
            )
            assert enabled_purposes.status_code == 200

            premature = await client.patch(
                "/user/preferences",
                headers=headers,
                json={"whatsapp_enabled": True},
            )
            assert premature.status_code == 409

            malformed = await client.post(
                "/user/preferences/whatsapp-verification",
                headers=headers,
                json={"number": "9876543210"},
            )
            assert malformed.status_code == 422
            assert captured_codes == []

            requested = await client.post(
                "/user/preferences/whatsapp-verification",
                headers=headers,
                json={"number": phone},
            )
            assert requested.status_code == 202
            assert len(captured_codes) == 1

            opted_out_while_pending = await client.patch(
                "/user/preferences",
                headers=headers,
                json={"whatsapp_enabled": False},
            )
            assert opted_out_while_pending.status_code == 200

            async with AsyncSessionLocal() as session:
                pending = await session.scalar(
                    select(UserPreferences).where(UserPreferences.user_id == user_id)
                )
                assert pending.whatsapp_pending_number == phone
                assert pending.whatsapp_verification_code_hash != captured_codes[0]
                assert captured_codes[0] not in pending.whatsapp_verification_code_hash
                assert pending.whatsapp_verified is False
                assert pending.whatsapp_enabled is False

            wrong = await client.post(
                "/user/preferences/whatsapp-verification/confirm",
                headers=headers,
                json={"code": "000000" if captured_codes[0] != "000000" else "111111"},
            )
            assert wrong.status_code == 400

            confirmed = await client.post(
                "/user/preferences/whatsapp-verification/confirm",
                headers=headers,
                json={"code": captured_codes[0]},
            )
            assert confirmed.status_code == 200
            assert confirmed.json()["whatsapp_verified"] is True
            assert confirmed.json()["whatsapp_enabled"] is False
            assert confirmed.json()["whatsapp_number"] == phone

            explicitly_enabled = await client.patch(
                "/user/preferences",
                headers=headers,
                json={"whatsapp_enabled": True},
            )
            assert explicitly_enabled.status_code == 200
            assert explicitly_enabled.json()["whatsapp_enabled"] is True

            replay = await client.post(
                "/user/preferences/whatsapp-verification/confirm",
                headers=headers,
                json={"code": captured_codes[0]},
            )
            assert replay.status_code == 409

            duplicate_request = await client.post(
                "/user/preferences/whatsapp-verification",
                headers=other_headers,
                json={"number": phone},
            )
            assert duplicate_request.status_code == 202
            duplicate_confirm = await client.post(
                "/user/preferences/whatsapp-verification/confirm",
                headers=other_headers,
                json={"code": captured_codes[-1]},
            )
            assert duplicate_confirm.status_code == 409

            new_request = await client.post(
                "/user/preferences/whatsapp-verification",
                headers=headers,
                json={"number": "+919876543211"},
            )
            assert new_request.status_code == 202
            async with AsyncSessionLocal() as session:
                pending = await session.scalar(
                    select(UserPreferences).where(UserPreferences.user_id == user_id)
                )
                pending.whatsapp_verification_expires_at = (
                    datetime.now(UTC).replace(tzinfo=None) - timedelta(seconds=1)
                )
                await session.commit()
            expired = await client.post(
                "/user/preferences/whatsapp-verification/confirm",
                headers=headers,
                json={"code": captured_codes[-1]},
            )
            assert expired.status_code == 409

            monkeypatch.setattr(
                preferences_route,
                "send_whatsapp_message",
                lambda *_args, **_kwargs: False,
            )
            provider_failed = await client.post(
                "/user/preferences/whatsapp-verification",
                headers=headers,
                json={"number": "+919876543212"},
            )
            assert provider_failed.status_code == 502
            async with AsyncSessionLocal() as session:
                failed_preferences = await session.scalar(
                    select(UserPreferences).where(UserPreferences.user_id == user_id)
                )
                assert failed_preferences.whatsapp_pending_number is None
                assert failed_preferences.whatsapp_verified is False
                assert failed_preferences.whatsapp_enabled is False

            # An older provider failure must not clear a newer successfully
            # delivered challenge for the same account.
            first_number = "+919876543214"
            second_number = "+919876543215"
            first_started = threading.Event()
            release_first = threading.Event()

            def out_of_order_delivery(number: str, message: str, **kwargs) -> bool:
                if number == first_number:
                    first_started.set()
                    assert release_first.wait(timeout=5)
                    return False
                return capture_verification(number, message, **kwargs)

            rate_limit_enabled = settings.RATE_LIMIT_ENABLED
            monkeypatch.setattr(settings, "RATE_LIMIT_ENABLED", False)
            monkeypatch.setattr(
                preferences_route,
                "send_whatsapp_message",
                out_of_order_delivery,
            )
            older_request = asyncio.create_task(
                client.post(
                    "/user/preferences/whatsapp-verification",
                    headers=headers,
                    json={"number": first_number},
                )
            )
            assert await asyncio.to_thread(first_started.wait, 5)
            newer_request = await client.post(
                "/user/preferences/whatsapp-verification",
                headers=headers,
                json={"number": second_number},
            )
            assert newer_request.status_code == 202
            newer_code = captured_codes[-1]
            release_first.set()
            assert (await older_request).status_code == 502

            async with AsyncSessionLocal() as session:
                latest = await session.scalar(
                    select(UserPreferences).where(UserPreferences.user_id == user_id)
                )
                assert latest.whatsapp_pending_number == second_number
                assert latest.whatsapp_verification_code_hash == (
                    preferences_route._verification_hash(second_number, newer_code)
                )

            latest_confirmed = await client.post(
                "/user/preferences/whatsapp-verification/confirm",
                headers=headers,
                json={"code": newer_code},
            )
            assert latest_confirmed.status_code == 200
            assert latest_confirmed.json()["whatsapp_number"] == second_number
            assert latest_confirmed.json()["whatsapp_enabled"] is False

            monkeypatch.setattr(
                preferences_route,
                "send_whatsapp_message",
                capture_verification,
            )
            monkeypatch.setattr(settings, "RATE_LIMIT_ENABLED", rate_limit_enabled)
            bounded_request = await client.post(
                "/user/preferences/whatsapp-verification",
                headers=headers,
                json={"number": "+919876543213"},
            )
            assert bounded_request.status_code == 202
            bounded_code = captured_codes[-1]
            wrong_code = "000000" if bounded_code != "000000" else "111111"
            for _ in range(preferences_route.MAX_VERIFICATION_ATTEMPTS):
                rejected = await client.post(
                    "/user/preferences/whatsapp-verification/confirm",
                    headers=headers,
                    json={"code": wrong_code},
                )
                assert rejected.status_code == 400
            after_limit = await client.post(
                "/user/preferences/whatsapp-verification/confirm",
                headers=headers,
                json={"code": bounded_code},
            )
            assert after_limit.status_code == 409

            push_payload = {
                "endpoint": "https://fcm.googleapis.com/subscription-1",
                "keys": {"p256dh": "p" * 32, "auth": "a" * 16},
            }
            registered = await client.post(
                "/api/register-webpush",
                headers=headers,
                json=push_payload,
            )
            assert registered.status_code == 200
            async with AsyncSessionLocal() as session:
                registered_preferences = await session.scalar(
                    select(UserPreferences).where(UserPreferences.user_id == user_id)
                )
                assert registered_preferences.push_enabled is False
            stolen = await client.post(
                "/api/register-webpush",
                headers=other_headers,
                json=push_payload,
            )
            assert stolen.status_code == 409
            removed = await client.post(
                "/api/unregister-webpush",
                headers=headers,
            )
            assert removed.status_code == 200

        async with AsyncSessionLocal() as session:
            owner_prefs = await session.scalar(
                select(UserPreferences).where(UserPreferences.user_id == user_id)
            )
            assert owner_prefs.push_enabled is False
            assert await session.scalar(
                select(WebPushSubscription).where(
                    WebPushSubscription.user_id == user_id
                )
            ) is None
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(
                delete(WebPushSubscription).where(
                    WebPushSubscription.user_id.in_([user_id, other_user_id])
                )
            )
            await session.execute(
                delete(AuthSession).where(AuthSession.user_id.in_([user_id, other_user_id]))
            )
            await session.execute(
                delete(UserPreferences).where(
                    UserPreferences.user_id.in_([user_id, other_user_id])
                )
            )
            await session.execute(delete(User).where(User.id.in_([user_id, other_user_id])))
            await session.commit()
        await engine.dispose()
