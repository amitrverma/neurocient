import asyncio
import json
from unittest.mock import Mock

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
        {"type": "http", "method": "POST", "path": "/auth/firebase-login", "headers": []},
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
