import asyncio
import os
import time
from datetime import timedelta
from uuid import uuid4
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from sqlalchemy import delete, select


pytestmark = [
    pytest.mark.asyncio(loop_scope="session"),
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]


async def test_atomic_limit_persists_across_independent_sessions(monkeypatch):
    from app.config import settings
    from app.database import AsyncSessionLocal
    from app.models import AbuseRateLimitBucket
    from app.services import rate_limits

    policy_name = f"test_{uuid4().hex[:16]}"
    identity = f"actor-{uuid4()}"
    monkeypatch.setattr(settings, "RATE_LIMIT_ENABLED", True)
    monkeypatch.setattr(settings, "RATE_LIMIT_KEY_SECRET", "test-rate-key-that-is-at-least-32-chars")
    monkeypatch.setitem(rate_limits.POLICIES, policy_name, rate_limits.Policy(policy_name, 5, 60))
    latencies_ms: list[float] = []

    async def attempt():
        started = time.perf_counter()
        try:
            await rate_limits.enforce(None, [(policy_name, identity)])
            return "allowed"
        except HTTPException as exc:
            assert exc.status_code == 429
            assert exc.detail["code"] == "rate_limited"
            assert int(exc.headers["Retry-After"]) >= 1
            return "denied"
        finally:
            latencies_ms.append((time.perf_counter() - started) * 1000)

    results = await asyncio.gather(*(attempt() for _ in range(20)))
    assert results.count("allowed") == 5
    assert results.count("denied") == 15
    p95_ms = sorted(latencies_ms)[int(len(latencies_ms) * 0.95) - 1]
    assert p95_ms < 5_000
    print(f"rate-limit probe: requests=20 allowed=5 denied=15 p95_ms={p95_ms:.1f}")

    async with AsyncSessionLocal() as db:
        rows = (await db.execute(select(AbuseRateLimitBucket).where(
            AbuseRateLimitBucket.policy == policy_name
        ))).scalars().all()
        assert len(rows) == 1
        assert rows[0].request_count == 5
        assert len(rows[0].identity_hash) == 64
        assert identity not in rows[0].identity_hash
        next_window = rows[0].window_started_at + timedelta(seconds=61)

    await rate_limits.enforce(None, [(policy_name, identity)], now=next_window)
    async with AsyncSessionLocal() as db:
        row = (await db.execute(select(AbuseRateLimitBucket).where(
            AbuseRateLimitBucket.policy == policy_name
        ))).scalar_one()
        assert row.request_count == 1
        await db.execute(delete(AbuseRateLimitBucket).where(
            AbuseRateLimitBucket.policy == policy_name
        ))
        await db.commit()


async def test_concurrent_weekly_reflection_calls_provider_once(monkeypatch):
    from app.Routes import reflections_routes
    from app.config import settings
    from app.database import AsyncSessionLocal
    from app.models import AbuseRateLimitBucket, IkeaWorksheet, User, WeeklyReflection

    user_id = uuid4()
    provider_calls = 0
    prompts: list[str] = []
    monkeypatch.setattr(settings, "RATE_LIMIT_ENABLED", True)
    monkeypatch.setattr(settings, "RATE_LIMIT_KEY_SECRET", "test-rate-key-that-is-at-least-32-chars")

    class FakeCompletions:
        async def create(self, **kwargs):
            nonlocal provider_calls
            provider_calls += 1
            prompts.append(kwargs["messages"][0]["content"])
            await asyncio.sleep(0.05)
            return SimpleNamespace(choices=[SimpleNamespace(
                message=SimpleNamespace(content="One durable weekly reflection."),
            )])

    class FakeOpenAI:
        def __init__(self, **_kwargs):
            self.chat = SimpleNamespace(completions=FakeCompletions())

    monkeypatch.setattr(reflections_routes.openai, "AsyncOpenAI", FakeOpenAI)
    async with AsyncSessionLocal() as db:
        db.add(User(id=user_id, email=f"reflection-{user_id}@example.test"))
        db.add(IkeaWorksheet(
            user_id=user_id, struggle="test", identity="x" * 20_000,
            knowledge="test", environment={}, tiny_action="y" * 20_000,
        ))
        await db.commit()

    async def generate():
        async with AsyncSessionLocal() as db:
            user = await db.get(User, user_id)
            return await reflections_routes.generate_weekly_reflection(user, db)

    results = await asyncio.gather(generate(), generate(), generate())
    assert provider_calls == 1
    assert len(prompts) == 1
    assert len(prompts[0]) <= 12_012
    assert {result["reflection"] for result in results} == {"One durable weekly reflection."}

    async with AsyncSessionLocal() as db:
        reflections = (await db.execute(select(WeeklyReflection).where(
            WeeklyReflection.user_id == user_id
        ))).scalars().all()
        assert len(reflections) == 1
        await db.execute(delete(WeeklyReflection).where(WeeklyReflection.user_id == user_id))
        await db.execute(delete(IkeaWorksheet).where(IkeaWorksheet.user_id == user_id))
        await db.execute(delete(User).where(User.id == user_id))
        await db.execute(delete(AbuseRateLimitBucket).where(
            AbuseRateLimitBucket.policy.in_(("reflection_user", "reflection_provider"))
        ))
        await db.commit()
