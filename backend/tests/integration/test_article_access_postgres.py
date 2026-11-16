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
    from app.utils.auth import create_access_token, create_refresh_token, issue_session

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
                - timedelta(seconds=1),
            )
        )
        await session.commit()
        account_tokens = await issue_session(session, user_id)

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
            assert denied.json()["detail"]["message"] == (
                "You have read five free Insights. Sign in to continue."
            )

            account_headers = {
                **access_header,
                "Authorization": f"Bearer {account_tokens.access}"
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

            # Logging out must not let an exhausted guest browser inherit an
            # Insight that was granted only to the signed-in account.
            logged_out_revisit = await client.post(
                "/articles/account-new/access",
                headers=guest_headers,
            )
            assert logged_out_revisit.status_code == 402
            assert logged_out_revisit.json()["detail"]["code"] == "account_required"
            assert logged_out_revisit.json()["detail"]["next_action"] == "sign_in"

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


async def test_logout_returns_the_browser_to_its_existing_guest_allowance():
    from app.Routes import article_routes, auth_routes
    from app.database import AsyncSessionLocal, engine
    from app.models import ArticleAccessGrant, AuthSession, User
    from app.utils.auth import hash_password

    user_id = uuid4()
    guest_id = uuid4()
    password = "a durable logout test passphrase"
    guest_slugs = [
        f"logout-guest-{index}"
        for index in range(article_routes.GUEST_ARTICLE_LIMIT)
    ]
    account_slug = "logout-account-only"
    app = FastAPI()
    app.include_router(article_routes.router, prefix="/articles")
    app.include_router(auth_routes.router, prefix="/auth")
    transport = httpx.ASGITransport(app=app)
    access_header = {
        article_routes.ARTICLE_ACCESS_REQUEST_HEADER: "insight-page",
    }
    auth_header = {
        auth_routes.AUTH_REQUEST_HEADER: auth_routes.AUTH_REQUEST_VALUE,
    }

    async with AsyncSessionLocal() as session:
        email = f"logout-{user_id}@example.com"
        session.add(
            User(
                id=user_id,
                email=email,
                password_hash=hash_password(password),
            )
        )
        session.add_all(
            ArticleAccessGrant(guest_id=guest_id, article_slug=slug)
            for slug in guest_slugs
        )
        await session.commit()

    try:
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://test",
        ) as client:
            client.cookies.set(
                "guest_access_id",
                str(guest_id),
                domain="test.local",
                path="/",
            )
            login = await client.post(
                "/auth/login",
                headers=auth_header,
                json={"email": email, "password": password},
            )
            assert login.status_code == 200
            assert client.cookies.get("access_token")
            assert client.cookies.get("refresh_token")
            assert client.cookies.get("session_present") == "1"

            signed_in = await client.post(
                f"/articles/{account_slug}/access",
                headers=access_header,
            )
            assert signed_in.status_code == 200

            logout = await client.post("/auth/logout", headers=auth_header)
            assert logout.status_code == 200
            assert client.cookies.get("guest_access_id") == str(guest_id)
            assert client.cookies.get("access_token") is None
            assert client.cookies.get("refresh_token") is None
            assert client.cookies.get("session_present") is None

            account_only_after_logout = await client.post(
                f"/articles/{account_slug}/access",
                headers=access_header,
            )
            assert account_only_after_logout.status_code == 402
            assert (
                account_only_after_logout.json()["detail"]["next_action"]
                == "sign_in"
            )

            new_guest_article = await client.post(
                "/articles/logout-sixth-guest/access",
                headers=access_header,
            )
            assert new_guest_article.status_code == 402

            existing_guest_article = await client.post(
                f"/articles/{guest_slugs[0]}/access",
                headers=access_header,
            )
            assert existing_guest_article.status_code == 200

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
            auth_session = await session.scalar(
                select(AuthSession).where(AuthSession.user_id == user_id)
            )
            assert guest_count == article_routes.GUEST_ARTICLE_LIMIT
            assert account_count == 1
            assert auth_session is not None
            assert auth_session.revoked_at is not None
            assert auth_session.revocation_reason == "logout"
    finally:
        async with AsyncSessionLocal() as session:
            await session.execute(
                delete(ArticleAccessGrant).where(
                    (ArticleAccessGrant.user_id == user_id)
                    | (ArticleAccessGrant.guest_id == guest_id)
                )
            )
            await session.execute(delete(User).where(User.id == user_id))
            await session.commit()
        await engine.dispose()
