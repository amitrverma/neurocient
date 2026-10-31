from datetime import datetime, timedelta
import logging

import openai
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    CavemanSpot, IkeaTracker, IkeaWorksheet, MicrochallengeDefinition,
    MicrochallengeLog, User, UserMicrochallenge, WeeklyReflection,
)
from app.services.rate_limits import enforce, enforce_ip
from app.utils.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


async def enforce_reflection_ip(request: Request) -> None:
    await enforce_ip(request, "reflection_ip")


@router.post(
    "/weekly-reflection/generate",
    dependencies=[Depends(enforce_reflection_ip)],
)
async def generate_weekly_reflection(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = datetime.utcnow().date()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    # Serialize this user's path so concurrent requests cannot multiply provider spend.
    await db.execute(select(User.id).where(User.id == current_user.id).with_for_update())
    existing = await db.scalar(select(WeeklyReflection).where(
        WeeklyReflection.user_id == current_user.id,
        WeeklyReflection.week_start == week_start,
    ))
    if existing:
        await db.commit()
        return {"reflection": existing.content}

    await enforce(db, [("reflection_user", str(current_user.id))])

    worksheet = (await db.execute(
        select(IkeaWorksheet).where(IkeaWorksheet.user_id == current_user.id)
        .order_by(IkeaWorksheet.created_at.desc())
    )).scalars().first()
    if not worksheet:
        raise HTTPException(status_code=404, detail="No IKEA worksheet found")

    tracker_entries = (await db.execute(
        select(IkeaTracker).where(
            IkeaTracker.worksheet_id == worksheet.id,
            IkeaTracker.date >= week_start,
            IkeaTracker.date <= week_end,
        ).order_by(IkeaTracker.date.asc()).limit(100)
    )).scalars().all()
    mc_logs = (await db.execute(
        select(MicrochallengeLog, MicrochallengeDefinition)
        .join(UserMicrochallenge, MicrochallengeLog.assignment_id == UserMicrochallenge.id)
        .join(MicrochallengeDefinition, UserMicrochallenge.challenge_id == MicrochallengeDefinition.id)
        .where(
            UserMicrochallenge.user_id == current_user.id,
            MicrochallengeLog.log_date >= week_start,
            MicrochallengeLog.log_date <= week_end,
        ).order_by(MicrochallengeLog.log_date.asc(), MicrochallengeLog.id.asc()).limit(100)
    )).all()
    spots = (await db.execute(
        select(CavemanSpot).where(
            CavemanSpot.user_id == current_user.id,
            CavemanSpot.date >= week_start,
            CavemanSpot.date <= week_end,
        ).order_by(CavemanSpot.date.asc(), CavemanSpot.id.asc()).limit(100)
    )).scalars().all()

    prompt = (
        "Based only on the following logs, write a 4-6 sentence weekly reflection. "
        "Describe specific recurring situations, actions, and changes in direct, "
        "non-judgmental language. Explain automatic processing without giving it "
        "intention or agency. Do not diagnose the user or invent motives. If the "
        "evidence is limited, say so plainly.\n\n"
        f"Identity: {(worksheet.identity or '')[:1000]}\n"
        f"Tiny Action: {(worksheet.tiny_action or '')[:1000]}\n\nTracker Completions:\n"
    )
    for entry in tracker_entries[:100]:
        prompt += f"- {entry.date.isoformat()}: {'yes' if entry.completed else 'no'} {(entry.note or '')[:500]}\n"
    if mc_logs:
        prompt += "\nMicrochallenge Logs:\n"
        for log, definition in mc_logs[:100]:
            prompt += f"- Challenge: {(definition.title or '')[:300]}, Note: {(log.note or 'no note')[:500]}\n"
    if spots:
        prompt += "\nCaveman Spots:\n"
        for spot in spots[:100]:
            prompt += f"- {(spot.description or '')[:500]}\n"
    prompt = prompt[:12_000] + "\nReflection:"

    # The calendar-week key makes provider spend one-shot even after a timeout,
    # where it is unknowable whether the provider completed the request.
    await enforce(
        db,
        [("reflection_provider", f"{current_user.id}:{week_start.isoformat()}")],
    )

    try:
        client = openai.AsyncOpenAI(timeout=15.0)
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
        )
        reflection_text = (response.choices[0].message.content or "").strip()
        if not reflection_text:
            raise ValueError("empty provider response")
    except Exception:
        logger.warning("Weekly reflection provider call failed", exc_info=False)
        raise HTTPException(status_code=502, detail="Could not generate this week's reflection")

    db.add(WeeklyReflection(
        user_id=current_user.id,
        content=reflection_text,
        week_start=week_start,
        week_end=week_end,
    ))
    await db.commit()
    return {"reflection": reflection_text}


@router.get("/weekly-reflection/latest")
async def get_latest_weekly_reflection(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    latest = (await db.execute(
        select(WeeklyReflection).where(WeeklyReflection.user_id == current_user.id)
        .order_by(WeeklyReflection.created_at.desc())
    )).scalars().first()
    if not latest:
        raise HTTPException(status_code=404, detail="No reflection found")
    return {
        "id": str(latest.id), "week_start": latest.week_start.isoformat(),
        "week_end": latest.week_end.isoformat(), "content": latest.content,
    }
