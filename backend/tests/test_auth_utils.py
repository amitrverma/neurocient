from datetime import timedelta
from uuid import uuid4

from fastapi import Response

from app.utils import auth


def test_hash_and_verify_password():
    password = "supersecret"
    hashed = auth.hash_password(password)
    assert auth.verify_password(password, hashed)
    assert not auth.verify_password("wrong", hashed)


def test_create_and_decode_token():
    token = auth.create_access_token({"sub": "user"}, expires_delta=timedelta(minutes=5))
    decoded = auth.decode_token(token)
    assert decoded["sub"] == "user"


def test_decode_token_invalid():
    assert auth.decode_token("invalid-token") is None


def test_production_auth_cookies_are_secure_lax_and_http_only(monkeypatch):
    monkeypatch.setattr(auth, "COOKIE_SECURE", True)
    monkeypatch.setattr(auth, "COOKIE_SAMESITE", "Lax")
    response = Response()
    tokens = auth.SessionTokens(
        access="access",
        refresh="refresh",
        session_id=uuid4(),
        family_id=uuid4(),
    )
    auth.set_auth_cookies(response, tokens)
    cookies = response.headers.getlist("set-cookie")
    assert len(cookies) == 3
    assert all("Secure" in cookie and "SameSite=Lax" in cookie for cookie in cookies)
    assert "HttpOnly" in cookies[0]
    assert "HttpOnly" in cookies[1]
    assert "HttpOnly" not in cookies[2]
