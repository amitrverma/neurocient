from datetime import date

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import BehavioralNudge, DailyNudgeSelection
from app.services.product_clock import product_today


def _selected_nudge_statement(selection_date: date):
    return (
        select(BehavioralNudge)
        .join(
            DailyNudgeSelection,
            DailyNudgeSelection.nudge_id == BehavioralNudge.id,
        )
        .where(DailyNudgeSelection.selection_date == selection_date)
    )


async def get_daily_active_nudge(
    db: AsyncSession,
    *,
    selection_date: date | None = None,
) -> BehavioralNudge:
    """Return the durable nudge shared by web and outbound channels today."""
    current_date = selection_date or product_today()
    selected = await db.scalar(_selected_nudge_statement(current_date))
    if selected is not None:
        return selected

    candidate = await db.scalar(
        select(BehavioralNudge)
        .where(BehavioralNudge.is_active.is_(True))
        .order_by(func.random())
        .limit(1)
    )
    if candidate is None:
        raise HTTPException(status_code=404, detail="No active nudges available")

    await db.execute(
        insert(DailyNudgeSelection)
        .values(selection_date=current_date, nudge_id=candidate.id)
        .on_conflict_do_nothing(
            index_elements=[DailyNudgeSelection.selection_date],
        )
    )
    await db.commit()

    selected = await db.scalar(_selected_nudge_statement(current_date))
    if selected is None:
        raise RuntimeError("Daily nudge selection could not be resolved")
    return selected
