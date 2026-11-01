import logging

import httpx
import pytest
from fastapi import FastAPI
from twilio.request_validator import RequestValidator

from app.Routes import whatsapp_routes
from app.config import settings
from app.database import get_db


WEBHOOK_URL = "https://api.example.com/wa/webhook/whatsapp"
AUTH_TOKEN = "route-test-auth-token"
ACCOUNT_SID = "AC" + "1" * 32


class FailingSession:
    async def execute(self, _statement):
        raise RuntimeError("private-database-detail")

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
