"""Create or resume a membership welcome email for one exact user UUID."""

import argparse
import asyncio
from uuid import UUID

from app.database import AsyncSessionLocal
from app.services.membership_welcome_email import (
    deliver_membership_welcome_email,
    ensure_membership_welcome_delivery,
)


async def run(user_id: UUID) -> None:
    async with AsyncSessionLocal() as db:
        delivery = await ensure_membership_welcome_delivery(db, user_id)
        if delivery is None:
            print("membership welcome email: not due")
            return
        await db.commit()
        result = await deliver_membership_welcome_email(db, user_id)
        print(f"membership welcome email: {result}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("user_id", type=UUID)
    args = parser.parse_args()
    asyncio.run(run(args.user_id))


if __name__ == "__main__":
    main()
