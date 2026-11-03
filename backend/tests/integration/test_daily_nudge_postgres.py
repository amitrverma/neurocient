import asyncio
import os
from datetime import date
from uuid import uuid4

import pytest
from sqlalchemy import delete, func, select, update


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]


async def test_daily_nudge_selection_is_shared_and_durable():
    from app.database import AsyncSessionLocal, engine
    from app.helper.common import get_daily_active_nudge
    from app.models import BehavioralNudge, DailyNudgeSelection

    selection_date = date(2199, 1, 17)
    first_id = uuid4()
    second_id = uuid4()

    async with AsyncSessionLocal() as db:
        await db.execute(
            delete(DailyNudgeSelection).where(
                DailyNudgeSelection.selection_date == selection_date
            )
        )
        db.add_all(
            [
                BehavioralNudge(
                    id=first_id,
                    title="First nudge",
                    paragraphs=["First body"],
                    is_active=True,
                ),
                BehavioralNudge(
                    id=second_id,
                    title="Second nudge",
                    paragraphs=["Second body"],
                    is_active=True,
                ),
            ]
        )
        await db.commit()

    async def select_for_consumer():
        async with AsyncSessionLocal() as db:
            return await get_daily_active_nudge(db, selection_date=selection_date)

    try:
        dashboard_nudge, whatsapp_nudge = await asyncio.gather(
            select_for_consumer(),
            select_for_consumer(),
        )

        assert dashboard_nudge.id == whatsapp_nudge.id

        async with AsyncSessionLocal() as db:
            assert (
                await db.scalar(
                    select(func.count(DailyNudgeSelection.selection_date)).where(
                        DailyNudgeSelection.selection_date == selection_date
                    )
                )
            ) == 1
            await db.execute(
                update(BehavioralNudge)
                .where(BehavioralNudge.id == dashboard_nudge.id)
                .values(is_active=False)
            )
            await db.commit()

        async with AsyncSessionLocal() as db:
            later_nudge = await get_daily_active_nudge(
                db,
                selection_date=selection_date,
            )

        assert later_nudge.id == dashboard_nudge.id
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(DailyNudgeSelection).where(
                    DailyNudgeSelection.selection_date == selection_date
                )
            )
            await db.execute(
                delete(BehavioralNudge).where(
                    BehavioralNudge.id.in_([first_id, second_id])
                )
            )
            await db.commit()
        await engine.dispose()
