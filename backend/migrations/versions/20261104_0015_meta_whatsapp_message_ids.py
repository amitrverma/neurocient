"""widen WhatsApp replay keys for Meta message identifiers

Revision ID: 20261104_0015
Revises: 20261103_0014
Create Date: 2026-11-04 12:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261104_0015"
down_revision: str | Sequence[str] | None = "20261103_0014"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column(
        "whatsapp_webhook_events",
        "provider_message_sid",
        new_column_name="provider_message_id",
        existing_type=sa.String(length=34),
        existing_nullable=False,
    )
    op.alter_column(
        "whatsapp_webhook_events",
        "provider_message_id",
        existing_type=sa.String(length=34),
        type_=sa.String(length=255),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM whatsapp_webhook_events
                WHERE length(provider_message_id) > 34
            ) THEN
                RAISE EXCEPTION
                    'cannot downgrade: WhatsApp replay keys exceed 34 characters';
            END IF;
        END
        $$;
        """
    )
    op.alter_column(
        "whatsapp_webhook_events",
        "provider_message_id",
        existing_type=sa.String(length=255),
        type_=sa.String(length=34),
        existing_nullable=False,
    )
    op.alter_column(
        "whatsapp_webhook_events",
        "provider_message_id",
        new_column_name="provider_message_sid",
        existing_type=sa.String(length=34),
        existing_nullable=False,
    )
