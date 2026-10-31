"""Safely reconcile a legacy Neurocient database before Alembic stamping.

The default mode is read-only. Mutation requires ``--apply`` plus exact host
and database confirmations. All changes run in one transaction while holding
an application-specific advisory lock.
"""

import argparse
import asyncio
import json

from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine

from app.config import settings


REQUIRED_TABLES = {"users", "saved_articles"}


async def inspect(connection) -> dict:
    database = await connection.scalar(text("select current_database()"))
    tables = set(
        (
            await connection.execute(
                text(
                    """
                    select table_name
                    from information_schema.tables
                    where table_schema = 'public'
                    """
                )
            )
        ).scalars()
    )
    missing_tables = sorted(REQUIRED_TABLES - tables)
    if missing_tables:
        return {"database": database, "missing_tables": missing_tables, "ready": False}

    required_columns = {
        ("users", "email"),
        ("saved_articles", "user_id"),
        ("saved_articles", "article_id"),
    }
    present_columns = set(
        (
            await connection.execute(
                text(
                    """
                    select table_name, column_name
                    from information_schema.columns
                    where table_schema = 'public'
                      and table_name in ('users', 'saved_articles')
                    """
                )
            )
        ).tuples()
    )
    missing_columns = sorted(required_columns - present_columns)
    if missing_columns:
        return {
            "database": database,
            "missing_tables": [],
            "missing_columns": missing_columns,
            "ready": False,
        }

    users_email_nullable = await connection.scalar(
        text(
            """
            select is_nullable = 'YES'
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'users'
              and column_name = 'email'
            """
        )
    )
    null_user_emails = await connection.scalar(
        text("select count(*) from public.users where email is null")
    )
    duplicate_saved_article_keys = await connection.scalar(
        text(
            """
            select count(*)
            from (
                select user_id, article_id
                from public.saved_articles
                group by user_id, article_id
                having count(*) > 1
            ) duplicates
            """
        )
    )
    saved_article_constraint = await connection.scalar(
        text(
            """
            select pg_get_constraintdef(c.oid)
            from pg_constraint c
            join pg_class t on t.oid = c.conrelid
            join pg_namespace n on n.oid = t.relnamespace
            where n.nspname = 'public'
              and t.relname = 'saved_articles'
              and c.conname = 'uq_user_article'
            """
        )
    )
    expected_constraint = "UNIQUE (user_id, article_id)"
    constraint_conflict = saved_article_constraint not in (None, expected_constraint)

    alembic_version_exists = "alembic_version" in tables
    alembic_revision = None
    if alembic_version_exists:
        alembic_revision = await connection.scalar(
            text("select version_num from public.alembic_version limit 1")
        )

    ready = (
        null_user_emails == 0
        and duplicate_saved_article_keys == 0
        and not constraint_conflict
    )
    return {
        "database": database,
        "missing_tables": [],
        "missing_columns": [],
        "alembic_version_exists": alembic_version_exists,
        "alembic_revision": alembic_revision,
        "users_email_nullable": bool(users_email_nullable),
        "null_user_emails": null_user_emails,
        "duplicate_saved_article_keys": duplicate_saved_article_keys,
        "saved_article_constraint": saved_article_constraint,
        "constraint_conflict": constraint_conflict,
        "changes_needed": [
            change
            for needed, change in (
                (users_email_nullable, "users.email SET NOT NULL"),
                (saved_article_constraint is None, "ADD uq_user_article"),
            )
            if needed
        ],
        "ready": ready,
    }


async def run(
    apply: bool,
    confirmed_database: str | None,
    confirmed_host: str | None,
) -> int:
    if not settings.DATABASE_URL:
        raise RuntimeError("DATABASE_URL is required for baseline reconciliation")

    target_host = make_url(settings.DATABASE_URL).host
    engine = create_async_engine(settings.DATABASE_URL)
    try:
        async with engine.connect() as connection:
            transaction = await connection.begin()
            try:
                if apply:
                    await connection.execute(text("set local lock_timeout = '5s'"))
                    await connection.execute(text("set local statement_timeout = '30s'"))
                    await connection.execute(
                        text(
                            "select pg_advisory_xact_lock("
                            "hashtext('neurocient_alembic_baseline_adoption'))"
                        )
                    )
                else:
                    await connection.execute(text("set transaction read only"))

                before = await inspect(connection)
                before["host"] = target_host
                if not before["ready"]:
                    raise RuntimeError(f"Baseline preconditions failed: {json.dumps(before)}")

                if apply:
                    if not confirmed_host or confirmed_host != target_host:
                        raise RuntimeError(
                            "--confirm-host must exactly match the configured database host"
                        )
                    if not confirmed_database or confirmed_database != before["database"]:
                        raise RuntimeError(
                            "--confirm-database must exactly match current_database()"
                        )
                    if before["alembic_version_exists"]:
                        raise RuntimeError(
                            "Database is already Alembic-versioned; reconciliation refused"
                        )
                    if before["users_email_nullable"]:
                        await connection.execute(
                            text(
                                "alter table public.users "
                                "alter column email set not null"
                            )
                        )
                    if before["saved_article_constraint"] is None:
                        await connection.execute(
                            text(
                                "alter table public.saved_articles "
                                "add constraint uq_user_article "
                                "unique (user_id, article_id)"
                            )
                        )

                    after = await inspect(connection)
                    after["host"] = target_host
                    if not after["ready"] or after["changes_needed"]:
                        raise RuntimeError(
                            f"Post-reconciliation verification failed: {json.dumps(after)}"
                        )
                    await transaction.commit()
                    print(json.dumps({"before": before, "after": after}, sort_keys=True))
                else:
                    await transaction.rollback()
                    print(json.dumps(before, sort_keys=True))
            except Exception:
                if transaction.is_active:
                    await transaction.rollback()
                raise
    finally:
        await engine.dispose()
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply the two guarded reconciliation changes transactionally.",
    )
    parser.add_argument(
        "--confirm-database",
        help="Required with --apply; must exactly match current_database().",
    )
    parser.add_argument(
        "--confirm-host",
        help="Required with --apply; must exactly match the configured database host.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    raise SystemExit(
        asyncio.run(run(args.apply, args.confirm_database, args.confirm_host))
    )
