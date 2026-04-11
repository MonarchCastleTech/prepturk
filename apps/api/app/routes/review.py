from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, update
from typing import Optional
import uuid
from datetime import datetime, timezone

from app.db.database import get_db
from app.db.models import User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting, ReviewQueue
from app.schemas import *
from app.security.auth import get_current_active_user, require_admin

router = APIRouter()


@router.get("/queue", response_model=list[dict])
async def get_review_queue(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Get the review queue with pagination and filtering."""
    from sqlalchemy.orm import selectinload

    query = select(ReviewQueue).options(selectinload(ReviewQueue.document))

    if status_filter:
        query = query.where(ReviewQueue.status == status_filter)
    if priority is not None:
        query = query.where(ReviewQueue.priority == priority)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * page_size
    query = (
        query.order_by(ReviewQueue.priority.desc(), ReviewQueue.created_at.asc())
        .offset(offset)
        .limit(page_size)
    )

    result = await db.execute(query)
    items = result.scalars().all()

    results = []
    for item in items:
        doc_data = None
        if item.document:
            doc_data = {
                "id": item.document.id,
                "title": item.document.title,
                "category": item.document.category,
                "province": item.document.province,
                "trust_level": item.document.trust_level,
                "review_status": item.document.review_status,
            }
        results.append(
            {
                "id": item.id,
                "document_id": item.document_id,
                "document": doc_data,
                "reviewer_id": item.reviewer_id,
                "status": item.status,
                "priority": item.priority,
                "notes": item.notes,
                "review_result": item.review_result,
                "reviewed_at": item.reviewed_at,
                "created_at": item.created_at,
            }
        )

    return results


@router.get("/queue/total-count")
async def get_review_queue_total_count(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Get total review queue count with applied filters."""
    query = select(func.count(ReviewQueue.id))

    if status_filter:
        query = query.where(ReviewQueue.status == status_filter)
    if priority is not None:
        query = query.where(ReviewQueue.priority == priority)

    result = await db.execute(query)
    return {"total": result.scalar()}


@router.post("/queue/{doc_id}", status_code=status.HTTP_201_CREATED)
async def add_to_review_queue(
    doc_id: uuid.UUID,
    request: dict,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Add a document to the review queue."""
    doc_result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = doc_result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Belge bulunamadi")

    existing = await db.execute(
        select(ReviewQueue).where(
            ReviewQueue.document_id == doc_id,
            ReviewQueue.status.in_(["review_needed", "pending"]),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Belge zaten gozden gecirme sirasinda")

    queue_item = ReviewQueue(
        document_id=doc_id,
        status=request.get("status", "review_needed"),
        priority=request.get("priority", 0),
        notes=request.get("notes"),
    )
    db.add(queue_item)

    doc.review_status = "review_needed"
    await db.commit()
    await db.refresh(queue_item)

    return {
        "id": queue_item.id,
        "document_id": queue_item.document_id,
        "status": queue_item.status,
        "priority": queue_item.priority,
        "message": "Belge gozden gecirme kuyruguna eklendi",
    }


@router.post("/queue/{queue_id}/approve")
async def approve_document(
    queue_id: uuid.UUID,
    request: dict,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Approve a document from the review queue."""
    result = await db.execute(select(ReviewQueue).where(ReviewQueue.id == queue_id))
    queue_item = result.scalar_one_or_none()
    if not queue_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gozden gecirme kaydi bulunamadi")

    doc_result = await db.execute(select(Document).where(Document.id == queue_item.document_id))
    doc = doc_result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Belge bulunamadi")

    doc.review_status = "approved"
    queue_item.status = "approved"
    queue_item.review_result = "approved"
    queue_item.reviewed_at = datetime.now(timezone.utc)
    queue_item.reviewer_id = _current_user.id
    queue_item.notes = request.get("notes", queue_item.notes)

    await db.commit()

    return {
        "message": "Belge onaylandi",
        "document_id": doc.id,
        "review_status": "approved",
    }


@router.post("/queue/{queue_id}/reject")
async def reject_document(
    queue_id: uuid.UUID,
    request: dict,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Reject a document from the review queue."""
    result = await db.execute(select(ReviewQueue).where(ReviewQueue.id == queue_id))
    queue_item = result.scalar_one_or_none()
    if not queue_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gozden gecirme kaydi bulunamadi")

    doc_result = await db.execute(select(Document).where(Document.id == queue_item.document_id))
    doc = doc_result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Belge bulunamadi")

    doc.review_status = "rejected"
    queue_item.status = "rejected"
    queue_item.review_result = "rejected"
    queue_item.reviewed_at = datetime.now(timezone.utc)
    queue_item.reviewer_id = _current_user.id
    queue_item.notes = request.get("notes", queue_item.notes)

    await db.commit()

    return {
        "message": "Belge reddedildi",
        "document_id": doc.id,
        "review_status": "rejected",
    }
