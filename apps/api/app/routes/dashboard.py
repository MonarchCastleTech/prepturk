from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional
import uuid
import os
from datetime import datetime, timezone, timedelta

from app.db.database import get_db
from app.db.models import (
    User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting,
    AuditLog, ReviewQueue,
)
from app.schemas import *
from app.security.auth import get_current_active_user, require_admin
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get dashboard statistics."""
    # Total documents
    total_docs_result = await db.execute(
        select(func.count(Document.id)).where(Document.deleted_at.is_(None))
    )
    total_documents = total_docs_result.scalar()

    # Official documents
    official_docs_result = await db.execute(
        select(func.count(Document.id)).where(
            Document.deleted_at.is_(None),
            Document.trust_level == "official",
        )
    )
    official_documents = official_docs_result.scalar()

    # Total sources
    total_sources_result = await db.execute(select(func.count(SourceManifest.id)))
    total_sources = total_sources_result.scalar()

    # Active sources
    active_sources_result = await db.execute(
        select(func.count(SourceManifest.id)).where(SourceManifest.is_active == True)
    )
    active_sources = active_sources_result.scalar()

    # Storage stats
    total_storage_bytes = 0
    storage_used_bytes = 0

    storage_dirs = [
        settings.storage_originals,
        settings.storage_extracted,
        settings.storage_previews,
        settings.storage_thumbnails,
        settings.storage_vault,
        settings.storage_exports,
    ]

    for dir_path in storage_dirs:
        if os.path.exists(dir_path):
            for dirpath, dirnames, filenames in os.walk(dir_path):
                for f in filenames:
                    fp = os.path.join(dirpath, f)
                    if os.path.exists(fp):
                        storage_used_bytes += os.path.getsize(fp)

    # Recent documents
    recent_docs_result = await db.execute(
        select(Document)
        .where(Document.deleted_at.is_(None))
        .order_by(Document.created_at.desc())
        .limit(5)
    )
    recent_docs = recent_docs_result.scalars().all()
    recent_documents = [DocumentResponse.model_validate(d) for d in recent_docs]

    # Recent ingestion runs
    recent_runs_result = await db.execute(
        select(IngestionRun)
        .order_by(IngestionRun.started_at.desc())
        .limit(5)
    )
    recent_runs = recent_runs_result.scalars().all()
    recent_ingestion_runs = [IngestionRunResponse.model_validate(r) for r in recent_runs]

    # Province packs count
    packs_count_result = await db.execute(
        select(func.count(ProvincePack.id)).where(ProvincePack.is_active == True)
    )
    province_packs_count = packs_count_result.scalar()

    # Pending reviews
    pending_reviews_result = await db.execute(
        select(func.count(ReviewQueue.id)).where(
            ReviewQueue.status.in_(["review_needed", "pending"])
        )
    )
    pending_reviews = pending_reviews_result.scalar()

    return DashboardStats(
        total_documents=total_documents,
        official_documents=official_documents,
        total_sources=total_sources,
        active_sources=active_sources,
        total_storage_bytes=total_storage_bytes,
        storage_used_bytes=storage_used_bytes,
        recent_documents=recent_documents,
        recent_ingestion_runs=recent_ingestion_runs,
        province_packs_count=province_packs_count,
        pending_reviews=pending_reviews,
    )


@router.get("/activity", response_model=list[dict])
async def get_recent_activity(
    limit: int = Query(20, ge=1, le=100),
    activity_type: Optional[str] = None,
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get recent activity across the system."""
    activities = []
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # Recent documents
    if activity_type is None or activity_type == "documents":
        docs_result = await db.execute(
            select(Document)
            .where(Document.deleted_at.is_(None), Document.created_at >= since)
            .order_by(Document.created_at.desc())
            .limit(limit)
        )
        docs = docs_result.scalars().all()
        for d in docs:
            activities.append(
                {
                    "type": "document_created",
                    "id": d.id,
                    "title": d.title,
                    "category": d.category,
                    "province": d.province,
                    "timestamp": d.created_at,
                    "details": {
                        "institution": d.institution,
                        "trust_level": d.trust_level,
                    },
                }
            )

    # Recent ingestion runs
    if activity_type is None or activity_type == "ingestion":
        runs_result = await db.execute(
            select(IngestionRun)
            .where(IngestionRun.started_at >= since)
            .order_by(IngestionRun.started_at.desc())
            .limit(limit)
        )
        runs = runs_result.scalars().all()
        for r in runs:
            activities.append(
                {
                    "type": "ingestion_run",
                    "id": r.id,
                    "title": f"Iceri aktarma: {r.adapter_name}",
                    "status": r.status,
                    "timestamp": r.started_at,
                    "details": {
                        "documents_found": r.documents_found,
                        "documents_fetched": r.documents_fetched,
                        "documents_indexed": r.documents_indexed,
                        "documents_failed": r.documents_failed,
                    },
                }
            )

    # Recent reviews
    if activity_type is None or activity_type == "review":
        reviews_result = await db.execute(
            select(ReviewQueue)
            .where(ReviewQueue.reviewed_at >= since)
            .order_by(ReviewQueue.reviewed_at.desc())
            .limit(limit)
        )
        reviews = reviews_result.scalars().all()
        for rv in reviews:
            activities.append(
                {
                    "type": "document_reviewed",
                    "id": rv.id,
                    "title": f"Belge gozden gecirildi: {rv.review_result}",
                    "status": rv.status,
                    "timestamp": rv.reviewed_at,
                    "details": {
                        "document_id": rv.document_id,
                        "review_result": rv.review_result,
                        "notes": rv.notes,
                    },
                }
            )

    # Recent notes
    if activity_type is None or activity_type == "notes":
        notes_result = await db.execute(
            select(Note)
            .where(Note.user_id == current_user.id, Note.created_at >= since)
            .order_by(Note.created_at.desc())
            .limit(limit)
        )
        notes = notes_result.scalars().all()
        for n in notes:
            activities.append(
                {
                    "type": "note_created",
                    "id": n.id,
                    "title": n.title,
                    "timestamp": n.created_at,
                    "details": {
                        "note_type": n.note_type,
                        "province": n.province,
                        "is_pinned": n.is_pinned,
                    },
                }
            )

    # Sort all activities by timestamp
    activities.sort(key=lambda x: x["timestamp"], reverse=True)

    return activities[:limit]


@router.get("/activity/summary", response_model=dict)
async def get_activity_summary(
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a summary of activity counts by type."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # Documents created
    docs_count = await db.execute(
        select(func.count(Document.id)).where(
            Document.deleted_at.is_(None), Document.created_at >= since
        )
    )

    # Ingestion runs
    runs_count = await db.execute(
        select(func.count(IngestionRun.id)).where(IngestionRun.started_at >= since)
    )

    # Reviews completed
    reviews_count = await db.execute(
        select(func.count(ReviewQueue.id)).where(
            ReviewQueue.reviewed_at >= since
        )
    )

    # User notes
    notes_count = await db.execute(
        select(func.count(Note.id)).where(
            Note.user_id == current_user.id, Note.created_at >= since
        )
    )

    return {
        "period_days": days,
        "documents_created": docs_count.scalar(),
        "ingestion_runs": runs_count.scalar(),
        "reviews_completed": reviews_count.scalar(),
        "notes_created": notes_count.scalar(),
    }
