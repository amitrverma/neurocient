"""track accepted, delivered, read, and failed WhatsApp dispatches

Revision ID: 20261112_0021
Revises: 20261107_0020
Create Date: 2026-11-12 14:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261112_0021"
down_revision: str | Sequence[str] | None = "20261107_0020"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint(
        "ck_notification_dispatch_status",
        "notification_dispatches",
        type_="check",
    )
    op.create_check_constraint(
        "ck_notification_dispatch_status",
        "notification_dispatches",
        "status IN ('dispatching', 'sent', 'accepted', 'delivered', 'read', "
        "'failed', 'skipped', 'reconciliation_required')",
    )
    op.add_column(
        "notification_dispatches",
        sa.Column("delivered_at", sa.DateTime(), nullable=True),
    )
    op.add_column(
        "notification_dispatches",
        sa.Column("read_at", sa.DateTime(), nullable=True),
    )
    op.add_column(
        "notification_dispatches",
        sa.Column("failed_at", sa.DateTime(), nullable=True),
    )
    op.create_index(
        "uq_notification_dispatch_provider_message_id",
        "notification_dispatches",
        ["provider_message_id"],
        unique=True,
        postgresql_where=sa.text("provider_message_id IS NOT NULL"),
    )


def downgrade() -> None:
    op.execute(
        "UPDATE notification_dispatches SET status = 'sent' "
        "WHERE status IN ('accepted', 'delivered', 'read')"
    )
    op.drop_index(
        "uq_notification_dispatch_provider_message_id",
        table_name="notification_dispatches",
    )
    op.drop_column("notification_dispatches", "failed_at")
    op.drop_column("notification_dispatches", "read_at")
    op.drop_column("notification_dispatches", "delivered_at")
    op.drop_constraint(
        "ck_notification_dispatch_status",
        "notification_dispatches",
        type_="check",
    )
    op.create_check_constraint(
        "ck_notification_dispatch_status",
        "notification_dispatches",
        "status IN ('dispatching', 'sent', 'failed', 'skipped', "
        "'reconciliation_required')",
    )
