"""add inbound WhatsApp pairing consent

Revision ID: 20261107_0020
Revises: 20261105_0019
Create Date: 2026-11-07 12:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261107_0020"
down_revision: str | Sequence[str] | None = "20261105_0019"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("user_preferences", sa.Column("whatsapp_pairing_token_hash", sa.String(64), nullable=True))
    op.add_column("user_preferences", sa.Column("whatsapp_pairing_expires_at", sa.DateTime(), nullable=True))
    op.add_column("user_preferences", sa.Column("whatsapp_consent_at", sa.DateTime(), nullable=True))
    op.add_column("user_preferences", sa.Column("whatsapp_consent_version", sa.String(64), nullable=True))
    op.create_unique_constraint(
        "uq_user_preferences_whatsapp_pairing_token_hash",
        "user_preferences",
        ["whatsapp_pairing_token_hash"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_user_preferences_whatsapp_pairing_token_hash",
        "user_preferences",
        type_="unique",
    )
    op.drop_column("user_preferences", "whatsapp_consent_version")
    op.drop_column("user_preferences", "whatsapp_consent_at")
    op.drop_column("user_preferences", "whatsapp_pairing_expires_at")
    op.drop_column("user_preferences", "whatsapp_pairing_token_hash")
