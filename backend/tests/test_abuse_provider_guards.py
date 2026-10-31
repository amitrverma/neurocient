from uuid import uuid4

import pytest
from fastapi import HTTPException, Request

from app.Routes import auth_routes, cohort_routes, contact_routes
from app.models import User


def _request(path: str) -> Request:
    return Request({
        "type": "http", "method": "POST", "path": path,
        "raw_path": path.encode(), "query_string": b"", "headers": [],
        "client": ("203.0.113.8", 1234), "server": ("test", 443),
        "scheme": "https",
    })


@pytest.mark.asyncio
async def test_contact_limiter_failure_prevents_resend(monkeypatch):
    async def deny(*_args, **_kwargs):
        raise HTTPException(status_code=503, detail={"code": "abuse_protection_unavailable"})

    monkeypatch.setattr(contact_routes, "enforce", deny)
    monkeypatch.setattr(
        contact_routes.httpx,
        "AsyncClient",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(AssertionError("Resend must not run")),
    )
    with pytest.raises(HTTPException) as exc_info:
        await contact_routes.send_contact(
            contact_routes.ContactRequest(name="Amit", email="amit@example.com", message="Hello"),
            _request("/api/contact"),
            object(),
        )
    assert exc_info.value.status_code == 503


@pytest.mark.asyncio
async def test_checkout_denial_prevents_razorpay_and_database_work(monkeypatch):
    async def deny(*_args, **_kwargs):
        raise HTTPException(status_code=429, detail={"code": "rate_limited", "retry_after": 60})

    monkeypatch.setattr(cohort_routes, "enforce", deny)
    monkeypatch.setattr(
        cohort_routes,
        "razorpay_ready",
        lambda: (_ for _ in ()).throw(AssertionError("provider config must not be read")),
    )
    with pytest.raises(HTTPException) as exc_info:
        await cohort_routes.begin_checkout(
            uuid4(),
            User(id=uuid4(), email="member@example.com"),
            object(),
        )
    assert exc_info.value.status_code == 429


@pytest.mark.asyncio
async def test_login_denial_happens_before_account_lookup_or_password_work(monkeypatch):
    async def deny(*_args, **_kwargs):
        raise HTTPException(status_code=429, detail={"code": "rate_limited", "retry_after": 60})

    monkeypatch.setattr(auth_routes, "enforce", deny)
    monkeypatch.setattr(
        auth_routes,
        "verify_password",
        lambda *_args: (_ for _ in ()).throw(AssertionError("password work must not run")),
    )
    request = _request("/auth/login")
    request.scope["headers"] = [
        (auth_routes.AUTH_REQUEST_HEADER.encode(), auth_routes.AUTH_REQUEST_VALUE.encode())
    ]
    with pytest.raises(HTTPException) as exc_info:
        await auth_routes.login(
            auth_routes.AuthRequest(email="nobody@example.com", password="not-checked"),
            request,
            object(),
        )
    assert exc_info.value.status_code == 429
