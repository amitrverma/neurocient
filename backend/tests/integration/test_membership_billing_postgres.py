import asyncio
import hashlib
import hmac
import json
import os
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import delete, func, select


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]


def _configure(monkeypatch):
    from app.config import settings
    from app.services import membership_welcome_email

    values = {
        "RAZORPAY_KEY_ID": "rzp_test_membership",
        "RAZORPAY_KEY_SECRET": "provider-secret",
        "RAZORPAY_MEMBERSHIP_PLAN_ID": "plan_member_monthly",
        "RAZORPAY_MEMBERSHIP_AMOUNT_MINOR": 49_900,
        "RAZORPAY_MEMBERSHIP_CURRENCY": "INR",
        "RAZORPAY_MEMBERSHIP_TOTAL_COUNT": 12,
        "RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET": "membership-webhook-secret",
        "RESEND_API_KEY": "re_test_membership",
        "RESEND_FROM_EMAIL": "welcome@example.test",
    }
    for name, value in values.items():
        monkeypatch.setattr(settings, name, value)

    async def send_welcome(payload, *, idempotency_key):
        assert payload["to"]
        assert idempotency_key.startswith("membership-welcome/")
        return f"email_{idempotency_key.rsplit('/', 1)[-1]}"

    monkeypatch.setattr(membership_welcome_email, "send_resend_email", send_welcome)
    return values


async def _no_enforce(*args, **kwargs):
    return None


async def _no_ip():
    return None


@pytest.mark.parametrize("preexisting", [False, True], ids=["new", "existing_failed"])
async def test_concurrent_checkout_creates_one_provider_subscription(monkeypatch, preexisting):
    from app.Routes import membership_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import MembershipBillingEvent, MembershipEntitlement, User
    from app.utils.auth import get_current_user

    config = _configure(monkeypatch)
    user_id = uuid4()
    user = User(id=user_id, email=f"billing-{user_id}@example.test")
    calls = 0

    async def fetch_plan(_plan_id: str):
        return {
            "id": config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
            "period": "monthly",
            "interval": 1,
            "item": {"active": True, "amount": 49_900, "currency": "INR"},
        }

    async def create_subscription(*, user_id: str, operation_id: str, plan_id: str):
        nonlocal calls
        calls += 1
        assert plan_id == config["RAZORPAY_MEMBERSHIP_PLAN_ID"]
        await asyncio.sleep(0.15)
        return {
            "id": "sub_concurrent_once",
            "plan_id": config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
            "status": "created",
        }

    monkeypatch.setattr(membership_routes, "fetch_membership_plan", fetch_plan)
    monkeypatch.setattr(membership_routes, "create_membership_subscription", create_subscription)
    monkeypatch.setattr(membership_routes, "enforce", _no_enforce)

    app = FastAPI()
    app.include_router(membership_routes.router, prefix="/api")
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[membership_routes.enforce_membership_checkout_ip] = _no_ip
    transport = httpx.ASGITransport(app=app)

    async with AsyncSessionLocal() as session:
        session.add(user)
        await session.flush()
        if preexisting:
            session.add(
                MembershipEntitlement(
                    user_id=user_id,
                    status="inactive",
                    checkout_state="failed",
                    price_minor=49_900,
                    currency="INR",
                )
            )
        await session.commit()

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            responses = await asyncio.gather(
                client.post("/api/membership/checkout"),
                client.post("/api/membership/checkout"),
            )
            resumed = await client.post("/api/membership/checkout")
        assert sorted(response.status_code for response in responses) == [200, 409]
        assert resumed.status_code == 200
        assert resumed.json()["subscription_id"] == "sub_concurrent_once"
        assert calls == 1
        conflict = next(response for response in responses if response.status_code == 409)
        assert conflict.json()["detail"]["code"] == "reconciliation_required"

        async with AsyncSessionLocal() as session:
            entitlement = await session.get(MembershipEntitlement, user_id)
            assert entitlement.checkout_state == "ready"
            assert entitlement.provider_subscription_id == "sub_concurrent_once"
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(delete(MembershipBillingEvent).where(MembershipBillingEvent.user_id == user_id))
            await session.execute(delete(MembershipEntitlement).where(MembershipEntitlement.user_id == user_id))
            await session.execute(delete(User).where(User.id == user_id))
            await session.commit()
        await engine.dispose()


async def test_webhook_replay_is_atomic_and_browser_callback_is_not_authority(monkeypatch):
    from app.Routes import membership_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import (
        MembershipBillingEvent,
        MembershipEntitlement,
        MembershipWelcomeEmailDelivery,
        User,
    )

    config = _configure(monkeypatch)
    user_id = uuid4()
    subscription_id = f"sub_{uuid4().hex}"
    event_id = f"evt_{uuid4().hex}"
    now = datetime.now(UTC)
    payload = {
        "event": "subscription.charged",
        "created_at": int(now.timestamp()),
        "payload": {
            "subscription": {
                "entity": {
                    "id": subscription_id,
                    "plan_id": config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
                    "status": "active",
                    "customer_id": "cust_replay",
                    "current_end": int((now + timedelta(days=30)).timestamp()),
                }
            },
            "payment": {
                "entity": {
                    "id": f"pay_{uuid4().hex}",
                    "customer_id": "cust_replay",
                    "amount": 49_900,
                    "currency": "INR",
                    "status": "captured",
                }
            },
        },
    }
    body = json.dumps(payload, separators=(",", ":")).encode()
    signature = hmac.new(
        config["RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET"].encode(), body, hashlib.sha256
    ).hexdigest()

    async with AsyncSessionLocal() as session:
        session.add(User(id=user_id, email=f"webhook-{user_id}@example.test"))
        session.add(
            MembershipEntitlement(
                user_id=user_id,
                status="inactive",
                provider="razorpay",
                provider_plan_id=config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
                provider_subscription_id=subscription_id,
                checkout_state="ready",
                price_minor=49_900,
                currency="INR",
            )
        )
        await session.commit()

    app = FastAPI()
    app.include_router(membership_routes.router, prefix="/api")
    transport = httpx.ASGITransport(app=app)
    headers = {
        "content-type": "application/json",
        "x-razorpay-signature": signature,
        "x-razorpay-event-id": event_id,
    }
    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            responses = await asyncio.gather(
                client.post("/api/membership/razorpay/webhook", content=body, headers=headers),
                client.post("/api/membership/razorpay/webhook", content=body, headers=headers),
            )
            replay = await client.post(
                "/api/membership/razorpay/webhook", content=body, headers=headers
            )
        assert all(response.status_code == 200 for response in responses)
        assert replay.json() == {"ok": True, "duplicate": True}

        async with AsyncSessionLocal() as session:
            count = await session.scalar(
                select(func.count(MembershipBillingEvent.provider_event_id)).where(
                    MembershipBillingEvent.provider_event_id == event_id
                )
            )
            entitlement = await session.get(MembershipEntitlement, user_id)
            delivery = await session.get(MembershipWelcomeEmailDelivery, user_id)
            assert count == 1
            assert entitlement.status == "active"
            assert entitlement.current_period_end > datetime.utcnow()
            assert delivery.status == "sent"
            assert delivery.attempt_count == 1
            assert delivery.provider_message_id == f"email_{user_id}"
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(delete(MembershipBillingEvent).where(MembershipBillingEvent.provider_event_id == event_id))
            await session.execute(delete(MembershipEntitlement).where(MembershipEntitlement.user_id == user_id))
            await session.execute(delete(User).where(User.id == user_id))
            await session.commit()
        await engine.dispose()


async def test_unknown_provider_outcome_blocks_automatic_duplicate(monkeypatch):
    from app.Routes import membership_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import MembershipEntitlement, User
    from app.services.membership_razorpay import ProviderOutcomeUnknown
    from app.utils.auth import get_current_user

    config = _configure(monkeypatch)
    user_id = uuid4()
    user = User(id=user_id, email=f"unknown-{user_id}@example.test")
    calls = 0

    async def fetch_plan(_plan_id: str):
        return {
            "id": config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
            "period": "monthly",
            "interval": 1,
            "item": {"active": True, "amount": 49_900, "currency": "INR"},
        }

    async def uncertain_create(**kwargs):
        nonlocal calls
        calls += 1
        raise ProviderOutcomeUnknown("connection ended after send")

    monkeypatch.setattr(membership_routes, "fetch_membership_plan", fetch_plan)
    monkeypatch.setattr(membership_routes, "create_membership_subscription", uncertain_create)
    monkeypatch.setattr(membership_routes, "enforce", _no_enforce)
    app = FastAPI()
    app.include_router(membership_routes.router, prefix="/api")
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[membership_routes.enforce_membership_checkout_ip] = _no_ip

    async with AsyncSessionLocal() as session:
        session.add(user)
        await session.commit()
    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as client:
            first = await client.post("/api/membership/checkout")
            second = await client.post("/api/membership/checkout")
        assert first.status_code == 502
        assert first.json()["detail"]["code"] == "reconciliation_required"
        assert second.status_code == 409
        assert second.json()["detail"]["code"] == "reconciliation_required"
        assert calls == 1
        async with AsyncSessionLocal() as session:
            entitlement = await session.get(MembershipEntitlement, user_id)
            assert entitlement.checkout_state == "unknown"
            assert entitlement.provider_subscription_id is None
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(delete(MembershipEntitlement).where(MembershipEntitlement.user_id == user_id))
            await session.execute(delete(User).where(User.id == user_id))
            await session.commit()
        await engine.dispose()


async def test_failed_webhook_transaction_can_be_retried(monkeypatch):
    from app.Routes import membership_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import MembershipBillingEvent, MembershipEntitlement, User

    config = _configure(monkeypatch)
    user_id = uuid4()
    subscription_id = f"sub_{uuid4().hex}"
    event_id = f"evt_{uuid4().hex}"
    now = datetime.now(UTC)
    payload = {
        "event": "subscription.activated",
        "created_at": int(now.timestamp()),
        "payload": {"subscription": {"entity": {
            "id": subscription_id,
            "plan_id": config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
            "customer_id": "cust_retry",
            "current_end": int((now + timedelta(days=30)).timestamp()),
        }}},
    }
    body = json.dumps(payload, separators=(",", ":")).encode()
    signature = hmac.new(
        config["RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET"].encode(), body, hashlib.sha256
    ).hexdigest()
    headers = {
        "content-type": "application/json",
        "x-razorpay-signature": signature,
        "x-razorpay-event-id": event_id,
    }
    async with AsyncSessionLocal() as session:
        session.add(User(id=user_id, email=f"retry-{user_id}@example.test"))
        session.add(MembershipEntitlement(
            user_id=user_id,
            status="inactive",
            provider="razorpay",
            provider_plan_id=config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
            provider_subscription_id=subscription_id,
            price_minor=49_900,
            currency="INR",
        ))
        await session.commit()

    original_apply = membership_routes._apply_event
    monkeypatch.setattr(
        membership_routes,
        "_apply_event",
        lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("forced rollback")),
    )
    app = FastAPI()
    app.include_router(membership_routes.router, prefix="/api")
    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app, raise_app_exceptions=False),
            base_url="http://test",
        ) as client:
            failed = await client.post("/api/membership/razorpay/webhook", content=body, headers=headers)
            assert failed.status_code == 500
            monkeypatch.setattr(membership_routes, "_apply_event", original_apply)
            retried = await client.post("/api/membership/razorpay/webhook", content=body, headers=headers)
        assert retried.status_code == 200
        assert retried.json()["outcome"] == "applied"
        async with AsyncSessionLocal() as session:
            event = await session.get(MembershipBillingEvent, event_id)
            entitlement = await session.get(MembershipEntitlement, user_id)
            assert event.status == "applied"
            assert entitlement.status == "active"
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(delete(MembershipBillingEvent).where(MembershipBillingEvent.provider_event_id == event_id))
            await session.execute(delete(MembershipEntitlement).where(MembershipEntitlement.user_id == user_id))
            await session.execute(delete(User).where(User.id == user_id))
            await session.commit()
        await engine.dispose()


async def test_webhook_can_recover_the_pre_persisted_checkout_operation(monkeypatch):
    from app.Routes import membership_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import MembershipBillingEvent, MembershipEntitlement, User

    config = _configure(monkeypatch)
    user_id, operation_id = uuid4(), uuid4()
    subscription_id = f"sub_{uuid4().hex}"
    event_id = f"evt_{uuid4().hex}"
    mismatch_event_id = f"evt_{uuid4().hex}"
    now = datetime.now(UTC)
    payload = {
        "event": "subscription.activated",
        "created_at": int(now.timestamp()),
        "payload": {"subscription": {"entity": {
            "id": subscription_id,
            "plan_id": config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
            "customer_id": "cust_early",
            "current_end": int((now + timedelta(days=30)).timestamp()),
            "notes": {"user_id": str(user_id), "operation_id": str(operation_id)},
        }}},
    }
    body = json.dumps(payload, separators=(",", ":")).encode()
    signature = hmac.new(
        config["RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET"].encode(), body, hashlib.sha256
    ).hexdigest()
    mismatch_payload = json.loads(json.dumps(payload))
    mismatch_payload["created_at"] += 1
    mismatch_payload["payload"]["subscription"]["entity"]["customer_id"] = "cust_wrong"
    mismatch_body = json.dumps(mismatch_payload, separators=(",", ":")).encode()
    mismatch_signature = hmac.new(
        config["RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET"].encode(), mismatch_body, hashlib.sha256
    ).hexdigest()
    async with AsyncSessionLocal() as session:
        session.add(User(id=user_id, email=f"early-{user_id}@example.test"))
        session.add(MembershipEntitlement(
            user_id=user_id,
            status="inactive",
            provider="razorpay",
            provider_plan_id=config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
            checkout_operation_id=operation_id,
            checkout_state="creating",
            price_minor=49_900,
            currency="INR",
        ))
        await session.commit()
    app = FastAPI()
    app.include_router(membership_routes.router, prefix="/api")
    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as client:
            result = await client.post(
                "/api/membership/razorpay/webhook",
                content=body,
                headers={
                    "content-type": "application/json",
                    "x-razorpay-signature": signature,
                    "x-razorpay-event-id": event_id,
                },
            )
            mismatch_result = await client.post(
                "/api/membership/razorpay/webhook",
                content=mismatch_body,
                headers={
                    "content-type": "application/json",
                    "x-razorpay-signature": mismatch_signature,
                    "x-razorpay-event-id": mismatch_event_id,
                },
            )
        assert result.status_code == 200
        assert result.json() == {"ok": True}
        assert mismatch_result.status_code == 200
        async with AsyncSessionLocal() as session:
            entitlement = await session.get(MembershipEntitlement, user_id)
            event = await session.get(MembershipBillingEvent, event_id)
            mismatch_event = await session.get(MembershipBillingEvent, mismatch_event_id)
            assert entitlement.provider_subscription_id is None
            assert event.status == "unmatched"
            assert mismatch_event.status == "unmatched"
            entitlement.provider_subscription_id = subscription_id
            entitlement.checkout_state = "ready"
            await membership_routes._replay_unmatched(session, entitlement)
            await session.commit()
        async with AsyncSessionLocal() as session:
            entitlement = await session.get(MembershipEntitlement, user_id)
            assert entitlement.provider_subscription_id == subscription_id
            assert entitlement.checkout_state == "ready"
            assert entitlement.status == "active"
            assert entitlement.provider_customer_id == "cust_early"
            mismatch_event = await session.get(MembershipBillingEvent, mismatch_event_id)
            assert mismatch_event.status == "rejected"
            assert mismatch_event.reason_code == "customer_mismatch"
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(delete(MembershipBillingEvent).where(MembershipBillingEvent.provider_event_id.in_([event_id, mismatch_event_id])))
            await session.execute(delete(MembershipEntitlement).where(MembershipEntitlement.user_id == user_id))
            await session.execute(delete(User).where(User.id == user_id))
            await session.commit()
        await engine.dispose()


async def test_webhook_rejects_cross_object_and_customer_mismatches(monkeypatch):
    from app.Routes import membership_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import MembershipBillingEvent, MembershipEntitlement, User

    config = _configure(monkeypatch)
    user_id = uuid4()
    subscription_id = f"sub_{uuid4().hex}"
    event_ids = [f"evt_{uuid4().hex}" for _ in range(7)]
    now = datetime.now(UTC)

    def signed(payload: dict, event_id: str):
        body = json.dumps(payload, separators=(",", ":")).encode()
        signature = hmac.new(
            config["RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET"].encode(), body, hashlib.sha256
        ).hexdigest()
        return body, {
            "content-type": "application/json",
            "x-razorpay-signature": signature,
            "x-razorpay-event-id": event_id,
        }

    base_subscription = {
        "id": subscription_id,
        "plan_id": config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
        "customer_id": "cust_expected",
        "current_end": int((now + timedelta(days=30)).timestamp()),
    }
    relationship_payload = {
        "event": "subscription.charged",
        "created_at": int(now.timestamp()),
        "payload": {
            "subscription": {"entity": base_subscription},
            "payment": {"entity": {
                "id": "pay_relationship",
                "subscription_id": "sub_different",
                "customer_id": "cust_expected",
                "amount": 49_900,
                "currency": "INR",
            }},
        },
    }
    missing_customer_payload = {
        "event": "subscription.activated",
        "created_at": int((now + timedelta(seconds=1)).timestamp()),
        "payload": {"subscription": {"entity": {
            **base_subscription,
            "customer_id": None,
        }}},
    }
    wrong_customer_payload = {
        "event": "subscription.activated",
        "created_at": int((now + timedelta(seconds=2)).timestamp()),
        "payload": {"subscription": {"entity": {
            **base_subscription,
            "customer_id": "cust_wrong",
        }}},
    }
    valid_payment = {
        "id": "pay_validation",
        "customer_id": "cust_expected",
        "amount": 49_900,
        "currency": "INR",
        "status": "captured",
    }
    missing_payment_id_payload = {
        "event": "subscription.charged",
        "created_at": int((now + timedelta(seconds=3)).timestamp()),
        "payload": {
            "subscription": {"entity": base_subscription},
            "payment": {"entity": {**valid_payment, "id": None}},
        },
    }
    failed_payment_payload = {
        "event": "subscription.charged",
        "created_at": int((now + timedelta(seconds=4)).timestamp()),
        "payload": {
            "subscription": {"entity": base_subscription},
            "payment": {"entity": {**valid_payment, "status": "failed"}},
        },
    }

    async with AsyncSessionLocal() as session:
        session.add(User(id=user_id, email=f"ownership-{user_id}@example.test"))
        session.add(MembershipEntitlement(
            user_id=user_id,
            status="inactive",
            provider="razorpay",
            provider_plan_id=config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
            provider_subscription_id=subscription_id,
            provider_customer_id="cust_expected",
            price_minor=49_900,
            currency="INR",
        ))
        await session.commit()

    app = FastAPI()
    app.include_router(membership_routes.router, prefix="/api")
    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as client:
            body, headers = signed(relationship_payload, event_ids[0])
            relationship = await client.post("/api/membership/razorpay/webhook", content=body, headers=headers)
            body, headers = signed(missing_customer_payload, event_ids[1])
            missing_customer = await client.post("/api/membership/razorpay/webhook", content=body, headers=headers)
            body, headers = signed(wrong_customer_payload, event_ids[2])
            wrong_customer = await client.post("/api/membership/razorpay/webhook", content=body, headers=headers)
            body, headers = signed(missing_payment_id_payload, event_ids[3])
            missing_payment_id = await client.post(
                "/api/membership/razorpay/webhook", content=body, headers=headers
            )
            body, headers = signed(failed_payment_payload, event_ids[4])
            failed_payment = await client.post(
                "/api/membership/razorpay/webhook", content=body, headers=headers
            )
            body, headers = signed([], event_ids[5])
            malformed_shape = await client.post(
                "/api/membership/razorpay/webhook", content=body, headers=headers
            )
            invalid_utf8 = b"\xff"
            invalid_utf8_signature = hmac.new(
                config["RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET"].encode(),
                invalid_utf8,
                hashlib.sha256,
            ).hexdigest()
            malformed_encoding = await client.post(
                "/api/membership/razorpay/webhook",
                content=invalid_utf8,
                headers={
                    "content-type": "application/json",
                    "x-razorpay-signature": invalid_utf8_signature,
                    "x-razorpay-event-id": event_ids[6],
                },
            )

        assert relationship.status_code == 409
        assert relationship.json()["detail"]["code"] == "subscription_mismatch"
        assert missing_customer.status_code == 400
        assert missing_customer.json()["detail"]["code"] == "customer_missing"
        assert wrong_customer.status_code == 409
        assert wrong_customer.json()["detail"]["code"] == "customer_mismatch"
        assert missing_payment_id.status_code == 400
        assert missing_payment_id.json()["detail"]["code"] == "invalid_provider_data"
        assert failed_payment.status_code == 400
        assert failed_payment.json()["detail"]["code"] == "invalid_provider_data"
        assert malformed_shape.status_code == 400
        assert malformed_encoding.status_code == 400
        async with AsyncSessionLocal() as session:
            entitlement = await session.get(MembershipEntitlement, user_id)
            assert entitlement.status == "inactive"
            reasons = (await session.execute(
                select(MembershipBillingEvent.reason_code)
                .where(MembershipBillingEvent.provider_event_id.in_(event_ids))
                .order_by(MembershipBillingEvent.provider_event_id)
            )).scalars().all()
            assert sorted(reasons) == sorted([
                "subscription_mismatch",
                "customer_missing",
                "customer_mismatch",
                "invalid_provider_data",
                "invalid_provider_data",
            ])
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(delete(MembershipBillingEvent).where(MembershipBillingEvent.provider_event_id.in_(event_ids)))
            await session.execute(delete(MembershipEntitlement).where(MembershipEntitlement.user_id == user_id))
            await session.execute(delete(User).where(User.id == user_id))
            await session.commit()
        await engine.dispose()


async def test_provider_shaped_early_refund_is_replayed_after_charge(monkeypatch):
    from app.Routes import membership_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import MembershipBillingEvent, MembershipEntitlement, User

    config = _configure(monkeypatch)
    user_id = uuid4()
    subscription_id = f"sub_{uuid4().hex}"
    payment_id = f"pay_{uuid4().hex}"
    now = datetime.now(UTC)

    async with AsyncSessionLocal() as session:
        session.add(User(id=user_id, email=f"shape-{user_id}@example.test"))
        await session.flush()
        session.add(
            MembershipEntitlement(
                user_id=user_id,
                status="authenticated",
                provider="razorpay",
                provider_plan_id=config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
                provider_subscription_id=subscription_id,
                provider_customer_id="cust_shape",
                checkout_state="ready",
                price_minor=49_900,
                currency="INR",
            )
        )
        await session.commit()

    def signed(event_id: str, payload: dict):
        body = json.dumps(payload, separators=(",", ":")).encode()
        signature = hmac.new(
            config["RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET"].encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        return body, {
            "x-razorpay-signature": signature,
            "x-razorpay-event-id": event_id,
        }

    refund_id = f"evt_{uuid4().hex}"
    charged_id = f"evt_{uuid4().hex}"
    refund_body, refund_headers = signed(
        refund_id,
        {
            "event": "payment.refunded",
            "created_at": int((now + timedelta(seconds=1)).timestamp()),
            "payload": {"payment": {"entity": {
                "id": payment_id,
                "customer_id": "cust_shape",
                "amount": 49_900,
                "currency": "INR",
                "status": "refunded",
            }}},
        },
    )
    charged_body, charged_headers = signed(
        charged_id,
        {
            "event": "subscription.charged",
            "created_at": int(now.timestamp()),
            "payload": {
                "subscription": {"entity": {
                    "id": subscription_id,
                    "plan_id": config["RAZORPAY_MEMBERSHIP_PLAN_ID"],
                    "customer_id": "cust_shape",
                    "status": "active",
                    "current_end": int((now + timedelta(days=30)).timestamp()),
                }},
                "payment": {"entity": {
                    "id": payment_id,
                    "customer_id": "cust_shape",
                    "amount": 49_900,
                    "currency": "INR",
                    "status": "captured",
                    "invoice_id": f"inv_{uuid4().hex}",
                }},
            },
        },
    )
    app = FastAPI()
    app.include_router(membership_routes.router, prefix="/api")

    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as client:
            refund = await client.post(
                "/api/membership/razorpay/webhook",
                content=refund_body,
                headers=refund_headers,
            )
            charged = await client.post(
                "/api/membership/razorpay/webhook",
                content=charged_body,
                headers=charged_headers,
            )
        assert refund.status_code == 200
        assert charged.status_code == 200
        async with AsyncSessionLocal() as session:
            entitlement = await session.get(MembershipEntitlement, user_id)
            refund_event = await session.get(MembershipBillingEvent, refund_id)
            assert entitlement.status == "refunded"
            assert entitlement.provider_payment_id == payment_id
            assert refund_event.status == "applied"
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(delete(MembershipBillingEvent).where(MembershipBillingEvent.user_id == user_id))
            await session.execute(delete(MembershipBillingEvent).where(MembershipBillingEvent.provider_event_id.in_([refund_id, charged_id])))
            await session.execute(delete(MembershipEntitlement).where(MembershipEntitlement.user_id == user_id))
            await session.execute(delete(User).where(User.id == user_id))
            await session.commit()
        await engine.dispose()
