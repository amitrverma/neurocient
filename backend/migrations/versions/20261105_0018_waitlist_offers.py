"""add account-bound cohort waitlist offers

Revision ID: 20261105_0018
Revises: 20261105_0017
Create Date: 2026-11-05 18:30:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261105_0018"
down_revision: str | Sequence[str] | None = "20261105_0017"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("cohort_waitlist_entries", sa.Column("offered_at", sa.DateTime(), nullable=True))
    op.add_column("cohort_waitlist_entries", sa.Column("offer_expires_at", sa.DateTime(), nullable=True))
    op.add_column("cohort_waitlist_entries", sa.Column("offer_email_sent_at", sa.DateTime(), nullable=True))
    op.add_column("cohort_waitlist_entries", sa.Column("offer_email_provider_id", sa.String(), nullable=True))
    op.create_index(
        "ix_cohort_waitlist_offer_expiry",
        "cohort_waitlist_entries",
        ["cohort_id", "status", "offer_expires_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_cohort_waitlist_offer_expiry", table_name="cohort_waitlist_entries")
    op.drop_column("cohort_waitlist_entries", "offer_email_provider_id")
    op.drop_column("cohort_waitlist_entries", "offer_email_sent_at")
    op.drop_column("cohort_waitlist_entries", "offer_expires_at")
    op.drop_column("cohort_waitlist_entries", "offered_at")
