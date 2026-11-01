"""add recurring membership billing ledger and state

Revision ID: 20261101_0007
Revises: 20261031_0006
Create Date: 2026-11-01 13:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20261101_0007"
down_revision: str | Sequence[str] | None = "20261031_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("membership_entitlements", sa.Column("provider_plan_id", sa.String(), nullable=True))
    op.add_column("membership_entitlements", sa.Column("provider_payment_id", sa.String(), nullable=True))
    op.add_column("membership_entitlements", sa.Column("provider_status", sa.String(), nullable=True))
    op.add_column("membership_entitlements", sa.Column("checkout_operation_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("membership_entitlements", sa.Column("checkout_state", sa.String(), nullable=True))
    op.add_column("membership_entitlements", sa.Column("price_minor", sa.Integer(), nullable=True))
    op.add_column("membership_entitlements", sa.Column("currency", sa.String(), nullable=True))
    op.add_column("membership_entitlements", sa.Column("billing_total_count", sa.Integer(), nullable=True))
    op.add_column("membership_entitlements", sa.Column("last_provider_event_at", sa.DateTime(), nullable=True))
    op.add_column("membership_entitlements", sa.Column("last_provider_event_rank", sa.Integer(), nullable=True))
    op.create_index("ix_membership_entitlements_provider_payment_id", "membership_entitlements", ["provider_payment_id"])
    op.create_index("ix_membership_entitlements_checkout_state", "membership_entitlements", ["checkout_state"])
    op.create_unique_constraint("uq_membership_entitlements_checkout_operation", "membership_entitlements", ["checkout_operation_id"])

    op.create_table(
        "membership_billing_events",
        sa.Column("provider_event_id", sa.String(), primary_key=True),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("provider_subscription_id", sa.String(), nullable=True),
        sa.Column("provider_payment_id", sa.String(), nullable=True),
        sa.Column("provider_customer_id", sa.String(), nullable=True),
        sa.Column("provider_plan_id", sa.String(), nullable=True),
        sa.Column("amount_minor", sa.Integer(), nullable=True),
        sa.Column("currency", sa.String(), nullable=True),
        sa.Column("provider_created_at", sa.DateTime(), nullable=True),
        sa.Column("current_period_end", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="received"),
        sa.Column("reason_code", sa.String(), nullable=True),
        sa.Column("processed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_membership_billing_events_event_type", "membership_billing_events", ["event_type"])
    op.create_index("ix_membership_billing_events_user_id", "membership_billing_events", ["user_id"])
    op.create_index("ix_membership_billing_events_provider_subscription_id", "membership_billing_events", ["provider_subscription_id"])
    op.create_index("ix_membership_billing_events_provider_payment_id", "membership_billing_events", ["provider_payment_id"])
    op.create_index("ix_membership_billing_events_provider_customer_id", "membership_billing_events", ["provider_customer_id"])
    op.create_index("ix_membership_billing_events_status", "membership_billing_events", ["status"])


def downgrade() -> None:
    bind = op.get_bind()
    has_billing_evidence = bind.execute(
        sa.text(
            """
            SELECT
                EXISTS (SELECT 1 FROM membership_billing_events)
                OR EXISTS (
                    SELECT 1 FROM membership_entitlements
                    WHERE checkout_operation_id IS NOT NULL
                       OR provider_plan_id IS NOT NULL
                       OR provider_payment_id IS NOT NULL
                       OR checkout_state IS NOT NULL
                       OR price_minor IS NOT NULL
                       OR currency IS NOT NULL
                       OR billing_total_count IS NOT NULL
                       OR last_provider_event_at IS NOT NULL
                       OR last_provider_event_rank IS NOT NULL
                )
            """
        )
    ).scalar_one()
    if has_billing_evidence:
        raise RuntimeError(
            "Refusing destructive downgrade: membership billing evidence exists; use forward repair"
        )
    op.drop_table("membership_billing_events")
    op.drop_constraint("uq_membership_entitlements_checkout_operation", "membership_entitlements", type_="unique")
    op.drop_index("ix_membership_entitlements_checkout_state", table_name="membership_entitlements")
    op.drop_index("ix_membership_entitlements_provider_payment_id", table_name="membership_entitlements")
    for name in (
        "last_provider_event_rank", "last_provider_event_at", "billing_total_count",
        "currency", "price_minor", "checkout_state", "checkout_operation_id",
        "provider_status", "provider_payment_id", "provider_plan_id",
    ):
        op.drop_column("membership_entitlements", name)
