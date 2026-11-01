import html
import logging
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import (
    Cohort,
    CohortEnrollment,
    CohortWelcomeEmailDelivery,
    User,
)


logger = logging.getLogger(__name__)
ELIGIBLE_ENROLLMENT_STATUSES = ("paid", "active", "completed")
SUPPORT_EMAIL = "support@neurocient.com"
DISPATCH_LEASE = timedelta(seconds=30)
IDEMPOTENCY_RETRY_LIMIT = timedelta(hours=23)


def _utc_now_naive() -> datetime:
    """Match the repository's naive-UTC columns without deprecated utcnow()."""
    return datetime.now(UTC).replace(tzinfo=None)


class WelcomeEmailDeliveryError(RuntimeError):
    def __init__(
        self,
        reason_code: str,
        *,
        retryable: bool = True,
        outcome_unknown: bool = False,
    ):
        super().__init__(reason_code)
        self.reason_code = reason_code
        self.retryable = retryable
        self.outcome_unknown = outcome_unknown


def _display_date(value: datetime) -> str:
    return f"{value.day} {value.strftime('%B %Y')}"


def build_welcome_email_payload(
    *,
    recipient: str,
    user_name: str | None,
    cohort_title: str,
    starts_at: datetime,
    timezone: str,
) -> dict[str, Any]:
    safe_name = html.escape((user_name or "there").strip() or "there")
    safe_title = html.escape(cohort_title)
    safe_date = html.escape(_display_date(starts_at))
    safe_timezone = html.escape(timezone.replace("_", " "))
    subject = f"You're in — {cohort_title}"
    text = (
        f"Hi {(user_name or 'there').strip() or 'there'},\n\n"
        "Welcome to The Modern Caveman.\n\n"
        f"Your place in {cohort_title} is confirmed. The cohort starts "
        f"{_display_date(starts_at)} ({timezone.replace('_', ' ')}).\n\n"
        "No further action is needed right now. We'll send the joining details "
        "to this email address before the cohort begins.\n\n"
        "Attend the first session. If the program does not feel right for you, "
        f"email {SUPPORT_EMAIL} within 48 hours of that session for a full refund.\n\n"
        "Welcome aboard,\nNeurocient"
    )
    email_html = f"""<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f7f3ea;color:#082f30;font-family:Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Your place in {safe_title} is confirmed.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f3ea;padding:28px 14px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffdf8;border:1px solid #d9d4c8;">
          <tr><td style="background:#082f30;padding:34px 38px;color:#ffffff;">
            <div style="color:#f9dc5c;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Payment confirmed</div>
            <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:36px;line-height:1.15;font-weight:600;">Welcome to The Modern Caveman.</h1>
          </td></tr>
          <tr><td style="padding:34px 38px;">
            <p style="margin:0 0 18px;font-size:17px;line-height:1.65;">Hi {safe_name},</p>
            <p style="margin:0 0 24px;font-size:17px;line-height:1.65;">Your payment is complete and your place is confirmed.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 26px;background:#f3eee3;border-left:4px solid #f9dc5c;">
              <tr><td style="padding:20px 22px;">
                <div style="font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#397c86;">Your cohort</div>
                <div style="margin-top:8px;font-family:Georgia,serif;font-size:24px;font-weight:600;">{safe_title}</div>
                <div style="margin-top:8px;font-size:15px;color:#38595a;">Starts {safe_date} · {safe_timezone}</div>
              </td></tr>
            </table>
            <h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:24px;font-weight:600;">What happens now?</h2>
            <p style="margin:0 0 24px;font-size:16px;line-height:1.65;">No further action is needed right now. We'll send the joining details to this email address before the cohort begins.</p>
            <p style="margin:0 0 24px;padding-top:22px;border-top:1px solid #d9d4c8;font-size:14px;line-height:1.6;color:#516869;">Attend the first session. If the program does not feel right for you, email <a href="mailto:{SUPPORT_EMAIL}" style="color:#082f30;font-weight:700;">{SUPPORT_EMAIL}</a> within 48 hours of that session for a full refund.</p>
            <p style="margin:0;font-size:16px;line-height:1.65;">Welcome aboard,<br><strong>Neurocient</strong></p>
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


async def send_resend_email(
    payload: dict[str, Any],
    *,
    idempotency_key: str,
) -> str:
    if not settings.RESEND_API_KEY or not settings.RESEND_FROM_EMAIL:
        raise WelcomeEmailDeliveryError("configuration_missing")
    request_payload = {
        **payload,
        "from": payload.get("from") or f"Neurocient <{settings.RESEND_FROM_EMAIL}>",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                    "Idempotency-Key": idempotency_key,
                },
                json=request_payload,
            )
    except httpx.ConnectError as error:
        raise WelcomeEmailDeliveryError("provider_unreachable") from error
    except httpx.HTTPError as error:
        raise WelcomeEmailDeliveryError(
            "provider_outcome_unknown", outcome_unknown=True
        ) from error
    if not 200 <= response.status_code < 300:
        logger.error(
            "cohort_welcome_email_rejected",
            extra={"status_code": response.status_code},
        )
        if response.status_code == 409 or response.status_code >= 500:
            raise WelcomeEmailDeliveryError(
                "provider_outcome_unknown", outcome_unknown=True
            )
        raise WelcomeEmailDeliveryError(f"provider_rejected_{response.status_code}")
    try:
        provider_id = response.json().get("id")
    except ValueError as error:
        raise WelcomeEmailDeliveryError(
            "provider_response_invalid", outcome_unknown=True
        ) from error
    if not isinstance(provider_id, str) or not provider_id:
        raise WelcomeEmailDeliveryError(
            "provider_response_invalid", outcome_unknown=True
        )
    return provider_id


async def ensure_welcome_email_delivery(
    db: AsyncSession,
    enrollment_id: UUID,
) -> CohortWelcomeEmailDelivery | None:
    existing = await db.get(CohortWelcomeEmailDelivery, enrollment_id)
    if existing:
        return existing
    result = await db.execute(
        select(CohortEnrollment, Cohort, User)
        .join(Cohort, Cohort.id == CohortEnrollment.cohort_id)
        .join(User, User.id == CohortEnrollment.user_id)
        .where(CohortEnrollment.id == enrollment_id)
    )
    row = result.one_or_none()
    if not row:
        return None
    enrollment, cohort, user = row
    if enrollment.status not in ELIGIBLE_ENROLLMENT_STATUSES:
        return None
    delivery = CohortWelcomeEmailDelivery(
        enrollment_id=enrollment.id,
        recipient=user.email,
        payload=build_welcome_email_payload(
            recipient=user.email,
            user_name=user.name,
            cohort_title=cohort.title,
            starts_at=cohort.starts_at,
            timezone=cohort.timezone,
        ),
        status="pending",
    )
    db.add(delivery)
    await db.flush()
    return delivery


async def deliver_welcome_email(db: AsyncSession, enrollment_id: UUID) -> str:
    result = await db.execute(
        select(CohortWelcomeEmailDelivery, CohortEnrollment.status)
        .join(
            CohortEnrollment,
            CohortEnrollment.id == CohortWelcomeEmailDelivery.enrollment_id,
        )
        .where(CohortWelcomeEmailDelivery.enrollment_id == enrollment_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    row = result.one_or_none()
    if not row:
        return "not_due"
    delivery, enrollment_status = row
    if delivery.status == "sent":
        return "already_sent"
    if enrollment_status not in ELIGIBLE_ENROLLMENT_STATUSES:
        delivery.status = "suppressed"
        delivery.last_error_code = "enrollment_not_eligible"
        await db.commit()
        return "suppressed"

    now = _utc_now_naive()
    if delivery.status == "reconciliation_required":
        await db.commit()
        raise WelcomeEmailDeliveryError(
            "reconciliation_required", retryable=False, outcome_unknown=True
        )
    if delivery.status == "dispatching" and delivery.last_attempt_at:
        dispatch_age = now - delivery.last_attempt_at
        if dispatch_age < DISPATCH_LEASE:
            await db.commit()
            raise WelcomeEmailDeliveryError("dispatch_in_progress")
        idempotency_age = now - (delivery.first_dispatched_at or delivery.last_attempt_at)
        if idempotency_age >= IDEMPOTENCY_RETRY_LIMIT:
            delivery.status = "reconciliation_required"
            delivery.last_error_code = "provider_acceptance_unknown"
            await db.commit()
            raise WelcomeEmailDeliveryError(
                "reconciliation_required", retryable=False, outcome_unknown=True
            )

    if not settings.RESEND_API_KEY or not settings.RESEND_FROM_EMAIL:
        # Once provider acceptance is ambiguous, later safe failures must not
        # erase the original idempotency deadline.
        if delivery.status != "dispatching":
            delivery.status = "failed"
        delivery.last_error_code = "configuration_missing"
        await db.commit()
        raise WelcomeEmailDeliveryError("configuration_missing")

    if not delivery.payload.get("from"):
        delivery.payload = {
            **delivery.payload,
            "from": f"Neurocient <{settings.RESEND_FROM_EMAIL}>",
        }
    continuing_ambiguous_dispatch = delivery.status == "dispatching"
    delivery.attempt_count += 1
    delivery.last_attempt_at = now
    if not continuing_ambiguous_dispatch:
        delivery.first_dispatched_at = now
    delivery.status = "dispatching"
    delivery.last_error_code = None
    await db.commit()
    claimed_attempt = delivery.attempt_count

    # Re-lock both records so a cancellation/refund cannot race the provider call.
    result = await db.execute(
        select(CohortWelcomeEmailDelivery, CohortEnrollment.status)
        .join(
            CohortEnrollment,
            CohortEnrollment.id == CohortWelcomeEmailDelivery.enrollment_id,
        )
        .where(CohortWelcomeEmailDelivery.enrollment_id == enrollment_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    delivery, enrollment_status = result.one()
    if delivery.status == "sent":
        await db.commit()
        return "already_sent"
    if delivery.status != "dispatching" or delivery.attempt_count != claimed_attempt:
        await db.commit()
        raise WelcomeEmailDeliveryError("dispatch_superseded")
    if (
        delivery.first_dispatched_at
        and _utc_now_naive() - delivery.first_dispatched_at
        >= IDEMPOTENCY_RETRY_LIMIT
    ):
        delivery.status = "reconciliation_required"
        delivery.last_error_code = "provider_acceptance_unknown"
        await db.commit()
        raise WelcomeEmailDeliveryError(
            "reconciliation_required", retryable=False, outcome_unknown=True
        )
    if enrollment_status not in ELIGIBLE_ENROLLMENT_STATUSES:
        delivery.status = "suppressed"
        delivery.last_error_code = "enrollment_not_eligible"
        await db.commit()
        return "suppressed"
    try:
        provider_id = await send_resend_email(
            delivery.payload,
            idempotency_key=f"cohort-welcome/{delivery.enrollment_id}",
        )
    except WelcomeEmailDeliveryError as error:
        delivery.status = (
            "dispatching"
            if error.outcome_unknown or continuing_ambiguous_dispatch
            else "failed"
        )
        delivery.last_error_code = error.reason_code
        await db.commit()
        logger.error(
            "cohort_welcome_email_failed",
            extra={
                "enrollment_id": str(delivery.enrollment_id),
                "reason_code": error.reason_code,
                "attempt": delivery.attempt_count,
            },
        )
        raise

    delivery.status = "sent"
    delivery.provider_message_id = provider_id
    delivery.last_error_code = None
    delivery.sent_at = _utc_now_naive()
    await db.commit()
    logger.info(
        "cohort_welcome_email_sent",
        extra={"enrollment_id": str(delivery.enrollment_id)},
    )
    return "sent"
