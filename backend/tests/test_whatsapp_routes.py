import hashlib
import hmac
import json
import logging
from unittest.mock import AsyncMock
from types import SimpleNamespace
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI

from app.Routes import whatsapp_routes
from app.config import settings
from app.database import get_db
from app.services.microchallenge_progress import CheckinResult


APP_SECRET = "route-test-meta-app-secret"
VERIFY_TOKEN = "route-test-verify-token"
WABA_ID = "123456789012345"
PHONE_NUMBER_ID = "987654321098765"


def _configure(monkeypatch):
    monkeypatch.setattr(settings, "WHATSAPP_ACCESS_TOKEN", "route-access-token")
    monkeypatch.setattr(settings, "WHATSAPP_APP_SECRET", APP_SECRET)
    monkeypatch.setattr(settings, "WHATSAPP_VERIFY_TOKEN", VERIFY_TOKEN)
    monkeypatch.setattr(settings, "WHATSAPP_BUSINESS_ACCOUNT_ID", WABA_ID)
    monkeypatch.setattr(settings, "WHATSAPP_PHONE_NUMBER_ID", PHONE_NUMBER_ID)
    monkeypatch.setattr(settings, "WHATSAPP_GRAPH_API_VERSION", "v24.0")
    monkeypatch.setattr(settings, "CONSENT_PAIRING_SECRET", "p" * 32)


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


def _signed_request(payload: dict) -> tuple[bytes, dict[str, str]]:
    raw_body = json.dumps(payload, separators=(",", ":")).encode()
    digest = hmac.new(APP_SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
    return raw_body, {"X-Hub-Signature-256": f"sha256={digest}"}


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
    assert "support@neurocient.com" in whatsapp_routes.HELP_MESSAGE


def test_pairing_token_parser_requires_explicit_final_connect_command():
    token = "a" * 43
    assert whatsapp_routes.parse_pairing_token(
        f"Connect my WhatsApp to Neurocient.\n\nCONNECT {token}"
    ) == token
    assert whatsapp_routes.parse_pairing_token(f"CONNECT {token} trailing") is None
    assert whatsapp_routes.parse_pairing_token("CONNECT short") is None


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


class EmptySession:
    def __init__(self):
        self.commits = 0

    async def commit(self):
        self.commits += 1

    async def rollback(self):
        return None


class ScalarResult:
    def __init__(self, value=None):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


class MicrochallengeSession:
    def __init__(self, message_id, user_id, assignment_id):
        linked = SimpleNamespace(
            user_id=user_id,
            whatsapp_enabled=True,
            whatsapp_consent_at=None,
            whatsapp_consent_version=None,
        )
        self.results = [ScalarResult(message_id), ScalarResult(linked), ScalarResult()]
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


def _app_with_db(db):
    app = FastAPI()
    app.include_router(whatsapp_routes.router, prefix="/wa")
    app.dependency_overrides[get_db] = lambda: db
    return app


@pytest.mark.asyncio
async def test_meta_webhook_verification_returns_only_the_challenge(monkeypatch):
    _configure(monkeypatch)
    app = _app_with_db(EmptySession())
    transport = httpx.ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        verified = await client.get(
            "/wa/webhook/whatsapp",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": VERIFY_TOKEN,
                "hub.challenge": "123456789",
            },
        )
        rejected = await client.get(
            "/wa/webhook/whatsapp",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "wrong",
                "hub.challenge": "123456789",
            },
        )

    assert verified.status_code == 200
    assert verified.text == "123456789"
    assert rejected.status_code == 403


@pytest.mark.asyncio
async def test_internal_failure_is_generic_and_privacy_safe(monkeypatch, caplog):
    _configure(monkeypatch)
    phone = "+919876543210"
    private_message = "private-message-canary"
    payload = _payload("wamid.private-failure", phone, f"spot: {private_message}")
    raw_body, headers = _signed_request(payload)
    app = _app_with_db(FailingSession())
    transport = httpx.ASGITransport(app=app)
    caplog.set_level(logging.INFO, logger="whatsapp")

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/wa/webhook/whatsapp",
            content=raw_body,
            headers={"Content-Type": "application/json", **headers},
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
    assert headers["X-Hub-Signature-256"] not in observable


@pytest.mark.asyncio
async def test_verified_microchallenge_response_uses_shared_checkin_and_acknowledges(
    monkeypatch,
):
    _configure(monkeypatch)
    message_id = "wamid.microchallenge-partly"
    user_id = uuid4()
    assignment_id = uuid4()
    db = MicrochallengeSession(message_id, user_id, assignment_id)
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
        ) or True,
    )
    payload = _payload(message_id, "+919876543210", "Partly")
    raw_body, headers = _signed_request(payload)
    transport = httpx.ASGITransport(app=_app_with_db(db))

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/wa/webhook/whatsapp",
            content=raw_body,
            headers={"Content-Type": "application/json", **headers},
        )

    assert response.status_code == 200
    assert db.commits == 1
    record_checkin.assert_awaited_once_with(
        db,
        user_id=user_id,
        assignment_id=assignment_id,
        outcome="partly",
    )
    assert sent == [(
        "+919876543210",
        "Recorded. Partial attempts still show what makes the behaviour easier or harder. "
        "If you want, reply 'note: ...' with what got in the way.",
        False,
    )]


@pytest.mark.asyncio
async def test_response_without_today_prompt_cannot_mutate_active_work(monkeypatch):
    _configure(monkeypatch)
    message_id = "wamid.no-current-prompt"
    user_id = uuid4()
    db = MicrochallengeSession(message_id, user_id, None)
    record_checkin = AsyncMock()
    sent = []
    monkeypatch.setattr(whatsapp_routes, "record_checkin", record_checkin)
    monkeypatch.setattr(
        whatsapp_routes,
        "send_whatsapp_message",
        lambda _number, message, *, emit_logs=True: sent.append(message) or True,
    )
    payload = _payload(message_id, "+919876543210", "Done")
    raw_body, headers = _signed_request(payload)
    transport = httpx.ASGITransport(app=_app_with_db(db))

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/wa/webhook/whatsapp",
            content=raw_body,
            headers={"Content-Type": "application/json", **headers},
        )

    assert response.status_code == 200
    record_checkin.assert_not_awaited()
    assert sent == [
        "There isn't a recent experiment reminder to update. "
        "Open Neurocient to check your active experiment."
    ]


@pytest.mark.asyncio
async def test_status_callback_is_acknowledged_without_database_lookup(monkeypatch):
    _configure(monkeypatch)
    db = EmptySession()
    payload = _payload("wamid.ignored", "+919876543210", "ignored")
    value = payload["entry"][0]["changes"][0]["value"]
    value.pop("messages")
    value["statuses"] = [{"id": "wamid.outbound", "status": "delivered"}]
    raw_body, headers = _signed_request(payload)
    transport = httpx.ASGITransport(app=_app_with_db(db))

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/wa/webhook/whatsapp",
            content=raw_body,
            headers={"Content-Type": "application/json", **headers},
        )

    assert response.status_code == 200
    assert db.commits == 1


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("content", "content_type", "expected_status"),
    [
        (b"{}", "text/plain", 415),
        (b"not-json", "application/json", 400),
        (b"x" * 65_537, "application/json", 413),
    ],
    ids=["unsupported-content-type", "malformed-json", "oversized-json"],
)
async def test_rejects_unsupported_malformed_or_oversized_requests_before_database(
    monkeypatch,
    content,
    content_type,
    expected_status,
):
    _configure(monkeypatch)
    headers = {"Content-Type": content_type}
    if content == b"not-json":
        digest = hmac.new(APP_SECRET.encode(), content, hashlib.sha256).hexdigest()
        headers["X-Hub-Signature-256"] = f"sha256={digest}"
    transport = httpx.ASGITransport(app=_app_with_db(FailingSession()))

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/wa/webhook/whatsapp",
            content=content,
            headers=headers,
        )

    assert response.status_code == expected_status


@pytest.mark.asyncio
async def test_rejects_text_above_meta_boundary_before_database(monkeypatch):
    _configure(monkeypatch)
    payload = _payload("wamid.too-long", "+919876543210", "x" * 4097)
    raw_body, headers = _signed_request(payload)
    transport = httpx.ASGITransport(app=_app_with_db(FailingSession()))

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/wa/webhook/whatsapp",
            content=raw_body,
            headers={"Content-Type": "application/json", **headers},
        )

    assert response.status_code == 400
