import logging
from unittest.mock import AsyncMock
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI
from twilio.request_validator import RequestValidator

from app.Routes import whatsapp_routes
from app.config import settings
from app.database import get_db
from app.services.microchallenge_progress import CheckinResult


WEBHOOK_URL = "https://api.example.com/wa/webhook/whatsapp"
AUTH_TOKEN = "route-test-auth-token"
ACCOUNT_SID = "AC" + "1" * 32


@pytest.mark.parametrize(
    ("body", "expected"),
    [
        ("done", "done"),
        (" DONE ", "done"),
        ("1", "done"),
        ("partly", "partly"),
        ("2", "partly"),
        ("didn't happen", "not_today"),
        ("did not happen", "not_today"),
        ("not today", "not_today"),
        ("3", "not_today"),
        ("spot: I switched tasks", None),
        ("done because it was easy", None),
        ("note: the phone was beside me", None),
        ("", None),
    ],
)
def test_microchallenge_response_parser_is_explicit(body, expected):
    assert whatsapp_routes.parse_microchallenge_response(body) == expected


def test_microchallenge_acknowledgements_are_light_and_truthful():
    assert whatsapp_routes.microchallenge_acknowledgement("done") == "Recorded for today."
    assert "Partial attempts" in whatsapp_routes.microchallenge_acknowledgement("partly")
    assert "Nothing to make up for" in whatsapp_routes.microchallenge_acknowledgement(
        "not_today"
    )


def test_help_copy_uses_canonical_inner_caveman_language():
    assert "Spot the Inner Caveman" in whatsapp_routes.HELP_MESSAGE
    assert "Caveman Spot" not in whatsapp_routes.HELP_MESSAGE


@pytest.mark.parametrize(
    ("body", "expected"),
    [
        ("note: The phone was beside me", "The phone was beside me"),
        (" NOTE:  I had not prepared the document ", "I had not prepared the document"),
        ("note:", None),
        ("The note was useful", None),
    ],
)
def test_obstacle_note_parser_requires_an_explicit_prefix(body, expected):
    assert whatsapp_routes.parse_obstacle_note(body) == expected


class FailingSession:
    async def execute(self, _statement):
        raise RuntimeError("private-database-detail")

    async def rollback(self):
        return None


class ScalarResult:
    def __init__(self, value=None):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


class MicrochallengeSession:
    def __init__(self, message_sid, user_id, assignment_id):
        self.results = [ScalarResult(message_sid), ScalarResult(user_id), ScalarResult()]
        self.assignment_id = assignment_id
        self.commits = 0

    async def execute(self, _statement):
        return self.results.pop(0)

    async def scalar(self, _statement):
        return (
            f"microchallenge-assignment:{self.assignment_id}"
            if self.assignment_id is not None
            else None
        )

    async def commit(self):
        self.commits += 1

    async def rollback(self):
        return None


def _configure(monkeypatch):
    monkeypatch.setattr(settings, "TWILIO_ACCOUNT_SID", ACCOUNT_SID)
    monkeypatch.setattr(settings, "TWILIO_AUTH_TOKEN", AUTH_TOKEN)
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_WEBHOOK_URL", WEBHOOK_URL)


@pytest.mark.asyncio
async def test_internal_failure_is_generic_and_privacy_safe(monkeypatch, caplog):
    phone = "+919876543210"
    private_message = "private-message-canary"
    form = {
        "AccountSid": ACCOUNT_SID,
        "MessageSid": "SM" + "2" * 32,
        "From": f"whatsapp:{phone}",
        "Body": f"spot: {private_message}",
    }
    signature = RequestValidator(AUTH_TOKEN).compute_signature(WEBHOOK_URL, form)

    _configure(monkeypatch)

    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    app.dependency_overrides[get_db] = lambda: FailingSession()
    transport = httpx.ASGITransport(app=app)
    caplog.set_level(logging.INFO, logger="whatsapp")

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/wa/webhook/whatsapp",
            data=form,
            headers={"X-Twilio-Signature": signature},
        )

    assert response.status_code == 500
    assert response.json() == {
        "status": "rejected",
        "message": "Unable to process request",
    }
    observable = caplog.text + response.text
    assert phone not in observable
    assert private_message not in observable
    assert "private-database-detail" not in observable
    assert signature not in observable


@pytest.mark.asyncio
async def test_verified_microchallenge_response_uses_shared_checkin_and_acknowledges(
    monkeypatch,
):
    _configure(monkeypatch)
    message_sid = "SM" + "3" * 32
    user_id = uuid4()
    assignment_id = uuid4()
    db = MicrochallengeSession(message_sid, user_id, assignment_id)
    record_checkin = AsyncMock(
        return_value=CheckinResult(
            result="recorded",
            assignment_id=assignment_id,
            outcome="partly",
            status="active",
        )
    )
    sent = []

    monkeypatch.setattr(whatsapp_routes, "record_checkin", record_checkin)
    monkeypatch.setattr(
        whatsapp_routes,
        "send_whatsapp_message",
        lambda number, message, *, emit_logs=True: sent.append(
            (number, message, emit_logs)
        )
        or True,
    )
    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    app.dependency_overrides[get_db] = lambda: db
    transport = httpx.ASGITransport(app=app)
    form = {
        "AccountSid": ACCOUNT_SID,
        "MessageSid": message_sid,
        "From": "whatsapp:+919876543210",
        "Body": "Partly",
    }
    signature = RequestValidator(AUTH_TOKEN).compute_signature(WEBHOOK_URL, form)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/wa/webhook/whatsapp",
            data=form,
            headers={"X-Twilio-Signature": signature},
        )

    assert response.status_code == 200
    assert db.commits == 1
    record_checkin.assert_awaited_once_with(
        db,
        user_id=user_id,
        assignment_id=assignment_id,
        outcome="partly",
    )
    assert sent == [
        (
            "+919876543210",
            "Recorded. Partial attempts still show what makes the behaviour easier or harder. "
            "If you want, reply 'note: ...' with what got in the way.",
            False,
        )
    ]


@pytest.mark.asyncio
async def test_microchallenge_response_without_today_prompt_cannot_mutate_active_work(
    monkeypatch,
):
    _configure(monkeypatch)
    message_sid = "SM" + "4" * 32
    user_id = uuid4()
    db = MicrochallengeSession(message_sid, user_id, None)
    record_checkin = AsyncMock()
    sent = []
    monkeypatch.setattr(whatsapp_routes, "record_checkin", record_checkin)
    monkeypatch.setattr(
        whatsapp_routes,
        "send_whatsapp_message",
        lambda _number, message, *, emit_logs=True: sent.append(message) or True,
    )
    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    app.dependency_overrides[get_db] = lambda: db
    transport = httpx.ASGITransport(app=app)
    form = {
        "AccountSid": ACCOUNT_SID,
        "MessageSid": message_sid,
        "From": "whatsapp:+919876543210",
        "Body": "Done",
    }
    signature = RequestValidator(AUTH_TOKEN).compute_signature(WEBHOOK_URL, form)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/wa/webhook/whatsapp",
            data=form,
            headers={"X-Twilio-Signature": signature},
        )

    assert response.status_code == 200
    record_checkin.assert_not_awaited()
    assert sent == [
        "There isn't a recent experiment reminder to update. "
        "Open Neurocient to check your active experiment."
    ]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("content", "content_type", "expected_status"),
    [
        (b"{}", "application/json", 415),
        (b"Body=one&Body=two", "application/x-www-form-urlencoded", 400),
        (b"x" * 8193, "application/x-www-form-urlencoded", 413),
        (
            "&".join(f"Field{index}=x" for index in range(65)).encode(),
            "application/x-www-form-urlencoded",
            400,
        ),
    ],
)
async def test_rejects_ambiguous_or_oversized_forms_before_database_access(
    monkeypatch,
    content,
    content_type,
    expected_status,
):
    _configure(monkeypatch)
    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    app.dependency_overrides[get_db] = lambda: FailingSession()
    transport = httpx.ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/wa/webhook/whatsapp",
            content=content,
            headers={
                "Content-Type": content_type,
                "X-Twilio-Signature": "not-relevant-before-safe-rejection",
            },
        )

    assert response.status_code == expected_status


@pytest.mark.asyncio
async def test_enforces_message_body_character_boundary(monkeypatch):
    _configure(monkeypatch)
    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    app.dependency_overrides[get_db] = lambda: FailingSession()
    transport = httpx.ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        responses = []
        for length in (1600, 1601):
            form = {
                "AccountSid": ACCOUNT_SID,
                "MessageSid": "SM" + str(length).zfill(32),
                "From": "whatsapp:+919876543210",
                "Body": "x" * length,
            }
            signature = RequestValidator(AUTH_TOKEN).compute_signature(WEBHOOK_URL, form)
            responses.append(
                await client.post(
                    "/wa/webhook/whatsapp",
                    data=form,
                    headers={"X-Twilio-Signature": signature},
                )
            )

    assert [response.status_code for response in responses] == [500, 400]


def test_provider_send_failure_does_not_log_private_response(monkeypatch, caplog):
    private_provider_body = "provider-private-response"

    class Response:
        status_code = 400
        text = private_provider_body

    monkeypatch.setattr(settings, "TWILIO_ACCOUNT_SID", ACCOUNT_SID)
    monkeypatch.setattr(settings, "TWILIO_AUTH_TOKEN", AUTH_TOKEN)
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    monkeypatch.setattr(whatsapp_routes.requests, "post", lambda *args, **kwargs: Response())
    caplog.set_level(logging.INFO, logger="whatsapp")

    assert whatsapp_routes.send_whatsapp_message(
        "+919876543210",
        "private outbound content",
    ) is False
    assert private_provider_body not in caplog.text
    assert "+919876543210" not in caplog.text
    assert "private outbound content" not in caplog.text


def test_provider_send_bounds_body_and_returns_message_sid(monkeypatch):
    provider_message_id = "SM" + "8" * 32
    captured = {}

    class Response:
        status_code = 201

        @staticmethod
        def json():
            return {"sid": provider_message_id}

    _configure(monkeypatch)
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

    def capture_post(*_args, **kwargs):
        captured.update(kwargs["data"])
        return Response()

    monkeypatch.setattr(whatsapp_routes.requests, "post", capture_post)

    result = whatsapp_routes.send_whatsapp_message(
        "+919876543210",
        "private outbound content " * 200,
    )

    assert result == provider_message_id
    assert len(captured["Body"]) <= 1_600
    assert captured["Body"].endswith("…")


def test_provider_5xx_is_outcome_unknown(monkeypatch, caplog):
    class Response:
        status_code = 503

    _configure(monkeypatch)
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    monkeypatch.setattr(whatsapp_routes.requests, "post", lambda *args, **kwargs: Response())
    caplog.set_level(logging.INFO, logger="whatsapp")

    with pytest.raises(whatsapp_routes.NotificationOutcomeUnknown):
        whatsapp_routes.send_whatsapp_message(
            "+919876543210",
            "private outbound content",
        )
    assert "+919876543210" not in caplog.text
    assert "private outbound content" not in caplog.text


def test_unexpected_provider_exception_is_contained(monkeypatch, caplog):
    _configure(monkeypatch)
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    monkeypatch.setattr(
        whatsapp_routes.requests,
        "post",
        lambda *args, **kwargs: (_ for _ in ()).throw(
            RuntimeError("private-unexpected-provider-error")
        ),
    )
    caplog.set_level(logging.INFO, logger="whatsapp")

    with pytest.raises(whatsapp_routes.NotificationOutcomeUnknown):
        whatsapp_routes.send_whatsapp_message(
            "+919876543210",
            "private outbound content",
        )
    assert "private-unexpected-provider-error" not in caplog.text
    assert "+919876543210" not in caplog.text
    assert "private outbound content" not in caplog.text
