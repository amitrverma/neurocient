"""allow short-lived WhatsApp microchallenge notes

Revision ID: 20261113_0023
Revises: 20261112_0022
Create Date: 2026-11-13 12:45:00
"""

from collections.abc import Sequence

from alembic import op


revision: str = "20261113_0023"
down_revision: str | Sequence[str] | None = "20261112_0022"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint(
        "ck_user_preferences_whatsapp_pending_action",
        "user_preferences",
        type_="check",
    )
    op.create_check_constraint(
        "ck_user_preferences_whatsapp_pending_action",
        "user_preferences",
        "whatsapp_pending_action IS NULL OR "
        "whatsapp_pending_action IN ('spot_capture', 'microchallenge_note')",
    )


def downgrade() -> None:
    op.execute(
        "UPDATE user_preferences "
        "SET whatsapp_pending_action = NULL, "
        "whatsapp_pending_action_expires_at = NULL "
        "WHERE whatsapp_pending_action = 'microchallenge_note'"
    )
    op.drop_constraint(
        "ck_user_preferences_whatsapp_pending_action",
        "user_preferences",
        type_="check",
    )
    op.create_check_constraint(
        "ck_user_preferences_whatsapp_pending_action",
        "user_preferences",
        "whatsapp_pending_action IS NULL OR "
        "whatsapp_pending_action = 'spot_capture'",
    )
