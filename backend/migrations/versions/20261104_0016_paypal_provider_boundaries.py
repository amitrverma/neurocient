"""add explicit provider boundaries for PayPal billing

Revision ID: 20261104_0016
Revises: 20261104_0015
Create Date: 2026-11-04 17:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261104_0016"
down_revision: str | Sequence[str] | None = "20261104_0015"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "cohort_enrollments",
        sa.Column("provider", sa.String(), nullable=False, server_default="razorpay"),
    )
    op.add_column(
        "payment_webhook_events",
        sa.Column("provider", sa.String(), nullable=False, server_default="razorpay"),
    )
    op.add_column(
        "membership_billing_events",
        sa.Column("provider", sa.String(), nullable=False, server_default="razorpay"),
    )
    op.create_index(
        "ix_membership_billing_events_provider",
        "membership_billing_events",
        ["provider"],
    )


def downgrade() -> None:
    bind = op.get_bind()
    paypal_evidence = bind.execute(
        sa.text(
            """
            SELECT
                EXISTS (SELECT 1 FROM cohort_enrollments WHERE provider <> 'razorpay')
                OR EXISTS (SELECT 1 FROM payment_webhook_events WHERE provider <> 'razorpay')
                OR EXISTS (SELECT 1 FROM membership_billing_events WHERE provider <> 'razorpay')
            """
        )
    ).scalar_one()
    if paypal_evidence:
        raise RuntimeError(
            "Refusing destructive downgrade: non-Razorpay billing evidence exists; use forward repair"
        )
    op.drop_index(
        "ix_membership_billing_events_provider",
        table_name="membership_billing_events",
    )
    op.drop_column("membership_billing_events", "provider")
    op.drop_column("payment_webhook_events", "provider")
    op.drop_column("cohort_enrollments", "provider")
