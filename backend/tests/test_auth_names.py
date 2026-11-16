import pytest
from fastapi import HTTPException

from app.Routes.auth_routes import (
    SignupRequest,
    _normalized_name,
    _verified_google_identity,
)


def test_normalized_name_trims_and_collapses_whitespace():
    assert _normalized_name("  Ada   Lovelace  ") == "Ada Lovelace"


@pytest.mark.parametrize("value", ["", "   ", None, 42])
def test_normalized_name_rejects_missing_or_blank_values(value):
    with pytest.raises(HTTPException) as exc_info:
        _normalized_name(value)

    assert exc_info.value.status_code == 422


def test_signup_request_requires_name():
    with pytest.raises(ValueError):
        SignupRequest(email="ada@example.com", password="a memorable passphrase")


def test_google_identity_without_provider_name_remains_compatible_for_named_users():
    _email, name, _uid = _verified_google_identity(
        {
            "email": "ada@example.com",
            "email_verified": True,
            "uid": "google-user-1",
            "firebase": {"sign_in_provider": "google.com"},
        }
    )

    assert name is None


def test_verified_google_identity_returns_normalized_verified_name():
    email, name, uid = _verified_google_identity(
        {
            "email": "  ADA@EXAMPLE.COM ",
            "email_verified": True,
            "name": "  Ada   Lovelace  ",
            "uid": "google-user-1",
            "firebase": {"sign_in_provider": "google.com"},
        }
    )

    assert (email, name, uid) == (
        "ada@example.com",
        "Ada Lovelace",
        "google-user-1",
    )
