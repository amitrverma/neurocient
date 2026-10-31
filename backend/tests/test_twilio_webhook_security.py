from twilio.request_validator import RequestValidator

from app.config import settings
from app.services.twilio_webhook import validate_twilio_request


WEBHOOK_URL = "https://api.example.com/wa/webhook/whatsapp"
AUTH_TOKEN = "test-auth-token"
FORM = {
    "AccountSid": "AC" + "1" * 32,
    "MessageSid": "SM" + "2" * 32,
    "From": "whatsapp:+919876543210",
    "Body": "spot: I opened social media without deciding to",
}


def _signature(url: str, form: dict[str, str]) -> str:
    return RequestValidator(AUTH_TOKEN).compute_signature(url, form)


def _configure(monkeypatch) -> None:
    monkeypatch.setattr(settings, "TWILIO_AUTH_TOKEN", AUTH_TOKEN)
    monkeypatch.setattr(settings, "TWILIO_ACCOUNT_SID", FORM["AccountSid"])
    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_WEBHOOK_URL", WEBHOOK_URL)


def test_validates_exact_url_and_every_form_field(monkeypatch):
    _configure(monkeypatch)
    signature = _signature(WEBHOOK_URL, FORM)

    assert validate_twilio_request(FORM, signature) is True
    assert validate_twilio_request(FORM, None) is False
    assert validate_twilio_request(FORM, "invalid") is False

    changed = {**FORM, "FutureTwilioField": "new-value"}
    assert validate_twilio_request(changed, signature) is False
    assert validate_twilio_request(
        changed,
        _signature(WEBHOOK_URL, changed),
    ) is True


def test_rejects_signature_for_wrong_public_url(monkeypatch):
    _configure(monkeypatch)
    wrong_url_signature = _signature(
        "https://internal.example/wa/webhook/whatsapp",
        FORM,
    )

    assert validate_twilio_request(FORM, wrong_url_signature) is False


def test_fails_closed_without_required_configuration(monkeypatch):
    _configure(monkeypatch)
    signature = _signature(WEBHOOK_URL, FORM)

    monkeypatch.setattr(settings, "TWILIO_AUTH_TOKEN", None)
    assert validate_twilio_request(FORM, signature) is False
    monkeypatch.setattr(settings, "TWILIO_AUTH_TOKEN", AUTH_TOKEN)

    monkeypatch.setattr(settings, "TWILIO_WHATSAPP_WEBHOOK_URL", None)
    assert validate_twilio_request(FORM, signature) is False


def test_rejects_a_different_twilio_account(monkeypatch):
    _configure(monkeypatch)
    other_account = {**FORM, "AccountSid": "AC" + "9" * 32}

    assert validate_twilio_request(
        other_account,
        _signature(WEBHOOK_URL, other_account),
    ) is False
