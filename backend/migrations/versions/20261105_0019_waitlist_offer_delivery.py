"""add durable waitlist offer delivery state

Revision ID: 20261105_0019
Revises: 20261105_0018
Create Date: 2026-11-05 20:30:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261105_0019"
down_revision: str | Sequence[str] | None = "20261105_0018"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "cohort_waitlist_entries",
        sa.Column("offer_email_status", sa.String(), nullable=False, server_default="pending"),
    )
    op.add_column(
        "cohort_waitlist_entries",
        sa.Column("offer_email_attempt_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column("cohort_waitlist_entries", sa.Column("offer_email_last_error_code", sa.String(), nullable=True))
    op.add_column("cohort_waitlist_entries", sa.Column("offer_email_first_dispatched_at", sa.DateTime(), nullable=True))
    op.add_column("cohort_waitlist_entries", sa.Column("offer_email_last_attempt_at", sa.DateTime(), nullable=True))
    op.add_column("cohort_waitlist_entries", sa.Column("offer_email_payload", sa.JSON(), nullable=True))
    op.execute(
        "UPDATE cohort_waitlist_entries SET offer_email_status = 'sent' "
        "WHERE offer_email_sent_at IS NOT NULL"
    )
    op.create_index(
        "ix_cohort_waitlist_entries_offer_email_status",
        "cohort_waitlist_entries",
        ["offer_email_status"],
        unique=False,
    )
    op.create_check_constraint(
        "ck_cohort_waitlist_offer_email_status",
        "cohort_waitlist_entries",
        "offer_email_status IN ('pending', 'dispatching', 'failed', 'sent', 'reconciliation_required')",
    )


def downgrade() -> None:
    bind = op.get_bind()
    active = bind.execute(sa.text(
        "SELECT COUNT(*) FROM cohort_waitlist_entries "
        "WHERE status IN ('offered', 'checkout_started')"
    )).scalar_one()
    if active:
        raise RuntimeError(
            "Refusing downgrade while active waitlist offers exist; finish or revoke them before rollback"
        )
    op.drop_constraint("ck_cohort_waitlist_offer_email_status", "cohort_waitlist_entries", type_="check")
    op.drop_index("ix_cohort_waitlist_entries_offer_email_status", table_name="cohort_waitlist_entries")
    op.drop_column("cohort_waitlist_entries", "offer_email_payload")
    op.drop_column("cohort_waitlist_entries", "offer_email_last_attempt_at")
    op.drop_column("cohort_waitlist_entries", "offer_email_first_dispatched_at")
    op.drop_column("cohort_waitlist_entries", "offer_email_last_error_code")
    op.drop_column("cohort_waitlist_entries", "offer_email_attempt_count")
    op.drop_column("cohort_waitlist_entries", "offer_email_status")
