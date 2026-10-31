"""Compare a PostgreSQL schema with the application's SQLAlchemy metadata.

This command is read-only. It intentionally does not require an Alembic
revision marker, which makes it suitable for evaluating a legacy database
before baseline adoption.
"""

import asyncio

from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from sqlalchemy.ext.asyncio import create_async_engine

from app import models  # noqa: F401 - imports all mapped tables
from app.config import settings
from app.database import Base


UNMANAGED_TABLES = {"subscribers"}


def include_object(object_, name, type_, reflected, compare_to):
    return not (type_ == "table" and reflected and name in UNMANAGED_TABLES)


def find_differences(connection):
    context = MigrationContext.configure(
        connection,
        opts={"compare_type": True, "include_object": include_object},
    )
    return compare_metadata(context, Base.metadata)


async def main() -> int:
    if not settings.DATABASE_URL:
        raise RuntimeError("DATABASE_URL is required for schema comparison")

    engine = create_async_engine(settings.DATABASE_URL)
    try:
        async with engine.connect() as connection:
            differences = await connection.run_sync(find_differences)
    finally:
        await engine.dispose()

    if not differences:
        print("Schema matches SQLAlchemy metadata.")
        return 0

    print(f"Schema differs from SQLAlchemy metadata ({len(differences)} changes):")
    for difference in differences:
        print(repr(difference))
    return 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
