"""strengthen cohort welcome email recovery states

Revision ID: 20261101_0009
Revises: 20261101_0008
Create Date: 2026-11-01 18:20:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261101_0009"
down_revision: str | Sequence[str] | None = "20261101_0008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint(
        "ck_cohort_welcome_email_status",
        "cohort_welcome_email_deliveries",
        type_="check",
    )
    op.create_check_constraint(
        "ck_cohort_welcome_email_status",
        "cohort_welcome_email_deliveries",
        "status IN ('pending', 'dispatching', 'failed', 'sent', 'suppressed', 'reconciliation_required')",
    )


def downgrade() -> None:
    bind = op.get_bind()
    unsupported = bind.execute(
        sa.text(
            """
            SELECT EXISTS (
                SELECT 1 FROM cohort_welcome_email_deliveries
                WHERE status IN ('dispatching', 'suppressed', 'reconciliation_required')
            )
            """
        )
    ).scalar_one()
    if unsupported:
        raise RuntimeError(
            "Refusing downgrade: welcome email recovery state requires forward repair"
        )
    op.drop_constraint(
        "ck_cohort_welcome_email_status",
        "cohort_welcome_email_deliveries",
        type_="check",
    )
    op.create_check_constraint(
        "ck_cohort_welcome_email_status",
        "cohort_welcome_email_deliveries",
        "status IN ('pending', 'failed', 'sent')",
    )
