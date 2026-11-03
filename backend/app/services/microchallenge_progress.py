from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Literal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    MicrochallengeDefinition,
    MicrochallengeLog,
    UserMicrochallenge,
)
from app.services.product_clock import product_today, utcnow_naive


CHALLENGE_DURATION_DAYS = 21
CHALLENGE_SUCCESS_DAYS = 17
MicrochallengeOutcome = Literal["done", "partly", "not_today"]


@dataclass(frozen=True)
class CheckinResult:
    result: Literal["recorded", "already_recorded", "no_active", "ended"]
    assignment_id: UUID | None = None
    outcome: MicrochallengeOutcome | None = None
    status: str | None = None
    completed_days: int = 0


def progress_percent(completed_days: int) -> float:
    return min(100.0, round((completed_days / CHALLENGE_DURATION_DAYS) * 100, 1))


def final_status(started_at: datetime, completed_days: int, today: date) -> str:
    days_elapsed = (today - started_at.date()).days + 1
    if days_elapsed <= CHALLENGE_DURATION_DAYS:
        return "active"
    return "success" if completed_days >= CHALLENGE_SUCCESS_DAYS else "failed"


async def completed_days_for_assignment(db: AsyncSession, assignment_id: UUID) -> int:
    return int(
        await db.scalar(
            select(func.count(MicrochallengeLog.id)).where(
                MicrochallengeLog.assignment_id == assignment_id,
                MicrochallengeLog.outcome == "done",
            )
        )
        or 0
    )


async def active_microchallenge(
    db: AsyncSession,
    user_id,
) -> tuple[UserMicrochallenge, MicrochallengeDefinition] | None:
    result = await db.execute(
        select(UserMicrochallenge, MicrochallengeDefinition)
        .join(
            MicrochallengeDefinition,
            UserMicrochallenge.challenge_id == MicrochallengeDefinition.id,
        )
        .where(
            UserMicrochallenge.user_id == user_id,
            UserMicrochallenge.status == "active",
        )
    )
    rows = result.all()
    if len(rows) != 1:
        return None
    row = rows[0]
    assignment, _definition = row
    days_elapsed = (product_today() - assignment.started_at.date()).days + 1
    return row if 1 <= days_elapsed <= CHALLENGE_DURATION_DAYS else None


async def record_checkin(
    db: AsyncSession,
    *,
    user_id,
    outcome: MicrochallengeOutcome,
    assignment_id: UUID | None = None,
    note: str = "",
    today: date | None = None,
) -> CheckinResult:
    current_day = today or product_today()
    statement = select(UserMicrochallenge).where(
        UserMicrochallenge.user_id == user_id,
        UserMicrochallenge.status == "active",
    )
    if assignment_id is not None:
        statement = statement.where(UserMicrochallenge.id == assignment_id)
    assignment = await db.scalar(statement.with_for_update())
    if assignment is None:
        return CheckinResult(result="no_active")

    completed_days = await completed_days_for_assignment(db, assignment.id)
    status = final_status(assignment.started_at, completed_days, current_day)
    if status != "active":
        assignment.status = status
        assignment.completed_at = utcnow_naive()
        return CheckinResult(
            result="ended",
            assignment_id=assignment.id,
            status=status,
            completed_days=completed_days,
        )

    inserted = await db.execute(
        insert(MicrochallengeLog)
        .values(
            assignment_id=assignment.id,
            log_date=current_day,
            outcome=outcome,
            note=note,
            created_at=utcnow_naive(),
        )
        .on_conflict_do_nothing(
            constraint="uq_assignment_log_date",
        )
        .returning(MicrochallengeLog.id)
    )
    if inserted.scalar_one_or_none() is None:
        existing_outcome = await db.scalar(
            select(MicrochallengeLog.outcome).where(
                MicrochallengeLog.assignment_id == assignment.id,
                MicrochallengeLog.log_date == current_day,
            )
        )
        return CheckinResult(
            result="already_recorded",
            assignment_id=assignment.id,
            outcome=existing_outcome or "done",
            status=assignment.status,
            completed_days=completed_days,
        )

    if outcome == "done":
        completed_days += 1
    return CheckinResult(
        result="recorded",
        assignment_id=assignment.id,
        outcome=outcome,
        status=assignment.status,
        completed_days=completed_days,
    )


async def add_obstacle_note(
    db: AsyncSession,
    *,
    user_id,
    note: str,
    today: date | None = None,
) -> bool:
    current_day = today or product_today()
    log = await db.scalar(
        select(MicrochallengeLog)
        .join(
            UserMicrochallenge,
            MicrochallengeLog.assignment_id == UserMicrochallenge.id,
        )
        .where(
            UserMicrochallenge.user_id == user_id,
            UserMicrochallenge.status == "active",
            MicrochallengeLog.log_date == current_day,
            MicrochallengeLog.outcome.in_(["partly", "not_today"]),
            func.coalesce(MicrochallengeLog.note, "") == "",
        )
        .with_for_update()
    )
    if log is None:
        return False
    log.note = note
    return True
