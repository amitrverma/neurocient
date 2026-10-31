"""add server-authoritative article access grants

Revision ID: 20261031_0002
Revises: 20261031_0001
Create Date: 2026-10-31 10:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261031_0002"
down_revision: str | Sequence[str] | None = "20261031_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "article_access_grants",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("article_slug", sa.String(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=True),
        sa.Column("guest_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint(
            "(user_id IS NOT NULL AND guest_id IS NULL) OR "
            "(user_id IS NULL AND guest_id IS NOT NULL)",
            name="ck_article_access_actor",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "guest_id",
            "article_slug",
            name="uq_article_access_guest_slug",
        ),
        sa.UniqueConstraint(
            "user_id",
            "article_slug",
            name="uq_article_access_user_slug",
        ),
    )
    op.create_index(
        "ix_article_access_guest_id",
        "article_access_grants",
        ["guest_id"],
        unique=False,
    )
    op.create_index(
        "ix_article_access_user_id",
        "article_access_grants",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_article_access_user_id",
        table_name="article_access_grants",
    )
    op.drop_index(
        "ix_article_access_guest_id",
        table_name="article_access_grants",
    )
    op.drop_table("article_access_grants")
