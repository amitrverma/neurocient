"""record truthful daily microchallenge outcomes

Revision ID: 20261103_0013
Revises: 20261101_0012
Create Date: 2026-11-03 15:30:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261103_0013"
down_revision: str | Sequence[str] | None = "20261101_0012"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "microchallenge_logs",
        sa.Column(
            "outcome",
            sa.String(),
            nullable=False,
            server_default="done",
        ),
    )
    op.create_check_constraint(
        "ck_microchallenge_log_outcome",
        "microchallenge_logs",
        "outcome IN ('done', 'partly', 'not_today')",
    )
    op.alter_column(
        "microchallenge_logs",
        "outcome",
        server_default=None,
    )


def downgrade() -> None:
    non_done_count = op.get_bind().execute(
        sa.text(
            "SELECT count(*) FROM microchallenge_logs "
            "WHERE outcome <> 'done'"
        )
    ).scalar_one()
    if non_done_count:
        raise RuntimeError(
            "Cannot downgrade microchallenge outcomes after partial or "
            "not-today evidence exists; use forward repair"
        )
    op.drop_constraint(
        "ck_microchallenge_log_outcome",
        "microchallenge_logs",
        type_="check",
    )
    op.drop_column("microchallenge_logs", "outcome")
