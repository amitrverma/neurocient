import asyncio
import os
from datetime import datetime, timedelta
from pathlib import Path
from uuid import uuid4

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import create_async_engine


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]

TEST_DATABASE = "neurocient_payment_order_identity_test"


async def recreate_database(admin_url, test_url):
    admin = create_async_engine(admin_url, isolation_level="AUTOCOMMIT")
    try:
        async with admin.connect() as connection:
            await connection.execute(text(
                "select pg_terminate_backend(pid) from pg_stat_activity "
                f"where datname = '{TEST_DATABASE}' and pid <> pg_backend_pid()"
            ))
            await connection.execute(text(f"drop database if exists {TEST_DATABASE}"))
            await connection.execute(text(f"create database {TEST_DATABASE}"))
    finally:
        await admin.dispose()


async def drop_database(admin_url):
    admin = create_async_engine(admin_url, isolation_level="AUTOCOMMIT")
    try:
        async with admin.connect() as connection:
            await connection.execute(text(
                "select pg_terminate_backend(pid) from pg_stat_activity "
                f"where datname = '{TEST_DATABASE}' and pid <> pg_backend_pid()"
            ))
            await connection.execute(text(f"drop database if exists {TEST_DATABASE}"))
    finally:
        await admin.dispose()


async def test_payment_order_identity_upgrade_refuses_duplicates_and_enforces_constraint(
    monkeypatch,
):
    from app.config import settings

    configured = make_url(settings.DATABASE_URL)
    admin_url = configured.set(database="postgres")
    test_url = configured.set(database=TEST_DATABASE)
    await recreate_database(admin_url, test_url)
    monkeypatch.setattr(settings, "DATABASE_URL", test_url.render_as_string(False))
    alembic_config = Config(str(Path(__file__).parents[2] / "alembic.ini"))
    engine = create_async_engine(test_url)
    user_id, cohort_id, enrollment_id = uuid4(), uuid4(), uuid4()
    first_record_id, second_record_id = uuid4(), uuid4()
    now = datetime.utcnow()

    try:
        await asyncio.to_thread(command.upgrade, alembic_config, "20261104_0016")
        async with engine.begin() as connection:
            await connection.execute(text(
                "INSERT INTO users (id, email, created_at) "
                "VALUES (:id, :email, :created_at)"
            ), {"id": user_id, "email": f"migration-{user_id}@example.test", "created_at": now})
            await connection.execute(text(
                """
                INSERT INTO cohorts (
                    id, program_key, slug, title, timezone, starts_at, ends_at,
                    capacity, price_minor, currency, status, created_at, updated_at
                ) VALUES (
                    :id, 'modern-caveman', :slug, 'Migration cohort', 'Asia/Kolkata',
                    :starts_at, :ends_at, 20, 2100000, 'INR', 'open', :now, :now
                )
                """
            ), {
                "id": cohort_id,
                "slug": f"migration-{cohort_id}",
                "starts_at": now + timedelta(days=14),
                "ends_at": now + timedelta(days=42),
                "now": now,
            })
            await connection.execute(text(
                """
                INSERT INTO cohort_enrollments (
                    id, cohort_id, user_id, status, provider, amount_minor,
                    currency, created_at, updated_at
                ) VALUES (
                    :id, :cohort_id, :user_id, 'pending_payment', 'razorpay',
                    2100000, 'INR', :now, :now
                )
                """
            ), {
                "id": enrollment_id,
                "cohort_id": cohort_id,
                "user_id": user_id,
                "now": now,
            })
            for record_id in (first_record_id, second_record_id):
                await connection.execute(text(
                    """
                    INSERT INTO payment_records (
                        id, enrollment_id, provider, provider_order_id, status,
                        amount_minor, currency, created_at, updated_at
                    ) VALUES (
                        :id, :enrollment_id, 'razorpay', 'order_duplicate', 'created',
                        2100000, 'INR', :now, :now
                    )
                    """
                ), {"id": record_id, "enrollment_id": enrollment_id, "now": now})

        with pytest.raises(RuntimeError, match="provider-verified forward repair"):
            await asyncio.to_thread(command.upgrade, alembic_config, "head")

        async with engine.begin() as connection:
            assert await connection.scalar(text(
                "SELECT version_num FROM alembic_version"
            )) == "20261104_0016"
            await connection.execute(text(
                "DELETE FROM payment_records WHERE id = :id"
            ), {"id": second_record_id})

        await asyncio.to_thread(command.upgrade, alembic_config, "head")
        async with engine.connect() as connection:
            assert await connection.scalar(text(
                "SELECT COUNT(*) FROM pg_constraint "
                "WHERE conname = 'uq_payment_record_provider_order'"
            )) == 1

        with pytest.raises(IntegrityError):
            async with engine.begin() as connection:
                await connection.execute(text(
                    """
                    INSERT INTO payment_records (
                        id, enrollment_id, provider, provider_order_id, status,
                        amount_minor, currency, created_at, updated_at
                    ) VALUES (
                        :id, :enrollment_id, 'razorpay', 'order_duplicate', 'created',
                        2100000, 'INR', :now, :now
                    )
                    """
                ), {"id": uuid4(), "enrollment_id": enrollment_id, "now": now})
    finally:
        await engine.dispose()
        await drop_database(admin_url)
