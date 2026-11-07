import httpx
import json
import pytest
from fastapi import FastAPI, Request
from pydantic import ValidationError
from uuid import uuid4

from app.config import Settings, settings
from app.middleware import MutationBodyLimitMiddleware
from app.services import rate_limits
from app.services.rate_limits import client_ip, proxy_signature
from app.Routes.caveman_scan_routes import CreateScanSession, UpdateScanSession
from app.Routes.contact_routes import ContactRequest


def _request(path: str, headers: dict[str, str]) -> Request:
    return Request({
        "type": "http",
        "method": "POST",
        "path": path,
        "raw_path": path.encode(),
        "query_string": b"",
        "headers": [(key.lower().encode(), value.encode()) for key, value in headers.items()],
        "client": ("10.0.0.8", 1234),
        "server": ("api.test", 443),
        "scheme": "https",
    })


def test_signed_client_ip_and_safe_rightmost_fallback(monkeypatch):
    secret = "proxy-secret-that-is-at-least-32-characters"
    monkeypatch.setattr(settings, "ABUSE_PROXY_SECRET", secret)
    timestamp = 1_700_000_000
    signature = proxy_signature(secret, timestamp, "POST", "/auth/login", "203.0.113.9")
    valid = _request("/auth/login", {
        "x-neurocient-client-ip": "203.0.113.9",
        "x-neurocient-proxy-timestamp": str(timestamp),
        "x-neurocient-proxy-signature": signature,
        "x-forwarded-for": "198.51.100.1, 10.0.0.9",
    })
    assert client_ip(valid, now_seconds=timestamp) == "203.0.113.9"

    forged = _request("/auth/login", {
        "x-neurocient-client-ip": "203.0.113.9",
        "x-neurocient-proxy-timestamp": str(timestamp),
        "x-neurocient-proxy-signature": "0" * 64,
        "x-forwarded-for": "198.51.100.1, 10.0.0.9",
    })
    assert client_ip(forged, now_seconds=timestamp) == "10.0.0.9"
    assert client_ip(valid, now_seconds=timestamp + 61) == "10.0.0.9"

    expanded = "2001:0DB8:0000:0000:0000:0000:0000:0001"
    ipv6_signature = proxy_signature(secret, timestamp, "POST", "/auth/login", expanded)
    ipv6 = _request("/auth/login", {
        "x-neurocient-client-ip": expanded,
        "x-neurocient-proxy-timestamp": str(timestamp),
        "x-neurocient-proxy-signature": ipv6_signature,
        "x-forwarded-for": "10.0.0.9",
    })
    assert client_ip(ipv6, now_seconds=timestamp) == "2001:db8::1"


@pytest.mark.asyncio
async def test_mutation_body_limit_buffers_boundary_and_rejects_overflow():
    calls = 0
    app = FastAPI()
    app.add_middleware(MutationBodyLimitMiddleware, max_bytes=16)

    @app.post("/echo")
    async def echo(request: Request):
        nonlocal calls
        calls += 1
        return {"size": len(await request.body())}

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        accepted = await client.post("/echo", content=b"a" * 16)
        rejected = await client.post("/echo", content=b"a" * 17)
        async def chunks():
            yield b"b" * 10
            yield b"b" * 10
        streamed = await client.post("/echo", content=chunks())
    assert accepted.status_code == 200
    assert accepted.json() == {"size": 16}
    assert rejected.status_code == 413
    assert rejected.json() == {"detail": {"code": "payload_too_large"}}
    assert streamed.status_code == 413
    assert calls == 1


def test_production_requires_strong_abuse_secrets(monkeypatch):
    monkeypatch.setattr(Settings, "ENV", "prod")
    monkeypatch.setattr(Settings, "DATABASE_URL", "postgresql://example")
    monkeypatch.setattr(Settings, "JWT_SECRET", "jwt")
    monkeypatch.setattr(Settings, "OPENAI_API_KEY", "openai")
    monkeypatch.setattr(Settings, "RATE_LIMIT_ENABLED", True)
    monkeypatch.setattr(Settings, "RATE_LIMIT_KEY_SECRET", "short")
    monkeypatch.setattr(Settings, "ABUSE_PROXY_SECRET", "also-short")
    monkeypatch.setattr(Settings, "WHATSAPP_ACCESS_TOKEN", "access-token")
    monkeypatch.setattr(Settings, "WHATSAPP_APP_SECRET", "app-secret")
    monkeypatch.setattr(Settings, "WHATSAPP_VERIFY_TOKEN", "verify-token")
    monkeypatch.setattr(Settings, "WHATSAPP_BUSINESS_ACCOUNT_ID", "123456789")
    monkeypatch.setattr(Settings, "WHATSAPP_PHONE_NUMBER_ID", "987654321")
    monkeypatch.setattr(Settings, "WHATSAPP_GRAPH_API_VERSION", "v24.0")
    with pytest.raises(RuntimeError, match="RATE_LIMIT_KEY_SECRET"):
        Settings().validate_for_startup()


def test_production_rejects_reused_abuse_secret(monkeypatch):
    shared = "shared-secret-that-is-at-least-32-characters"
    monkeypatch.setattr(Settings, "ENV", "prod")
    monkeypatch.setattr(Settings, "DATABASE_URL", "postgresql://example")
    monkeypatch.setattr(Settings, "JWT_SECRET", "jwt")
    monkeypatch.setattr(Settings, "OPENAI_API_KEY", "openai")
    monkeypatch.setattr(Settings, "RATE_LIMIT_ENABLED", True)
    monkeypatch.setattr(Settings, "RATE_LIMIT_KEY_SECRET", shared)
    monkeypatch.setattr(Settings, "ABUSE_PROXY_SECRET", shared)
    monkeypatch.setattr(Settings, "WHATSAPP_ACCESS_TOKEN", "access-token")
    monkeypatch.setattr(Settings, "WHATSAPP_APP_SECRET", "app-secret")
    monkeypatch.setattr(Settings, "WHATSAPP_VERIFY_TOKEN", "verify-token")
    monkeypatch.setattr(Settings, "WHATSAPP_BUSINESS_ACCOUNT_ID", "123456789")
    monkeypatch.setattr(Settings, "WHATSAPP_PHONE_NUMBER_ID", "987654321")
    monkeypatch.setattr(Settings, "WHATSAPP_GRAPH_API_VERSION", "v24.0")
    with pytest.raises(RuntimeError, match="must be independent"):
        Settings().validate_for_startup()


@pytest.mark.asyncio
async def test_disabled_limiter_is_a_development_noop(monkeypatch):
    monkeypatch.setattr(settings, "RATE_LIMIT_ENABLED", False)
    monkeypatch.setattr(
        rate_limits,
        "AsyncSessionLocal",
        lambda: (_ for _ in ()).throw(AssertionError("database must not be used")),
    )
    await rate_limits.enforce(None, [("login_ip", "203.0.113.1")])


@pytest.mark.asyncio
async def test_limiter_failure_has_stable_safe_503(monkeypatch):
    monkeypatch.setattr(settings, "RATE_LIMIT_ENABLED", True)
    monkeypatch.setattr(settings, "RATE_LIMIT_KEY_SECRET", "test-rate-key-that-is-at-least-32-chars")
    monkeypatch.setattr(
        rate_limits,
        "AsyncSessionLocal",
        lambda: (_ for _ in ()).throw(RuntimeError("database unavailable secret-data")),
    )
    with pytest.raises(Exception) as exc_info:
        await rate_limits.enforce(None, [("login_ip", "203.0.113.1")])
    exc = exc_info.value
    assert exc.status_code == 503
    assert exc.detail == {"code": "abuse_protection_unavailable"}
    assert "secret-data" not in str(exc.detail)


def test_domain_payload_boundaries():
    CreateScanSession(
        scan_version="1", scoring_version="1", report_version="1",
        scenario_ids=["x" * 100],
    )
    with pytest.raises(ValidationError):
        CreateScanSession(
            scan_version="1", scoring_version="1", report_version="1",
            scenario_ids=["x" * 101],
        )

    token = str(uuid4())
    depth_eight = "leaf"
    for _ in range(7):
        depth_eight = [depth_eight]
    UpdateScanSession(accessToken=token, evidence={"value": depth_eight})
    with pytest.raises(ValidationError):
        UpdateScanSession(accessToken=token, evidence={"value": [depth_eight]})
    with pytest.raises(ValidationError):
        UpdateScanSession(accessToken=token, evidence={"value": float("inf")})

    exact_32_kib = [{"x": ""} for _ in range(8)]
    overhead = len(json.dumps(exact_32_kib).encode("utf-8"))
    text_bytes, remainder = divmod(32_768 - overhead, len(exact_32_kib))
    for index, item in enumerate(exact_32_kib):
        item["x"] = "x" * (text_bytes + (1 if index < remainder else 0))
    assert len(json.dumps(exact_32_kib).encode("utf-8")) == 32_768
    UpdateScanSession(accessToken=token, responses=exact_32_kib)
    over_32_kib = [dict(item) for item in exact_32_kib]
    over_32_kib[-1]["x"] += "x"
    with pytest.raises(ValidationError):
        UpdateScanSession(accessToken=token, responses=over_32_kib)

    ContactRequest(name="n" * 100, email="user@example.com", message="m" * 4000)
    with pytest.raises(ValidationError):
        ContactRequest(name="n" * 101, email="user@example.com", message="ok")
    with pytest.raises(ValidationError):
        ContactRequest(name="ok", email="user@example.com", message="m" * 4001)


def test_whatsapp_connection_rate_limit_policies_are_registered():
    expected = {
        "whatsapp_pair_ip": (10, 60 * 60),
        "whatsapp_pair_user": (5, 60 * 60),
        "whatsapp_disconnect_ip": (30, 60 * 60),
        "whatsapp_disconnect_user": (10, 60 * 60),
    }

    assert {
        name: (rate_limits.POLICIES[name].limit, rate_limits.POLICIES[name].window_seconds)
        for name in expected
    } == expected
