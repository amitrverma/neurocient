import asyncio
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from fastapi import HTTPException
from firebase_admin import auth as firebase_auth
from starlette.requests import Request

from app.Routes import auth_routes


def _request(body: dict) -> Request:
    encoded = json.dumps(body).encode()

    async def receive():
        return {"type": "http.request", "body": encoded, "more_body": False}

    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/auth/firebase-login",
            "headers": [
                (
                    auth_routes.AUTH_REQUEST_HEADER.encode(),
                    auth_routes.AUTH_REQUEST_VALUE.encode(),
                )
            ],
        },
        receive,
    )


@pytest.mark.parametrize(
    ("verification_error", "expected_detail"),
    [
        (firebase_auth.InvalidIdTokenError("invalid token"), "Invalid Firebase token"),
        (firebase_auth.ExpiredIdTokenError("expired token", None), "Expired Firebase token"),
    ],
)
def test_firebase_login_rejects_unverifiable_tokens(
    monkeypatch, verification_error, expected_detail
):
    def reject_token(*_args, **_kwargs):
        raise verification_error

    monkeypatch.setattr(firebase_auth, "verify_id_token", reject_token)

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(
            auth_routes.firebase_login(
                _request({"idToken": "synthetic-token"}),
                db=Mock(),
            )
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == expected_detail


@pytest.mark.parametrize(
    "claims",
    [
        {
            "email": "person@example.com",
            "email_verified": False,
            "uid": "google-1",
            "firebase": {"sign_in_provider": "google.com"},
        },
        {
            "email": "person@example.com",
            "email_verified": True,
            "uid": "google-1",
            "firebase": {"sign_in_provider": "password"},
        },
        {
            "email_verified": True,
            "uid": "google-1",
            "firebase": {"sign_in_provider": "google.com"},
        },
        {
            "email": "person@example.com",
            "email_verified": True,
            "firebase": {"sign_in_provider": "google.com"},
        },
    ],
)
def test_firebase_login_requires_verified_google_claims(monkeypatch, claims):
    monkeypatch.setattr(firebase_auth, "verify_id_token", lambda *_args, **_kwargs: claims)

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(
            auth_routes.firebase_login(
                _request({"idToken": "synthetic-token"}),
                db=Mock(),
            )
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Unverified Google identity"


def test_firebase_login_rejects_existing_google_uid_mismatch(monkeypatch):
    claims = {
        "email": "person@example.com",
        "email_verified": True,
        "uid": "attacker-google-id",
        "firebase": {"sign_in_provider": "google.com"},
    }
    monkeypatch.setattr(firebase_auth, "verify_id_token", lambda *_args, **_kwargs: claims)

    user_result = Mock()
    user_result.scalars.return_value.first.return_value = SimpleNamespace(
        google_id="expected-google-id"
    )
    db = Mock()
    db.execute = AsyncMock(return_value=user_result)

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(
            auth_routes.firebase_login(
                _request({"idToken": "synthetic-token"}),
                db=db,
            )
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Google identity mismatch"


def test_verified_google_identity_normalizes_email_and_preserves_uid():
    assert auth_routes._verified_google_identity(
        {
            "email": " Person@Example.COM ",
            "email_verified": True,
            "name": "Person",
            "uid": "google-1",
            "firebase": {"sign_in_provider": "google.com"},
        }
    ) == ("person@example.com", "Person", "google-1")
