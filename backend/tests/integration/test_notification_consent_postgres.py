import hashlib
import hmac
import json
import os
import re
from datetime import UTC, datetime, timedelta
from urllib.parse import parse_qs, urlsplit
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

APP_SECRET = "integration-meta-app-secret-value"
WABA_ID = "123456789012345"
PHONE_NUMBER_ID = "987654321098765"
BUSINESS_NUMBER = "919209830485"


def _payload(message_id: str, sender: str, body: str) -> dict:
    return {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": WABA_ID,
            "changes": [{
                "field": "messages",
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {
                        "display_phone_number": BUSINESS_NUMBER,
                        "phone_number_id": PHONE_NUMBER_ID,
                    },
                    "messages": [{
                        "from": sender.removeprefix("+"),
                        "id": message_id,
                        "timestamp": "1730678400",
                        "type": "text",
                        "text": {"body": body},
                    }],
                },
            }],
        }],
    }


def _signed(payload: dict) -> tuple[bytes, dict[str, str]]:
    raw = json.dumps(payload, separators=(",", ":")).encode()
    digest = hmac.new(APP_SECRET.encode(), raw, hashlib.sha256).hexdigest()
    return raw, {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": f"sha256={digest}",
    }


async def test_channel_consent_and_inbound_whatsapp_pairing(monkeypatch):
    from app.Routes import preferences_route, whatsapp_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import AuthSession, User, UserPreferences, WhatsAppWebhookEvent
    from app.utils.auth import issue_session

    user_id = uuid4()
    other_user_id = uuid4()
    sender = "+919876543210"
    message_ids = [
        "wamid.pair",
        "wamid.pair-replay",
        "wamid.owner-conflict",
        "wamid.stop",
        "wamid.start",
        "wamid.expired",
    ]
    sent: list[tuple[str, str]] = []

    monkeypatch.setattr(settings, "RATE_LIMIT_ENABLED", False)
    monkeypatch.setattr(settings, "CONSENT_PAIRING_SECRET", "p" * 32)
    monkeypatch.setattr(settings, "WHATSAPP_ACCESS_TOKEN", "a" * 40)
    monkeypatch.setattr(settings, "WHATSAPP_APP_SECRET", APP_SECRET)
    monkeypatch.setattr(settings, "WHATSAPP_VERIFY_TOKEN", "v" * 32)
    monkeypatch.setattr(settings, "WHATSAPP_BUSINESS_ACCOUNT_ID", WABA_ID)
    monkeypatch.setattr(settings, "WHATSAPP_PHONE_NUMBER_ID", PHONE_NUMBER_ID)
    monkeypatch.setattr(settings, "WHATSAPP_BUSINESS_NUMBER", BUSINESS_NUMBER)
    monkeypatch.setattr(settings, "WHATSAPP_GRAPH_API_VERSION", "v25.0")
    monkeypatch.setattr(
        whatsapp_routes,
        "send_whatsapp_service_message",
        lambda number, message, **_kwargs: sent.append((number, message)) or True,
    )

    app = FastAPI()
    app.include_router(preferences_route.router, prefix="/user")
    app.include_router(whatsapp_routes.router, prefix="/wa")
    transport = httpx.ASGITransport(app=app)

    async with AsyncSessionLocal() as session:
        session.add_all([
            User(id=user_id, email=f"pair-{user_id}@example.test"),
            User(id=other_user_id, email=f"pair-{other_user_id}@example.test"),
            UserPreferences(user_id=user_id),
            UserPreferences(user_id=other_user_id),
        ])
        await session.commit()
        tokens = await issue_session(session, user_id)
        other_tokens = await issue_session(session, other_user_id)

    headers = {"Authorization": f"Bearer {tokens.access}"}
    other_headers = {"Authorization": f"Bearer {other_tokens.access}"}

    async def webhook(client, message_id: str, body: str):
        raw, signed_headers = _signed(_payload(message_id, sender, body))
        return await client.post("/wa/webhook/whatsapp", content=raw, headers=signed_headers)

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            defaults = await client.get("/user/preferences", headers=headers)
            assert defaults.status_code == 200
            assert defaults.json()["push_enabled"] is False
            assert defaults.json()["whatsapp_connected"] is False
            assert "nudge_enabled" not in defaults.json()
            assert "whatsapp_number" not in defaults.json()

            forbidden_purpose = await client.patch(
                "/user/preferences", headers=headers, json={"nudge_enabled": True}
            )
            assert forbidden_purpose.status_code == 422
            push = await client.patch(
                "/user/preferences", headers=headers, json={"push_enabled": True}
            )
            assert push.status_code == 200
            assert push.json()["push_enabled"] is True

            pairing = await client.post("/user/preferences/whatsapp-pairing", headers=headers)
            assert pairing.status_code == 201
            url = pairing.json()["whatsapp_url"]
            assert urlsplit(url).netloc == "wa.me"
            assert urlsplit(url).path == f"/{BUSINESS_NUMBER}"
            consent_message = parse_qs(urlsplit(url).query)["text"][0]
            assert "Neurocient" in consent_message
            assert "nudges, check-ins" in consent_message
            assert "microchallenge progress" in consent_message
            assert "STOP" not in consent_message
            token = consent_message.rsplit("Connection code: ", 1)[1]
            assert re.fullmatch(r"[A-Z2-7]{4}(?:-[A-Z2-7]{4}){3}", token)

            async with AsyncSessionLocal() as session:
                pending = await session.scalar(
                    select(UserPreferences).where(UserPreferences.user_id == user_id)
                )
                assert pending.whatsapp_pairing_token_hash == preferences_route.pairing_token_hash(token)
                assert token not in pending.whatsapp_pairing_token_hash

            connected = await webhook(client, message_ids[0], consent_message)
            assert connected.status_code == 200
            state = (await client.get("/user/preferences", headers=headers)).json()
            assert state["whatsapp_connected"] is True
            assert state["whatsapp_enabled"] is True
            assert state["whatsapp_display_number"].endswith("3210")
            assert sender not in json.dumps(state)
            async with AsyncSessionLocal() as session:
                connected_preferences = await session.scalar(
                    select(UserPreferences).where(UserPreferences.user_id == user_id)
                )
                assert connected_preferences.whatsapp_consent_version == (
                    "whatsapp-companion-v4"
                )

            replay = await webhook(client, message_ids[0], consent_message)
            assert replay.status_code == 200
            assert len([message for _, message in sent if "You're connected" in message]) == 1
            connected_reply = next(
                message for _, message in sent if "You're connected" in message
            )
            assert "Reply STOP at any time" in connected_reply

            other_pairing = await client.post(
                "/user/preferences/whatsapp-pairing", headers=other_headers
            )
            other_message = parse_qs(urlsplit(other_pairing.json()["whatsapp_url"]).query)["text"][0]
            conflict = await webhook(client, message_ids[2], other_message)
            assert conflict.status_code == 200
            assert (await client.get("/user/preferences", headers=other_headers)).json()["whatsapp_connected"] is False

            assert (await webhook(client, message_ids[3], "STOP")).status_code == 200
            assert (await client.get("/user/preferences", headers=headers)).json()["whatsapp_enabled"] is False
            assert (await webhook(client, message_ids[4], "START")).status_code == 200
            assert (await client.get("/user/preferences", headers=headers)).json()["whatsapp_enabled"] is True

            disconnected = await client.delete(
                "/user/preferences/whatsapp-connection", headers=headers
            )
            assert disconnected.status_code == 200
            assert disconnected.json()["whatsapp_connected"] is False

            expired_pairing = await client.post(
                "/user/preferences/whatsapp-pairing", headers=other_headers
            )
            expired_message = parse_qs(urlsplit(expired_pairing.json()["whatsapp_url"]).query)["text"][0]
            async with AsyncSessionLocal() as session:
                prefs = await session.scalar(
                    select(UserPreferences).where(UserPreferences.user_id == other_user_id)
                )
                prefs.whatsapp_pairing_expires_at = datetime.now(UTC).replace(tzinfo=None) - timedelta(seconds=1)
                await session.commit()
            assert (await webhook(client, message_ids[5], expired_message)).status_code == 200
            assert (await client.get("/user/preferences", headers=other_headers)).json()["whatsapp_connected"] is False
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(delete(WhatsAppWebhookEvent).where(WhatsAppWebhookEvent.provider_message_id.in_(message_ids)))
            await session.execute(delete(AuthSession).where(AuthSession.user_id.in_([user_id, other_user_id])))
            await session.execute(delete(UserPreferences).where(UserPreferences.user_id.in_([user_id, other_user_id])))
            await session.execute(delete(User).where(User.id.in_([user_id, other_user_id])))
            await session.commit()
        await engine.dispose()
