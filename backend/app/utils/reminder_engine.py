import asyncio
import json
import logging
from datetime import date, datetime
from typing import Literal
from zoneinfo import ZoneInfo

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.helper.common import get_random_active_nudge
from app.models import (
    CavemanSpot,
    MicrochallengeLog,
    UserMicrochallenge,
    UserPreferences,
    WebPushSubscription,
)
from app.Routes.whatsapp_routes import send_whatsapp_message
from app.observability import log_event, safe_exception_fields
from app.services.job_control import (
    claim_notification_dispatch,
    finish_notification_dispatch,
)
from app.utils.pushnotification import send_push

logger = logging.getLogger("notification_delivery")

Purpose = Literal["nudge", "spot_reminder", "microchallenge"]
PURPOSE_FIELDS = {
    "nudge": "nudge_enabled",
    "spot_reminder": "spot_reminder_enabled",
    "microchallenge": "microchallenge_enabled",
}


def _dispatch_date() -> date:
    return datetime.now(ZoneInfo("Asia/Kolkata")).date()


async def has_spotted_today(user_id, db: AsyncSession):
    return (
        await db.scalar(
            select(CavemanSpot.id).where(
                CavemanSpot.user_id == user_id,
                CavemanSpot.date == date.today(),
            )
        )
    ) is not None


async def has_logged_micro_today(user_id, db: AsyncSession):
    return (
        await db.scalar(
            select(MicrochallengeLog.id)
            .join(
                UserMicrochallenge,
                MicrochallengeLog.assignment_id == UserMicrochallenge.id,
            )
            .where(
                UserMicrochallenge.user_id == user_id,
                MicrochallengeLog.log_date == date.today(),
            )
        )
    ) is not None


async def _candidate_user_ids(db: AsyncSession, purpose: Purpose) -> list:
    purpose_column = getattr(UserPreferences, PURPOSE_FIELDS[purpose])
    result = await db.execute(
        select(UserPreferences.user_id).where(
            purpose_column.is_(True),
            or_(
                UserPreferences.push_enabled.is_(True),
                and_(
                    UserPreferences.whatsapp_enabled.is_(True),
                    UserPreferences.whatsapp_verified.is_(True),
                    UserPreferences.whatsapp_number.is_not(None),
                ),
            ),
        )
    )
    return list(result.scalars().all())


async def _deliver_to_user(
    db: AsyncSession,
    *,
    user_id,
    purpose: Purpose,
    title: str,
    body: str,
    whatsapp_body: str | None = None,
) -> dict[str, int]:
    """Re-read consent immediately before reaching either provider adapter."""
    prefs = await db.scalar(
        select(UserPreferences).where(UserPreferences.user_id == user_id)
    )
    if prefs is None or not getattr(prefs, PURPOSE_FIELDS[purpose]):
        logger.info(
            "notification_skipped purpose=%s reason=purpose_disabled",
            purpose,
        )
        return {
            "push_success": 0,
            "push_failed": 0,
            "whatsapp_success": 0,
            "whatsapp_failed": 0,
        }

    push_success = 0
    push_failed = 0
    if prefs.push_enabled:
        subscriptions = (
            await db.execute(
                select(WebPushSubscription).where(
                    WebPushSubscription.user_id == user_id
                )
            )
        ).scalars().all()
        dispatch = (
            await claim_notification_dispatch(
                db,
                user_id=user_id,
                purpose=purpose,
                channel="push",
                destination_key="user-push",
                dispatch_date=_dispatch_date(),
            )
            if subscriptions
            else None
        )
        if subscriptions and dispatch is None:
            logger.info(
                "notification_skipped purpose=%s channel=push reason=durable_claim_exists",
                purpose,
            )
        elif dispatch is not None:
            delivered = False
            uncertain_error = None
            consent_revoked = False
            for subscription in subscriptions:
                await db.refresh(
                    prefs,
                    attribute_names=[PURPOSE_FIELDS[purpose], "push_enabled"],
                )
                if not (
                    getattr(prefs, PURPOSE_FIELDS[purpose]) and prefs.push_enabled
                ):
                    consent_revoked = True
                    break
                try:
                    delivered = bool(
                        await send_push(
                            {
                                "endpoint": subscription.endpoint,
                                "keys": subscription.keys,
                            },
                            payload=json.dumps({"title": title, "body": body}),
                            db=db,
                            sub_id=subscription.id,
                        )
                    )
                except Exception as error:
                    uncertain_error = error
                    break
                if delivered:
                    break

            if consent_revoked:
                await finish_notification_dispatch(
                    db,
                    dispatch.id,
                    status="skipped",
                    error_code="consent_revoked",
                )
            elif uncertain_error is not None:
                await finish_notification_dispatch(
                    db,
                    dispatch.id,
                    status="reconciliation_required",
                    error_code="provider_outcome_unknown",
                )
                log_event(
                    logger,
                    "notification_delivery_uncertain",
                    level=logging.ERROR,
                    component="worker",
                    operation="notification_delivery",
                    outcome="uncertain",
                    purpose=purpose,
                    channel="push",
                    reason_code="provider_outcome_unknown",
                    **safe_exception_fields(uncertain_error),
                )
                push_failed += 1
            else:
                await finish_notification_dispatch(
                    db,
                    dispatch.id,
                    status="sent" if delivered else "failed",
                    error_code=None if delivered else "provider_rejected",
                )
                if delivered:
                    push_success += 1
                else:
                    push_failed += 1

    whatsapp_success = 0
    whatsapp_failed = 0
    await db.refresh(
        prefs,
        attribute_names=[
            PURPOSE_FIELDS[purpose],
            "whatsapp_enabled",
            "whatsapp_verified",
            "whatsapp_number",
        ],
    )
    if (
        getattr(prefs, PURPOSE_FIELDS[purpose])
        and prefs.whatsapp_enabled
        and prefs.whatsapp_verified
        and prefs.whatsapp_number
    ):
        dispatch = await claim_notification_dispatch(
            db,
            user_id=user_id,
            purpose=purpose,
            channel="whatsapp",
            destination_key="verified-account-number",
            dispatch_date=_dispatch_date(),
        )
        if dispatch is not None:
            try:
                delivered = await asyncio.to_thread(
                    send_whatsapp_message,
                    prefs.whatsapp_number,
                    whatsapp_body or f"{title} {body}",
                )
            except Exception as error:
                await finish_notification_dispatch(
                    db,
                    dispatch.id,
                    status="reconciliation_required",
                    error_code="provider_outcome_unknown",
                )
                log_event(
                    logger,
                    "notification_delivery_uncertain",
                    level=logging.ERROR,
                    component="worker",
                    operation="notification_delivery",
                    outcome="uncertain",
                    purpose=purpose,
                    channel="whatsapp",
                    reason_code="provider_outcome_unknown",
                    **safe_exception_fields(error),
                )
                whatsapp_failed = 1
            else:
                await finish_notification_dispatch(
                    db,
                    dispatch.id,
                    status="sent" if delivered else "failed",
                    error_code=None if delivered else "provider_rejected",
                )
                if delivered:
                    whatsapp_success = 1
                else:
                    whatsapp_failed = 1

    logger.info(
        "notification_delivery_finished purpose=%s push_success=%s push_failed=%s "
        "whatsapp_success=%s whatsapp_failed=%s",
        purpose,
        push_success,
        push_failed,
        whatsapp_success,
        whatsapp_failed,
    )
    return {
        "push_success": push_success,
        "push_failed": push_failed,
        "whatsapp_success": whatsapp_success,
        "whatsapp_failed": whatsapp_failed,
    }


async def send_spot_pushes(db: AsyncSession):
    push_success = 0
    push_failed = 0
    whatsapp_success = 0
    whatsapp_failed = 0
    for user_id in await _candidate_user_ids(db, "spot_reminder"):
        if await has_spotted_today(user_id, db):
            title = "Awareness recorded"
            body = "You recorded an Inner Caveman response today."
        else:
            title = "Spot check"
            body = "Did an automatic response show up today?"
        result = await _deliver_to_user(
            db,
            user_id=user_id,
            purpose="spot_reminder",
            title=title,
            body=body,
        )
        push_success += result["push_success"]
        push_failed += result["push_failed"]
        whatsapp_success += result["whatsapp_success"]
        whatsapp_failed += result["whatsapp_failed"]
    return {
        "push_success": push_success,
        "push_failed": push_failed,
        "whatsapp_success": whatsapp_success,
        "whatsapp_failed": whatsapp_failed,
    }


async def send_microchallenge_pushes(db: AsyncSession):
    push_success = 0
    push_failed = 0
    whatsapp_success = 0
    whatsapp_failed = 0
    for user_id in await _candidate_user_ids(db, "microchallenge"):
        if await has_logged_micro_today(user_id, db):
            title = "Experiment recorded"
            body = "You recorded today's practical experiment."
        else:
            title = "Your practical experiment"
            body = "Your current experiment is still open."
        result = await _deliver_to_user(
            db,
            user_id=user_id,
            purpose="microchallenge",
            title=title,
            body=body,
        )
        push_success += result["push_success"]
        push_failed += result["push_failed"]
        whatsapp_success += result["whatsapp_success"]
        whatsapp_failed += result["whatsapp_failed"]
    return {
        "push_success": push_success,
        "push_failed": push_failed,
        "whatsapp_success": whatsapp_success,
        "whatsapp_failed": whatsapp_failed,
    }


async def send_daily_nudge(db: AsyncSession):
    nudge = await get_random_active_nudge(db)
    title = nudge.title or "Inner Caveman reminder"
    body = nudge.quote or (
        nudge.paragraphs[0]
        if nudge.paragraphs
        else "Return to one useful idea from your Neurocient work."
    )
    message = f"*{title}*\n\n" + "\n\n".join(nudge.paragraphs or [])
    if nudge.quote:
        message += f"\n\n_{nudge.quote}_"

    push_success = 0
    push_failed = 0
    whatsapp_success = 0
    whatsapp_failed = 0
    for user_id in await _candidate_user_ids(db, "nudge"):
        result = await _deliver_to_user(
            db,
            user_id=user_id,
            purpose="nudge",
            title=title,
            body=body,
            whatsapp_body=message,
        )
        push_success += result["push_success"]
        push_failed += result["push_failed"]
        whatsapp_success += result["whatsapp_success"]
        whatsapp_failed += result["whatsapp_failed"]
    return {
        "nudge_id": str(nudge.id),
        "push_success": push_success,
        "push_failed": push_failed,
        "whatsapp_success": whatsapp_success,
        "whatsapp_failed": whatsapp_failed,
        "preview": {"title": title, "body": body},
    }
