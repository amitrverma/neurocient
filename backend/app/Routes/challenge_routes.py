# app/routers/microchallenges.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database import get_db
from app.models import (
    MicrochallengeDefinition,
    UserMicrochallenge,
    MicrochallengeLog,
    User,
)
from datetime import datetime, date
from uuid import UUID
from app.utils.auth import get_current_user
from pydantic import BaseModel
from typing import Optional
from app.analytics.posthog_client import track_event
from app.services.membership import (
    has_active_membership,
    lock_account_access,
    membership_required_detail,
)

router = APIRouter()

CHALLENGE_DURATION_DAYS = 21
CHALLENGE_SUCCESS_DAYS = 17
FREE_MICROCHALLENGE_LIMIT = 5

# ----------------------
# Helpers
# ----------------------

def serialize_datetime(dt):
    return dt.isoformat() if dt else None

def serialize_date(d):
    return d.isoformat() if d else None


def progress_percent(completed_days: int) -> float:
    return min(
        100.0,
        round((completed_days / CHALLENGE_DURATION_DAYS) * 100, 1),
    )


def final_status(started_at: datetime, completed_days: int, today: date) -> str:
    days_elapsed = (today - started_at.date()).days + 1
    if days_elapsed <= CHALLENGE_DURATION_DAYS:
        return "active"
    return "success" if completed_days >= CHALLENGE_SUCCESS_DAYS else "failed"

# ----------------------
# Challenge Catalog
# ----------------------

@router.get("/all")
async def list_all_challenges(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MicrochallengeDefinition).order_by(MicrochallengeDefinition.created_at)
    )
    challenges = result.scalars().all()
    return [
        {"id": str(c.id), "title": c.title, "intro": c.intro}
        for c in challenges
    ]


# ----------------------
# Assignments
# ----------------------

@router.post("/assign/{challenge_id}")
async def assign_microchallenge(
    challenge_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await lock_account_access(db, current_user.id)
    if not await has_active_membership(db, current_user.id):
        count_result = await db.execute(
            select(func.count(UserMicrochallenge.id)).where(
                UserMicrochallenge.user_id == current_user.id,
            )
        )
        if (count_result.scalar() or 0) >= FREE_MICROCHALLENGE_LIMIT:
            raise HTTPException(
                status_code=402,
                detail=membership_required_detail(
                    "microchallenges",
                    FREE_MICROCHALLENGE_LIMIT,
                ),
            )

    # Ensure no other active challenge
    result = await db.execute(
        select(UserMicrochallenge).where(
            UserMicrochallenge.user_id == current_user.id,
            UserMicrochallenge.status == "active",
        )
    )
    active = result.scalar_one_or_none()
    if active:
        raise HTTPException(status_code=400, detail="You already have an active challenge")

    # Ensure challenge exists
    result = await db.execute(
        select(MicrochallengeDefinition).where(MicrochallengeDefinition.id == challenge_id)
    )
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Create assignment
    mapping = UserMicrochallenge(
        user_id=current_user.id,
        challenge_id=challenge_id,
        status="active",
        started_at=datetime.utcnow(),
    )
    db.add(mapping)
    await db.commit()
    await db.refresh(mapping)

    track_event(str(current_user.id), "challenge_assigned", {"challenge_id": str(challenge_id)})

    return {
        "assignment_id": str(mapping.id),
        "challenge_id": str(mapping.challenge_id),
        "status": mapping.status,
        "started_at": serialize_datetime(mapping.started_at),
    }


@router.get("/active")
async def get_active_assignment(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(UserMicrochallenge, MicrochallengeDefinition)
        .join(MicrochallengeDefinition, UserMicrochallenge.challenge_id == MicrochallengeDefinition.id)
        .where(
            UserMicrochallenge.user_id == current_user.id,
            UserMicrochallenge.status == "active",
        )
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="No active challenge")
    um, mc = row
    return {
        "assignment_id": str(um.id),
        "status": um.status,
        "started_at": serialize_datetime(um.started_at),
        "completed_at": serialize_datetime(um.completed_at),
        "challenge": {
            "id": str(mc.id),
            "title": mc.title,
            "intro": mc.intro,
            "instructions": mc.instructions,
            "why": mc.why,
            "tips": mc.tips,
            "closing": mc.closing,
        },
    }


@router.post("/remove/{assignment_id}")
async def remove_assignment(
    assignment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(UserMicrochallenge).where(
            UserMicrochallenge.id == assignment_id,
            UserMicrochallenge.user_id == current_user.id,
            UserMicrochallenge.status == "active",
        )
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Active challenge not found")

    assignment.status = "removed"
    assignment.completed_at = datetime.utcnow()
    db.add(assignment)
    await db.commit()
    return {"message": "Challenge removed"}


# 🔹 Get my assigned challenges
@router.get("/my")
async def my_microchallenges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(UserMicrochallenge, MicrochallengeDefinition)
        .join(MicrochallengeDefinition, UserMicrochallenge.challenge_id == MicrochallengeDefinition.id)
        .where(UserMicrochallenge.user_id == current_user.id)
    )

    rows = result.all()
    response = []

    status_changed = False
    for um, mc in rows:
        # fetch logs for this assignment
        logs_result = await db.execute(
            select(MicrochallengeLog).where(MicrochallengeLog.assignment_id == um.id)
        )
        logs = logs_result.scalars().all()
        progress = progress_percent(len(logs))

        outcome = final_status(um.started_at, len(logs), date.today())
        if um.status == "active" and outcome != "active":
            um.status = outcome
            um.completed_at = datetime.utcnow()
            db.add(um)
            status_changed = True

        response.append({
            # assignment fields
            "assignment_id": str(um.id),
            "challenge_id": str(um.challenge_id),
            "status": um.status,
            "started_at": um.started_at.isoformat() if um.started_at else None,
            "completed_at": um.completed_at.isoformat() if um.completed_at else None,

            # definition fields
            "title": mc.title,
            "intro": mc.intro or [],
            "instructions": mc.instructions or [],
            "why": mc.why,
            "tips": mc.tips or [],
            "closing": mc.closing,

            # progress percentage only
            "progress": progress,
            "logged_today": any(log.log_date == date.today() for log in logs),
        })

    if status_changed:
        await db.commit()

    return response


# ----------------------
# Logging & Progress
# ----------------------

class LogTodayRequest(BaseModel):
    assignment_id: UUID
    note: Optional[str] = ""


@router.post("/log")
async def log_today(
    payload: LogTodayRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    # validate assignment
    result = await db.execute(
        select(UserMicrochallenge).where(
            UserMicrochallenge.id == payload.assignment_id,
            UserMicrochallenge.user_id == current_user.id,
            UserMicrochallenge.status == "active",
        )
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Active assignment not found")

    days_elapsed = (today - assignment.started_at.date()).days + 1
    if days_elapsed > CHALLENGE_DURATION_DAYS:
        logs_result = await db.execute(
            select(MicrochallengeLog).where(
                MicrochallengeLog.assignment_id == payload.assignment_id,
            )
        )
        logs = logs_result.scalars().all()
        assignment.status = final_status(assignment.started_at, len(logs), today)
        assignment.completed_at = datetime.utcnow()
        db.add(assignment)
        await db.commit()
        raise HTTPException(
            status_code=409,
            detail={
                "code": "challenge_ended",
                "message": "This 21-day experiment has ended.",
                "status": assignment.status,
            },
        )

    # prevent duplicate log
    result = await db.execute(
        select(MicrochallengeLog).where(
            MicrochallengeLog.assignment_id == payload.assignment_id,
            MicrochallengeLog.log_date == today,
        )
    )
    if result.scalar_one_or_none():
        logs_result = await db.execute(
            select(MicrochallengeLog).where(
                MicrochallengeLog.assignment_id == payload.assignment_id
            )
        )
        progress = progress_percent(len(logs_result.scalars().all()))
        return {
            "message": "Already logged today",
            "progress": progress,
            "status": assignment.status,
            "completed_at": assignment.completed_at,
        }

    # insert new log
    new_log = MicrochallengeLog(
        assignment_id=payload.assignment_id,
        log_date=today,
        note=payload.note or "",
        created_at=datetime.utcnow(),
    )
    db.add(new_log)
    await db.commit()

    # count logs for progress
    logs_result = await db.execute(
        select(MicrochallengeLog).where(MicrochallengeLog.assignment_id == payload.assignment_id)
    )
    logs = logs_result.scalars().all()
    progress = progress_percent(len(logs))

    track_event(str(current_user.id), "challenge_logged", {"assignment_id": str(payload.assignment_id)})

    return {
        "message": "Log successful",
        "progress": progress,
        "status": assignment.status,
        "completed_at": assignment.completed_at,
    }




@router.get("/progress/{assignment_id}")
async def get_progress(
    assignment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify assignment
    result = await db.execute(
        select(UserMicrochallenge).where(
            UserMicrochallenge.id == assignment_id,
            UserMicrochallenge.user_id == current_user.id,
        )
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Fetch logs
    result = await db.execute(
        select(MicrochallengeLog).where(MicrochallengeLog.assignment_id == assignment_id)
    )
    logs = result.scalars().all()

    completed_days = len(logs)
    days_elapsed = (date.today() - assignment.started_at.date()).days + 1
    ratio = (
        completed_days / CHALLENGE_DURATION_DAYS
        if days_elapsed > CHALLENGE_DURATION_DAYS
        else completed_days / max(days_elapsed, 1)
    )

    # Update status if challenge has ended
    status = assignment.status
    if status == "active" and days_elapsed > CHALLENGE_DURATION_DAYS:
        status = final_status(assignment.started_at, completed_days, date.today())
        assignment.status = status
        assignment.completed_at = datetime.utcnow()
        db.add(assignment)
        await db.commit()

    return {
        "assignment_id": str(assignment.id),
        "status": status,
        "completed_days": completed_days,
        "days_elapsed": days_elapsed,
        "success_ratio": round(ratio * 100, 1),
        "started_at": serialize_datetime(assignment.started_at),
        "completed_at": serialize_datetime(assignment.completed_at),
        "notes": [{"date": serialize_date(log.log_date), "note": log.note or ""} for log in logs],
    }

# ----------------------
# Get Challenge (catch-all, must be last!)
# ----------------------

@router.get("/{challenge_id}")
async def get_challenge(challenge_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MicrochallengeDefinition).where(MicrochallengeDefinition.id == challenge_id)
    )
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    return {
        "id": str(challenge.id),
        "title": challenge.title,
        "intro": challenge.intro,
        "instructions": challenge.instructions,
        "why": challenge.why,
        "tips": challenge.tips,
        "closing": challenge.closing,
        "created_at": serialize_datetime(challenge.created_at),
    }

