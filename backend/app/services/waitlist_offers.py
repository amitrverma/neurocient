"""Cohort waitlist offer policy and transactional email presentation."""

import html
import logging
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.business_identity import PAYMENT_OPERATOR_STATEMENT, SUPPORT_EMAIL
from app.models import Cohort, CohortWaitlistEntry, User
from app.services.cohort_welcome_email import WelcomeEmailDeliveryError, send_resend_email
from app.services.cohorts import PUBLIC_STATUSES, enrollment_window_is_open, occupied_seats


WAITLIST_OFFER_DURATION = timedelta(hours=24)
DELIVERY_LEASE = timedelta(seconds=30)
IDEMPOTENCY_RETRY_LIMIT = timedelta(hours=23)
logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class WaitlistOfferResult:
    entry_id: object | None
    outcome: str


def waitlist_offer_is_valid(entry, *, now: datetime | None = None) -> bool:
    if entry is None or entry.status not in {"offered", "checkout_started"}:
        return False
    if getattr(entry, "offer_email_status", None) != "sent":
        return False
    expires_at = entry.offer_expires_at
    if expires_at is None:
        return False
    reference = now or datetime.now(UTC).replace(tzinfo=None)
    if reference.tzinfo is not None:
        reference = reference.astimezone(UTC).replace(tzinfo=None)
    if expires_at.tzinfo is not None:
        expires_at = expires_at.astimezone(UTC).replace(tzinfo=None)
    return expires_at > reference


def waitlist_offer_is_checkoutable(entry, cohort, *, now: datetime | None = None) -> bool:
    if not waitlist_offer_is_valid(entry, now=now):
        return False
    if cohort is None or cohort.status not in ("open", "full"):
        return False
    reference = now
    if reference is not None and reference.tzinfo is None:
        reference = reference.replace(tzinfo=UTC)
    return enrollment_window_is_open(cohort, reference)


async def _expire_offers(
    db: AsyncSession,
    cohort_id,
    *,
    now: datetime,
) -> None:
    result = await db.execute(
        select(CohortWaitlistEntry)
        .where(
            CohortWaitlistEntry.cohort_id == cohort_id,
            CohortWaitlistEntry.status.in_(("offered", "checkout_started")),
            CohortWaitlistEntry.offer_email_status == "sent",
            CohortWaitlistEntry.offer_expires_at.is_not(None),
            CohortWaitlistEntry.offer_expires_at <= now,
        )
        .with_for_update()
    )
    for entry in result.scalars().all():
        entry.status = "offer_expired"


async def offer_next_waitlisted_user(
    db: AsyncSession,
    cohort_id,
    *,
    now: datetime | None = None,
) -> WaitlistOfferResult:
    """Reserve one genuinely free seat for the oldest waiting account."""
    reference = now or datetime.utcnow()
    cohort_result = await db.execute(
        select(Cohort).where(Cohort.id == cohort_id).with_for_update()
    )
    cohort = cohort_result.scalar_one_or_none()
    if not cohort or cohort.status not in PUBLIC_STATUSES:
        return WaitlistOfferResult(None, "cohort_unavailable")
    await _expire_offers(db, cohort.id, now=reference)
    window_reference = reference.replace(tzinfo=UTC) if reference.tzinfo is None else reference
    if cohort.status not in ("open", "full") or not enrollment_window_is_open(cohort, window_reference):
        await db.commit()
        return WaitlistOfferResult(None, "enrollment_closed")

    seats = await occupied_seats(db, cohort.id, reference)
    if seats >= cohort.capacity:
        await db.commit()
        return WaitlistOfferResult(None, "no_free_seat")

    waiting_result = await db.execute(
        select(CohortWaitlistEntry)
        .where(
            CohortWaitlistEntry.cohort_id == cohort.id,
            CohortWaitlistEntry.status == "waiting",
        )
        .order_by(CohortWaitlistEntry.created_at.asc(), CohortWaitlistEntry.id.asc())
        .limit(1)
        .with_for_update()
    )
    entry = waiting_result.scalar_one_or_none()
    if not entry:
        # Once every waiter has an offer, genuinely spare capacity can return
        # to public checkout while the enrollment window is still open.
        if cohort.status == "full" and seats < cohort.capacity:
            cohort.status = "open"
        await db.commit()
        return WaitlistOfferResult(None, "waitlist_empty")
    entry.status = "offered"
    entry.offered_at = reference
    entry.offer_expires_at = None
    entry.offer_email_sent_at = None
    entry.offer_email_provider_id = None
    entry.offer_email_status = "pending"
    entry.offer_email_attempt_count = 0
    entry.offer_email_last_error_code = None
    entry.offer_email_first_dispatched_at = None
    entry.offer_email_last_attempt_at = None
    entry.offer_email_payload = None
    await db.commit()
    return WaitlistOfferResult(entry.id, "offered")


async def deliver_waitlist_offer_email(db: AsyncSession, entry_id) -> str:
    result = await db.execute(
        select(CohortWaitlistEntry, Cohort, User)
        .join(Cohort, Cohort.id == CohortWaitlistEntry.cohort_id)
        .join(User, User.id == CohortWaitlistEntry.user_id)
        .where(CohortWaitlistEntry.id == entry_id)
        .with_for_update()
    )
    row = result.one_or_none()
    if not row:
        return "not_found"
    entry, cohort, user = row
    if entry.offer_email_status == "sent":
        return "already_sent"
    if entry.status != "offered":
        return "not_due"
    now = datetime.now(UTC).replace(tzinfo=None)
    continuing_ambiguous = entry.offer_email_status == "dispatching"
    if continuing_ambiguous and entry.offer_email_last_attempt_at:
        if now - entry.offer_email_last_attempt_at < DELIVERY_LEASE:
            await db.commit()
            raise WelcomeEmailDeliveryError("dispatch_in_progress")
        if now - (entry.offer_email_first_dispatched_at or entry.offer_email_last_attempt_at) >= IDEMPOTENCY_RETRY_LIMIT:
            entry.offer_email_status = "reconciliation_required"
            entry.offer_email_last_error_code = "provider_acceptance_unknown"
            await db.commit()
            raise WelcomeEmailDeliveryError(
                "reconciliation_required", retryable=False, outcome_unknown=True
            )
    if entry.offer_email_status == "reconciliation_required":
        await db.commit()
        raise WelcomeEmailDeliveryError(
            "reconciliation_required", retryable=False, outcome_unknown=True
        )

    if continuing_ambiguous:
        payload = entry.offer_email_payload
        expires_at = entry.offer_expires_at
        first_dispatched_at = entry.offer_email_first_dispatched_at
        if not payload or not expires_at or not first_dispatched_at:
            entry.offer_email_status = "reconciliation_required"
            entry.offer_email_last_error_code = "delivery_state_incomplete"
            await db.commit()
            raise WelcomeEmailDeliveryError(
                "reconciliation_required", retryable=False, outcome_unknown=True
            )
    else:
        try:
            zone = ZoneInfo(cohort.timezone)
        except (ZoneInfoNotFoundError, ValueError, TypeError):
            zone = UTC
        local_cutoff = min(
            value
            for value in (cohort.starts_at, cohort.enrollment_closes_at)
            if value is not None
        )
        cutoff = local_cutoff.replace(tzinfo=zone).astimezone(UTC).replace(tzinfo=None)
        expires_at = min(now + WAITLIST_OFFER_DURATION, cutoff)
        if expires_at <= now:
            entry.status = "offer_expired"
            await db.commit()
            return "not_due"
        offer_url = f"{settings.PUBLIC_SITE_URL}/modern-caveman?waitlist_offer={entry.id}#pricing"
        payload = build_waitlist_offer_email_payload(
            recipient=user.email,
            user_name=user.name,
            cohort_title=cohort.title,
            starts_at=cohort.starts_at,
            timezone=cohort.timezone,
            offer_expires_at=expires_at,
            offer_url=offer_url,
        )
        entry.offer_expires_at = expires_at
        entry.offer_email_payload = payload
        entry.offer_email_first_dispatched_at = now
        first_dispatched_at = now

    entry.offer_email_attempt_count += 1
    entry.offer_email_last_attempt_at = now
    entry.offer_email_status = "dispatching"
    entry.offer_email_last_error_code = None
    await db.commit()
    try:
        provider_id = await send_resend_email(
            payload,
            idempotency_key=f"cohort-waitlist-offer/{entry.id}/{int(first_dispatched_at.replace(tzinfo=UTC).timestamp())}",
        )
    except WelcomeEmailDeliveryError as error:
        claimed = await db.get(CohortWaitlistEntry, entry_id)
        if claimed:
            claimed.offer_email_status = "dispatching" if error.outcome_unknown else "failed"
            claimed.offer_email_last_error_code = error.reason_code
            if not error.outcome_unknown:
                claimed.offer_expires_at = None
                claimed.offer_email_payload = None
                claimed.offer_email_first_dispatched_at = None
            await db.commit()
        logger.error(
            "waitlist_offer_email_failed",
            extra={"entry_id": str(entry_id), "reason_code": error.reason_code},
        )
        raise
    claimed_result = await db.execute(
        select(CohortWaitlistEntry)
        .where(CohortWaitlistEntry.id == entry_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    claimed_entry = claimed_result.scalar_one_or_none()
    if not claimed_entry:
        return "not_found"
    if claimed_entry.offer_email_status == "sent":
        await db.commit()
        return "already_sent"
    claimed_entry.offer_email_provider_id = provider_id
    claimed_entry.offer_email_sent_at = datetime.utcnow()
    claimed_entry.offer_email_status = "sent"
    claimed_entry.offer_email_last_error_code = None
    claimed_entry.offer_email_payload = None
    await db.commit()
    return "sent"


async def dispatch_available_waitlist_offers(db: AsyncSession) -> dict[str, int]:
    """Retry pending mail and create one offer per genuinely free seat."""
    result = await db.execute(
        select(Cohort.id).where(
            Cohort.program_key == "modern-caveman",
            Cohort.status.in_(("open", "full")),
        )
    )
    counts = {"offered": 0, "emailed": 0, "email_pending": 0}
    failures: list[tuple[object, Exception]] = []
    for cohort_id in result.scalars().all():
        try:
            cohort_counts = await dispatch_waitlist_offers_for_cohort(db, cohort_id)
        except Exception as error:
            failures.append((cohort_id, error))
            await db.rollback()
            logger.exception(
                "waitlist_offer_cohort_dispatch_failed",
                extra={"cohort_id": str(cohort_id)},
            )
            continue
        for key, value in cohort_counts.items():
            counts[key] += value
    if failures:
        raise RuntimeError(f"waitlist offer dispatch failed for {len(failures)} cohort(s)")
    return counts


async def dispatch_waitlist_offers_for_cohort(
    db: AsyncSession,
    cohort_id,
) -> dict[str, int]:
    counts = {"offered": 0, "emailed": 0, "email_pending": 0}
    pending_result = await db.execute(
        select(CohortWaitlistEntry.id)
        .where(
            CohortWaitlistEntry.cohort_id == cohort_id,
            CohortWaitlistEntry.status == "offered",
            CohortWaitlistEntry.offer_email_status.in_(("pending", "failed", "dispatching")),
        )
        .order_by(CohortWaitlistEntry.offered_at.asc(), CohortWaitlistEntry.id.asc())
    )
    for entry_id in pending_result.scalars().all():
        try:
            delivery = await deliver_waitlist_offer_email(db, entry_id)
        except WelcomeEmailDeliveryError:
            counts["email_pending"] += 1
        else:
            if delivery in ("sent", "already_sent"):
                counts["emailed"] += 1

    while True:
        offer = await offer_next_waitlisted_user(db, cohort_id)
        if not offer.entry_id:
            break
        counts["offered"] += 1
        try:
            delivery = await deliver_waitlist_offer_email(db, offer.entry_id)
        except WelcomeEmailDeliveryError:
            counts["email_pending"] += 1
        else:
            if delivery in ("sent", "already_sent"):
                counts["emailed"] += 1
    return counts


def _display_deadline(value: datetime, timezone: str) -> str:
    try:
        zone = ZoneInfo(timezone)
    except (ZoneInfoNotFoundError, ValueError, TypeError):
        zone = UTC
        timezone = "UTC"
    aware = value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)
    local = aware.astimezone(zone)
    clock = local.strftime("%I:%M %p").lstrip("0")
    return f"{local.day} {local.strftime('%B %Y')}, {clock} ({timezone})"


def _display_date(value: datetime) -> str:
    return f"{value.day} {value.strftime('%B %Y')}"


def build_waitlist_offer_email_payload(
    *,
    recipient: str,
    user_name: str | None,
    cohort_title: str,
    starts_at: datetime,
    timezone: str,
    offer_expires_at: datetime,
    offer_url: str,
) -> dict[str, Any]:
    display_name = (user_name or "there").strip() or "there"
    deadline = _display_deadline(offer_expires_at, timezone)
    start_date = _display_date(starts_at)
    safe_name = html.escape(display_name)
    safe_title = html.escape(cohort_title)
    safe_deadline = html.escape(deadline)
    safe_start = html.escape(start_date)
    safe_url = html.escape(offer_url, quote=True)
    subject = f"A place is available — {cohort_title}"
    text = (
        f"Hi {display_name},\n\n"
        f"A place is available in {cohort_title}, starting {start_date}.\n\n"
        f"Use your offer before {deadline}:\n{offer_url}\n\n"
        "The link must be opened with the same Neurocient account that joined "
        "the waitlist. Joining the waitlist did not charge you; payment begins "
        "only if you choose a currency and open secure checkout.\n\n"
        f"If anything looks wrong, email {SUPPORT_EMAIL}.\n\n"
        f"{PAYMENT_OPERATOR_STATEMENT}\n\nNeurocient"
    )
    email_html = f"""<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f7f3ea;color:#082f30;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 14px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffdf8;border:1px solid #d9d4c8;">
          <tr><td style="background:#082f30;padding:32px 38px;color:#fff;">
            <div style="color:#f9dc5c;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Waitlist offer</div>
            <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:34px;line-height:1.15;">A place is available.</h1>
          </td></tr>
          <tr><td style="padding:34px 38px;">
            <p style="margin:0 0 18px;font-size:17px;line-height:1.65;">Hi {safe_name},</p>
            <p style="margin:0 0 22px;font-size:17px;line-height:1.65;">A place has opened in <strong>{safe_title}</strong>, starting {safe_start}.</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">This offer is available through <strong>{safe_deadline}</strong>.</p>
            <a href="{safe_url}" style="display:inline-block;background:#f9dc5c;color:#082f30;padding:13px 21px;text-decoration:none;font-weight:700;border-radius:999px;">Choose payment and join</a>
            <p style="margin:26px 0 0;font-size:14px;line-height:1.6;color:#516869;">Open the link with the same Neurocient account that joined the waitlist. You have not been charged; payment begins only when you open secure checkout.</p>
            <p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:#6a7d7d;">{PAYMENT_OPERATOR_STATEMENT}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>"""
    return {
        "to": [recipient],
        "reply_to": SUPPORT_EMAIL,
        "subject": subject,
        "html": email_html,
        "text": text,
    }
