import pytest

from app.config import Settings


def test_production_configuration_rejects_missing_secrets(monkeypatch):
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
    monkeypatch.setattr(Settings, "ENV", "dev")
    monkeypatch.setattr(Settings, "DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.setattr(Settings, "JWT_SECRET", None)
    monkeypatch.setattr(Settings, "OPENAI_API_KEY", None)

    Settings().validate_for_startup()
