from __future__ import annotations

import hashlib
import hmac
import ipaddress
import math
import time
import asyncio
from dataclasses import dataclass
from datetime import datetime, timedelta

from fastapi import HTTPException, Request, status
from sqlalchemy import case, delete, func, or_, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import AbuseRateLimitBucket
from app.database import AsyncSessionLocal


PROXY_IP_HEADER = "x-neurocient-client-ip"
PROXY_TIMESTAMP_HEADER = "x-neurocient-proxy-timestamp"
PROXY_SIGNATURE_HEADER = "x-neurocient-proxy-signature"
PROXY_MAX_SKEW_SECONDS = 60
BUCKET_RETENTION_DAYS = 30
_cleanup_lock = asyncio.Lock()
_last_cleanup_monotonic = 0.0


@dataclass(frozen=True)
class Policy:
    name: str
    limit: int
    window_seconds: int


POLICIES = {
    "login_ip": Policy("login_ip", 30, 5 * 60),
    "login_email": Policy("login_email", 10, 15 * 60),
    "signup_ip": Policy("signup_ip", 5, 60 * 60),
    "signup_email": Policy("signup_email", 3, 24 * 60 * 60),
    "refresh_ip": Policy("refresh_ip", 120, 5 * 60),
    "refresh_token": Policy("refresh_token", 30, 5 * 60),
    "reset_request_ip": Policy("reset_request_ip", 5, 60 * 60),
    "reset_request_email": Policy("reset_request_email", 3, 60 * 60),
    "reset_confirm_ip": Policy("reset_confirm_ip", 10, 60 * 60),
    "reset_confirm_token": Policy("reset_confirm_token", 5, 60 * 60),
    "firebase_ip": Policy("firebase_ip", 20, 5 * 60),
    "firebase_token": Policy("firebase_token", 10, 5 * 60),
    "scan_ip": Policy("scan_ip", 20, 60 * 60),
    "scan_user": Policy("scan_user", 30, 60 * 60),
    "newsletter_ip": Policy("newsletter_ip", 5, 60 * 60),
    "newsletter_email": Policy("newsletter_email", 3, 24 * 60 * 60),
    "contact_ip": Policy("contact_ip", 3, 60 * 60),
    "contact_email": Policy("contact_email", 3, 24 * 60 * 60),
    "reflection_ip": Policy("reflection_ip", 10, 24 * 60 * 60),
    "reflection_user": Policy("reflection_user", 3, 24 * 60 * 60),
    "reflection_provider": Policy("reflection_provider", 1, 8 * 24 * 60 * 60),
    "checkout_ip": Policy("checkout_ip", 20, 60 * 60),
    "checkout_user": Policy("checkout_user", 10, 60 * 60),
}


def normalize_email(value: str) -> str:
    return value.strip().lower()


def credential_digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _valid_ip(value: str | None) -> str | None:
    if not value:
        return None
    candidate = value.strip()
    try:
        return ipaddress.ip_address(candidate).compressed
    except ValueError:
        return None


def proxy_signature(secret: str, timestamp: int, method: str, path: str, ip: str) -> str:
    payload = f"{timestamp}\n{method.upper()}\n{path}\n{ip}".encode("utf-8")
    return hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()


def client_ip(request: Request, *, now_seconds: int | None = None) -> str:
    claimed_raw = (request.headers.get(PROXY_IP_HEADER) or "").strip()
    claimed_ip = _valid_ip(claimed_raw)
    timestamp_value = request.headers.get(PROXY_TIMESTAMP_HEADER)
    signature = request.headers.get(PROXY_SIGNATURE_HEADER)
    secret = settings.ABUSE_PROXY_SECRET
    if claimed_ip and timestamp_value and signature and secret:
        try:
            timestamp = int(timestamp_value)
        except ValueError:
            timestamp = 0
        now = int(time.time()) if now_seconds is None else now_seconds
        if abs(now - timestamp) <= PROXY_MAX_SKEW_SECONDS:
            expected = proxy_signature(
                secret, timestamp, request.method, request.url.path, claimed_raw
            )
            if hmac.compare_digest(expected, signature):
                return claimed_ip

    # Azure appends its trusted peer address to the right-hand side.
    forwarded = request.headers.get("x-forwarded-for", "")
    direct = _valid_ip(forwarded.rsplit(",", 1)[-1])
    if direct:
        return direct
    if request.client:
        peer = _valid_ip(request.client.host)
        if peer:
            return peer
    return "0.0.0.0"


def _identity_hash(policy: Policy, identity: str) -> str:
    secret = settings.RATE_LIMIT_KEY_SECRET
    if not secret:
        raise RuntimeError("rate-limit key secret is not configured")
    return hmac.new(
        secret.encode("utf-8"),
        f"{policy.name}\0{identity}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def _rate_limited(retry_after: int) -> HTTPException:
    retry_after = max(1, retry_after)
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail={"code": "rate_limited", "retry_after": retry_after},
        headers={"Retry-After": str(retry_after), "Cache-Control": "no-store"},
    )


def _unavailable() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={"code": "abuse_protection_unavailable"},
        headers={"Cache-Control": "no-store"},
    )


async def enforce(
    db: AsyncSession | None,
    rules: list[tuple[str, str]],
    *,
    now: datetime | None = None,
) -> None:
    if not settings.RATE_LIMIT_ENABLED:
        return
    del db  # limiter accounting has its own transaction and survives business rollback
    try:
        async with AsyncSessionLocal() as limiter_db:
            current = now or (await limiter_db.execute(select(func.clock_timestamp()))).scalar_one().replace(tzinfo=None)
            for policy_name, identity in rules:
                policy = POLICIES[policy_name]
                identity_hash = _identity_hash(policy, identity)
                expired_before = current - timedelta(seconds=policy.window_seconds)
                table = AbuseRateLimitBucket.__table__
                statement = insert(table).values(
                    policy=policy.name,
                    identity_hash=identity_hash,
                    window_started_at=current,
                    request_count=1,
                    updated_at=current,
                )
                expired = table.c.window_started_at <= expired_before
                statement = statement.on_conflict_do_update(
                    index_elements=[table.c.policy, table.c.identity_hash],
                    set_={
                        "window_started_at": case((expired, current), else_=table.c.window_started_at),
                        "request_count": case((expired, 1), else_=table.c.request_count + 1),
                        "updated_at": current,
                    },
                    where=or_(expired, table.c.request_count < policy.limit),
                ).returning(table.c.window_started_at)
                result = await limiter_db.execute(statement)
                if result.first() is None:
                    started_at = (await limiter_db.execute(
                        select(table.c.window_started_at).where(
                            table.c.policy == policy.name,
                            table.c.identity_hash == identity_hash,
                        )
                    )).scalar_one()
                    await limiter_db.commit()
                    retry = math.ceil((
                        started_at + timedelta(seconds=policy.window_seconds) - current
                    ).total_seconds())
                    raise _rate_limited(retry)
            await limiter_db.commit()
        await _maybe_cleanup(current)
    except HTTPException:
        raise
    except Exception:
        raise _unavailable()


async def _maybe_cleanup(current: datetime) -> None:
    global _last_cleanup_monotonic
    monotonic = time.monotonic()
    if monotonic - _last_cleanup_monotonic < 3600 or _cleanup_lock.locked():
        return
    async with _cleanup_lock:
        if time.monotonic() - _last_cleanup_monotonic < 3600:
            return
        async with AsyncSessionLocal() as cleanup_db:
            await cleanup_db.execute(delete(AbuseRateLimitBucket).where(
                AbuseRateLimitBucket.updated_at < current - timedelta(days=BUCKET_RETENTION_DAYS)
            ))
            await cleanup_db.commit()
        _last_cleanup_monotonic = time.monotonic()


def request_rules(
    request: Request, *subject_rules: tuple[str, str], ip_policy: str
) -> list[tuple[str, str]]:
    return [(ip_policy, client_ip(request)), *subject_rules]


async def enforce_ip(request: Request, policy: str) -> None:
    await enforce(None, [(policy, client_ip(request))])
