import os
from datetime import datetime, timedelta
from uuid import uuid4

import pytest
from fastapi import HTTPException
from sqlalchemy import delete, func, select


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]


async def test_waitlist_offer_reserves_one_seat_and_is_account_bound(monkeypatch):
    from app.Routes import cohort_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import Cohort, CohortEnrollment, CohortWaitlistEntry, PaymentWebhookEvent, User
    from app.services.cohort_billing import apply_verified_capture
    from app.services.cohorts import occupied_seats

    cohort_id = uuid4()
    offered_user_id = uuid4()
    other_user_id = uuid4()
    now = datetime.utcnow()
    event_id = f"evt_{uuid4().hex}"
    provider_calls = []

    async def no_enforce(*_args, **_kwargs):
        return None

    async def create_order(**kwargs):
        provider_calls.append(kwargs)
        return {"id": f"order_{uuid4().hex}"}

    monkeypatch.setattr(cohort_routes, "enforce", no_enforce)
    monkeypatch.setattr(cohort_routes, "razorpay_ready", lambda: True)
    monkeypatch.setattr(cohort_routes, "create_order", create_order)

    try:
        async with AsyncSessionLocal() as db:
            offered_user = User(id=offered_user_id, email=f"offered-{offered_user_id}@example.test")
            other_user = User(id=other_user_id, email=f"other-{other_user_id}@example.test")
            db.add_all([offered_user, other_user])
            db.add(Cohort(
                id=cohort_id,
                slug=f"waitlist-bound-{cohort_id}",
                title="Waitlist account binding",
                starts_at=now + timedelta(days=14),
                ends_at=now + timedelta(days=42),
                capacity=1,
                price_minor=2_100_000,
                currency="INR",
                status="full",
            ))
            await db.flush()
            db.add(CohortWaitlistEntry(
                cohort_id=cohort_id,
                user_id=offered_user_id,
                status="offered",
                offered_at=now,
                offer_expires_at=now + timedelta(hours=24),
                offer_email_status="sent",
                offer_email_sent_at=now,
            ))
            await db.commit()

            assert await occupied_seats(db, cohort_id) == 1

            with pytest.raises(HTTPException) as denied:
                await cohort_routes.begin_checkout(
                    cohort_id,
                    other_user,
                    db,
                    cohort_routes.CohortCheckoutInput(offer_id="inr"),
                )
            assert denied.value.status_code == 409
            assert provider_calls == []

            checkout = await cohort_routes.begin_checkout(
                cohort_id,
                offered_user,
                db,
                cohort_routes.CohortCheckoutInput(offer_id="inr"),
            )
            assert checkout["order_id"].startswith("order_")
            assert len(provider_calls) == 1
            enrollment = await db.scalar(
                select(CohortEnrollment).where(
                    CohortEnrollment.cohort_id == cohort_id,
                    CohortEnrollment.user_id == offered_user_id,
                )
            )
            waitlist_entry = await db.scalar(
                select(CohortWaitlistEntry).where(
                    CohortWaitlistEntry.cohort_id == cohort_id,
                    CohortWaitlistEntry.user_id == offered_user_id,
                )
            )
            assert enrollment.status == "pending_payment"
            assert waitlist_entry.status == "checkout_started"
            assert await occupied_seats(db, cohort_id) == 1
            enrollment.reservation_expires_at = now - timedelta(minutes=1)
            await db.commit()

            webhook = PaymentWebhookEvent(
                provider_event_id=event_id,
                provider="razorpay",
                event_type="payment.captured",
                payload={},
            )
            db.add(webhook)
            captured = await apply_verified_capture(
                db,
                webhook=webhook,
                provider="razorpay",
                order_id=checkout["order_id"],
                payment_id=f"pay_{uuid4().hex}",
                amount_minor=2_100_000,
                currency="INR",
            )
            await db.commit()
            assert captured.outcome == "processed"
            await db.refresh(waitlist_entry)
            assert waitlist_entry.status == "enrolled"
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(PaymentWebhookEvent).where(
                PaymentWebhookEvent.provider_event_id == event_id
            ))
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id.in_((offered_user_id, other_user_id))))
            await db.commit()
        await engine.dispose()


async def test_multiple_free_seats_offer_distinct_waiters_in_fifo_order(monkeypatch):
    from app.database import AsyncSessionLocal, engine
    from app.models import Cohort, CohortWaitlistEntry, User
    from app.services import waitlist_offers
    from app.services.waitlist_offers import offer_next_waitlisted_user

    cohort_id = uuid4()
    first_user_id = uuid4()
    second_user_id = uuid4()
    now = datetime.utcnow()
    sent = []

    async def send_email(payload, *, idempotency_key):
        sent.append((payload, idempotency_key))
        return f"email-{len(sent)}"

    monkeypatch.setattr(waitlist_offers, "send_resend_email", send_email)
    try:
        async with AsyncSessionLocal() as db:
            db.add_all([
                User(id=first_user_id, email=f"first-{first_user_id}@example.test"),
                User(id=second_user_id, email=f"second-{second_user_id}@example.test"),
                Cohort(
                    id=cohort_id,
                    slug=f"waitlist-order-{cohort_id}",
                    title="Waitlist order",
                    starts_at=now + timedelta(days=14),
                    ends_at=now + timedelta(days=42),
                    capacity=2,
                    price_minor=2_100_000,
                    currency="INR",
                    status="open",
                ),
            ])
            await db.flush()
            first = CohortWaitlistEntry(
                cohort_id=cohort_id,
                user_id=first_user_id,
                status="waiting",
                created_at=now - timedelta(minutes=2),
            )
            second = CohortWaitlistEntry(
                cohort_id=cohort_id,
                user_id=second_user_id,
                status="waiting",
                created_at=now - timedelta(minutes=1),
            )
            db.add_all([first, second])
            await db.commit()

            offered = await offer_next_waitlisted_user(db, cohort_id, now=now)
            assert offered.outcome == "offered"
            assert offered.entry_id == first.id
            second_offer = await offer_next_waitlisted_user(db, cohort_id, now=now)
            assert second_offer.outcome == "offered"
            assert second_offer.entry_id == second.id
            blocked = await offer_next_waitlisted_user(db, cohort_id, now=now)
            assert blocked.outcome == "no_free_seat"
            await db.refresh(first)
            await db.refresh(second)
            assert first.status == "offered"
            assert second.status == "offered"
            assert await waitlist_offers.deliver_waitlist_offer_email(db, first.id) == "sent"
            assert await waitlist_offers.deliver_waitlist_offer_email(db, second.id) == "sent"
            await db.refresh(first)
            await db.refresh(second)
            assert first.offer_email_status == "sent"
            assert second.offer_email_status == "sent"
            assert first.offer_expires_at > now + timedelta(hours=23, minutes=59)
            assert second.offer_expires_at > now + timedelta(hours=23, minutes=59)
            assert len({key for _, key in sent}) == 2
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id.in_((first_user_id, second_user_id))))
            await db.commit()
        await engine.dispose()


async def test_public_checkout_cannot_bypass_an_existing_waiter(monkeypatch):
    from app.Routes import cohort_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import Cohort, CohortWaitlistEntry, User

    cohort_id = uuid4()
    waiting_user_id = uuid4()
    public_user_id = uuid4()
    now = datetime.utcnow()
    provider_calls = []

    async def no_enforce(*_args, **_kwargs):
        return None

    async def create_order(**kwargs):
        provider_calls.append(kwargs)
        return {"id": f"order_{uuid4().hex}"}

    monkeypatch.setattr(cohort_routes, "enforce", no_enforce)
    monkeypatch.setattr(cohort_routes, "razorpay_ready", lambda: True)
    monkeypatch.setattr(cohort_routes, "create_order", create_order)
    try:
        async with AsyncSessionLocal() as db:
            waiting_user = User(id=waiting_user_id, email=f"waiting-{waiting_user_id}@example.test")
            public_user = User(id=public_user_id, email=f"public-{public_user_id}@example.test")
            db.add_all([waiting_user, public_user])
            db.add(Cohort(
                id=cohort_id,
                slug=f"waitlist-priority-{cohort_id}",
                title="Waitlist priority",
                starts_at=now + timedelta(days=14),
                ends_at=now + timedelta(days=42),
                capacity=1,
                price_minor=2_100_000,
                currency="INR",
                status="open",
            ))
            await db.flush()
            db.add(CohortWaitlistEntry(
                cohort_id=cohort_id,
                user_id=waiting_user_id,
                status="waiting",
                created_at=now,
            ))
            await db.commit()

            with pytest.raises(HTTPException) as denied:
                await cohort_routes.begin_checkout(
                    cohort_id,
                    public_user,
                    db,
                    cohort_routes.CohortCheckoutInput(offer_id="inr"),
                )
            assert denied.value.status_code == 409
            assert provider_calls == []
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id.in_((waiting_user_id, public_user_id))))
            await db.commit()
        await engine.dispose()


async def test_excess_capacity_reopens_after_all_waiters_have_offers(monkeypatch):
    from app.database import AsyncSessionLocal, engine
    from app.models import Cohort, CohortWaitlistEntry, User
    from app.services import waitlist_offers

    cohort_id = uuid4()
    user_id = uuid4()
    now = datetime.utcnow()

    async def accepted_email(payload, *, idempotency_key):
        return "email-accepted"

    monkeypatch.setattr(waitlist_offers, "send_resend_email", accepted_email)
    try:
        async with AsyncSessionLocal() as db:
            db.add(User(id=user_id, email=f"reopen-{user_id}@example.test"))
            cohort = Cohort(
                id=cohort_id,
                slug=f"waitlist-reopen-{cohort_id}",
                title="Waitlist public reopening",
                starts_at=now + timedelta(days=14),
                ends_at=now + timedelta(days=42),
                capacity=2,
                price_minor=2_100_000,
                currency="INR",
                status="full",
            )
            db.add(cohort)
            await db.flush()
            db.add(CohortWaitlistEntry(
                cohort_id=cohort_id,
                user_id=user_id,
                status="waiting",
                created_at=now,
            ))
            await db.commit()

            counts = await waitlist_offers.dispatch_waitlist_offers_for_cohort(db, cohort_id)
            await db.refresh(cohort)
            assert counts == {"offered": 1, "emailed": 1, "email_pending": 0}
            assert cohort.status == "open"
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_offer_clock_starts_only_after_definite_email_acceptance(monkeypatch):
    from app.database import AsyncSessionLocal, engine
    from app.models import Cohort, CohortWaitlistEntry, User
    from app.services import waitlist_offers
    from app.services.cohort_welcome_email import WelcomeEmailDeliveryError

    cohort_id = uuid4()
    user_id = uuid4()
    now = datetime.utcnow()
    attempts = []

    async def rejected_email(payload, *, idempotency_key):
        attempts.append(idempotency_key)
        raise WelcomeEmailDeliveryError("provider_rejected")

    async def accepted_email(payload, *, idempotency_key):
        attempts.append(idempotency_key)
        return "email-accepted"

    try:
        async with AsyncSessionLocal() as db:
            db.add(User(id=user_id, email=f"delivery-{user_id}@example.test"))
            db.add(Cohort(
                id=cohort_id,
                slug=f"waitlist-delivery-{cohort_id}",
                title="Waitlist delivery",
                starts_at=now + timedelta(days=14),
                ends_at=now + timedelta(days=42),
                capacity=1,
                price_minor=2_100_000,
                currency="INR",
                status="full",
            ))
            await db.flush()
            entry = CohortWaitlistEntry(
                cohort_id=cohort_id,
                user_id=user_id,
                status="offered",
                offered_at=now,
                offer_email_status="pending",
            )
            db.add(entry)
            await db.commit()

            monkeypatch.setattr(waitlist_offers, "send_resend_email", rejected_email)
            with pytest.raises(WelcomeEmailDeliveryError):
                await waitlist_offers.deliver_waitlist_offer_email(db, entry.id)
            await db.refresh(entry)
            assert entry.offer_email_status == "failed"
            assert entry.offer_expires_at is None
            assert entry.offer_email_first_dispatched_at is None

            monkeypatch.setattr(waitlist_offers, "send_resend_email", accepted_email)
            assert await waitlist_offers.deliver_waitlist_offer_email(db, entry.id) == "sent"
            await db.refresh(entry)
            assert entry.offer_email_status == "sent"
            assert entry.offer_expires_at > datetime.utcnow() + timedelta(hours=23, minutes=59)
            assert len(attempts) == 2
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_ambiguous_offer_email_retry_reuses_identity_and_deadline(monkeypatch):
    from app.database import AsyncSessionLocal, engine
    from app.models import Cohort, CohortWaitlistEntry, User
    from app.services import waitlist_offers
    from app.services.cohort_welcome_email import WelcomeEmailDeliveryError

    cohort_id = uuid4()
    user_id = uuid4()
    now = datetime.utcnow()
    attempts = []

    async def ambiguous_email(payload, *, idempotency_key):
        attempts.append(idempotency_key)
        raise WelcomeEmailDeliveryError("provider_outcome_unknown", outcome_unknown=True)

    async def accepted_email(payload, *, idempotency_key):
        attempts.append(idempotency_key)
        return "email-after-retry"

    try:
        async with AsyncSessionLocal() as db:
            db.add(User(id=user_id, email=f"ambiguous-{user_id}@example.test"))
            db.add(Cohort(
                id=cohort_id,
                slug=f"waitlist-ambiguous-{cohort_id}",
                title="Ambiguous waitlist delivery",
                starts_at=now + timedelta(days=14),
                ends_at=now + timedelta(days=42),
                capacity=1,
                price_minor=2_100_000,
                currency="INR",
                status="full",
            ))
            await db.flush()
            entry = CohortWaitlistEntry(
                cohort_id=cohort_id,
                user_id=user_id,
                status="offered",
                offered_at=now,
                offer_email_status="pending",
            )
            db.add(entry)
            await db.commit()

            monkeypatch.setattr(waitlist_offers, "send_resend_email", ambiguous_email)
            with pytest.raises(WelcomeEmailDeliveryError):
                await waitlist_offers.deliver_waitlist_offer_email(db, entry.id)
            await db.refresh(entry)
            original_deadline = entry.offer_expires_at
            assert entry.offer_email_status == "dispatching"
            assert original_deadline is not None

            entry.offer_email_last_attempt_at = datetime.utcnow() - timedelta(minutes=1)
            await db.commit()
            monkeypatch.setattr(waitlist_offers, "send_resend_email", accepted_email)
            assert await waitlist_offers.deliver_waitlist_offer_email(db, entry.id) == "sent"
            await db.refresh(entry)
            assert entry.offer_expires_at == original_deadline
            assert attempts[0] == attempts[1]
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_offer_deadline_uses_cohort_start_when_enrollment_closes_later(monkeypatch):
    from zoneinfo import ZoneInfo

    from app.database import AsyncSessionLocal, engine
    from app.models import Cohort, CohortWaitlistEntry, User
    from app.services import waitlist_offers

    cohort_id = uuid4()
    user_id = uuid4()
    now = datetime.utcnow()

    async def accepted_email(payload, *, idempotency_key):
        return "email-accepted"

    monkeypatch.setattr(waitlist_offers, "send_resend_email", accepted_email)
    try:
        async with AsyncSessionLocal() as db:
            db.add(User(id=user_id, email=f"cutoff-{user_id}@example.test"))
            cohort = Cohort(
                id=cohort_id,
                slug=f"waitlist-cutoff-{cohort_id}",
                title="Waitlist cutoff",
                starts_at=now + timedelta(hours=12),
                ends_at=now + timedelta(days=14),
                enrollment_closes_at=now + timedelta(days=2),
                capacity=1,
                price_minor=2_100_000,
                currency="INR",
                status="full",
                timezone="Asia/Kolkata",
            )
            db.add(cohort)
            await db.flush()
            entry = CohortWaitlistEntry(
                cohort_id=cohort_id,
                user_id=user_id,
                status="offered",
                offered_at=now,
                offer_email_status="pending",
            )
            db.add(entry)
            await db.commit()

            assert await waitlist_offers.deliver_waitlist_offer_email(db, entry.id) == "sent"
            await db.refresh(entry)
            expected = (
                cohort.starts_at.replace(tzinfo=ZoneInfo(cohort.timezone))
                .astimezone(ZoneInfo("UTC"))
                .replace(tzinfo=None)
            )
            assert abs((entry.offer_expires_at - expected).total_seconds()) < 1
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_admin_can_resolve_each_ambiguous_offer_email_outcome():
    from app.Routes import cohort_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import AdminAuditEvent, Cohort, CohortWaitlistEntry, User

    cohort_id = uuid4()
    admin_id = uuid4()
    user_ids = [uuid4(), uuid4(), uuid4()]
    entry_ids = []
    now = datetime.utcnow()
    try:
        async with AsyncSessionLocal() as db:
            admin = User(id=admin_id, email=f"admin-{admin_id}@example.test")
            db.add(admin)
            db.add_all([
                User(id=user_id, email=f"resolution-{user_id}@example.test")
                for user_id in user_ids
            ])
            db.add(Cohort(
                id=cohort_id,
                slug=f"waitlist-resolution-{cohort_id}",
                title="Waitlist resolution",
                starts_at=now + timedelta(days=14),
                ends_at=now + timedelta(days=42),
                capacity=3,
                price_minor=2_100_000,
                currency="INR",
                status="full",
            ))
            await db.flush()
            for user_id in user_ids:
                entry = CohortWaitlistEntry(
                    cohort_id=cohort_id,
                    user_id=user_id,
                    status="offered",
                    offered_at=now,
                    offer_expires_at=now + timedelta(hours=1),
                    offer_email_status="reconciliation_required",
                    offer_email_last_error_code="provider_acceptance_unknown",
                    offer_email_payload={"to": ["redacted@example.test"]},
                )
                db.add(entry)
                await db.flush()
                entry_ids.append(entry.id)
            await db.commit()

            await cohort_routes.admin_resolve_waitlist_offer_email(
                cohort_id, entry_ids[0],
                cohort_routes.WaitlistOfferEmailResolutionInput(action="confirmed_sent"),
                admin, db,
            )
            await cohort_routes.admin_resolve_waitlist_offer_email(
                cohort_id, entry_ids[1],
                cohort_routes.WaitlistOfferEmailResolutionInput(action="retry_confirmed_absent"),
                admin, db,
            )
            await cohort_routes.admin_resolve_waitlist_offer_email(
                cohort_id, entry_ids[2],
                cohort_routes.WaitlistOfferEmailResolutionInput(action="revoke"),
                admin, db,
            )

            entries = [await db.get(CohortWaitlistEntry, entry_id) for entry_id in entry_ids]
            assert entries[0].offer_email_status == "sent"
            assert entries[0].offer_email_payload is None
            assert entries[1].offer_email_status == "pending"
            assert entries[1].offer_expires_at is None
            assert entries[2].status == "offer_expired"
            audit_count = await db.scalar(
                select(func.count(AdminAuditEvent.id)).where(
                    AdminAuditEvent.subject_id.in_([str(value) for value in entry_ids])
                )
            )
            assert audit_count == 3
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(AdminAuditEvent).where(
                AdminAuditEvent.subject_id.in_([str(value) for value in entry_ids])
            ))
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id.in_([admin_id, *user_ids])))
            await db.commit()
        await engine.dispose()


async def test_offer_deadline_uses_cohort_start_when_enrollment_closes_later(monkeypatch):
    from zoneinfo import ZoneInfo

    from app.database import AsyncSessionLocal, engine
    from app.models import Cohort, CohortWaitlistEntry, User
    from app.services import waitlist_offers

    cohort_id = uuid4()
    user_id = uuid4()
    now = datetime.utcnow()

    async def accepted_email(payload, *, idempotency_key):
        return "email-accepted"

    monkeypatch.setattr(waitlist_offers, "send_resend_email", accepted_email)
    try:
        async with AsyncSessionLocal() as db:
            db.add(User(id=user_id, email=f"cutoff-{user_id}@example.test"))
            cohort = Cohort(
                id=cohort_id,
                slug=f"waitlist-cutoff-{cohort_id}",
                title="Waitlist cutoff",
                starts_at=now + timedelta(hours=12),
                ends_at=now + timedelta(days=14),
                enrollment_closes_at=now + timedelta(days=2),
                capacity=1,
                price_minor=2_100_000,
                currency="INR",
                status="full",
                timezone="Asia/Kolkata",
            )
            db.add(cohort)
            await db.flush()
            entry = CohortWaitlistEntry(
                cohort_id=cohort_id,
                user_id=user_id,
                status="offered",
                offered_at=now,
                offer_email_status="pending",
            )
            db.add(entry)
            await db.commit()

            assert await waitlist_offers.deliver_waitlist_offer_email(db, entry.id) == "sent"
            await db.refresh(entry)
            expected = (
                cohort.starts_at.replace(tzinfo=ZoneInfo(cohort.timezone))
                .astimezone(ZoneInfo("UTC"))
                .replace(tzinfo=None)
            )
            assert abs((entry.offer_expires_at - expected).total_seconds()) < 1
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(Cohort).where(Cohort.id == cohort_id))
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()
