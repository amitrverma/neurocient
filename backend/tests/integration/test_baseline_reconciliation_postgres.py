import os

import pytest
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]

TEST_DATABASE = "neurocient_reconcile_test"


async def recreate_database(admin_url, test_url):
    admin = create_async_engine(admin_url, isolation_level="AUTOCOMMIT")
    try:
        async with admin.connect() as connection:
            await connection.execute(
                text(
                    "select pg_terminate_backend(pid) from pg_stat_activity "
                    f"where datname = '{TEST_DATABASE}' and pid <> pg_backend_pid()"
                )
            )
            await connection.execute(text(f"drop database if exists {TEST_DATABASE}"))
            await connection.execute(text(f"create database {TEST_DATABASE}"))
    finally:
        await admin.dispose()

    engine = create_async_engine(test_url)
    try:
        async with engine.begin() as connection:
            await connection.execute(
                text("create table users (id uuid primary key, email varchar null)")
            )
            await connection.execute(
                text(
                    "create table saved_articles (id uuid primary key, "
                    "user_id uuid not null, article_id uuid not null)"
                )
            )
    finally:
        await engine.dispose()


async def drop_database(admin_url):
    admin = create_async_engine(admin_url, isolation_level="AUTOCOMMIT")
    try:
        async with admin.connect() as connection:
            await connection.execute(
                text(
                    "select pg_terminate_backend(pid) from pg_stat_activity "
                    f"where datname = '{TEST_DATABASE}' and pid <> pg_backend_pid()"
                )
            )
            await connection.execute(text(f"drop database if exists {TEST_DATABASE}"))
    finally:
        await admin.dispose()


async def test_reconciliation_is_guarded_transactional_and_repeatable(monkeypatch):
    from app.config import settings
    from scripts.reconcile_baseline import run

    configured = make_url(settings.DATABASE_URL)
    admin_url = configured.set(database="postgres")
    test_url = configured.set(database=TEST_DATABASE)
    await recreate_database(admin_url, test_url)
    monkeypatch.setattr(settings, "DATABASE_URL", test_url.render_as_string(False))

    try:
        assert await run(False, None, None) == 0

        with pytest.raises(RuntimeError, match="--confirm-host"):
            await run(True, TEST_DATABASE, "wrong-host.example")

        engine = create_async_engine(test_url)
        try:
            async with engine.connect() as connection:
                assert await connection.scalar(
                    text(
                        "select is_nullable from information_schema.columns "
                        "where table_schema='public' and table_name='users' "
                        "and column_name='email'"
                    )
                ) == "YES"
        finally:
            await engine.dispose()

        assert await run(True, TEST_DATABASE, configured.host) == 0
        assert await run(True, TEST_DATABASE, configured.host) == 0

        engine = create_async_engine(test_url)
        try:
            async with engine.begin() as connection:
                assert await connection.scalar(
                    text(
                        "select is_nullable from information_schema.columns "
                        "where table_schema='public' and table_name='users' "
                        "and column_name='email'"
                    )
                ) == "NO"
                assert await connection.scalar(
                    text(
                        "select count(*) from pg_constraint "
                        "where conname='uq_user_article'"
                    )
                ) == 1
                await connection.execute(
                    text("create table alembic_version (version_num varchar(32) primary key)")
                )

            with pytest.raises(RuntimeError, match="already Alembic-versioned"):
                await run(True, TEST_DATABASE, configured.host)
        finally:
            await engine.dispose()
    finally:
        await drop_database(admin_url)
