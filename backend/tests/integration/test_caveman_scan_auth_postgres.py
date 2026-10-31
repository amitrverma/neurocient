import os
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import delete, func, select


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]


async def test_scan_routes_share_durable_session_enforcement():
    from app.Routes import caveman_scan_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import AuthSession, CavemanScanSession, User
    from app.utils.auth import create_access_token, create_refresh_token, issue_session

    user_id = uuid4()
    email = f"scan-security-{user_id}@example.test"
    now = datetime.now(UTC).replace(tzinfo=None)
    owned = CavemanScanSession(
        user_id=user_id,
        scan_version="v1",
        scoring_version="v1",
        report_version="v1",
        status="completed",
        scenario_ids=["scenario-1"],
        responses=[{"scenarioId": "scenario-1", "answer": "a"}],
        evidence={"private": True},
        portrait={"private": "portrait"},
        completed_at=now,
    )
    linkable = CavemanScanSession(
        scan_version="v1",
        scoring_version="v1",
        report_version="v1",
        scenario_ids=["scenario-2"],
    )
    revoked_link_target = CavemanScanSession(
        scan_version="v1",
        scoring_version="v1",
        report_version="v1",
        scenario_ids=["scenario-3"],
    )

    async with AsyncSessionLocal() as session:
        session.add(User(id=user_id, email=email))
        session.add_all([owned, linkable, revoked_link_target])
        await session.commit()
        tokens = await issue_session(session, user_id)

    app = FastAPI()
    app.include_router(caveman_scan_routes.router, prefix="/api")
    transport = httpx.ASGITransport(app=app)
    access_cookie = {"Cookie": f"access_token={tokens.access}"}

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            latest = await client.get(
                "/api/caveman-scan/sessions/latest",
                headers=access_cookie,
            )
            assert latest.status_code == 200
            assert latest.json()["portrait"] == {"private": "portrait"}

            read = await client.get(
                f"/api/caveman-scan/sessions/{owned.id}",
                params={"access_token": str(owned.access_token)},
                headers=access_cookie,
            )
            assert read.status_code == 200

            update = await client.put(
                f"/api/caveman-scan/sessions/{owned.id}",
                headers=access_cookie,
                json={
                    "accessToken": str(owned.access_token),
                    "status": "completed",
                    "responses": owned.responses,
                    "evidence": {"private": True},
                    "portrait": {"private": "updated"},
                },
            )
            assert update.status_code == 200

            linked = await client.post(
                f"/api/caveman-scan/sessions/{linkable.id}/link",
                headers=access_cookie,
                json={"accessToken": str(linkable.access_token)},
            )
            assert linked.status_code == 200

            for invalid_token in (
                create_access_token({"sub": str(user_id)}),
                create_refresh_token(str(user_id)),
            ):
                invalid = await client.get(
                    "/api/caveman-scan/sessions/latest",
                    headers={"Cookie": f"access_token={invalid_token}"},
                )
                assert invalid.status_code == 401

            async with AsyncSessionLocal() as session:
                auth_session = await session.get(AuthSession, tokens.session_id)
                auth_session.revoked_at = now + timedelta(seconds=1)
                auth_session.revocation_reason = "test_revocation"
                await session.commit()
                before_count = await session.scalar(
                    select(func.count(CavemanScanSession.id))
                )

            revoked_requests = [
                await client.post(
                    "/api/caveman-scan/sessions",
                    headers=access_cookie,
                    json={
                        "scan_version": "v1",
                        "scoring_version": "v1",
                        "report_version": "v1",
                        "scenario_ids": ["blocked-create"],
                    },
                ),
                await client.get(
                    "/api/caveman-scan/sessions/latest",
                    headers=access_cookie,
                ),
                await client.put(
                    f"/api/caveman-scan/sessions/{owned.id}",
                    headers=access_cookie,
                    json={
                        "accessToken": str(owned.access_token),
                        "status": "completed",
                        "responses": owned.responses,
                        "portrait": {"private": "forbidden"},
                    },
                ),
                await client.post(
                    f"/api/caveman-scan/sessions/{revoked_link_target.id}/link",
                    headers=access_cookie,
                    json={"accessToken": str(revoked_link_target.access_token)},
                ),
                await client.get(
                    f"/api/caveman-scan/sessions/{owned.id}",
                    params={"access_token": str(owned.access_token)},
                    headers=access_cookie,
                ),
            ]
            assert [response.status_code for response in revoked_requests] == [
                401,
                401,
                401,
                401,
                401,
            ]

            async with AsyncSessionLocal() as session:
                assert await session.scalar(
                    select(func.count(CavemanScanSession.id))
                ) == before_count
                persisted = await session.get(CavemanScanSession, owned.id)
                assert persisted.portrait == {"private": "updated"}
                untouched = await session.get(
                    CavemanScanSession,
                    revoked_link_target.id,
                )
                assert untouched.user_id is None
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(
                delete(CavemanScanSession).where(
                    CavemanScanSession.id.in_(
                        [owned.id, linkable.id, revoked_link_target.id]
                    )
                )
            )
            await session.execute(
                delete(AuthSession).where(AuthSession.user_id == user_id)
            )
            await session.execute(delete(User).where(User.id == user_id))
            await session.commit()
        await engine.dispose()
