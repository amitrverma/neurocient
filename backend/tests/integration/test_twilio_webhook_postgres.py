import asyncio
import logging
import os
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import delete, func, select
from twilio.request_validator import RequestValidator


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]

WEBHOOK_URL = "https://api.example.com/wa/webhook/whatsapp"
AUTH_TOKEN = "postgres-integration-auth-token"
ACCOUNT_SID = "AC" + "1" * 32


def _message_sid() -> str:
    return "SM" + uuid4().hex


def _signed_headers(form: dict[str, str], *, url: str = WEBHOOK_URL) -> dict[str, str]:
    signature = RequestValidator(AUTH_TOKEN).compute_signature(url, form)
    return {"X-Twilio-Signature": signature}


async def test_signed_whatsapp_boundary_is_private_and_replay_safe(
    monkeypatch,
    caplog,
):
    from app.Routes import whatsapp_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import CavemanSpot, User, UserPreferences, WhatsAppWebhookEvent

    canary_phone = "+919" + str(uuid4().int)[:9]
    unknown_phone = "+918" + str(uuid4().int)[:9]
    canary_message = f"private-message-{uuid4()}"
    user_id = uuid4()
    sent_to: list[str] = []

    monkeypatch.setattr(settings, "TWILIO_ACCOUNT_SID", ACCOUNT_SID)
    monkeypatch.setattr(settings, "TWILIO_AUTH_TOKEN", AUTH_TOKEN)
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_WEBHOOK_URL", WEBHOOK_URL)

    def capture_send(to_number: str, _message: str, *, emit_logs: bool = True) -> bool:
        assert emit_logs is False
        sent_to.append(to_number)
        return True

    monkeypatch.setattr(whatsapp_routes, "send_whatsapp_message", capture_send)

    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    transport = httpx.ASGITransport(app=app)

    async with AsyncSessionLocal() as db:
        db.add_all(
            [User(
                id=user_id,
                email=f"twilio-{uuid4()}@example.com",
                name="Webhook Test",
                phone_number=canary_phone,
            ), UserPreferences(
                user_id=user_id,
                whatsapp_number=canary_phone,
                whatsapp_verified=True,
                whatsapp_enabled=False,
            )]
        )
        await db.commit()

    first_sid = _message_sid()
    unknown_sid = _message_sid()
    non_spot_sid = _message_sid()
    empty_spot_sid = _message_sid()
    concurrent_sid = _message_sid()
    event_sids = [
        first_sid,
        unknown_sid,
        non_spot_sid,
        empty_spot_sid,
        concurrent_sid,
    ]
    form = {
        "AccountSid": ACCOUNT_SID,
        "MessageSid": first_sid,
        "From": f"whatsapp:{canary_phone}",
        "Body": f"spot: {canary_message}",
        "FutureTwilioField": "accepted-by-signature-validation",
    }

    caplog.set_level(logging.INFO, logger="whatsapp")
    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            invalid = await client.post(
                "/wa/webhook/whatsapp",
                data=form,
                headers={"X-Twilio-Signature": "invalid"},
            )
            assert invalid.status_code == 403

            wrong_url = await client.post(
                "/wa/webhook/whatsapp",
                data=form,
                headers=_signed_headers(form, url="https://wrong.example/webhook"),
            )
            assert wrong_url.status_code == 403

            malformed_form = {**form, "MessageSid": _message_sid(), "From": "not-a-phone"}
            malformed = await client.post(
                "/wa/webhook/whatsapp",
                data=malformed_form,
                headers=_signed_headers(malformed_form),
            )
            assert malformed.status_code == 400

            accepted = await client.post(
                "/wa/webhook/whatsapp",
                data=form,
                headers=_signed_headers(form),
            )
            replay = await client.post(
                "/wa/webhook/whatsapp",
                data=form,
                headers=_signed_headers(form),
            )
            assert accepted.status_code == replay.status_code == 200
            assert accepted.json() == replay.json() == {"status": "accepted"}

            changed_replay_form = {
                **form,
                "Body": "spot: changed content must not replace the first write",
            }
            changed_replay = await client.post(
                "/wa/webhook/whatsapp",
                data=changed_replay_form,
                headers=_signed_headers(changed_replay_form),
            )
            assert changed_replay.status_code == 200
            assert changed_replay.json() == accepted.json()

            unknown_form = {
                **form,
                "MessageSid": unknown_sid,
                "From": f"whatsapp:{unknown_phone}",
            }
            unknown = await client.post(
                "/wa/webhook/whatsapp",
                data=unknown_form,
                headers=_signed_headers(unknown_form),
            )
            assert unknown.status_code == 200
            assert unknown.json() == accepted.json()

            non_spot_form = {
                **form,
                "MessageSid": non_spot_sid,
                "Body": "hello",
            }
            non_spot = await client.post(
                "/wa/webhook/whatsapp",
                data=non_spot_form,
                headers=_signed_headers(non_spot_form),
            )
            empty_spot_form = {
                **form,
                "MessageSid": empty_spot_sid,
                "Body": "spot:   ",
            }
            empty_spot = await client.post(
                "/wa/webhook/whatsapp",
                data=empty_spot_form,
                headers=_signed_headers(empty_spot_form),
            )
            assert non_spot.status_code == empty_spot.status_code == 200
            assert non_spot.json() == empty_spot.json() == accepted.json()

        concurrent_form = {**form, "MessageSid": concurrent_sid}

        async def post_concurrently() -> httpx.Response:
            async with httpx.AsyncClient(
                transport=transport,
                base_url="http://test",
            ) as client:
                return await client.post(
                    "/wa/webhook/whatsapp",
                    data=concurrent_form,
                    headers=_signed_headers(concurrent_form),
                )

        concurrent = await asyncio.gather(post_concurrently(), post_concurrently())
        assert [response.status_code for response in concurrent] == [200, 200]

        async with AsyncSessionLocal() as db:
            spot_count = await db.scalar(
                select(func.count(CavemanSpot.id)).where(
                    CavemanSpot.user_id == user_id,
                )
            )
            event_count = await db.scalar(
                select(func.count(WhatsAppWebhookEvent.provider_message_sid)).where(
                    WhatsAppWebhookEvent.provider_message_sid.in_(event_sids)
                )
            )
            descriptions = (
                await db.scalars(
                    select(CavemanSpot.description).where(
                        CavemanSpot.user_id == user_id,
                    )
                )
            ).all()

        assert spot_count == 2
        assert event_count == 5
        assert descriptions == [canary_message, canary_message]
        # Two Spot acknowledgements plus guidance for the verified sender's
        # unknown and empty-Spot messages. Replays and unknown senders are silent.
        assert sent_to == [canary_phone, canary_phone, canary_phone, canary_phone]

        observable = "\n".join(
            [
                caplog.text,
                invalid.text,
                wrong_url.text,
                malformed.text,
                accepted.text,
                replay.text,
                unknown.text,
                non_spot.text,
                empty_spot.text,
            ]
        )
        assert canary_phone not in observable
        assert unknown_phone not in observable
        assert canary_message not in observable
        assert AUTH_TOKEN not in observable
        assert _signed_headers(form)["X-Twilio-Signature"] not in observable
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(CavemanSpot).where(CavemanSpot.user_id == user_id))
            await db.execute(
                delete(WhatsAppWebhookEvent).where(
                    WhatsAppWebhookEvent.provider_message_sid.in_(event_sids)
                )
            )
            await db.execute(
                delete(UserPreferences).where(UserPreferences.user_id == user_id)
            )
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_whatsapp_microchallenge_response_writes_shared_daily_outcome(
    monkeypatch,
):
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

    phone = "+916" + str(uuid4().int)[:9]
    user_id = uuid4()
    challenge_id = uuid4()
    assignment_id = uuid4()
    first_sid = _message_sid()
    second_sid = _message_sid()
    third_sid = _message_sid()
    sent_messages: list[str] = []

    monkeypatch.setattr(settings, "TWILIO_ACCOUNT_SID", ACCOUNT_SID)
    monkeypatch.setattr(settings, "TWILIO_AUTH_TOKEN", AUTH_TOKEN)
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_WEBHOOK_URL", WEBHOOK_URL)
    monkeypatch.setattr(
        whatsapp_routes,
        "send_whatsapp_message",
        lambda _number, message, *, emit_logs=True: sent_messages.append(message) or True,
    )

    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    transport = httpx.ASGITransport(app=app)

    async with AsyncSessionLocal() as db:
        db.add(
            User(
                id=user_id,
                email=f"twilio-micro-{uuid4()}@example.com",
                name="Microchallenge Test",
            )
        )
        await db.commit()
        db.add_all(
            [
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
            ]
        )
        await db.commit()

    def form(message_sid: str, body: str) -> dict[str, str]:
        return {
            "AccountSid": ACCOUNT_SID,
            "MessageSid": message_sid,
            "From": f"whatsapp:{phone}",
            "Body": body,
        }

    try:
        first_form = form(first_sid, "Partly")
        second_form = form(second_sid, "note: The phone was still beside me")
        third_form = form(third_sid, "Done")
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            first = await client.post(
                "/wa/webhook/whatsapp",
                data=first_form,
                headers=_signed_headers(first_form),
            )
            replay = await client.post(
                "/wa/webhook/whatsapp",
                data=first_form,
                headers=_signed_headers(first_form),
            )
            second = await client.post(
                "/wa/webhook/whatsapp",
                data=second_form,
                headers=_signed_headers(second_form),
            )
            third = await client.post(
                "/wa/webhook/whatsapp",
                data=third_form,
                headers=_signed_headers(third_form),
            )

        assert (
            first.status_code
            == replay.status_code
            == second.status_code
            == third.status_code
            == 200
        )
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
                    WhatsAppWebhookEvent.provider_message_sid.in_(
                        [first_sid, second_sid, third_sid]
                    )
                )
            )
            await db.execute(
                delete(UserMicrochallenge).where(UserMicrochallenge.id == assignment_id)
            )
            await db.execute(
                delete(NotificationDispatch).where(NotificationDispatch.user_id == user_id)
            )
            await db.execute(
                delete(MicrochallengeDefinition).where(
                    MicrochallengeDefinition.id == challenge_id
                )
            )
            await db.execute(
                delete(UserPreferences).where(UserPreferences.user_id == user_id)
            )
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_whatsapp_spot_respects_the_shared_free_account_limit(monkeypatch):
    from app.Routes import whatsapp_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import CavemanSpot, User, UserPreferences, WhatsAppWebhookEvent
    from app.services.spot_capture import FREE_SPOT_LIMIT
    from app.services.product_clock import product_today

    phone = "+915" + str(uuid4().int)[:9]
    user_id = uuid4()
    message_sids = [_message_sid(), _message_sid()]
    sent_messages: list[str] = []

    monkeypatch.setattr(settings, "TWILIO_ACCOUNT_SID", ACCOUNT_SID)
    monkeypatch.setattr(settings, "TWILIO_AUTH_TOKEN", AUTH_TOKEN)
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_WEBHOOK_URL", WEBHOOK_URL)
    monkeypatch.setattr(
        whatsapp_routes,
        "send_whatsapp_message",
        lambda _number, message, *, emit_logs=True: sent_messages.append(message) or True,
    )

    async with AsyncSessionLocal() as db:
        db.add(
            User(
                id=user_id,
                email=f"twilio-spot-limit-{uuid4()}@example.com",
                name="Spot Limit Test",
            )
        )
        await db.commit()
        db.add(
            UserPreferences(
                user_id=user_id,
                whatsapp_number=phone,
                whatsapp_verified=True,
            )
        )
        db.add_all(
            [
                CavemanSpot(
                    user_id=user_id,
                    description=f"Existing spot {index}",
                    date=product_today(),
                )
                for index in range(FREE_SPOT_LIMIT - 1)
            ]
        )
        await db.commit()

    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    transport = httpx.ASGITransport(app=app)

    def form(message_sid: str, index: int) -> dict[str, str]:
        return {
            "AccountSid": ACCOUNT_SID,
            "MessageSid": message_sid,
            "From": f"whatsapp:{phone}",
            "Body": f"spot: Concurrent spot {index}",
        }

    try:
        async def post_spot(message_sid: str, index: int):
            payload = form(message_sid, index)
            async with httpx.AsyncClient(
                transport=transport,
                base_url="http://test",
            ) as client:
                return await client.post(
                    "/wa/webhook/whatsapp",
                    data=payload,
                    headers=_signed_headers(payload),
                )

        responses = await asyncio.gather(
            *(
                post_spot(message_sid, index)
                for index, message_sid in enumerate(message_sids)
            )
        )

        assert [response.status_code for response in responses] == [200, 200]
        async with AsyncSessionLocal() as db:
            spot_count = await db.scalar(
                select(func.count(CavemanSpot.id)).where(
                    CavemanSpot.user_id == user_id
                )
            )
        assert spot_count == FREE_SPOT_LIMIT
        assert sorted(sent_messages) == sorted(
            [
                "Recorded. What you noticed is saved in Spot the Inner Caveman.",
                "Your free Spot the Inner Caveman limit has been reached. "
                "Open Neurocient to continue with membership.",
            ]
        )
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(CavemanSpot).where(CavemanSpot.user_id == user_id))
            await db.execute(
                delete(WhatsAppWebhookEvent).where(
                    WhatsAppWebhookEvent.provider_message_sid.in_(message_sids)
                )
            )
            await db.execute(
                delete(UserPreferences).where(UserPreferences.user_id == user_id)
            )
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_failed_transaction_releases_claim_and_ack_failure_is_not_retried(
    monkeypatch,
):
    from app.Routes import whatsapp_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine, get_db
    from app.models import CavemanSpot, User, UserPreferences, WhatsAppWebhookEvent

    phone = "+917" + str(uuid4().int)[:9]
    user_id = uuid4()
    message_sid = _message_sid()
    acknowledgement_attempts: list[str] = []

    monkeypatch.setattr(settings, "TWILIO_ACCOUNT_SID", ACCOUNT_SID)
    monkeypatch.setattr(settings, "TWILIO_AUTH_TOKEN", AUTH_TOKEN)
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_WEBHOOK_URL", WEBHOOK_URL)

    async with AsyncSessionLocal() as db:
        db.add_all(
            [User(
                id=user_id,
                email=f"twilio-rollback-{uuid4()}@example.com",
                phone_number=phone,
            ), UserPreferences(
                user_id=user_id,
                whatsapp_number=phone,
                whatsapp_verified=True,
                whatsapp_enabled=False,
            )]
        )
        await db.commit()

    class FailAfterClaim:
        def __init__(self, session):
            self.session = session
            self.executions = 0

        async def execute(self, statement):
            self.executions += 1
            if self.executions == 2:
                raise RuntimeError("forced failure after durable claim attempt")
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
    form = {
        "AccountSid": ACCOUNT_SID,
        "MessageSid": message_sid,
        "From": f"whatsapp:{phone}",
        "Body": "spot: retry after rollback",
    }

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            failed = await client.post(
                "/wa/webhook/whatsapp",
                data=form,
                headers=_signed_headers(form),
            )
        assert failed.status_code == 500

        async with AsyncSessionLocal() as db:
            assert await db.get(WhatsAppWebhookEvent, message_sid) is None
            assert (
                await db.scalar(
                    select(func.count(CavemanSpot.id)).where(
                        CavemanSpot.user_id == user_id,
                    )
                )
            ) == 0

        app.dependency_overrides.clear()

        def fail_acknowledgement(
            to_number: str,
            _message: str,
            *,
            emit_logs: bool = True,
        ) -> bool:
            assert emit_logs is False
            acknowledgement_attempts.append(to_number)
            raise RuntimeError("unexpected provider adapter failure")

        monkeypatch.setattr(
            whatsapp_routes,
            "send_whatsapp_message",
            fail_acknowledgement,
        )
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            accepted = await client.post(
                "/wa/webhook/whatsapp",
                data=form,
                headers=_signed_headers(form),
            )
            replay = await client.post(
                "/wa/webhook/whatsapp",
                data=form,
                headers=_signed_headers(form),
            )

        assert accepted.status_code == replay.status_code == 200
        assert accepted.json() == replay.json() == {"status": "accepted"}
        assert acknowledgement_attempts == [phone]

        async with AsyncSessionLocal() as db:
            assert await db.get(WhatsAppWebhookEvent, message_sid) is not None
            assert (
                await db.scalar(
                    select(func.count(CavemanSpot.id)).where(
                        CavemanSpot.user_id == user_id,
                    )
                )
            ) == 1
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(CavemanSpot).where(CavemanSpot.user_id == user_id))
            await db.execute(
                delete(WhatsAppWebhookEvent).where(
                    WhatsAppWebhookEvent.provider_message_sid == message_sid
                )
            )
            await db.execute(
                delete(UserPreferences).where(UserPreferences.user_id == user_id)
            )
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()
