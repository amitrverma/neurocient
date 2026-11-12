import pytest

from app.config import Settings, parse_csrf_trusted_origins


def _disable_whatsapp(monkeypatch):
    for name in (
        "WHATSAPP_ACCESS_TOKEN",
        "WHATSAPP_APP_SECRET",
        "WHATSAPP_VERIFY_TOKEN",
        "WHATSAPP_BUSINESS_ACCOUNT_ID",
        "WHATSAPP_PHONE_NUMBER_ID",
        "WHATSAPP_BUSINESS_NUMBER",
        "WHATSAPP_GRAPH_API_VERSION",
        "CONSENT_PAIRING_SECRET",
    ):
        monkeypatch.setattr(Settings, name, None)


def test_production_configuration_rejects_missing_secrets(monkeypatch):
    _disable_whatsapp(monkeypatch)
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
    assert "CONSENT_PAIRING_SECRET" in message


def test_development_configuration_only_requires_database(monkeypatch):
    _disable_whatsapp(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "dev")
    monkeypatch.setattr(Settings, "DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.setattr(Settings, "JWT_SECRET", None)
    monkeypatch.setattr(Settings, "OPENAI_API_KEY", None)

    Settings().validate_for_startup()


def test_production_requires_complete_whatsapp_configuration(monkeypatch):
    _disable_whatsapp(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "prod")
    monkeypatch.setattr(Settings, "DATABASE_URL", "postgresql://example")
    monkeypatch.setattr(Settings, "JWT_SECRET", "jwt-secret")
    monkeypatch.setattr(Settings, "OPENAI_API_KEY", "openai-secret")

    with pytest.raises(RuntimeError) as exc_info:
        Settings().validate_for_startup()

    message = str(exc_info.value)
    assert "WHATSAPP_ACCESS_TOKEN" in message
    assert "WHATSAPP_APP_SECRET" in message
    assert "WHATSAPP_VERIFY_TOKEN" in message
    assert "WHATSAPP_BUSINESS_ACCOUNT_ID" in message
    assert "WHATSAPP_PHONE_NUMBER_ID" in message
    assert "WHATSAPP_BUSINESS_NUMBER" in message
    assert "WHATSAPP_GRAPH_API_VERSION" in message


def test_partial_whatsapp_configuration_fails_closed(monkeypatch):
    _disable_whatsapp(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "dev")
    monkeypatch.setattr(Settings, "DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.setattr(Settings, "WHATSAPP_ACCESS_TOKEN", "access-token")

    with pytest.raises(RuntimeError) as exc_info:
        Settings().validate_for_startup()

    assert "WHATSAPP_APP_SECRET" in str(exc_info.value)


def test_whatsapp_graph_api_version_is_explicit_and_versioned(monkeypatch):
    _disable_whatsapp(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "dev")
    monkeypatch.setattr(Settings, "DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.setattr(Settings, "WHATSAPP_ACCESS_TOKEN", "access-token")
    monkeypatch.setattr(Settings, "WHATSAPP_APP_SECRET", "app-secret")
    monkeypatch.setattr(Settings, "WHATSAPP_VERIFY_TOKEN", "verify-token")
    monkeypatch.setattr(Settings, "WHATSAPP_BUSINESS_ACCOUNT_ID", "123456789")
    monkeypatch.setattr(Settings, "WHATSAPP_PHONE_NUMBER_ID", "987654321")
    monkeypatch.setattr(Settings, "WHATSAPP_BUSINESS_NUMBER", "919209830485")
    monkeypatch.setattr(Settings, "CONSENT_PAIRING_SECRET", "p" * 32)
    monkeypatch.setattr(Settings, "WHATSAPP_GRAPH_API_VERSION", "latest")

    with pytest.raises(RuntimeError) as exc_info:
        Settings().validate_for_startup()

    assert "form v<major>.0" in str(exc_info.value)


@pytest.mark.parametrize(
    ("name", "value", "expected"),
    [
        ("WHATSAPP_BUSINESS_ACCOUNT_ID", "not-an-id", "must be numeric"),
        ("WHATSAPP_PHONE_NUMBER_ID", "phone-id", "must be numeric"),
        ("WHATSAPP_ACCESS_TOKEN", "short", "at least 32 characters"),
        ("WHATSAPP_APP_SECRET", "short", "at least 32 characters"),
        ("WHATSAPP_VERIFY_TOKEN", "short", "at least 32 characters"),
    ],
)
def test_complete_whatsapp_configuration_rejects_malformed_values(
    monkeypatch, name, value, expected
):
    _disable_whatsapp(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "dev")
    monkeypatch.setattr(Settings, "DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.setattr(Settings, "WHATSAPP_ACCESS_TOKEN", "a" * 40)
    monkeypatch.setattr(Settings, "WHATSAPP_APP_SECRET", "b" * 32)
    monkeypatch.setattr(Settings, "WHATSAPP_VERIFY_TOKEN", "c" * 32)
    monkeypatch.setattr(Settings, "WHATSAPP_BUSINESS_ACCOUNT_ID", "123456789")
    monkeypatch.setattr(Settings, "WHATSAPP_PHONE_NUMBER_ID", "987654321")
    monkeypatch.setattr(Settings, "WHATSAPP_BUSINESS_NUMBER", "919209830485")
    monkeypatch.setattr(Settings, "CONSENT_PAIRING_SECRET", "p" * 32)
    monkeypatch.setattr(Settings, "WHATSAPP_GRAPH_API_VERSION", "v24.0")
    monkeypatch.setattr(Settings, name, value)

    with pytest.raises(RuntimeError, match=expected):
        Settings().validate_for_startup()


def test_whatsapp_app_and_verify_secrets_must_be_independent(monkeypatch):
    _disable_whatsapp(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "dev")
    monkeypatch.setattr(Settings, "DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.setattr(Settings, "WHATSAPP_ACCESS_TOKEN", "a" * 40)
    monkeypatch.setattr(Settings, "WHATSAPP_APP_SECRET", "s" * 32)
    monkeypatch.setattr(Settings, "WHATSAPP_VERIFY_TOKEN", "s" * 32)
    monkeypatch.setattr(Settings, "WHATSAPP_BUSINESS_ACCOUNT_ID", "123456789")
    monkeypatch.setattr(Settings, "WHATSAPP_PHONE_NUMBER_ID", "987654321")
    monkeypatch.setattr(Settings, "WHATSAPP_BUSINESS_NUMBER", "919209830485")
    monkeypatch.setattr(Settings, "CONSENT_PAIRING_SECRET", "p" * 32)
    monkeypatch.setattr(Settings, "WHATSAPP_GRAPH_API_VERSION", "v24.0")

    with pytest.raises(RuntimeError, match="must be independent"):
        Settings().validate_for_startup()


@pytest.mark.parametrize(
    ("name", "value", "expected"),
    [
        ("WHATSAPP_NUDGE_TEMPLATE_NAME", "Daily-Nudge", "lowercase letters"),
        ("WHATSAPP_SPOT_TEMPLATE_NAME", "", "lowercase letters"),
        ("WHATSAPP_TEMPLATE_LANGUAGE", "english", "Meta language code"),
    ],
)
def test_whatsapp_template_configuration_is_provider_valid(
    monkeypatch, name, value, expected
):
    monkeypatch.setattr(Settings, name, value)

    with pytest.raises(RuntimeError, match=expected):
        Settings().validate_for_startup()


def test_membership_currency_plans_must_be_distinct(monkeypatch):
    monkeypatch.setattr(Settings, "ENV", "dev")
    monkeypatch.setattr(Settings, "RAZORPAY_MEMBERSHIP_PLAN_ID", "plan_same")
    monkeypatch.setattr(Settings, "RAZORPAY_MEMBERSHIP_USD_PLAN_ID", "plan_same")

    with pytest.raises(RuntimeError, match="plans must be distinct"):
        Settings().validate_for_startup()


def test_csrf_origins_are_normalized_and_development_has_local_defaults():
    assert parse_csrf_trusted_origins(None, "dev") == (
        "http://localhost:3000",
        "http://localhost:3001",
    )
    assert parse_csrf_trusted_origins(
        "https://WWW.Neurocient.com,https://neurocient.com:444", "prod"
    ) == ("https://www.neurocient.com", "https://neurocient.com:444")


@pytest.mark.parametrize(
    "value",
    [
        "http://neurocient.com",
        "https://neurocient.com/",
        "https://user:secret@neurocient.com",
        "https://neurocient.com?next=evil",
        "https://neurocient.com,https://NEUROCIENT.com",
        "https://neurocient.com,",
    ],
)
def test_production_csrf_origins_reject_unsafe_or_ambiguous_values(value):
    with pytest.raises(RuntimeError):
        parse_csrf_trusted_origins(value, "prod")


def test_production_requires_explicit_csrf_origins(monkeypatch):
    _disable_whatsapp(monkeypatch)
    monkeypatch.setattr(Settings, "ENV", "prod")
    monkeypatch.setattr(Settings, "DATABASE_URL", "postgresql://example")
    monkeypatch.setattr(Settings, "JWT_SECRET", "jwt")
    monkeypatch.setattr(Settings, "OPENAI_API_KEY", "openai")
    monkeypatch.setattr(Settings, "RATE_LIMIT_ENABLED", True)
    monkeypatch.setattr(Settings, "RATE_LIMIT_KEY_SECRET", "r" * 32)
    monkeypatch.setattr(Settings, "ABUSE_PROXY_SECRET", "a" * 32)
    monkeypatch.setattr(Settings, "CSRF_TRUSTED_ORIGINS", ())

    with pytest.raises(RuntimeError, match="CSRF_TRUSTED_ORIGINS"):
        Settings().validate_for_startup()
