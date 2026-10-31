import asyncio
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


async def test_article_access_is_authoritative_idempotent_and_concurrency_safe():
    from app.Routes import article_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import ArticleAccessGrant, MembershipEntitlement, User
    from app.utils.auth import create_access_token, create_refresh_token

    user_id = uuid4()
    guest_id = uuid4()
    invalid_guest_id = uuid4()
    app = FastAPI()
    app.include_router(article_routes.router, prefix="/articles")
    transport = httpx.ASGITransport(app=app)
    access_header = {
        article_routes.ARTICLE_ACCESS_REQUEST_HEADER: "insight-page",
    }

    async with AsyncSessionLocal() as session:
        session.add(User(id=user_id, email=f"member-{user_id}@example.test"))
        await session.flush()
        session.add_all(
            ArticleAccessGrant(
                user_id=user_id,
                article_slug=f"account-existing-{index}",
            )
            for index in range(article_routes.ACCOUNT_ARTICLE_LIMIT)
        )
        session.add(
            MembershipEntitlement(
                user_id=user_id,
                status="canceled",
                current_period_end=datetime.now(UTC).replace(tzinfo=None)
                + timedelta(days=7),
            )
        )
        await session.commit()

    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            direct_request = await client.post("/articles/first/access")
            assert direct_request.status_code == 403

            missing_identity = await client.post(
                "/articles/first/access",
                headers=access_header,
            )
            assert missing_identity.status_code == 400
            assert missing_identity.json()["detail"]["code"] == "guest_identity_required"

            invalid_identity = await client.post(
                "/articles/first/access",
                headers={**access_header, "Cookie": "guest_access_id=invalid"},
            )
            assert invalid_identity.status_code == 400

            guest_headers = {
                **access_header,
                "Cookie": f"guest_access_id={guest_id}",
            }
            for index in range(article_routes.GUEST_ARTICLE_LIMIT - 1):
                response = await client.post(
                    f"/articles/guest-{index}/access",
                    headers=guest_headers,
                )
                assert response.status_code == 200

            contested = await asyncio.gather(
                client.post("/articles/guest-last-a/access", headers=guest_headers),
                client.post("/articles/guest-last-b/access", headers=guest_headers),
            )
            assert sorted(response.status_code for response in contested) == [200, 402]
            granted_slug = "guest-last-a" if contested[0].status_code == 200 else "guest-last-b"
            revisit = await client.post(
                f"/articles/{granted_slug}/access",
                headers=guest_headers,
            )
            assert revisit.status_code == 200
            denied = next(response for response in contested if response.status_code == 402)
            assert denied.json()["detail"]["code"] == "account_required"
            assert denied.json()["detail"]["next_action"] == "sign_in"

            account_headers = {
                **access_header,
                "Authorization": f"Bearer {create_access_token({'sub': str(user_id)})}"
            }
            canceled = await client.post(
                "/articles/account-new/access",
                headers=account_headers,
            )
            assert canceled.status_code == 402
            assert canceled.json()["detail"]["next_action"] == "membership"

            refresh_headers = {
                **access_header,
                "Authorization": f"Bearer {create_refresh_token(str(user_id))}",
                "Cookie": f"guest_access_id={invalid_guest_id}",
            }
            refresh = await client.post(
                "/articles/refresh-token/access",
                headers=refresh_headers,
            )
            assert refresh.status_code == 401

            refresh_cookie_only = await client.post(
                "/articles/refresh-cookie/access",
                headers={
                    **access_header,
                    "Cookie": (
                        f"guest_access_id={invalid_guest_id}; "
                        f"refresh_token={create_refresh_token(str(user_id))}; "
                        "session_present=1"
                    ),
                },
            )
            assert refresh_cookie_only.status_code == 401

            invalid_bearer = await client.post(
                "/articles/invalid-bearer/access",
                headers={
                    **access_header,
                    "Authorization": "Bearer invalid-token",
                    "Cookie": f"guest_access_id={invalid_guest_id}",
                },
            )
            assert invalid_bearer.status_code == 401

            malformed_subject_headers = {
                **access_header,
                "Authorization": (
                    "Bearer "
                    f"{create_access_token({'sub': 'not-a-user-id'})}"
                ),
                "Cookie": f"guest_access_id={invalid_guest_id}",
            }
            malformed_subject = await client.post(
                "/articles/malformed-subject/access",
                headers=malformed_subject_headers,
            )
            assert malformed_subject.status_code == 401

            async with AsyncSessionLocal() as session:
                entitlement = await session.get(MembershipEntitlement, user_id)
                entitlement.status = "active"
                entitlement.current_period_end = (
                    datetime.now(UTC).replace(tzinfo=None) + timedelta(days=7)
                )
                await session.commit()

            active = await client.post(
                "/articles/account-new/access",
                headers=account_headers,
            )
            assert active.status_code == 200
            assert active.json() == {
                "granted": True,
                "membership_active": True,
                "remaining": None,
            }

        async with AsyncSessionLocal() as session:
            guest_count = await session.scalar(
                select(func.count(ArticleAccessGrant.id)).where(
                    ArticleAccessGrant.guest_id == guest_id
                )
            )
            account_count = await session.scalar(
                select(func.count(ArticleAccessGrant.id)).where(
                    ArticleAccessGrant.user_id == user_id
                )
            )
            invalid_guest_count = await session.scalar(
                select(func.count(ArticleAccessGrant.id)).where(
                    ArticleAccessGrant.guest_id == invalid_guest_id
                )
            )
            assert guest_count == article_routes.GUEST_ARTICLE_LIMIT
            assert account_count == article_routes.ACCOUNT_ARTICLE_LIMIT
            assert invalid_guest_count == 0
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(
                delete(ArticleAccessGrant).where(
                    (ArticleAccessGrant.user_id == user_id)
                    | (ArticleAccessGrant.guest_id.in_([guest_id, invalid_guest_id]))
                )
            )
            await session.execute(
                delete(MembershipEntitlement).where(
                    MembershipEntitlement.user_id == user_id
                )
            )
            await session.execute(delete(User).where(User.id == user_id))
            await session.commit()
        await engine.dispose()
