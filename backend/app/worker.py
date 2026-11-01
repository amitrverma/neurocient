from __future__ import annotations

import asyncio
import logging

from app.config import settings
from app.observability import configure_logging, log_event
from app.utils.scheduler import record_heartbeat, start_scheduler, stop_scheduler


logger = logging.getLogger("worker")


async def serve() -> None:
    configure_logging()
    settings.validate_for_startup()
    if not settings.ENABLE_SCHEDULER:
        raise RuntimeError(
            "Dedicated worker is disabled; set ENABLE_SCHEDULER=true only on the worker process"
        )
    await record_heartbeat()
    start_scheduler()
    log_event(
        logger,
        "worker_ready",
        component="worker",
        operation="worker_start",
        outcome="success",
    )
    try:
        await asyncio.Event().wait()
    finally:
        stop_scheduler()


def main() -> None:
    asyncio.run(serve())


if __name__ == "__main__":
    main()
