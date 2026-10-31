"""add durable abuse-rate buckets and weekly reflection idempotency

Revision ID: 20261031_0005
Revises: 20261031_0004
Create Date: 2026-10-31 18:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261031_0005"
down_revision: str | Sequence[str] | None = "20261031_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    connection = op.get_bind()
    duplicates = connection.execute(sa.text("""
        SELECT user_id, week_start
        FROM weekly_reflections
        GROUP BY user_id, week_start
        HAVING count(*) > 1
        LIMIT 1
    """)).first()
    if duplicates:
        raise RuntimeError(
            "Cannot add weekly reflection uniqueness: duplicate user/week rows exist"
        )

    op.create_unique_constraint(
        "uq_weekly_reflection_user_week",
        "weekly_reflections",
        ["user_id", "week_start"],
    )
    op.create_table(
        "abuse_rate_limit_buckets",
        sa.Column("policy", sa.String(length=64), nullable=False),
        sa.Column("identity_hash", sa.String(length=64), nullable=False),
        sa.Column("window_started_at", sa.DateTime(), nullable=False),
        sa.Column("request_count", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint(
            "request_count >= 1", name="ck_abuse_rate_limit_count_positive"
        ),
        sa.PrimaryKeyConstraint("policy", "identity_hash"),
    )
    op.create_index(
        "ix_abuse_rate_limit_buckets_updated_at",
        "abuse_rate_limit_buckets",
        ["updated_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_abuse_rate_limit_buckets_updated_at",
        table_name="abuse_rate_limit_buckets",
    )
    op.drop_table("abuse_rate_limit_buckets")
    op.drop_constraint(
        "uq_weekly_reflection_user_week",
        "weekly_reflections",
        type_="unique",
    )
