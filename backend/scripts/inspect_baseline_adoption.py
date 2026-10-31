"""Run read-only aggregate checks needed before Alembic baseline adoption."""

import asyncio
import json

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.config import settings


CHECKS = {
    "alembic_version_table_exists": """
        select exists (
            select 1
            from information_schema.tables
            where table_schema = 'public' and table_name = 'alembic_version'
        )
    """,
    "legacy_subscribers_rows": "select count(1) from subscribers",
    "users_with_null_email": "select count(1) from users where email is null",
    "waitlist_with_null_email": "select count(1) from waitlist where email is null",
    "saved_article_duplicate_keys": """
        select count(1)
        from (
            select user_id, article_id
            from saved_articles
            group by user_id, article_id
            having count(1) > 1
        ) duplicates
    """,
}


async def main() -> None:
    if not settings.DATABASE_URL:
        raise RuntimeError("DATABASE_URL is required for adoption inspection")

    engine = create_async_engine(settings.DATABASE_URL)
    observations = {}
    try:
        async with engine.connect() as connection:
            transaction = await connection.begin()
            try:
                await connection.execute(text("set transaction read only"))
                for name, query in CHECKS.items():
                    observations[name] = await connection.scalar(text(query))
            finally:
                await transaction.rollback()
    finally:
        await engine.dispose()

    print(json.dumps(observations, sort_keys=True))


if __name__ == "__main__":
    asyncio.run(main())
