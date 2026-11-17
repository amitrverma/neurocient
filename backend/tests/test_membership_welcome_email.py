from datetime import datetime
from uuid import uuid4

import pytest
from fastapi import HTTPException


def test_membership_welcome_email_is_branded_personal_and_html_safe():
    from app.services.membership_welcome_email import (
        build_membership_welcome_email_payload,
    )

    payload = build_membership_welcome_email_payload(
        recipient="member@example.com",
        user_name="Amit <Founder>",
        current_period_end=datetime(2026, 11, 30, 18, 30),
    )

    assert payload["to"] == ["member@example.com"]
    assert payload["subject"] == "Welcome to Neurocient Membership"
    assert "Welcome to Neurocient" in payload["html"]
    assert "Hi Amit &lt;Founder&gt;" in payload["html"]
    assert "Insights · Practice · Spots · Microchallenges" in payload["html"]
    assert "30 November 2026" in payload["html"]
    assert "Begin with Practice" in payload["html"]
    assert "support@neurocient.com" in payload["html"]
    assert "Xaltris Technologies, operating Neurocient Labs" in payload["html"]
    assert "Xaltris Technologies, operating Neurocient Labs" in payload["text"]
    assert "Amit <Founder>" not in payload["html"]


@pytest.mark.asyncio
async def test_concurrent_welcome_dispatch_does_not_reject_an_accepted_webhook(
    monkeypatch,
):
    from app.Routes import membership_routes
    from app.services import membership_welcome_email

    async def dispatch_in_progress(_db, _user_id):
        raise membership_welcome_email.WelcomeEmailDeliveryError(
            "dispatch_in_progress"
        )

    monkeypatch.setattr(
        membership_welcome_email,
        "deliver_membership_welcome_email",
        dispatch_in_progress,
    )

    await membership_routes._deliver_membership_welcome(
        object(), uuid4(), "evt_concurrent"
    )


@pytest.mark.asyncio
async def test_other_retryable_welcome_failures_request_a_webhook_retry(monkeypatch):
    from app.Routes import membership_routes
    from app.services import membership_welcome_email

    async def temporarily_failed(_db, _user_id):
        raise membership_welcome_email.WelcomeEmailDeliveryError("provider_unavailable")

    monkeypatch.setattr(
        membership_welcome_email,
        "deliver_membership_welcome_email",
        temporarily_failed,
    )

    with pytest.raises(HTTPException) as raised:
        await membership_routes._deliver_membership_welcome(
            object(), uuid4(), "evt_retry"
        )

    assert raised.value.status_code == 503
    assert raised.value.detail == {"code": "welcome_email_pending"}
