import asyncio
import signal
import sys
import logging

from app.config import get_settings, setup_logging
from app.jobs.scheduler import create_scheduler
from app.db import engine

logger = setup_logging()
settings = get_settings()

_scheduler = None
_shutdown_event = asyncio.Event()


def _handle_signal(signum, frame):
    """Handle OS signals for graceful shutdown."""
    logger.info("Received signal %s, initiating shutdown...", signum)
    _shutdown_event.set()


async def start_worker():
    """Start the ingestion worker."""
    global _scheduler

    logger.info("Starting prepturk ingestion worker...")
    logger.info("Database: %s", settings.database_url.split("@")[-1] if "@" in settings.database_url else "in-memory")
    logger.info("Qdrant: %s", settings.qdrant_url)
    logger.info("Ollama: %s", settings.ollama_base_url)
    logger.info("Storage root: %s", settings.storage_root)
    logger.info("OCR enabled: %s", settings.ocr_enabled)
    logger.info("Manifest dir: %s", settings.manifest_dir)

    # Create scheduler
    _scheduler = await create_scheduler()

    # Register signal handlers
    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)

    logger.info("Worker started. Press Ctrl+C to stop.")

    # Wait for shutdown signal
    await _shutdown_event.wait()

    logger.info("Shutdown signal received, stopping worker...")
    await stop_worker()


async def stop_worker():
    """Stop the ingestion worker gracefully."""
    global _scheduler

    logger.info("Stopping ingestion worker...")

    if _scheduler:
        logger.info("Shutting down scheduler...")
        _scheduler.shutdown(wait=True)
        _scheduler = None

    # Wait briefly for any running jobs to finish
    try:
        await asyncio.wait_for(_shutdown_event.wait(), timeout=5.0)
    except asyncio.TimeoutError:
        logger.warning("Jobs did not finish within timeout, proceeding with shutdown")

    # Dispose of database engine
    try:
        await engine.dispose()
        logger.info("Database connections closed")
    except Exception as exc:
        logger.warning("Error disposing database engine: %s", exc)

    logger.info("Worker stopped.")


def main():
    """Entry point."""
    try:
        asyncio.run(start_worker())
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received.")
    except Exception as exc:
        logger.exception("Worker crashed: %s", exc)
        sys.exit(1)


if __name__ == "__main__":
    main()
