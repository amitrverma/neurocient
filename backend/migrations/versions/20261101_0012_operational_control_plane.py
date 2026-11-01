"""add operational reconciliation and durable worker claims

Revision ID: 20261101_0012
Revises: 20261101_0011
Create Date: 2026-11-01 21:30:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20261101_0012"
down_revision: str | Sequence[str] | None = "20261101_0011"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

PROTECTED_OPERATIONAL_TABLES = (
    "notification_dispatches",
    "worker_heartbeats",
    "scheduled_job_runs",
    "reconciliation_issues",
    "reconciliation_checkpoints",
)


def upgrade() -> None:
    op.add_column("membership_entitlements", sa.Column("cancellation_state", sa.String(), nullable=True))
    op.add_column("membership_entitlements", sa.Column("cancellation_requested_at", sa.DateTime(), nullable=True))
    op.create_check_constraint(
        "ck_membership_cancellation_state",
        "membership_entitlements",
        "cancellation_state IS NULL OR cancellation_state IN ('requesting', 'requested', 'failed', 'unknown', 'completed')",
    )
    op.create_index("ix_membership_entitlements_cancellation_state", "membership_entitlements", ["cancellation_state"])

    op.create_table(
        "reconciliation_issues",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("dedupe_key", sa.String(length=64), nullable=False, unique=True),
        sa.Column("product", sa.String(), nullable=False),
        sa.Column("issue_code", sa.String(), nullable=False),
        sa.Column("object_type", sa.String(), nullable=False),
        sa.Column("local_object_id", sa.String(), nullable=False),
        sa.Column("provider_object_id", sa.String(), nullable=True),
        sa.Column("severity", sa.String(), nullable=False, server_default="warning"),
        sa.Column("status", sa.String(), nullable=False, server_default="open"),
        sa.Column("details", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("correlation_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("first_seen_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("last_seen_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("status IN ('open', 'resolved')", name="ck_reconciliation_issue_status"),
        sa.CheckConstraint("severity IN ('warning', 'critical')", name="ck_reconciliation_issue_severity"),
    )
    op.create_index("ix_reconciliation_issues_product", "reconciliation_issues", ["product"])
    op.create_index("ix_reconciliation_issues_issue_code", "reconciliation_issues", ["issue_code"])
    op.create_index("ix_reconciliation_issues_status", "reconciliation_issues", ["status"])
    op.create_index("ix_reconciliation_issue_open", "reconciliation_issues", ["status", "last_seen_at"])

    op.create_table(
        "reconciliation_checkpoints",
        sa.Column("stream_name", sa.String(), primary_key=True),
        sa.Column("cursor", sa.String(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "scheduled_job_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("job_name", sa.String(), nullable=False),
        sa.Column("run_key", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="running"),
        sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("correlation_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lease_expires_at", sa.DateTime(), nullable=False),
        sa.Column("result", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("last_error_code", sa.String(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("job_name", "run_key", name="uq_scheduled_job_run_key"),
        sa.CheckConstraint(
            "status IN ('running', 'completed', 'failed', 'reconciliation_required')",
            name="ck_scheduled_job_run_status",
        ),
    )
    op.create_index("ix_scheduled_job_runs_status", "scheduled_job_runs", ["status"])
    op.create_index("ix_scheduled_job_runs_lease_expires_at", "scheduled_job_runs", ["lease_expires_at"])

    op.create_table(
        "worker_heartbeats",
        sa.Column("worker_name", sa.String(), primary_key=True),
        sa.Column("instance_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_worker_heartbeats_last_seen_at", "worker_heartbeats", ["last_seen_at"])

    op.create_table(
        "notification_dispatches",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("purpose", sa.String(), nullable=False),
        sa.Column("channel", sa.String(), nullable=False),
        sa.Column("destination_key", sa.String(), nullable=False),
        sa.Column("dispatch_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="dispatching"),
        sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("correlation_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("provider_message_id", sa.String(), nullable=True),
        sa.Column("last_error_code", sa.String(), nullable=True),
        sa.Column("first_attempt_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("last_attempt_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "purpose", "channel", "dispatch_date", name="uq_notification_dispatch_daily"),
        sa.CheckConstraint("status IN ('dispatching', 'sent', 'failed', 'skipped', 'reconciliation_required')", name="ck_notification_dispatch_status"),
        sa.CheckConstraint("channel IN ('push', 'whatsapp')", name="ck_notification_dispatch_channel"),
    )
    op.create_index("ix_notification_dispatches_user_id", "notification_dispatches", ["user_id"])
    op.create_index("ix_notification_dispatches_status", "notification_dispatches", ["status"])


def downgrade() -> None:
    bind = op.get_bind()
    for table in PROTECTED_OPERATIONAL_TABLES:
        exists = bind.execute(
            sa.text("SELECT to_regclass(:table_name)"),
            {"table_name": table},
        ).scalar_one()
        if exists is None:
            continue
        count = bind.execute(sa.text(f"SELECT count(*) FROM {table}")).scalar_one()
        if count:
            raise RuntimeError(
                "Refusing destructive downgrade: operational evidence exists; use forward repair"
            )
    op.drop_table("notification_dispatches")
    # During development this revision was rehearsed before the heartbeat
    # table was added. IF EXISTS lets that uncommitted draft return to its
    # parent so the final revision can be exercised cleanly.
    op.execute("DROP TABLE IF EXISTS worker_heartbeats")
    op.drop_table("scheduled_job_runs")
    op.execute("DROP TABLE IF EXISTS reconciliation_checkpoints")
    op.drop_table("reconciliation_issues")
    op.drop_index("ix_membership_entitlements_cancellation_state", table_name="membership_entitlements")
    op.drop_constraint("ck_membership_cancellation_state", "membership_entitlements", type_="check")
    op.drop_column("membership_entitlements", "cancellation_requested_at")
    op.drop_column("membership_entitlements", "cancellation_state")
