from datetime import datetime

import pytest


def test_welcome_email_payload_is_branded_personal_and_html_safe():
    from app.services.cohort_welcome_email import build_welcome_email_payload

    payload = build_welcome_email_payload(
        recipient="member@example.com",
        user_name="Amit <Founder>",
        cohort_title="November & Friends",
        starts_at=datetime(2026, 11, 21, 10, 30),
        timezone="Asia/Kolkata",
    )

    assert payload["to"] == ["member@example.com"]
    assert payload["subject"] == "You're in — November & Friends"
    assert "Welcome to The Modern Caveman" in payload["html"]
    assert "Hi Amit &lt;Founder&gt;" in payload["html"]
    assert "November &amp; Friends" in payload["html"]
    assert "21 November 2026" in payload["html"]
    assert "No further action is needed right now" in payload["html"]
    assert "support@neurocient.com" in payload["html"]
    assert "Amit <Founder>" not in payload["html"]


@pytest.mark.asyncio
async def test_resend_adapter_uses_delivery_idempotency_key(monkeypatch):
    from app.config import settings
    from app.services import cohort_welcome_email

    monkeypatch.setattr(settings, "RESEND_API_KEY", "resend-test-key")
    monkeypatch.setattr(settings, "RESEND_FROM_EMAIL", "hello@neurocient.com")
    observed = {}

    class Response:
        status_code = 200

        @staticmethod
        def json():
            return {"id": "email-provider-id"}

    class Client:
        def __init__(self, **kwargs):
            observed["client"] = kwargs

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return None

        async def post(self, url, **kwargs):
            observed["url"] = url
            observed.update(kwargs)
            return Response()

    monkeypatch.setattr(cohort_welcome_email.httpx, "AsyncClient", Client)
    payload = {"to": ["member@example.com"], "subject": "Welcome", "html": "<p>Hello</p>"}

    provider_id = await cohort_welcome_email.send_resend_email(
        payload,
        idempotency_key="cohort-welcome/enrollment-1",
    )

    assert provider_id == "email-provider-id"
    assert observed["url"] == "https://api.resend.com/emails"
    assert observed["headers"]["Idempotency-Key"] == "cohort-welcome/enrollment-1"
    assert observed["headers"]["Authorization"] == "Bearer resend-test-key"
    assert observed["json"]["from"] == "Neurocient <hello@neurocient.com>"


@pytest.mark.asyncio
async def test_resend_adapter_fails_closed_when_configuration_is_missing(monkeypatch):
    from app.config import settings
    from app.services.cohort_welcome_email import (
        WelcomeEmailDeliveryError,
        send_resend_email,
    )

    monkeypatch.setattr(settings, "RESEND_API_KEY", None)
    monkeypatch.setattr(settings, "RESEND_FROM_EMAIL", None)

    with pytest.raises(WelcomeEmailDeliveryError, match="configuration_missing"):
        await send_resend_email(
            {"to": ["member@example.com"], "subject": "Welcome", "html": "<p>Hello</p>"},
            idempotency_key="cohort-welcome/enrollment-1",
        )
