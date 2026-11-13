import os
from datetime import date
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import HTTPException
from sqlalchemy import delete, select


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]


async def test_admin_nudge_create_list_update_audit_and_publication_lock(monkeypatch):
    from app.Routes import admin_nudge_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import (
        AdminAuditEvent,
        BehavioralNudge,
        DailyNudgeSelection,
        User,
    )

    actor_id = uuid4()
    test_date = date(2199, 2, 7)
    actor_record = User(
        id=actor_id,
        email=f"nudge-admin-{actor_id}@example.test",
        password_hash="not-used",
    )
    actor = SimpleNamespace(id=actor_id)
    nudge_id = None
    monkeypatch.setattr(admin_nudge_routes, "product_today", lambda: test_date)

    try:
        async with AsyncSessionLocal() as db:
            db.add(actor_record)
            await db.commit()

            created = await admin_nudge_routes.create_nudge(
                admin_nudge_routes.NudgeInput(
                    title="Integration nudge",
                    paragraphs=["Notice the automatic response."],
                    quote="Then decide.",
                    is_active=True,
                ),
                actor,
                db,
            )
            nudge_id = created["id"]
            response = await admin_nudge_routes.list_nudges(
                query="Integration nudge",
                state="all",
                page=1,
                page_size=25,
                _=actor,
                db=db,
            )
            assert response["total"] == 1
            assert response["items"][0]["whatsapp_preview"].endswith("Then decide.")

            db.add(
                DailyNudgeSelection(
                    selection_date=test_date,
                    nudge_id=nudge_id,
                )
            )
            await db.commit()

            selected_response = await admin_nudge_routes.list_nudges(
                query="does-not-match-the-selected-nudge",
                state="all",
                page=1,
                page_size=1,
                _=actor,
                db=db,
            )
            assert selected_response["items"] == []
            assert selected_response["today_selection"]["id"] == nudge_id
            assert selected_response["today_selection"]["title"] == "Integration nudge"

            with pytest.raises(HTTPException) as conflict:
                await admin_nudge_routes.update_nudge(
                    nudge_id,
                    admin_nudge_routes.NudgeInput(
                        title="Integration nudge",
                        paragraphs=["Changed after publication."],
                        quote="Then decide.",
                        is_active=True,
                    ),
                    actor,
                    db,
                )
            assert conflict.value.status_code == 409
            await db.rollback()

            updated = await admin_nudge_routes.update_nudge(
                nudge_id,
                admin_nudge_routes.NudgeInput(
                    title="Integration nudge",
                    paragraphs=["Notice the automatic response."],
                    quote="Then decide.",
                    is_active=False,
                ),
                actor,
                db,
            )
            assert updated["is_active"] is False
            assert updated["selected_today"] is True

            actions = list(
                (
                    await db.execute(
                        select(AdminAuditEvent.action)
                        .where(AdminAuditEvent.subject_id == nudge_id)
                        .order_by(AdminAuditEvent.created_at, AdminAuditEvent.id)
                    )
                ).scalars()
            )
            assert actions == ["nudge_created", "nudge_updated"]
    finally:
        async with AsyncSessionLocal() as db:
            if nudge_id:
                await db.execute(
                    delete(AdminAuditEvent).where(
                        AdminAuditEvent.subject_id == nudge_id
                    )
                )
            await db.execute(
                delete(DailyNudgeSelection).where(
                    DailyNudgeSelection.selection_date == test_date
                )
            )
            if nudge_id:
                await db.execute(
                    delete(BehavioralNudge).where(
                        BehavioralNudge.id == nudge_id
                    )
                )
            await db.execute(delete(User).where(User.id == actor_id))
            await db.commit()
        await engine.dispose()
