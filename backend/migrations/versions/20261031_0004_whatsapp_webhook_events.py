"""add durable Twilio WhatsApp webhook replay records

Revision ID: 20261031_0004
Revises: 20261031_0003
Create Date: 2026-10-31 16:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261031_0004"
down_revision: str | Sequence[str] | None = "20261031_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "whatsapp_webhook_events",
        sa.Column("provider_message_sid", sa.String(length=34), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("processed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("provider_message_sid"),
    )


def downgrade() -> None:
    op.drop_table("whatsapp_webhook_events")
