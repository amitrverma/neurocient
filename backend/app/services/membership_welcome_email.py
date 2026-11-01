import html
import logging
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import (
    MembershipEntitlement,
    MembershipWelcomeEmailDelivery,
    User,
)
from app.services.cohort_welcome_email import (
    WelcomeEmailDeliveryError,
    send_resend_email,
)
from app.services.membership import entitlement_is_active


logger = logging.getLogger(__name__)
SUPPORT_EMAIL = "support@neurocient.com"
DISPATCH_LEASE = timedelta(seconds=30)
IDEMPOTENCY_RETRY_LIMIT = timedelta(hours=23)


def _utc_now_naive() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _display_date(value: datetime) -> str:
    return f"{value.day} {value.strftime('%B %Y')}"


def build_membership_welcome_email_payload(
    *,
    recipient: str,
    user_name: str | None,
    current_period_end: datetime,
) -> dict[str, Any]:
    display_name = (user_name or "there").strip() or "there"
    safe_name = html.escape(display_name)
    safe_period_end = html.escape(_display_date(current_period_end))
    subject = "Welcome to Neurocient Membership"
    text = (
        f"Hi {display_name},\n\n"
        "Your Neurocient Membership is active.\n\n"
        "You now have full access to Insights, Practice, Spots and "
        "Microchallenges without the free-account limits.\n\n"
        "A good place to begin is Practice: choose one real pattern you want "
        "to understand and work through it without rushing to action.\n\n"
        f"Your current paid period runs through {_display_date(current_period_end)}.\n\n"
        f"If anything looks wrong, email {SUPPORT_EMAIL}.\n\n"
        "Welcome in,\nNeurocient"
    )
    email_html = f"""<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f7f3ea;color:#082f30;font-family:Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Your Neurocient Membership is active.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f3ea;padding:28px 14px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffdf8;border:1px solid #d9d4c8;">
          <tr><td style="background:#082f30;padding:34px 38px;color:#ffffff;">
            <div style="color:#f9dc5c;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Membership active</div>
            <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:38px;line-height:1.12;font-weight:600;">Welcome to Neurocient.</h1>
          </td></tr>
          <tr><td style="padding:34px 38px;">
            <p style="margin:0 0 18px;font-size:17px;line-height:1.65;">Hi {safe_name},</p>
            <p style="margin:0 0 25px;font-size:17px;line-height:1.65;">Your membership is active. The free-account limits have been removed across the self-guided platform.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 27px;background:#f3eee3;border-left:4px solid #f9dc5c;">
              <tr><td style="padding:20px 22px;">
                <div style="font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#397c86;">Your access</div>
                <div style="margin-top:9px;font-family:Georgia,serif;font-size:23px;font-weight:600;">Insights · Practice · Spots · Microchallenges</div>
                <div style="margin-top:9px;font-size:15px;color:#38595a;">Current paid period through {safe_period_end}</div>
              </td></tr>
            </table>
            <h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:24px;font-weight:600;">A useful place to begin</h2>
            <p style="margin:0 0 25px;font-size:16px;line-height:1.65;">Open Practice and choose one real pattern you want to understand. Start with what actually happens; there is no need to rush into a fix.</p>
            <a href="https://neurocient.com/practice" style="display:inline-block;background:#f9dc5c;color:#082f30;padding:13px 21px;text-decoration:none;font-weight:700;border-radius:999px;">Begin with Practice</a>
            <p style="margin:28px 0 0;padding-top:22px;border-top:1px solid #d9d4c8;font-size:14px;line-height:1.6;color:#516869;">If anything looks wrong, email <a href="mailto:{SUPPORT_EMAIL}" style="color:#082f30;font-weight:700;">{SUPPORT_EMAIL}</a>.</p>
            <p style="margin:22px 0 0;font-size:16px;line-height:1.65;">Welcome in,<br><strong>Neurocient</strong></p>
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


async def ensure_membership_welcome_delivery(
    db: AsyncSession,
    user_id: UUID,
) -> MembershipWelcomeEmailDelivery | None:
    existing = await db.get(MembershipWelcomeEmailDelivery, user_id)
    if existing:
        return existing
    result = await db.execute(
        select(MembershipEntitlement, User)
        .join(User, User.id == MembershipEntitlement.user_id)
        .where(MembershipEntitlement.user_id == user_id)
    )
    row = result.one_or_none()
    if not row:
        return None
    entitlement, user = row
    if not entitlement_is_active(entitlement) or not entitlement.current_period_end:
        return None
    delivery = MembershipWelcomeEmailDelivery(
        user_id=user.id,
        recipient=user.email,
        payload=build_membership_welcome_email_payload(
            recipient=user.email,
            user_name=user.name,
            current_period_end=entitlement.current_period_end,
        ),
        status="pending",
    )
    db.add(delivery)
    await db.flush()
    return delivery


async def deliver_membership_welcome_email(db: AsyncSession, user_id: UUID) -> str:
    result = await db.execute(
        select(MembershipWelcomeEmailDelivery, MembershipEntitlement)
        .join(
            MembershipEntitlement,
            MembershipEntitlement.user_id == MembershipWelcomeEmailDelivery.user_id,
        )
        .where(MembershipWelcomeEmailDelivery.user_id == user_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    row = result.one_or_none()
    if not row:
        return "not_due"
    delivery, entitlement = row
    if delivery.status == "sent":
        return "already_sent"
    if not entitlement_is_active(entitlement):
        delivery.status = "suppressed"
        delivery.last_error_code = "membership_not_active"
        await db.commit()
        return "suppressed"

    now = _utc_now_naive()
    if delivery.status == "reconciliation_required":
        await db.commit()
        raise WelcomeEmailDeliveryError(
            "reconciliation_required", retryable=False, outcome_unknown=True
        )
    if delivery.status == "dispatching" and delivery.last_attempt_at:
        if now - delivery.last_attempt_at < DISPATCH_LEASE:
            await db.commit()
            raise WelcomeEmailDeliveryError("dispatch_in_progress")
        idempotency_age = now - (
            delivery.first_dispatched_at or delivery.last_attempt_at
        )
        if idempotency_age >= IDEMPOTENCY_RETRY_LIMIT:
            delivery.status = "reconciliation_required"
            delivery.last_error_code = "provider_acceptance_unknown"
            await db.commit()
            raise WelcomeEmailDeliveryError(
                "reconciliation_required", retryable=False, outcome_unknown=True
            )

    if not settings.RESEND_API_KEY or not settings.RESEND_FROM_EMAIL:
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

    result = await db.execute(
        select(MembershipWelcomeEmailDelivery, MembershipEntitlement)
        .join(
            MembershipEntitlement,
            MembershipEntitlement.user_id == MembershipWelcomeEmailDelivery.user_id,
        )
        .where(MembershipWelcomeEmailDelivery.user_id == user_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    delivery, entitlement = result.one()
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
    if not entitlement_is_active(entitlement):
        delivery.status = "suppressed"
        delivery.last_error_code = "membership_not_active"
        await db.commit()
        return "suppressed"

    try:
        provider_id = await send_resend_email(
            delivery.payload,
            idempotency_key=f"membership-welcome/{delivery.user_id}",
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
            "membership_welcome_email_failed",
            extra={
                "user_id": str(delivery.user_id),
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
        "membership_welcome_email_sent",
        extra={"user_id": str(delivery.user_id)},
    )
    return "sent"
