import pytest

from app.config import Settings


def _disable_twilio(monkeypatch):
    for name in (
        "TWILIO_ACCOUNT_SID",
        "TWILIO_AUTH_TOKEN",
        "TWILIO_WHATSAPP_NUMBER",
        "TWILIO_WHATSAPP_WEBHOOK_URL",
    ):
        monkeypatch.setattr(Settings, name, None)


def test_production_configuration_rejects_missing_secrets(monkeypatch):
    _disable_twilio(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "prod")
    monkeypatch.setattr(Settings, "DATABASE_URL", None)
    monkeypatch.setattr(Settings, "JWT_SECRET", None)
    monkeypatch.setattr(Settings, "OPENAI_API_KEY", None)

    with pytest.raises(RuntimeError) as exc_info:
        Settings().validate_for_startup()

    message = str(exc_info.value)
    assert "DATABASE_URL" in message
    assert "JWT_SECRET" in message
    assert "OPENAI_API_KEY" in message


def test_development_configuration_only_requires_database(monkeypatch):
    _disable_twilio(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "dev")
    monkeypatch.setattr(Settings, "DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.setattr(Settings, "JWT_SECRET", None)
    monkeypatch.setattr(Settings, "OPENAI_API_KEY", None)

    Settings().validate_for_startup()


def test_production_requires_complete_twilio_configuration(monkeypatch):
    _disable_twilio(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "prod")
    monkeypatch.setattr(Settings, "DATABASE_URL", "postgresql://example")
    monkeypatch.setattr(Settings, "JWT_SECRET", "jwt-secret")
    monkeypatch.setattr(Settings, "OPENAI_API_KEY", "openai-secret")

    with pytest.raises(RuntimeError) as exc_info:
        Settings().validate_for_startup()

    message = str(exc_info.value)
    assert "TWILIO_ACCOUNT_SID" in message
    assert "TWILIO_AUTH_TOKEN" in message
    assert "TWILIO_WHATSAPP_NUMBER" in message
    assert "TWILIO_WHATSAPP_WEBHOOK_URL" in message


def test_partial_twilio_configuration_fails_closed(monkeypatch):
    _disable_twilio(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "dev")
    monkeypatch.setattr(Settings, "DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.setattr(Settings, "TWILIO_ACCOUNT_SID", "AC" + "1" * 32)

    with pytest.raises(RuntimeError) as exc_info:
        Settings().validate_for_startup()

    assert "TWILIO_WHATSAPP_WEBHOOK_URL" in str(exc_info.value)


def test_twilio_webhook_url_requires_https(monkeypatch):
    _disable_twilio(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "dev")
    monkeypatch.setattr(Settings, "DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.setattr(Settings, "TWILIO_ACCOUNT_SID", "AC" + "1" * 32)
    monkeypatch.setattr(Settings, "TWILIO_AUTH_TOKEN", "secret")
    monkeypatch.setattr(Settings, "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    monkeypatch.setattr(
        Settings,
        "TWILIO_WHATSAPP_WEBHOOK_URL",
        "http://api.example.com/wa/webhook/whatsapp",
    )

    with pytest.raises(RuntimeError) as exc_info:
        Settings().validate_for_startup()

    assert "exact HTTPS webhook route" in str(exc_info.value)


@pytest.mark.parametrize(
    "url",
    [
        "https://api.example.com/wrong-path",
        "https://user:password@api.example.com/wa/webhook/whatsapp",
        "https://api.example.com/wa/webhook/whatsapp#fragment",
    ],
)
def test_twilio_webhook_url_rejects_ambiguous_variants(monkeypatch, url):
    _disable_twilio(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "dev")
    monkeypatch.setattr(Settings, "DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.setattr(Settings, "TWILIO_ACCOUNT_SID", "AC" + "1" * 32)
    monkeypatch.setattr(Settings, "TWILIO_AUTH_TOKEN", "secret")
    monkeypatch.setattr(Settings, "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    monkeypatch.setattr(Settings, "TWILIO_WHATSAPP_WEBHOOK_URL", url)

    with pytest.raises(RuntimeError):
        Settings().validate_for_startup()
