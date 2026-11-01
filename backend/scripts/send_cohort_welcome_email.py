"""Create or retry one paid cohort enrollment's welcome email delivery."""

import argparse
import asyncio
from uuid import UUID

from app.database import AsyncSessionLocal
from app.services.cohort_welcome_email import (
    deliver_welcome_email,
    ensure_welcome_email_delivery,
)


async def run(enrollment_id: UUID) -> str:
    async with AsyncSessionLocal() as db:
        delivery = await ensure_welcome_email_delivery(db, enrollment_id)
        if not delivery:
            raise RuntimeError(
                "Enrollment is missing or is not confirmed for welcome email delivery"
            )
        await db.commit()
        return await deliver_welcome_email(db, enrollment_id)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("enrollment_id", type=UUID)
    args = parser.parse_args()
    result = asyncio.run(run(args.enrollment_id))
    print(f"cohort welcome email: {result}")


if __name__ == "__main__":
    main()
