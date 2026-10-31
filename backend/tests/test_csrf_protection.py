import time

import httpx
import pytest
from fastapi import FastAPI, Request

from app.config import settings
from app.middleware import CsrfProtectionMiddleware
from app.services.rate_limits import proxy_signature


@pytest.fixture
def csrf_app(monkeypatch):
    monkeypatch.setattr(
        settings,
        "CSRF_TRUSTED_ORIGINS",
        ("https://www.neurocient.com", "http://localhost:3000"),
        raising=False,
    )
    monkeypatch.setattr(
        settings,
        "ABUSE_PROXY_SECRET",
        "csrf-test-secret-that-is-at-least-32-characters",
    )
    app = FastAPI()
    app.add_middleware(CsrfProtectionMiddleware)
    calls = []

    @app.post("/mutate")
    async def mutate(request: Request):
        calls.append(await request.body())
        return {"ok": True}

    async def auth_mutation():
        calls.append(b"reset")
        return {"ok": True}

    for auth_path in (
        "/auth/signup",
        "/auth/login",
        "/auth/refresh",
        "/auth/logout",
        "/auth/password-reset/request",
        "/auth/password-reset/confirm",
        "/auth/firebase-login",
    ):
        app.add_api_route(auth_path, auth_mutation, methods=["POST"])

    @app.post("/api/payments/razorpay/webhook")
    async def provider_webhook():
        calls.append(b"provider")
        return {"ok": True}

    @app.post("/api/send-daily-nudge")
    async def admin_key_job():
        calls.append(b"admin")
        return {"ok": True}

    return app, calls


async def _post(app, path="/mutate", **kwargs):
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport, base_url="https://api.neurocient.com"
    ) as client:
        return await client.post(path, **kwargs)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Origin": "null"},
        {"Origin": "not a url"},
        {"Origin": "https://evil.example"},
        {"Origin": "http://www.neurocient.com"},
        {"Origin": "https://www.neurocient.com:444"},
        {"Origin": "https://www.neurocient.com.evil.example"},
    ],
)
async def test_cookie_json_mutations_reject_untrusted_origin_before_body(
    csrf_app, headers
):
    app, calls = csrf_app
    response = await _post(
        app,
        headers={**headers, "Cookie": "access_token=secret"},
        json={"private": "value"},
    )
    assert response.status_code == 403
    assert response.json() == {"detail": {"code": "csrf_failed"}}
    assert response.headers["cache-control"] == "no-store"
    assert calls == []


@pytest.mark.asyncio
async def test_guest_cookie_no_body_mutation_is_protected(csrf_app):
    app, calls = csrf_app
    response = await _post(app, headers={"Cookie": "guest_access_id=guest"})
    assert response.status_code == 403
    assert calls == []


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "headers",
    [
        {"Origin": "https://www.neurocient.com"},
        {"Referer": "https://www.neurocient.com/insights/example?from=home"},
        {"Origin": "http://localhost:3000"},
    ],
)
async def test_trusted_direct_cookie_mutations_are_accepted(csrf_app, headers):
    app, calls = csrf_app
    response = await _post(
        app, headers={**headers, "Cookie": "refresh_token=secret"}
    )
    assert response.status_code == 200
    assert len(calls) == 1


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "path",
    [
        "/auth/signup",
        "/auth/login",
        "/auth/refresh",
        "/auth/logout",
        "/auth/password-reset/request",
        "/auth/password-reset/confirm",
        "/auth/firebase-login",
    ],
)
async def test_all_browser_auth_mutations_require_proof_without_cookie(
    csrf_app, path
):
    app, calls = csrf_app
    response = await _post(app, path, json={})
    assert response.status_code == 403
    assert calls == []


@pytest.mark.asyncio
async def test_bearer_only_and_provider_requests_remain_compatible(csrf_app):
    app, calls = csrf_app
    bearer = await _post(app, headers={"Authorization": "Bearer token"})
    provider = await _post(app, "/api/payments/razorpay/webhook", content=b"signed")
    admin_job = await _post(
        app,
        "/api/send-daily-nudge",
        headers={"X-Admin-Key": "admin-secret"},
    )
    assert bearer.status_code == 200
    assert provider.status_code == 200
    assert admin_job.status_code == 200
    assert len(calls) == 3


def _signed_headers(*, method="POST", path="/mutate", ip="203.0.113.8", age=0):
    timestamp = int(time.time()) - age
    secret = "csrf-test-secret-that-is-at-least-32-characters"
    return {
        "X-Neurocient-Client-IP": ip,
        "X-Neurocient-Proxy-Timestamp": str(timestamp),
        "X-Neurocient-Proxy-Signature": proxy_signature(
            secret, timestamp, method, path, ip
        ),
    }


@pytest.mark.asyncio
async def test_fresh_signed_bff_cookie_mutation_is_accepted(csrf_app):
    app, calls = csrf_app
    response = await _post(
        app,
        headers={"Cookie": "session_present=1", **_signed_headers()},
    )
    assert response.status_code == 200
    assert len(calls) == 1


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "proof",
    [
        _signed_headers(method="PUT"),
        _signed_headers(path="/different"),
        _signed_headers(ip="203.0.113.9")
        | {"X-Neurocient-Client-IP": "203.0.113.8"},
        _signed_headers(age=120),
        _signed_headers() | {"X-Neurocient-Proxy-Signature": "0" * 64},
    ],
)
async def test_invalid_signed_bff_proof_is_rejected(csrf_app, proof):
    app, calls = csrf_app
    response = await _post(
        app, headers={"Cookie": "access_token=secret", **proof}
    )
    assert response.status_code == 403
    assert calls == []
