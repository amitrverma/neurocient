"""persist one shared daily nudge selection

Revision ID: 20261103_0014
Revises: 20261103_0013
Create Date: 2026-11-03 20:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20261103_0014"
down_revision: str | Sequence[str] | None = "20261103_0013"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "daily_nudge_selections",
        sa.Column("selection_date", sa.Date(), nullable=False),
        sa.Column("nudge_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["nudge_id"],
            ["behavioral_nudges.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("selection_date"),
    )
    op.create_index(
        "ix_daily_nudge_selections_nudge_id",
        "daily_nudge_selections",
        ["nudge_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_daily_nudge_selections_nudge_id",
        table_name="daily_nudge_selections",
    )
    op.drop_table("daily_nudge_selections")
