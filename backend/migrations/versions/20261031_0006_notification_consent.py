"""make notification consent authoritative and opt-in

Revision ID: 20261031_0006
Revises: 20261031_0005
Create Date: 2026-10-31 21:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261031_0006"
down_revision: str | Sequence[str] | None = "20261031_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(sa.text("UPDATE users SET whatsapp_opt_in = false"))
    op.alter_column(
        "users",
        "whatsapp_opt_in",
        existing_type=sa.Boolean(),
        nullable=False,
        server_default=sa.false(),
    )

    op.add_column(
        "user_preferences",
        sa.Column("spot_reminder_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "user_preferences",
        sa.Column("push_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "user_preferences",
        sa.Column("whatsapp_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "user_preferences",
        sa.Column("whatsapp_pending_number", sa.String(), nullable=True),
    )
    op.add_column(
        "user_preferences",
        sa.Column("whatsapp_verification_code_hash", sa.String(), nullable=True),
    )
    op.add_column(
        "user_preferences",
        sa.Column("whatsapp_verification_expires_at", sa.DateTime(), nullable=True),
    )
    op.add_column(
        "user_preferences",
        sa.Column(
            "whatsapp_verification_attempts",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )

    # Some legacy provisioning paths may have created a user without the
    # companion row. Backfill a safe all-off authority for every such account.
    op.execute(
        sa.text(
            """
            INSERT INTO user_preferences (
                id,
                user_id,
                nudge_enabled,
                spot_reminder_enabled,
                microchallenge_enabled,
                push_enabled,
                whatsapp_enabled,
                whatsapp_verified,
                whatsapp_verification_attempts,
                created_at,
                updated_at
            )
            SELECT
                gen_random_uuid(),
                users.id,
                false,
                false,
                false,
                false,
                false,
                false,
                0,
                now(),
                now()
            FROM users
            WHERE NOT EXISTS (
                SELECT 1
                FROM user_preferences
                WHERE user_preferences.user_id = users.id
            )
            """
        )
    )

    # Existing booleans may have come from the former on-by-default model. They
    # cannot be distinguished from explicit consent, so reset them safely.
    op.execute(
        sa.text(
            """
            UPDATE user_preferences
            SET nudge_enabled = false,
                microchallenge_enabled = false,
                whatsapp_verified = false,
                whatsapp_number = NULL
            """
        )
    )
    op.alter_column(
        "user_preferences",
        "nudge_enabled",
        existing_type=sa.Boolean(),
        nullable=False,
        server_default=sa.false(),
    )
    op.alter_column(
        "user_preferences",
        "microchallenge_enabled",
        existing_type=sa.Boolean(),
        nullable=False,
        server_default=sa.false(),
    )
    op.alter_column(
        "user_preferences",
        "whatsapp_verified",
        existing_type=sa.Boolean(),
        nullable=False,
        server_default=sa.false(),
    )
    op.create_unique_constraint(
        "uq_user_preferences_whatsapp_number",
        "user_preferences",
        ["whatsapp_number"],
    )
    op.create_check_constraint(
        "ck_user_preferences_verified_number",
        "user_preferences",
        "NOT whatsapp_verified OR whatsapp_number IS NOT NULL",
    )
    op.create_check_constraint(
        "ck_user_preferences_enabled_verified",
        "user_preferences",
        "NOT whatsapp_enabled OR whatsapp_verified",
    )
    op.create_check_constraint(
        "ck_user_preferences_verification_attempts",
        "user_preferences",
        "whatsapp_verification_attempts BETWEEN 0 AND 5",
    )
    op.drop_column("user_preferences", "notif_channel")


def downgrade() -> None:
    op.add_column(
        "user_preferences",
        sa.Column("notif_channel", sa.String(), nullable=True),
    )
    op.drop_constraint(
        "ck_user_preferences_verification_attempts",
        "user_preferences",
        type_="check",
    )
    op.drop_constraint(
        "ck_user_preferences_enabled_verified",
        "user_preferences",
        type_="check",
    )
    op.drop_constraint(
        "ck_user_preferences_verified_number",
        "user_preferences",
        type_="check",
    )
    op.drop_constraint(
        "uq_user_preferences_whatsapp_number",
        "user_preferences",
        type_="unique",
    )
    op.alter_column(
        "user_preferences",
        "whatsapp_verified",
        existing_type=sa.Boolean(),
        nullable=True,
        server_default=None,
    )
    op.alter_column(
        "user_preferences",
        "microchallenge_enabled",
        existing_type=sa.Boolean(),
        nullable=True,
        server_default=None,
    )
    op.alter_column(
        "user_preferences",
        "nudge_enabled",
        existing_type=sa.Boolean(),
        nullable=True,
        server_default=None,
    )
    op.drop_column("user_preferences", "whatsapp_verification_attempts")
    op.drop_column("user_preferences", "whatsapp_verification_expires_at")
    op.drop_column("user_preferences", "whatsapp_verification_code_hash")
    op.drop_column("user_preferences", "whatsapp_pending_number")
    op.drop_column("user_preferences", "whatsapp_enabled")
    op.drop_column("user_preferences", "push_enabled")
    op.drop_column("user_preferences", "spot_reminder_enabled")
    op.alter_column(
        "users",
        "whatsapp_opt_in",
        existing_type=sa.Boolean(),
        nullable=True,
        server_default=None,
    )
