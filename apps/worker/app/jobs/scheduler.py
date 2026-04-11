import os
import glob
import logging
from typing import Dict, Any

import yaml
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.executors.asyncio import AsyncIOExecutor

from app.config import get_settings
from app.jobs.ingestion_job import create_ingestion_job

logger = logging.getLogger("worker.scheduler")
settings = get_settings()


def _load_manifests(manifest_dir: str) -> Dict[str, Dict[str, Any]]:
    """Load all YAML manifests from the manifest directory."""
    manifests: Dict[str, Dict[str, Any]] = {}
    pattern = os.path.join(manifest_dir, "*.yaml")

    for filepath in glob.glob(pattern):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
            if data and "name" in data:
                manifests[data["name"]] = {
                    **data,
                    "_filepath": filepath,
                }
                logger.debug("Loaded manifest: %s", data["name"])
        except Exception as exc:
            logger.warning("Failed to load manifest %s: %s", filepath, exc)

    return manifests


async def create_scheduler() -> AsyncIOScheduler:
    """Create and configure the APScheduler with ingestion jobs."""
    job_stores = {
        "default": MemoryJobStore(),
    }

    executors = {
        "default": AsyncIOExecutor(),
    }

    job_defaults = {
        "coalesce": True,
        "max_instances": 1,
        "misfire_grace_time": 300,
    }

    scheduler = AsyncIOScheduler(
        jobstores=job_stores,
        executors=executors,
        job_defaults=job_defaults,
    )

    if settings.airgap_mode:
        logger.warning("AIRGAP_MODE is enabled. All outbound ingestion jobs are DISABLED for OPSEC.")
        scheduler.start()
        return scheduler

    manifests = _load_manifests(settings.manifest_dir)
    logger.info("Found %d source manifests", len(manifests))

    for name, manifest_data in manifests.items():
        schedule = manifest_data.get("schedule")
        if not schedule:
            # No schedule means run once on startup
            logger.info("Scheduling one-time ingestion for: %s", name)
            job = create_ingestion_job(manifest_data)
            scheduler.add_job(
                job,
                trigger="date",
                id=f"ingest_{name}",
                name=f"Ingest {name}",
                run_date=None,  # runs immediately
                replace_existing=True,
            )
        else:
            logger.info(
                "Scheduling periodic ingestion for %s with cron: %s",
                name,
                schedule,
            )
            job = create_ingestion_job(manifest_data)
            scheduler.add_job(
                job,
                trigger="cron",
                id=f"ingest_{name}",
                name=f"Ingest {name}",
                cron=schedule,
                replace_existing=True,
            )

    scheduler.start()
    logger.info("Scheduler started with %d jobs", len(scheduler.get_jobs()))

    return scheduler
