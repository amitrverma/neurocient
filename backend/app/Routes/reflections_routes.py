from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
import logging
import openai

from app.database import get_db
from app.models import (
    WeeklyReflection, User, IkeaWorksheet, IkeaTracker,
    MicrochallengeLog, MicrochallengeDefinition, UserMicrochallenge, CavemanSpot
)
from app.utils.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/weekly-reflection/generate")
async def generate_weekly_reflection(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = datetime.utcnow().date()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    worksheet_result = await db.execute(
        select(IkeaWorksheet).where(IkeaWorksheet.user_id == current_user.id).order_by(IkeaWorksheet.created_at.desc())
    )
    worksheet = worksheet_result.scalars().first()

    if not worksheet:
        raise HTTPException(status_code=404, detail="No IKEA worksheet found")

    tracker_result = await db.execute(
        select(IkeaTracker).where(
            IkeaTracker.worksheet_id == worksheet.id,
            IkeaTracker.date >= week_start,
            IkeaTracker.date <= week_end
        )
    )
    tracker_entries = tracker_result.scalars().all()

    mc_log_result = await db.execute(
        select(MicrochallengeLog, MicrochallengeDefinition)
        .join(UserMicrochallenge, MicrochallengeLog.assignment_id == UserMicrochallenge.id)
        .join(MicrochallengeDefinition, UserMicrochallenge.challenge_id == MicrochallengeDefinition.id)
        .where(
            UserMicrochallenge.user_id == current_user.id,
            MicrochallengeLog.log_date >= week_start,
            MicrochallengeLog.log_date <= week_end
        )
    )
    mc_logs = mc_log_result.all()

    spot_result = await db.execute(
        select(CavemanSpot).where(
            CavemanSpot.user_id == current_user.id,
            CavemanSpot.date >= week_start,
            CavemanSpot.date <= week_end
        )
    )
    spots = spot_result.scalars().all()

    prompt = f"""
Based only on the following logs, write a 4–6 sentence weekly reflection. Describe specific recurring situations, actions, and changes in direct, non-judgmental language. Explain automatic processing without giving it intention or agency. Do not diagnose the user or invent motives. If the evidence is limited, say so plainly.

Identity: {worksheet.identity}
Tiny Action: {worksheet.tiny_action}

Tracker Completions:
"""
    for t in tracker_entries:
        prompt += f"- {t.date.isoformat()}: {'✅' if t.completed else '❌'} {t.note or ''}\n"

    if mc_logs:
        prompt += "\nMicrochallenge Logs:\n"
        for log, defn in mc_logs:
            prompt += f"- Challenge: {defn.title}, Note: {log.note or 'no note'}\n"

    if spots:
        prompt += "\nCaveman Spots:\n"
        for spot in spots:
            prompt += f"- {spot.description}\n"

    prompt += "\nReflection:"

    try:
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        reflection_text = response.choices[0].message.content.strip()

    except Exception:
        logger.exception("Weekly reflection generation failed")
        raise HTTPException(
            status_code=500,
            detail="Could not generate this week's reflection",
        )

    reflection = WeeklyReflection(
        user_id=current_user.id,
        content=reflection_text,
        week_start=week_start,
        week_end=week_end
    )
    db.add(reflection)
    await db.commit()

    return {"reflection": reflection_text}


@router.get("/weekly-reflection/latest")
async def get_latest_weekly_reflection(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(WeeklyReflection)
        .where(WeeklyReflection.user_id == current_user.id)
        .order_by(WeeklyReflection.created_at.desc())
    )
    latest = result.scalars().first()

    if not latest:
        raise HTTPException(status_code=404, detail="No reflection found")

    return {
        "id": str(latest.id),
        "week_start": latest.week_start.isoformat(),
        "week_end": latest.week_end.isoformat(),
        "content": latest.content
    }
