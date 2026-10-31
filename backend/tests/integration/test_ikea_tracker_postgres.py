import os
from datetime import date
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import delete, select


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]


async def test_tracker_authorization_and_persistence_on_postgres(monkeypatch):
    from app.Routes import ikea_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import IkeaTracker, IkeaWorksheet, User
    from app.utils.auth import create_access_token

    owner_id = uuid4()
    other_owner_id = uuid4()
    owner_worksheet_id = uuid4()
    other_worksheet_id = uuid4()
    nonexistent_worksheet_id = uuid4()
    test_date = date(2026, 10, 31)

    app = FastAPI()
    app.include_router(ikea_routes.router, prefix="/api")
    monkeypatch.setattr(ikea_routes, "track_event", lambda *args, **kwargs: None)

    async with AsyncSessionLocal() as session:
        session.add_all(
            [
                User(id=owner_id, email=f"owner-{owner_id}@example.test"),
                User(id=other_owner_id, email=f"other-{other_owner_id}@example.test"),
                IkeaWorksheet(
                    id=owner_worksheet_id,
                    user_id=owner_id,
                    struggle="Integration verification",
                    identity="Owner",
                    knowledge="Authorization belongs at the query boundary",
                    environment={"source": "integration-test"},
                    tiny_action="Run the test",
                ),
                IkeaWorksheet(
                    id=other_worksheet_id,
                    user_id=other_owner_id,
                    struggle="Other owner",
                    identity="Other",
                    knowledge="Private",
                    environment={"source": "integration-test"},
                    tiny_action="Remain private",
                ),
            ]
        )
        await session.commit()

    owner_headers = {
        "Authorization": f"Bearer {create_access_token({'sub': str(owner_id)})}"
    }
    transport = httpx.ASGITransport(app=app)

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            for method, suffix, body in (
                ("GET", "history", None),
                ("POST", "toggle", {"date": test_date.isoformat()}),
                ("POST", "note", {"date": test_date.isoformat(), "note": "private"}),
            ):
                anonymous = await client.request(
                    method,
                    f"/api/ikea/tracker/{owner_worksheet_id}/{suffix}",
                    json=body,
                )
                assert anonymous.status_code == 401

                wrong_owner = await client.request(
                    method,
                    f"/api/ikea/tracker/{other_worksheet_id}/{suffix}",
                    headers=owner_headers,
                    json=body,
                )
                assert wrong_owner.status_code == 404
                assert wrong_owner.json() == {"detail": "Worksheet not found"}

                nonexistent = await client.request(
                    method,
                    f"/api/ikea/tracker/{nonexistent_worksheet_id}/{suffix}",
                    headers=owner_headers,
                    json=body,
                )
                assert nonexistent.status_code == wrong_owner.status_code
                assert nonexistent.json() == wrong_owner.json()

            async with AsyncSessionLocal() as session:
                denied_entries = (
                    await session.scalars(
                        select(IkeaTracker).where(
                            IkeaTracker.worksheet_id.in_(
                                [owner_worksheet_id, other_worksheet_id]
                            ),
                            IkeaTracker.date == test_date,
                        )
                    )
                ).all()
                assert denied_entries == []

            toggled = await client.post(
                f"/api/ikea/tracker/{owner_worksheet_id}/toggle",
                headers=owner_headers,
                json={"date": test_date.isoformat()},
            )
            assert toggled.status_code == 200
            assert toggled.json() == {"completed": True}

            noted = await client.post(
                f"/api/ikea/tracker/{owner_worksheet_id}/note",
                headers=owner_headers,
                json={"date": test_date.isoformat(), "note": "Persisted privately"},
            )
            assert noted.status_code == 200

            history = await client.get(
                f"/api/ikea/tracker/{owner_worksheet_id}/history",
                headers=owner_headers,
            )
            assert history.status_code == 200
            assert history.json() == [
                {
                    "date": test_date.isoformat(),
                    "completed": True,
                    "note": "Persisted privately",
                }
            ]

        async with AsyncSessionLocal() as session:
            owner_entry = await session.scalar(
                select(IkeaTracker).where(
                    IkeaTracker.worksheet_id == owner_worksheet_id,
                    IkeaTracker.date == test_date,
                )
            )
            forbidden_entry = await session.scalar(
                select(IkeaTracker).where(
                    IkeaTracker.worksheet_id == other_worksheet_id,
                    IkeaTracker.date == test_date,
                )
            )
            assert owner_entry is not None
            assert owner_entry.completed is True
            assert owner_entry.note == "Persisted privately"
            assert forbidden_entry is None
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(
                delete(IkeaTracker).where(
                    IkeaTracker.worksheet_id.in_(
                        [owner_worksheet_id, other_worksheet_id]
                    )
                )
            )
            await session.execute(
                delete(IkeaWorksheet).where(
                    IkeaWorksheet.id.in_([owner_worksheet_id, other_worksheet_id])
                )
            )
            await session.execute(
                delete(User).where(User.id.in_([owner_id, other_owner_id]))
            )
            await session.commit()
        await engine.dispose()
