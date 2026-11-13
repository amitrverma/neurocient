"""track short-lived WhatsApp conversational actions

Revision ID: 20261112_0022
Revises: 20261112_0021
Create Date: 2026-11-12 18:30:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261112_0022"
down_revision: str | Sequence[str] | None = "20261112_0021"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "user_preferences",
        sa.Column("whatsapp_pending_action", sa.String(length=32), nullable=True),
    )
    op.add_column(
        "user_preferences",
        sa.Column("whatsapp_pending_action_expires_at", sa.DateTime(), nullable=True),
    )
    op.create_check_constraint(
        "ck_user_preferences_whatsapp_pending_action",
        "user_preferences",
        "whatsapp_pending_action IS NULL OR "
        "whatsapp_pending_action = 'spot_capture'",
    )
    op.create_check_constraint(
        "ck_user_preferences_whatsapp_pending_action_expiry",
        "user_preferences",
        "(whatsapp_pending_action IS NULL) = "
        "(whatsapp_pending_action_expires_at IS NULL)",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_user_preferences_whatsapp_pending_action_expiry",
        "user_preferences",
        type_="check",
    )
    op.drop_constraint(
        "ck_user_preferences_whatsapp_pending_action",
        "user_preferences",
        type_="check",
    )
    op.drop_column("user_preferences", "whatsapp_pending_action_expires_at")
    op.drop_column("user_preferences", "whatsapp_pending_action")
