import asyncio
import hashlib
import hmac
import json
import os
from datetime import datetime, timedelta
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


@pytest.mark.parametrize(
    ("captured_amount", "captured_currency", "replacement_amount", "replacement_currency"),
    [
        (2_100_000, "INR", 24_900, "USD"),
        (24_900, "USD", 2_100_000, "INR"),
    ],
)
async def test_superseded_order_capture_uses_immutable_payment_record(
    captured_amount,
    captured_currency,
    replacement_amount,
    replacement_currency,
):
    from app.database import AsyncSessionLocal, engine
    from app.models import (
        AdminAuditEvent,
        Cohort,
        CohortEnrollment,
        PaymentRecord,
        PaymentWebhookEvent,
        User,
    )
    from app.services.cohort_billing import apply_verified_capture

    user_id, cohort_id, enrollment_id = uuid4(), uuid4(), uuid4()
    captured_order_id = f"order_{captured_currency.lower()}_{uuid4().hex}"
    replacement_order_id = f"order_{replacement_currency.lower()}_{uuid4().hex}"
    captured_payment_id = f"pay_{uuid4().hex}"
    replacement_payment_id = f"pay_{uuid4().hex}"
    captured_event_id = f"evt_{uuid4().hex}"
    replacement_event_id = f"evt_{uuid4().hex}"
    now = datetime.utcnow()

    try:
        async with AsyncSessionLocal() as db:
            db.add(User(id=user_id, email=f"superseded-{user_id}@example.test"))
            db.add(Cohort(
                id=cohort_id,
                slug=f"superseded-{cohort_id}",
                title="Superseded checkout cohort",
                starts_at=now + timedelta(days=14),
                ends_at=now + timedelta(days=42),
                capacity=20,
                price_minor=2_100_000,
                currency="INR",
                status="open",
            ))
            await db.flush()
            db.add(CohortEnrollment(
                id=enrollment_id,
                cohort_id=cohort_id,
                user_id=user_id,
                status="pending_payment",
                reservation_expires_at=now + timedelta(minutes=10),
                provider="razorpay",
                provider_order_id=replacement_order_id,
                amount_minor=replacement_amount,
                currency=replacement_currency,
            ))
            db.add_all([
                PaymentRecord(
                    enrollment_id=enrollment_id,
                    provider="razorpay",
                    provider_order_id=captured_order_id,
                    status="superseded",
                    amount_minor=captured_amount,
                    currency=captured_currency,
                ),
                PaymentRecord(
                    enrollment_id=enrollment_id,
                    provider="razorpay",
                    provider_order_id=replacement_order_id,
                    status="created",
                    amount_minor=replacement_amount,
                    currency=replacement_currency,
                ),
            ])
            await db.commit()

            captured_webhook = PaymentWebhookEvent(
                provider_event_id=captured_event_id,
                provider="razorpay",
                event_type="payment.captured",
                payload={},
            )
            db.add(captured_webhook)
            first_result = await apply_verified_capture(
                db,
                webhook=captured_webhook,
                provider="razorpay",
                order_id=captured_order_id,
                payment_id=captured_payment_id,
                amount_minor=captured_amount,
                currency=captured_currency,
            )
            await db.commit()

            assert first_result.outcome == "processed"
            assert first_result.requires_refund is False
            enrollment = await db.get(CohortEnrollment, enrollment_id)
            assert enrollment.status == "paid"
            assert enrollment.provider_order_id == captured_order_id
            assert enrollment.provider_payment_id == captured_payment_id
            assert enrollment.amount_minor == captured_amount
            assert enrollment.currency == captured_currency
            captured_record = await db.scalar(select(PaymentRecord).where(
                PaymentRecord.provider_order_id == captured_order_id
            ))
            replacement_record = await db.scalar(select(PaymentRecord).where(
                PaymentRecord.provider_order_id == replacement_order_id
            ))
            assert captured_record.status == "captured"
            assert replacement_record.status == "superseded"

            replacement_webhook = PaymentWebhookEvent(
                provider_event_id=replacement_event_id,
                provider="razorpay",
                event_type="payment.captured",
                payload={},
            )
            db.add(replacement_webhook)
            second_result = await apply_verified_capture(
                db,
                webhook=replacement_webhook,
                provider="razorpay",
                order_id=replacement_order_id,
                payment_id=replacement_payment_id,
                amount_minor=replacement_amount,
                currency=replacement_currency,
            )
            await db.commit()

            assert second_result.outcome == "duplicate_payment"
            assert second_result.requires_refund is True
            await db.refresh(enrollment)
            await db.refresh(replacement_record)
            assert enrollment.provider_order_id == captured_order_id
            assert enrollment.provider_payment_id == captured_payment_id
            assert replacement_record.status == "duplicate_payment"
            assert replacement_record.provider_payment_id == replacement_payment_id
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(PaymentWebhookEvent).where(
                PaymentWebhookEvent.provider_event_id.in_(
                    (captured_event_id, replacement_event_id)
                )
            ))
            await db.execute(delete(AdminAuditEvent).where(
                AdminAuditEvent.subject_id == str(enrollment_id)
            ))
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_superseded_order_capture_reaches_capacity_refund_path():
    from app.database import AsyncSessionLocal, engine
    from app.models import (
        AdminAuditEvent,
        Cohort,
        CohortEnrollment,
        PaymentRecord,
        PaymentWebhookEvent,
        User,
    )
    from app.services.cohort_billing import apply_verified_capture

    user_id, occupying_user_id = uuid4(), uuid4()
    cohort_id, enrollment_id, occupying_enrollment_id = uuid4(), uuid4(), uuid4()
    stale_order_id = f"order_inr_{uuid4().hex}"
    replacement_order_id = f"order_usd_{uuid4().hex}"
    event_id = f"evt_{uuid4().hex}"
    payment_id = f"pay_{uuid4().hex}"
    now = datetime.utcnow()

    try:
        async with AsyncSessionLocal() as db:
            db.add_all([
                User(id=user_id, email=f"late-{user_id}@example.test"),
                User(id=occupying_user_id, email=f"occupying-{occupying_user_id}@example.test"),
            ])
            db.add(Cohort(
                id=cohort_id,
                slug=f"full-{cohort_id}",
                title="Full checkout cohort",
                starts_at=now + timedelta(days=14),
                ends_at=now + timedelta(days=42),
                capacity=1,
                price_minor=2_100_000,
                currency="INR",
                status="full",
            ))
            await db.flush()
            db.add_all([
                CohortEnrollment(
                    id=enrollment_id,
                    cohort_id=cohort_id,
                    user_id=user_id,
                    status="pending_payment",
                    reservation_expires_at=now - timedelta(minutes=1),
                    provider="razorpay",
                    provider_order_id=replacement_order_id,
                    amount_minor=24_900,
                    currency="USD",
                ),
                CohortEnrollment(
                    id=occupying_enrollment_id,
                    cohort_id=cohort_id,
                    user_id=occupying_user_id,
                    status="paid",
                    provider="razorpay",
                    provider_order_id=f"order_paid_{uuid4().hex}",
                    provider_payment_id=f"pay_paid_{uuid4().hex}",
                    amount_minor=2_100_000,
                    currency="INR",
                    paid_at=now,
                ),
            ])
            db.add_all([
                PaymentRecord(
                    enrollment_id=enrollment_id,
                    provider="razorpay",
                    provider_order_id=stale_order_id,
                    status="superseded",
                    amount_minor=2_100_000,
                    currency="INR",
                ),
                PaymentRecord(
                    enrollment_id=enrollment_id,
                    provider="razorpay",
                    provider_order_id=replacement_order_id,
                    status="created",
                    amount_minor=24_900,
                    currency="USD",
                ),
            ])
            await db.commit()

            webhook = PaymentWebhookEvent(
                provider_event_id=event_id,
                provider="razorpay",
                event_type="payment.captured",
                payload={},
            )
            db.add(webhook)
            result = await apply_verified_capture(
                db,
                webhook=webhook,
                provider="razorpay",
                order_id=stale_order_id,
                payment_id=payment_id,
                amount_minor=2_100_000,
                currency="INR",
            )
            await db.commit()

            assert result.outcome == "capacity_conflict"
            assert result.requires_refund is True
            enrollment = await db.get(CohortEnrollment, enrollment_id)
            payment = await db.scalar(select(PaymentRecord).where(
                PaymentRecord.provider_order_id == stale_order_id
            ))
            assert enrollment.status == "cancelled"
            assert payment.status == "capacity_conflict"
            assert payment.provider_payment_id == payment_id
            assert webhook.status == "capacity_conflict"
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(PaymentWebhookEvent).where(
                PaymentWebhookEvent.provider_event_id == event_id
            ))
            await db.execute(delete(AdminAuditEvent).where(
                AdminAuditEvent.subject_id == str(enrollment_id)
            ))
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id.in_((user_id, occupying_user_id))))
            await db.commit()
        await engine.dispose()


async def test_cohort_capture_claim_is_atomic_and_price_is_authoritative(monkeypatch):
    from app.Routes import cohort_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.services import cohort_welcome_email
    from app.models import (
        Cohort,
        CohortEnrollment,
        CohortWelcomeEmailDelivery,
        PaymentRecord,
        PaymentWebhookEvent,
        User,
    )

    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", "cohort-webhook-secret")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "cohort-checkout-secret")
    monkeypatch.setattr(settings, "RESEND_FROM_EMAIL", "hello@neurocient.com")
    provider_calls = []

    async def send_welcome(payload, *, idempotency_key):
        provider_calls.append((payload, idempotency_key))
        assert payload["from"].startswith("Neurocient <")
        await asyncio.sleep(0.02)
        return "resend-message-id"

    monkeypatch.setattr(cohort_welcome_email, "send_resend_email", send_welcome)
    user_id = uuid4()
    cohort_id = uuid4()
    enrollment_id = uuid4()
    event_id = f"evt_{uuid4().hex}"
    second_event_id = f"evt_{uuid4().hex}"
    order_id = f"order_{uuid4().hex}"
    payment_id = f"pay_{uuid4().hex}"
    now = datetime.utcnow()

    async with AsyncSessionLocal() as db:
        db.add(User(id=user_id, email=f"cohort-{user_id}@example.test"))
        db.add(
            Cohort(
                id=cohort_id,
                slug=f"modern-caveman-{cohort_id}",
                title="Modern Caveman",
                starts_at=now + timedelta(days=14),
                ends_at=now + timedelta(days=42),
                capacity=20,
                price_minor=2_100_000,
                currency="INR",
                status="open",
            )
        )
        await db.flush()
        db.add(
            CohortEnrollment(
                id=enrollment_id,
                cohort_id=cohort_id,
                user_id=user_id,
                status="pending_payment",
                reservation_expires_at=now + timedelta(minutes=10),
                provider_order_id=order_id,
                amount_minor=2_100_000,
                currency="INR",
            )
        )
        db.add(
            PaymentRecord(
                enrollment_id=enrollment_id,
                provider_order_id=order_id,
                status="created",
                amount_minor=2_100_000,
                currency="INR",
            )
        )
        await db.commit()

    payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": payment_id,
                    "order_id": order_id,
                    "amount": 2_100_000,
                    "currency": "INR",
                    "status": "captured",
                }
            }
        },
    }
    body = json.dumps(payload, separators=(",", ":")).encode()
    signature = hmac.new(
        b"cohort-webhook-secret", body, hashlib.sha256
    ).hexdigest()
    headers = {
        "x-razorpay-signature": signature,
        "x-razorpay-event-id": event_id,
        "content-type": "application/json",
    }
    app = FastAPI()
    app.include_router(cohort_routes.router, prefix="/api")
    from app.utils.auth import get_current_user

    async def no_enforce(*_args, **_kwargs):
        return None

    monkeypatch.setattr(cohort_routes, "enforce", no_enforce)
    app.dependency_overrides[get_current_user] = lambda: User(
        id=user_id, email=f"cohort-{user_id}@example.test"
    )

    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as client:
            missing_callback_field = await client.post(
                f"/api/cohorts/{cohort_id}/checkout/verify",
                json={
                    "razorpay_order_id": order_id,
                    "razorpay_payment_id": payment_id,
                },
            )
            invalid_callback = await client.post(
                f"/api/cohorts/{cohort_id}/checkout/verify",
                json={
                    "razorpay_order_id": order_id,
                    "razorpay_payment_id": payment_id,
                    "razorpay_signature": "not-valid",
                },
            )
            checkout_signature = hmac.new(
                b"cohort-checkout-secret",
                f"{order_id}|{payment_id}".encode(),
                hashlib.sha256,
            ).hexdigest()
            verified_callback = await client.post(
                f"/api/cohorts/{cohort_id}/checkout/verify",
                json={
                    "razorpay_order_id": order_id,
                    "razorpay_payment_id": payment_id,
                    "razorpay_signature": checkout_signature,
                },
            )

            assert missing_callback_field.status_code == 400
            assert invalid_callback.status_code == 400
            assert verified_callback.status_code == 200
            assert verified_callback.json() == {"verified": True, "confirmed": False}
            pending_snapshot = await client.get("/api/cohorts/my")
            assert pending_snapshot.status_code == 200
            assert pending_snapshot.json()["enrollments"][0]["payment_confirmation_pending"] is True
            assert provider_calls == []
            async with AsyncSessionLocal() as db:
                pending_enrollment = await db.get(CohortEnrollment, enrollment_id)
                pending_payment = await db.scalar(
                    select(PaymentRecord).where(
                        PaymentRecord.provider_order_id == order_id
                    )
                )
                assert pending_enrollment.status == "pending_payment"
                assert pending_enrollment.provider_payment_id is None
                assert pending_payment.status == "signature_verified"
                assert pending_payment.provider_payment_id == payment_id

            first, second = await asyncio.gather(
                client.post("/api/payments/razorpay/webhook", content=body, headers=headers),
                client.post("/api/payments/razorpay/webhook", content=body, headers=headers),
            )
            different_event = await client.post(
                "/api/payments/razorpay/webhook",
                content=body,
                headers={**headers, "x-razorpay-event-id": second_event_id},
            )
            missing_id = await client.post(
                "/api/payments/razorpay/webhook",
                content=body,
                headers={"x-razorpay-signature": signature},
            )
            confirmed_snapshot = await client.get("/api/cohorts/my")
            assert confirmed_snapshot.status_code == 200
            assert confirmed_snapshot.json()["enrollments"][0]["status"] == "paid"
            assert confirmed_snapshot.json()["enrollments"][0]["payment_confirmation_pending"] is False

        assert first.status_code in (200, 503)
        assert second.status_code in (200, 503)
        assert 200 in (first.status_code, second.status_code)
        assert different_event.status_code == 200
        assert different_event.json() == {"ok": True, "duplicate": True}
        assert missing_id.status_code == 400
        assert {first.json().get("duplicate"), second.json().get("duplicate")} == {
            None,
            True,
        }

        async with AsyncSessionLocal() as db:
            event_count = await db.scalar(
                select(func.count(PaymentWebhookEvent.provider_event_id)).where(
                    PaymentWebhookEvent.provider_event_id == event_id
                )
            )
            enrollment = await db.get(CohortEnrollment, enrollment_id)
            payment = await db.scalar(
                select(PaymentRecord).where(
                    PaymentRecord.provider_order_id == order_id
                )
            )
            welcome_email = await db.get(
                CohortWelcomeEmailDelivery, enrollment_id
            )
            assert event_count == 1
            assert enrollment.status == "paid"
            assert enrollment.provider_payment_id == payment_id
            assert payment.status == "captured"
            assert welcome_email.status == "sent"
            assert welcome_email.attempt_count == 1
            assert welcome_email.provider_message_id == "resend-message-id"
            assert len(provider_calls) == 1
            assert provider_calls[0][1] == f"cohort-welcome/{enrollment_id}"
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(PaymentWebhookEvent).where(
                    PaymentWebhookEvent.provider_event_id.in_(
                        (event_id, second_event_id)
                    )
                )
            )
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_email_failure_preserves_payment_and_duplicate_webhook_retries(monkeypatch):
    from app.Routes import cohort_routes
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import (
        Cohort,
        CohortEnrollment,
        CohortWelcomeEmailDelivery,
        PaymentRecord,
        PaymentWebhookEvent,
        User,
    )
    from app.services import cohort_welcome_email

    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", "cohort-webhook-secret")
    monkeypatch.setattr(settings, "RESEND_FROM_EMAIL", "hello@neurocient.com")
    attempts = 0

    async def send_welcome(_payload, *, idempotency_key):
        nonlocal attempts
        attempts += 1
        assert idempotency_key == f"cohort-welcome/{enrollment_id}"
        if attempts == 1:
            raise cohort_welcome_email.WelcomeEmailDeliveryError(
                "provider_unreachable"
            )
        return "resend-recovered-id"

    monkeypatch.setattr(cohort_welcome_email, "send_resend_email", send_welcome)
    user_id = uuid4()
    cohort_id = uuid4()
    enrollment_id = uuid4()
    event_id = f"evt_{uuid4().hex}"
    order_id = f"order_{uuid4().hex}"
    payment_id = f"pay_{uuid4().hex}"
    now = datetime.utcnow()

    async with AsyncSessionLocal() as db:
        db.add(User(id=user_id, email=f"retry-{user_id}@example.test"))
        db.add(
            Cohort(
                id=cohort_id,
                slug=f"modern-caveman-retry-{cohort_id}",
                title="Modern Caveman Retry Cohort",
                starts_at=now + timedelta(days=14),
                ends_at=now + timedelta(days=42),
                capacity=20,
                price_minor=2_100_000,
                currency="INR",
                status="open",
            )
        )
        await db.flush()
        db.add(
            CohortEnrollment(
                id=enrollment_id,
                cohort_id=cohort_id,
                user_id=user_id,
                status="pending_payment",
                reservation_expires_at=now + timedelta(minutes=10),
                provider_order_id=order_id,
                amount_minor=2_100_000,
                currency="INR",
            )
        )
        db.add(
            PaymentRecord(
                enrollment_id=enrollment_id,
                provider_order_id=order_id,
                status="created",
                amount_minor=2_100_000,
                currency="INR",
            )
        )
        await db.commit()

    payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": payment_id,
                    "order_id": order_id,
                    "amount": 2_100_000,
                    "currency": "INR",
                    "status": "captured",
                }
            }
        },
    }
    body = json.dumps(payload, separators=(",", ":")).encode()
    signature = hmac.new(
        b"cohort-webhook-secret", body, hashlib.sha256
    ).hexdigest()
    headers = {
        "x-razorpay-signature": signature,
        "x-razorpay-event-id": event_id,
        "content-type": "application/json",
    }
    app = FastAPI()
    app.include_router(cohort_routes.router, prefix="/api")

    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as client:
            failed = await client.post(
                "/api/payments/razorpay/webhook", content=body, headers=headers
            )

            assert failed.status_code == 503
            assert failed.json()["detail"]["code"] == "welcome_email_pending"
            async with AsyncSessionLocal() as db:
                enrollment = await db.get(CohortEnrollment, enrollment_id)
                delivery = await db.get(CohortWelcomeEmailDelivery, enrollment_id)
                assert enrollment.status == "paid"
                assert delivery.status == "failed"
                assert delivery.attempt_count == 1
                assert delivery.last_error_code == "provider_unreachable"

            retried = await client.post(
                "/api/payments/razorpay/webhook", content=body, headers=headers
            )

        assert retried.status_code == 200
        assert retried.json() == {"ok": True, "duplicate": True}
        assert attempts == 2
        async with AsyncSessionLocal() as db:
            enrollment = await db.get(CohortEnrollment, enrollment_id)
            delivery = await db.get(CohortWelcomeEmailDelivery, enrollment_id)
            assert enrollment.status == "paid"
            assert delivery.status == "sent"
            assert delivery.attempt_count == 2
            assert delivery.provider_message_id == "resend-recovered-id"
            assert delivery.last_error_code is None
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(PaymentWebhookEvent).where(
                    PaymentWebhookEvent.provider_event_id == event_id
                )
            )
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_welcome_dispatch_intent_survives_ambiguity_and_cancel_suppresses(monkeypatch):
    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import Cohort, CohortEnrollment, CohortWelcomeEmailDelivery, User
    from app.services import cohort_welcome_email

    monkeypatch.setattr(settings, "RESEND_API_KEY", "resend-test-key")
    monkeypatch.setattr(settings, "RESEND_FROM_EMAIL", "hello@neurocient.com")
    user_id, cohort_id, enrollment_id = uuid4(), uuid4(), uuid4()
    now = datetime.utcnow()
    provider_calls = 0

    async def ambiguous_send(payload, *, idempotency_key):
        nonlocal provider_calls
        provider_calls += 1
        assert idempotency_key == f"cohort-welcome/{enrollment_id}"
        async with AsyncSessionLocal() as observer:
            claimed = await observer.get(CohortWelcomeEmailDelivery, enrollment_id)
            assert claimed.status == "dispatching"
            assert claimed.attempt_count == 1
            assert claimed.first_dispatched_at is not None
            assert claimed.last_attempt_at is not None
            assert claimed.payload["from"] == "Neurocient <hello@neurocient.com>"
        raise cohort_welcome_email.WelcomeEmailDeliveryError(
            "provider_outcome_unknown", outcome_unknown=True
        )

    monkeypatch.setattr(cohort_welcome_email, "send_resend_email", ambiguous_send)
    async with AsyncSessionLocal() as db:
        db.add(User(id=user_id, email=f"ambiguous-{user_id}@example.test"))
        db.add(Cohort(
            id=cohort_id, slug=f"ambiguous-{cohort_id}", title="November Cohort",
            starts_at=now + timedelta(days=14), ends_at=now + timedelta(days=42),
            capacity=20, price_minor=2_100_000, currency="INR", status="open",
        ))
        await db.flush()
        db.add(CohortEnrollment(
            id=enrollment_id, cohort_id=cohort_id, user_id=user_id, status="paid",
            amount_minor=2_100_000, currency="INR", paid_at=now,
        ))
        await db.commit()
        await cohort_welcome_email.ensure_welcome_email_delivery(db, enrollment_id)
        await db.commit()
        with pytest.raises(cohort_welcome_email.WelcomeEmailDeliveryError):
            await cohort_welcome_email.deliver_welcome_email(db, enrollment_id)

    async with AsyncSessionLocal() as db:
        delivery = await db.get(CohortWelcomeEmailDelivery, enrollment_id)
        assert delivery.status == "dispatching"
        delivery.first_dispatched_at = now - timedelta(hours=22)
        delivery.last_attempt_at = now - timedelta(minutes=1)
        await db.commit()
        monkeypatch.setattr(settings, "RESEND_API_KEY", None)
        with pytest.raises(cohort_welcome_email.WelcomeEmailDeliveryError):
            await cohort_welcome_email.deliver_welcome_email(db, enrollment_id)
        delivery = await db.get(CohortWelcomeEmailDelivery, enrollment_id)
        assert delivery.status == "dispatching"
        assert delivery.first_dispatched_at == now - timedelta(hours=22)

        monkeypatch.setattr(settings, "RESEND_API_KEY", "resend-test-key")
        delivery.first_dispatched_at = now - timedelta(hours=24)
        delivery.last_attempt_at = now - timedelta(hours=24)
        await db.commit()
        with pytest.raises(cohort_welcome_email.WelcomeEmailDeliveryError) as exc_info:
            await cohort_welcome_email.deliver_welcome_email(db, enrollment_id)
        assert exc_info.value.retryable is False
        assert provider_calls == 1
        delivery = await db.get(CohortWelcomeEmailDelivery, enrollment_id)
        assert delivery.status == "reconciliation_required"

        enrollment = await db.get(CohortEnrollment, enrollment_id)
        enrollment.status = "cancelled"
        delivery.status = "pending"
        delivery.last_attempt_at = None
        await db.commit()
        assert await cohort_welcome_email.deliver_welcome_email(db, enrollment_id) == "suppressed"
        assert provider_calls == 1
        delivery = await db.get(CohortWelcomeEmailDelivery, enrollment_id)
        assert delivery.status == "suppressed"

    async with AsyncSessionLocal() as db:
        await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
        await db.execute(delete(User).where(User.id == user_id))
        await db.commit()
    await engine.dispose()


async def test_stale_welcome_dispatch_claim_cannot_send_after_recovery(monkeypatch):
    from sqlalchemy.ext.asyncio import AsyncSession

    from app.config import settings
    from app.database import AsyncSessionLocal, engine
    from app.models import Cohort, CohortEnrollment, CohortWelcomeEmailDelivery, User
    from app.services import cohort_welcome_email

    monkeypatch.setattr(settings, "RESEND_API_KEY", "resend-test-key")
    monkeypatch.setattr(settings, "RESEND_FROM_EMAIL", "hello@neurocient.com")
    monkeypatch.setattr(cohort_welcome_email, "DISPATCH_LEASE", timedelta(0))

    user_id, cohort_id, enrollment_id = uuid4(), uuid4(), uuid4()
    base_time = datetime.utcnow()
    clock = {"now": base_time}
    first_claim_committed = asyncio.Event()
    resume_first_claim = asyncio.Event()
    provider_calls = 0

    monkeypatch.setattr(
        cohort_welcome_email, "_utc_now_naive", lambda: clock["now"]
    )

    async def send_once(payload, *, idempotency_key):
        nonlocal provider_calls
        provider_calls += 1
        assert idempotency_key == f"cohort-welcome/{enrollment_id}"
        return "resend-recovery-id"

    monkeypatch.setattr(cohort_welcome_email, "send_resend_email", send_once)

    class PausingSession(AsyncSession):
        execute_count = 0

        async def execute(self, *args, **kwargs):
            self.execute_count += 1
            if self.execute_count == 2:
                first_claim_committed.set()
                await resume_first_claim.wait()
            return await super().execute(*args, **kwargs)

    async with AsyncSessionLocal() as db:
        db.add(User(id=user_id, email=f"stale-claim-{user_id}@example.test"))
        db.add(Cohort(
            id=cohort_id, slug=f"stale-claim-{cohort_id}", title="November Cohort",
            starts_at=base_time + timedelta(days=14),
            ends_at=base_time + timedelta(days=42), capacity=20,
            price_minor=2_100_000, currency="INR", status="open",
        ))
        await db.flush()
        db.add(CohortEnrollment(
            id=enrollment_id, cohort_id=cohort_id, user_id=user_id, status="paid",
            amount_minor=2_100_000, currency="INR", paid_at=base_time,
        ))
        await db.commit()
        await cohort_welcome_email.ensure_welcome_email_delivery(db, enrollment_id)
        await db.commit()

    async with PausingSession(bind=engine, expire_on_commit=False) as stale_db:
        stale_task = asyncio.create_task(
            cohort_welcome_email.deliver_welcome_email(stale_db, enrollment_id)
        )
        await asyncio.wait_for(first_claim_committed.wait(), timeout=2)

        clock["now"] = base_time + timedelta(hours=1)
        async with AsyncSessionLocal() as recovery_db:
            assert await cohort_welcome_email.deliver_welcome_email(
                recovery_db, enrollment_id
            ) == "sent"

        clock["now"] = base_time + timedelta(hours=26)
        resume_first_claim.set()
        assert await asyncio.wait_for(stale_task, timeout=2) == "already_sent"

    assert provider_calls == 1
    async with AsyncSessionLocal() as db:
        delivery = await db.get(CohortWelcomeEmailDelivery, enrollment_id)
        assert delivery.status == "sent"
        assert delivery.attempt_count == 2
        assert delivery.provider_message_id == "resend-recovery-id"
        await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
        await db.execute(delete(User).where(User.id == user_id))
        await db.commit()
    await engine.dispose()
