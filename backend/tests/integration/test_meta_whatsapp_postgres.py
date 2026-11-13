import asyncio
import hashlib
import hmac
import json
import logging
import os
from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock
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

APP_SECRET = "postgres-meta-app-secret"
VERIFY_TOKEN = "postgres-meta-verify-token"
WABA_ID = "123456789012345"
PHONE_NUMBER_ID = "987654321098765"


def _message_id() -> str:
    return f"wamid.{uuid4().hex}"


def _configure(settings, monkeypatch) -> None:
    monkeypatch.setattr(settings, "WHATSAPP_ACCESS_TOKEN", "postgres-access-token")
    monkeypatch.setattr(settings, "WHATSAPP_APP_SECRET", APP_SECRET)
    monkeypatch.setattr(settings, "WHATSAPP_VERIFY_TOKEN", VERIFY_TOKEN)
    monkeypatch.setattr(settings, "WHATSAPP_BUSINESS_ACCOUNT_ID", WABA_ID)
    monkeypatch.setattr(settings, "WHATSAPP_PHONE_NUMBER_ID", PHONE_NUMBER_ID)
    monkeypatch.setattr(settings, "WHATSAPP_GRAPH_API_VERSION", "v24.0")


def _payload(message_id: str, phone: str, body: str) -> dict:
    return {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": WABA_ID,
            "changes": [{
                "field": "messages",
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {
                        "display_phone_number": "15551234567",
                        "phone_number_id": PHONE_NUMBER_ID,
                    },
                    "messages": [{
                        "from": phone.removeprefix("+"),
                        "id": message_id,
                        "timestamp": "1730678400",
                        "type": "text",
                        "text": {"body": body},
                    }],
                },
            }],
        }],
    }


def _button_payload(
    message_id: str,
    phone: str,
    *,
    text: str,
    payload: str,
) -> dict:
    event = _payload(message_id, phone, text)
    message = event["entry"][0]["changes"][0]["value"]["messages"][0]
    message["type"] = "button"
    message.pop("text")
    message["button"] = {"text": text, "payload": payload}
    return event


def _signed_content(payload: dict) -> tuple[bytes, dict[str, str]]:
    raw_body = json.dumps(payload, separators=(",", ":")).encode()
    digest = hmac.new(APP_SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
    return raw_body, {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": f"sha256={digest}",
    }


async def _post(client, payload: dict) -> httpx.Response:
    raw_body, headers = _signed_content(payload)
    return await client.post(
        "/wa/webhook/whatsapp",
        content=raw_body,
        headers=headers,
    )


def _status_payload(message_id: str, status: str) -> dict:
    return {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": WABA_ID,
            "changes": [{
                "field": "messages",
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {
                        "display_phone_number": "15551234567",
                        "phone_number_id": PHONE_NUMBER_ID,
                    },
                    "statuses": [{
                        "id": message_id,
                        "status": status,
                        "timestamp": "1730678400",
                    }],
                },
            }],
        }],
    }


async def test_meta_delivery_status_updates_durable_dispatch(monkeypatch):
    from app.Routes import whatsapp_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import NotificationDispatch, User
    from app.services.product_clock import product_today

    _configure(settings, monkeypatch)
    user_id = uuid4()
    dispatch_id = uuid4()
    provider_message_id = _message_id()

    async with AsyncSessionLocal() as db:
        db.add(User(id=user_id, email=f"meta-status-{uuid4()}@example.com"))
        await db.commit()
        db.add(NotificationDispatch(
            id=dispatch_id,
            user_id=user_id,
            purpose="nudge",
            channel="whatsapp",
            destination_key="verified-account-number",
            dispatch_date=product_today(),
            status="accepted",
            correlation_id=uuid4(),
            provider_message_id=provider_message_id,
        ))
        await db.commit()

    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    transport = httpx.ASGITransport(app=app)
    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            response = await _post(
                client,
                _status_payload(provider_message_id, "delivered"),
            )
        assert response.status_code == 200
        async with AsyncSessionLocal() as db:
            dispatch = await db.get(NotificationDispatch, dispatch_id)
            assert dispatch.status == "delivered"
            assert dispatch.delivered_at is not None
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(NotificationDispatch).where(NotificationDispatch.id == dispatch_id)
            )
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_spot_v4_delivery_durably_opens_fifteen_minute_reply_window(
    monkeypatch,
):
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import NotificationDispatch, User, UserPreferences
    from app.services.whatsapp_interactions import (
        SPOT_CAPTURE_ACTION,
        SPOT_CAPTURE_WINDOW,
    )
    from app.utils import reminder_engine

    user_id = uuid4()
    phone = "+917" + str(uuid4().int)[:9]
    sent_at = datetime(2026, 11, 13, 12, 0, 0)
    monkeypatch.setattr(
        settings,
        "WHATSAPP_SPOT_TEMPLATE_NAME",
        "neurocient_spot_checkin_v4",
    )
    monkeypatch.setattr(reminder_engine, "_utcnow", lambda: sent_at)
    monkeypatch.setattr(
        reminder_engine.asyncio,
        "to_thread",
        AsyncMock(return_value="wamid.spot-v4-test"),
    )

    try:
        async with AsyncSessionLocal() as db:
            db.add_all([
                User(id=user_id, email=f"spot-v4-{uuid4()}@example.com"),
                UserPreferences(
                    user_id=user_id,
                    whatsapp_number=phone,
                    whatsapp_verified=True,
                    whatsapp_enabled=True,
                ),
            ])
            await db.commit()

            result = await reminder_engine._deliver_to_user(
                db,
                user_id=user_id,
                purpose="spot_reminder",
                title="Spot check",
                body="Did you spot your Inner Caveman today?",
            )
            assert result["whatsapp_success"] == 1

        async with AsyncSessionLocal() as db:
            prefs = await db.scalar(
                select(UserPreferences).where(UserPreferences.user_id == user_id)
            )
            assert prefs.whatsapp_pending_action == SPOT_CAPTURE_ACTION
            assert prefs.whatsapp_pending_action_expires_at == (
                sent_at + SPOT_CAPTURE_WINDOW
            )
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(NotificationDispatch).where(
                    NotificationDispatch.user_id == user_id
                )
            )
            await db.execute(
                delete(UserPreferences).where(UserPreferences.user_id == user_id)
            )
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_meta_whatsapp_boundary_is_private_and_replay_safe(monkeypatch, caplog):
    from app.Routes import whatsapp_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import CavemanSpot, User, UserPreferences, WhatsAppWebhookEvent

    _configure(settings, monkeypatch)
    phone = "+919" + str(uuid4().int)[:9]
    unknown_phone = "+918" + str(uuid4().int)[:9]
    private_message = f"private-message-{uuid4()}"
    user_id = uuid4()
    first_id, unknown_id, concurrent_id = (_message_id() for _ in range(3))
    event_ids = [first_id, unknown_id, concurrent_id]
    sent_to: list[str] = []

    monkeypatch.setattr(
        whatsapp_routes,
        "send_whatsapp_service_message",
        lambda to_number, _message, *, emit_logs=True: sent_to.append(to_number) or True,
    )
    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    transport = httpx.ASGITransport(app=app)

    async with AsyncSessionLocal() as db:
        db.add_all([
            User(id=user_id, email=f"meta-{uuid4()}@example.com", name="Webhook Test"),
            UserPreferences(
                user_id=user_id,
                whatsapp_number=phone,
                whatsapp_verified=True,
            ),
        ])
        await db.commit()

    first_payload = _payload(first_id, phone, f"spot: {private_message}")
    caplog.set_level(logging.INFO, logger="whatsapp")
    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            raw_body, headers = _signed_content(first_payload)
            invalid = await client.post(
                "/wa/webhook/whatsapp",
                content=raw_body,
                headers={**headers, "X-Hub-Signature-256": "sha256=" + "0" * 64},
            )
            assert invalid.status_code == 403

            wrong_asset = json.loads(raw_body)
            wrong_asset["entry"][0]["id"] = "999999999999999"
            wrong = await _post(client, wrong_asset)
            assert wrong.status_code == 400

            accepted = await _post(client, first_payload)
            replay = await _post(client, first_payload)
            changed_replay = await _post(
                client,
                _payload(first_id, phone, "spot: changed content must not replace the first"),
            )
            unknown = await _post(
                client,
                _payload(unknown_id, unknown_phone, f"spot: {private_message}"),
            )
            assert [
                accepted.status_code,
                replay.status_code,
                changed_replay.status_code,
                unknown.status_code,
            ] == [200, 200, 200, 200]

        concurrent_payload = _payload(
            concurrent_id,
            phone,
            f"spot: {private_message}",
        )

        async def post_concurrently() -> httpx.Response:
            async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
                return await _post(client, concurrent_payload)

        responses = await asyncio.gather(post_concurrently(), post_concurrently())
        assert [response.status_code for response in responses] == [200, 200]

        async with AsyncSessionLocal() as db:
            spot_count = await db.scalar(
                select(func.count(CavemanSpot.id)).where(CavemanSpot.user_id == user_id)
            )
            event_count = await db.scalar(
                select(func.count(WhatsAppWebhookEvent.provider_message_id)).where(
                    WhatsAppWebhookEvent.provider_message_id.in_(event_ids)
                )
            )
        assert spot_count == 2
        assert event_count == 3
        assert sent_to == [phone, phone]

        observable = caplog.text + invalid.text + wrong.text + accepted.text
        assert phone not in observable
        assert unknown_phone not in observable
        assert private_message not in observable
        assert APP_SECRET not in observable
        assert headers["X-Hub-Signature-256"] not in observable
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(CavemanSpot).where(CavemanSpot.user_id == user_id))
            await db.execute(
                delete(WhatsAppWebhookEvent).where(
                    WhatsAppWebhookEvent.provider_message_id.in_(event_ids)
                )
            )
            await db.execute(delete(UserPreferences).where(UserPreferences.user_id == user_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_spot_quick_reply_opens_bounded_natural_language_capture(monkeypatch):
    from app.Routes import whatsapp_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import CavemanSpot, User, UserPreferences, WhatsAppWebhookEvent

    _configure(settings, monkeypatch)
    phone = "+917" + str(uuid4().int)[:9]
    user_id = uuid4()
    button_id = _message_id()
    reply_id = _message_id()
    observation = "I opened another tab when the task became unclear."
    acknowledgements: list[str] = []
    monkeypatch.setattr(
        whatsapp_routes,
        "send_whatsapp_service_message",
        lambda _number, message, *, emit_logs=True: acknowledgements.append(message) or True,
    )
    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    transport = httpx.ASGITransport(app=app)

    async with AsyncSessionLocal() as db:
        db.add_all([
            User(id=user_id, email=f"spot-button-{uuid4()}@example.com"),
            UserPreferences(
                user_id=user_id,
                whatsapp_number=phone,
                whatsapp_verified=True,
                whatsapp_enabled=True,
            ),
        ])
        await db.commit()

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            opened = await _post(
                client,
                _button_payload(
                    button_id,
                    phone,
                    text="Record what I noticed",
                    payload="spot_capture_v1",
                ),
            )
            assert opened.status_code == 200
            async with AsyncSessionLocal() as db:
                prefs = await db.scalar(
                    select(UserPreferences).where(UserPreferences.user_id == user_id)
                )
                assert prefs.whatsapp_pending_action == "spot_capture"
                assert prefs.whatsapp_pending_action_expires_at is not None

            recorded = await _post(client, _payload(reply_id, phone, observation))
            assert recorded.status_code == 200

        async with AsyncSessionLocal() as db:
            prefs = await db.scalar(
                select(UserPreferences).where(UserPreferences.user_id == user_id)
            )
            spot = await db.scalar(
                select(CavemanSpot).where(CavemanSpot.user_id == user_id)
            )
            assert prefs.whatsapp_pending_action is None
            assert prefs.whatsapp_pending_action_expires_at is None
            assert spot.description == observation
        assert acknowledgements == [
            "What did you notice? Reply in your own words.",
            "Recorded in Spot the Inner Caveman.",
        ]
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(CavemanSpot).where(CavemanSpot.user_id == user_id))
            await db.execute(
                delete(WhatsAppWebhookEvent).where(
                    WhatsAppWebhookEvent.provider_message_id.in_([button_id, reply_id])
                )
            )
            await db.execute(delete(UserPreferences).where(UserPreferences.user_id == user_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_expired_spot_capture_does_not_consume_unrelated_text(monkeypatch):
    from app.Routes import whatsapp_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import CavemanSpot, User, UserPreferences, WhatsAppWebhookEvent

    _configure(settings, monkeypatch)
    phone = "+917" + str(uuid4().int)[:9]
    user_id = uuid4()
    message_ids = [_message_id(), _message_id()]
    acknowledgements: list[str] = []
    monkeypatch.setattr(
        whatsapp_routes,
        "send_whatsapp_service_message",
        lambda _number, message, *, emit_logs=True: acknowledgements.append(message) or True,
    )
    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    transport = httpx.ASGITransport(app=app)

    async with AsyncSessionLocal() as db:
        db.add_all([
            User(id=user_id, email=f"spot-expiry-{uuid4()}@example.com"),
            UserPreferences(
                user_id=user_id,
                whatsapp_number=phone,
                whatsapp_verified=True,
                whatsapp_enabled=True,
            ),
        ])
        await db.commit()

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            await _post(
                client,
                _button_payload(
                    message_ids[0],
                    phone,
                    text="Record what I noticed",
                    payload="spot_capture_v1",
                ),
            )
            async with AsyncSessionLocal() as db:
                prefs = await db.scalar(
                    select(UserPreferences).where(UserPreferences.user_id == user_id)
                )
                prefs.whatsapp_pending_action_expires_at = (
                    datetime.now(UTC).replace(tzinfo=None) - timedelta(seconds=1)
                )
                await db.commit()

            response = await _post(
                client,
                _payload(message_ids[1], phone, "This is an unrelated later message."),
            )
            assert response.status_code == 200

        async with AsyncSessionLocal() as db:
            prefs = await db.scalar(
                select(UserPreferences).where(UserPreferences.user_id == user_id)
            )
            spot_count = await db.scalar(
                select(func.count(CavemanSpot.id)).where(CavemanSpot.user_id == user_id)
            )
            assert prefs.whatsapp_pending_action is None
            assert prefs.whatsapp_pending_action_expires_at is None
            assert spot_count == 0
        assert acknowledgements == [
            "What did you notice? Reply in your own words.",
            whatsapp_routes.HELP_MESSAGE,
        ]
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(WhatsAppWebhookEvent).where(
                    WhatsAppWebhookEvent.provider_message_id.in_(message_ids)
                )
            )
            await db.execute(delete(UserPreferences).where(UserPreferences.user_id == user_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_meta_whatsapp_response_writes_shared_daily_outcome(monkeypatch):
    from app.Routes import whatsapp_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import (
        MicrochallengeDefinition,
        MicrochallengeLog,
        NotificationDispatch,
        User,
        UserMicrochallenge,
        UserPreferences,
        WhatsAppWebhookEvent,
    )
    from app.services.microchallenge_progress import product_today

    _configure(settings, monkeypatch)
    phone = "+916" + str(uuid4().int)[:9]
    user_id, challenge_id, assignment_id = uuid4(), uuid4(), uuid4()
    message_ids = [_message_id(), _message_id(), _message_id()]
    sent_messages: list[str] = []
    monkeypatch.setattr(
        whatsapp_routes,
        "send_whatsapp_service_message",
        lambda _number, message, *, emit_logs=True: sent_messages.append(message) or True,
    )

    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    transport = httpx.ASGITransport(app=app)
    async with AsyncSessionLocal() as db:
        db.add(User(id=user_id, email=f"meta-micro-{uuid4()}@example.com"))
        await db.commit()
        db.add_all([
            UserPreferences(
                user_id=user_id,
                whatsapp_number=phone,
                whatsapp_verified=True,
                whatsapp_enabled=True,
                microchallenge_enabled=True,
            ),
            MicrochallengeDefinition(
                id=challenge_id,
                title="Put the phone away",
                intro=[],
                instructions=["Leave it outside the room for ten minutes."],
                why="Reduce the easiest source of switching.",
                tips=[],
                closing="Notice what became easier.",
            ),
            UserMicrochallenge(
                id=assignment_id,
                user_id=user_id,
                challenge_id=challenge_id,
                status="active",
            ),
            NotificationDispatch(
                user_id=user_id,
                purpose="microchallenge",
                channel="whatsapp",
                destination_key=f"microchallenge-assignment:{assignment_id}",
                dispatch_date=product_today(),
                status="sent",
                correlation_id=uuid4(),
            ),
        ])
        await db.commit()

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            first_payload = _button_payload(
                message_ids[0],
                phone,
                text="Partly",
                payload="micro_partly_v1",
            )
            responses = [
                await _post(client, first_payload),
                await _post(client, first_payload),
                await _post(
                    client,
                    _payload(message_ids[1], phone, "note: The phone was still beside me"),
                ),
                await _post(client, _payload(message_ids[2], phone, "Done")),
            ]
        assert [response.status_code for response in responses] == [200, 200, 200, 200]
        async with AsyncSessionLocal() as db:
            logs = (
                await db.scalars(
                    select(MicrochallengeLog).where(
                        MicrochallengeLog.assignment_id == assignment_id
                    )
                )
            ).all()
        assert len(logs) == 1
        assert logs[0].outcome == "partly"
        assert logs[0].note == "The phone was still beside me"
        assert "Partial attempts" in sent_messages[0]
        assert sent_messages[1] == "Thanks. That's recorded with today's experiment."
        assert sent_messages[2] == "Today's experiment has already been recorded."
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(WhatsAppWebhookEvent).where(
                    WhatsAppWebhookEvent.provider_message_id.in_(message_ids)
                )
            )
            await db.execute(delete(UserMicrochallenge).where(UserMicrochallenge.id == assignment_id))
            await db.execute(delete(NotificationDispatch).where(NotificationDispatch.user_id == user_id))
            await db.execute(delete(MicrochallengeDefinition).where(MicrochallengeDefinition.id == challenge_id))
            await db.execute(delete(UserPreferences).where(UserPreferences.user_id == user_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_meta_whatsapp_spot_respects_shared_free_limit(monkeypatch):
    from app.Routes import whatsapp_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import CavemanSpot, User, UserPreferences, WhatsAppWebhookEvent
    from app.services.product_clock import product_today
    from app.services.spot_capture import FREE_SPOT_LIMIT

    _configure(settings, monkeypatch)
    phone = "+915" + str(uuid4().int)[:9]
    user_id = uuid4()
    message_ids = [_message_id(), _message_id()]
    sent_messages: list[str] = []
    monkeypatch.setattr(
        whatsapp_routes,
        "send_whatsapp_service_message",
        lambda _number, message, *, emit_logs=True: sent_messages.append(message) or True,
    )

    async with AsyncSessionLocal() as db:
        db.add(User(id=user_id, email=f"meta-limit-{uuid4()}@example.com"))
        await db.commit()
        db.add(UserPreferences(user_id=user_id, whatsapp_number=phone, whatsapp_verified=True))
        db.add_all([
            CavemanSpot(
                user_id=user_id,
                description=f"Existing spot {index}",
                date=product_today(),
            )
            for index in range(FREE_SPOT_LIMIT - 1)
        ])
        await db.commit()

    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    transport = httpx.ASGITransport(app=app)
    try:
        async def post_spot(message_id: str, index: int):
            async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
                return await _post(
                    client,
                    _payload(message_id, phone, f"spot: Concurrent spot {index}"),
                )

        responses = await asyncio.gather(
            *(post_spot(message_id, index) for index, message_id in enumerate(message_ids))
        )
        assert [response.status_code for response in responses] == [200, 200]
        async with AsyncSessionLocal() as db:
            spot_count = await db.scalar(
                select(func.count(CavemanSpot.id)).where(CavemanSpot.user_id == user_id)
            )
        assert spot_count == FREE_SPOT_LIMIT
        assert sorted(sent_messages) == sorted([
            "Recorded. What you noticed is saved in Spot the Inner Caveman.",
            "Your free Spot the Inner Caveman limit has been reached. "
            "Open Neurocient to continue with membership.",
        ])
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(CavemanSpot).where(CavemanSpot.user_id == user_id))
            await db.execute(
                delete(WhatsAppWebhookEvent).where(
                    WhatsAppWebhookEvent.provider_message_id.in_(message_ids)
                )
            )
            await db.execute(delete(UserPreferences).where(UserPreferences.user_id == user_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_failed_transaction_releases_meta_claim_and_ack_is_not_retried(monkeypatch):
    from app.Routes import whatsapp_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine, get_db
    from app.models import CavemanSpot, User, UserPreferences, WhatsAppWebhookEvent

    _configure(settings, monkeypatch)
    phone = "+917" + str(uuid4().int)[:9]
    user_id = uuid4()
    message_id = _message_id()
    attempts: list[str] = []
    async with AsyncSessionLocal() as db:
        db.add_all([
            User(id=user_id, email=f"meta-rollback-{uuid4()}@example.com"),
            UserPreferences(user_id=user_id, whatsapp_number=phone, whatsapp_verified=True),
        ])
        await db.commit()

    class FailAfterClaim:
        def __init__(self, session):
            self.session = session
            self.executions = 0

        async def execute(self, statement):
            self.executions += 1
            if self.executions == 2:
                raise RuntimeError("forced failure")
            return await self.session.execute(statement)

        def add(self, value):
            self.session.add(value)

        async def commit(self):
            await self.session.commit()

        async def rollback(self):
            await self.session.rollback()

    async def failing_session():
        async with AsyncSessionLocal() as session:
            yield FailAfterClaim(session)

    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    app.dependency_overrides[get_db] = failing_session
    transport = httpx.ASGITransport(app=app)
    payload = _payload(message_id, phone, "spot: retry after rollback")
    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            failed = await _post(client, payload)
        assert failed.status_code == 500
        async with AsyncSessionLocal() as db:
            assert await db.get(WhatsAppWebhookEvent, message_id) is None

        app.dependency_overrides.clear()

        def fail_ack(to_number: str, _message: str, *, emit_logs: bool = True) -> bool:
            attempts.append(to_number)
            raise RuntimeError("provider failure")

        monkeypatch.setattr(whatsapp_routes, "send_whatsapp_service_message", fail_ack)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            accepted = await _post(client, payload)
            replay = await _post(client, payload)
        assert accepted.status_code == replay.status_code == 200
        assert attempts == [phone]
        async with AsyncSessionLocal() as db:
            assert await db.get(WhatsAppWebhookEvent, message_id) is not None
            assert await db.scalar(
                select(func.count(CavemanSpot.id)).where(CavemanSpot.user_id == user_id)
            ) == 1
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(CavemanSpot).where(CavemanSpot.user_id == user_id))
            await db.execute(
                delete(WhatsAppWebhookEvent).where(
                    WhatsAppWebhookEvent.provider_message_id == message_id
                )
            )
            await db.execute(delete(UserPreferences).where(UserPreferences.user_id == user_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()
