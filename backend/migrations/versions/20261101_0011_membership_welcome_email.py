"""add durable membership welcome email delivery ledger

Revision ID: 20261101_0011
Revises: 20261101_0010
Create Date: 2026-11-01 20:05:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20261101_0011"
down_revision: str | Sequence[str] | None = "20261101_0010"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "membership_welcome_email_deliveries",
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("recipient", sa.String(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("provider_message_id", sa.String(), nullable=True),
        sa.Column("last_error_code", sa.String(), nullable=True),
        sa.Column("first_dispatched_at", sa.DateTime(), nullable=True),
        sa.Column("last_attempt_at", sa.DateTime(), nullable=True),
        sa.Column("sent_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "status IN ('pending', 'dispatching', 'failed', 'sent', 'suppressed', 'reconciliation_required')",
            name="ck_membership_welcome_email_status",
        ),
        sa.UniqueConstraint(
            "provider_message_id",
            name="uq_membership_welcome_email_provider_message_id",
        ),
    )
    op.create_index(
        "ix_membership_welcome_email_deliveries_status",
        "membership_welcome_email_deliveries",
        ["status"],
    )


def downgrade() -> None:
    bind = op.get_bind()
    delivery_evidence = bind.execute(
        sa.text(
            """
            SELECT EXISTS (
                SELECT 1 FROM membership_welcome_email_deliveries
                WHERE attempt_count > 0
                   OR provider_message_id IS NOT NULL
                   OR sent_at IS NOT NULL
                   OR status IN ('dispatching', 'reconciliation_required')
            )
            """
        )
    ).scalar_one()
    if delivery_evidence:
        raise RuntimeError(
            "Refusing destructive downgrade: membership welcome email delivery evidence exists; "
            "use forward repair"
        )
    op.drop_table("membership_welcome_email_deliveries")
