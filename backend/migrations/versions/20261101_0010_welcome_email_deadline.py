"""anchor welcome email idempotency deadline to first dispatch

Revision ID: 20261101_0010
Revises: 20261101_0009
Create Date: 2026-11-01 18:40:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261101_0010"
down_revision: str | Sequence[str] | None = "20261101_0009"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "cohort_welcome_email_deliveries",
        sa.Column("first_dispatched_at", sa.DateTime(), nullable=True),
    )
    op.execute(
        """
        UPDATE cohort_welcome_email_deliveries
        SET first_dispatched_at = last_attempt_at
        WHERE status IN ('dispatching', 'reconciliation_required')
          AND first_dispatched_at IS NULL
        """
    )


def downgrade() -> None:
    bind = op.get_bind()
    unsafe = bind.execute(
        sa.text(
            """
            SELECT EXISTS (
                SELECT 1 FROM cohort_welcome_email_deliveries
                WHERE status IN ('dispatching', 'reconciliation_required')
            )
            """
        )
    ).scalar_one()
    if unsafe:
        raise RuntimeError(
            "Refusing downgrade: active welcome email recovery requires the anchored deadline"
        )
    op.drop_column("cohort_welcome_email_deliveries", "first_dispatched_at")
