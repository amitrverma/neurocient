from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI, HTTPException

from app.Routes import (
    auth_routes, caveman_scan_routes, cohort_routes, newsletter_routes,
    reflections_routes,
)
from app.database import get_db
from app.utils.auth import get_current_user, get_optional_user


async def _fake_db():
    yield object()


def _deny() -> HTTPException:
    return HTTPException(
        status_code=429,
        detail={"code": "rate_limited", "retry_after": 60},
        headers={"Retry-After": "60", "Cache-Control": "no-store"},
    )


@pytest.mark.asyncio
async def test_all_auth_surfaces_reach_limiter_before_sensitive_work(monkeypatch):
    async def deny(*_args, **_kwargs):
        raise _deny()

    monkeypatch.setattr(auth_routes, "enforce", deny)
    app = FastAPI()
    app.include_router(auth_routes.router, prefix="/auth")
    app.dependency_overrides[get_db] = _fake_db
    marker = {auth_routes.AUTH_REQUEST_HEADER: auth_routes.AUTH_REQUEST_VALUE}
    transport = httpx.ASGITransport(app=app)
    cases = [
        ("/auth/login", {"email": "user@example.com", "password": "not checked"}),
        ("/auth/signup", {"email": "user@example.com", "password": "not checked"}),
        ("/auth/refresh", None),
        ("/auth/password-reset/request", {"email": "user@example.com"}),
        ("/auth/password-reset/confirm", {"token": "x" * 32, "password": "not checked"}),
        ("/auth/firebase-login", {"idToken": "token"}),
    ]
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        for path, body in cases:
            response = await client.post(path, headers=marker, json=body)
            assert response.status_code == 429, (path, response.text)
            assert response.headers["retry-after"] == "60"


@pytest.mark.asyncio
async def test_firebase_token_boundary(monkeypatch):
    async def deny(*_args, **_kwargs):
        raise _deny()

    monkeypatch.setattr(auth_routes, "enforce", deny)
    app = FastAPI()
    app.include_router(auth_routes.router, prefix="/auth")
    app.dependency_overrides[get_db] = _fake_db
    marker = {auth_routes.AUTH_REQUEST_HEADER: auth_routes.AUTH_REQUEST_VALUE}
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        accepted = await client.post(
            "/auth/firebase-login", headers=marker, json={"idToken": "x" * 4096}
        )
        rejected = await client.post(
            "/auth/firebase-login", headers=marker, json={"idToken": "x" * 4097}
        )
    assert accepted.status_code == 429
    assert rejected.status_code == 422


@pytest.mark.asyncio
async def test_newsletter_surface_reaches_limiter_before_lookup(monkeypatch):
    async def deny(*_args, **_kwargs):
        raise _deny()

    monkeypatch.setattr(newsletter_routes, "enforce", deny)
    app = FastAPI()
    app.include_router(newsletter_routes.router, prefix="/api")
    app.dependency_overrides[get_db] = _fake_db
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/subscribe", json={"email": "user@example.com"})
    assert response.status_code == 429


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("router", "prefix", "path", "module", "auth_dependency", "body"),
    [
        (
            caveman_scan_routes.router, "/api", "/api/caveman-scan/sessions",
            caveman_scan_routes, get_optional_user,
            {"scan_version": "1", "scoring_version": "1", "report_version": "1", "scenario_ids": ["one"]},
        ),
        (
            reflections_routes.router, "/api", "/api/weekly-reflection/generate",
            reflections_routes, get_current_user, None,
        ),
        (
            cohort_routes.router, "/api", f"/api/cohorts/{uuid4()}/checkout",
            cohort_routes, get_current_user, None,
        ),
    ],
)
async def test_ip_guard_runs_before_authentication(
    monkeypatch, router, prefix, path, module, auth_dependency, body,
):
    auth_called = False

    async def deny_ip(*_args, **_kwargs):
        raise _deny()

    async def auth_sentinel():
        nonlocal auth_called
        auth_called = True
        raise AssertionError("authentication must not run after IP denial")

    monkeypatch.setattr(module, "enforce_ip", deny_ip)
    app = FastAPI()
    app.include_router(router, prefix=prefix)
    app.dependency_overrides[get_db] = _fake_db
    app.dependency_overrides[auth_dependency] = auth_sentinel
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(path, json=body)
    assert response.status_code == 429
    assert auth_called is False
