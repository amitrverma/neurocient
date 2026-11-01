from datetime import datetime


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
    assert "Amit <Founder>" not in payload["html"]
