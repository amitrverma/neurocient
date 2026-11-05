"""enforce immutable provider order identity

Revision ID: 20261105_0017
Revises: 20261104_0016
Create Date: 2026-11-05 14:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261105_0017"
down_revision: str | Sequence[str] | None = "20261104_0016"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    duplicate = bind.execute(
        sa.text(
            """
            SELECT provider, provider_order_id, COUNT(*) AS record_count
            FROM payment_records
            GROUP BY provider, provider_order_id
            HAVING COUNT(*) > 1
            ORDER BY record_count DESC, provider, provider_order_id
            LIMIT 1
            """
        )
    ).mappings().first()
    if duplicate:
        raise RuntimeError(
            "Refusing payment order uniqueness migration: duplicate provider/order "
            "records require provider-verified forward repair before retrying"
        )

    op.create_unique_constraint(
        "uq_payment_record_provider_order",
        "payment_records",
        ["provider", "provider_order_id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_payment_record_provider_order",
        "payment_records",
        type_="unique",
    )
