import os
import time
from datetime import datetime, timedelta
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import delete


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]


async def _no_enforce(*args, **kwargs):
    return None


async def _no_ip():
    return None


async def test_cancellation_is_period_end_intent_and_webhook_remains_authority(monkeypatch):
    from app.Routes import membership_cancellation_routes, membership_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import MembershipBillingEvent, MembershipEntitlement, User
    from app.utils.auth import get_current_user

    user_id = uuid4()
    user = User(id=user_id, email=f"cancel-{user_id}@example.test")
    calls = 0

    async def cancel_provider(subscription_id):
        nonlocal calls
        calls += 1
        return {
            "id": subscription_id,
            "status": "active",
            "has_scheduled_changes": False,
            "change_scheduled_at": None,
        }

    monkeypatch.setattr(
        membership_cancellation_routes,
        "cancel_membership_subscription_at_period_end",
        cancel_provider,
    )
    monkeypatch.setattr(membership_cancellation_routes, "enforce", _no_enforce)
    monkeypatch.setattr(membership_routes, "verify_membership_webhook", lambda *_: True)
    monkeypatch.setattr(
        membership_routes.settings,
        "RAZORPAY_MEMBERSHIP_PLAN_ID",
        "plan_monthly",
    )
    monkeypatch.setattr(
        membership_routes.settings,
        "RAZORPAY_MEMBERSHIP_AMOUNT_MINOR",
        49_900,
    )
    monkeypatch.setattr(
        membership_routes.settings,
        "RAZORPAY_MEMBERSHIP_CURRENCY",
        "INR",
    )

    app = FastAPI()
    app.include_router(membership_cancellation_routes.router, prefix="/api")
    app.include_router(membership_routes.router, prefix="/api")
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[
        membership_cancellation_routes.enforce_membership_cancellation_ip
    ] = _no_ip
    transport = httpx.ASGITransport(app=app)

    async with AsyncSessionLocal() as db:
        db.add(user)
        db.add(
            MembershipEntitlement(
                user_id=user_id,
                status="active",
                provider="razorpay",
                provider_subscription_id=f"sub_{user_id.hex}",
                provider_plan_id="plan_monthly",
                price_minor=49_900,
                currency="INR",
                current_period_end=datetime.utcnow() + timedelta(days=20),
            )
        )
        await db.commit()

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            first = await client.post("/api/membership/cancel")
            repeated = await client.post("/api/membership/cancel")

        assert first.status_code == 202
        assert first.json()["status"] == "requested"
        assert repeated.status_code == 202
        assert calls == 1
        async with AsyncSessionLocal() as db:
            entitlement = await db.get(MembershipEntitlement, user_id)
            assert entitlement.status == "active"
            assert entitlement.cancellation_state == "requested"
            assert entitlement.cancellation_requested_at is not None

        payload = {
            "event": "subscription.cancelled",
            "created_at": int(time.time()),
            "payload": {
                "subscription": {
                    "entity": {
                        "id": f"sub_{user_id.hex}",
                        "customer_id": "cust_cancel_test",
                        "plan_id": "plan_monthly",
                        "current_end": int(time.time()) + 20 * 24 * 60 * 60,
                    }
                }
            },
        }
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            webhook = await client.post(
                "/api/membership/razorpay/webhook",
                headers={
                    "x-razorpay-signature": "valid-test-signature",
                    "x-razorpay-event-id": f"event_{user_id.hex}",
                },
                json=payload,
            )
        assert webhook.status_code == 200
        async with AsyncSessionLocal() as db:
            entitlement = await db.get(MembershipEntitlement, user_id)
            assert entitlement.status == "canceled"
            assert entitlement.cancellation_state == "completed"
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(MembershipBillingEvent).where(
                    MembershipBillingEvent.provider_event_id == f"event_{user_id.hex}"
                )
            )
            await db.execute(
                delete(MembershipEntitlement).where(
                    MembershipEntitlement.user_id == user_id
                )
            )
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()
