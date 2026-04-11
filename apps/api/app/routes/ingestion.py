from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional
import uuid

from app.db.database import get_db
from app.db.models import User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting, IngestionEvent
from app.schemas import *
from app.security.auth import get_current_active_user, require_admin

router = APIRouter()


@router.get("/runs", response_model=list[IngestionRunResponse])
async def list_ingestion_runs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    source_id: Optional[uuid.UUID] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """List ingestion runs with pagination and filtering."""
    query = select(IngestionRun)

    if source_id:
        query = query.where(IngestionRun.source_id == source_id)
    if status_filter:
        query = query.where(IngestionRun.status == status_filter)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * page_size
    query = query.order_by(IngestionRun.started_at.desc()).offset(offset).limit(page_size)

    result = await db.execute(query)
    runs = result.scalars().all()

    return [IngestionRunResponse.model_validate(r) for r in runs]


@router.get("/runs/total-count")
async def get_runs_total_count(
    source_id: Optional[uuid.UUID] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Get total ingestion run count with applied filters."""
    query = select(func.count(IngestionRun.id))

    if source_id:
        query = query.where(IngestionRun.source_id == source_id)
    if status_filter:
        query = query.where(IngestionRun.status == status_filter)

    result = await db.execute(query)
    return {"total": result.scalar()}


@router.get("/runs/{run_id}", response_model=dict)
async def get_ingestion_run(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Get a single ingestion run by ID."""
    result = await db.execute(select(IngestionRun).where(IngestionRun.id == run_id))
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Iceri aktarma isi bulunamadi")

    run_data = IngestionRunResponse.model_validate(run)
    return {
        "id": run_data.id,
        "source_id": run_data.source_id,
        "adapter_name": run_data.adapter_name,
        "status": run_data.status,
        "started_at": run_data.started_at,
        "completed_at": run_data.completed_at,
        "documents_found": run_data.documents_found,
        "documents_fetched": run_data.documents_fetched,
        "documents_indexed": run_data.documents_indexed,
        "documents_failed": run_data.documents_failed,
        "error_log": run.error_log,
        "metadata": run.metadata,
    }


@router.get("/runs/{run_id}/events", response_model=list[dict])
async def get_ingestion_run_events(
    run_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    event_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Get ingestion events for a specific run."""
    query = select(IngestionEvent).where(IngestionEvent.run_id == run_id)

    if event_type:
        query = query.where(IngestionEvent.event_type == event_type)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * page_size
    query = query.order_by(IngestionEvent.created_at.desc()).offset(offset).limit(page_size)

    result = await db.execute(query)
    events = result.scalars().all()

    return [
        {
            "id": e.id,
            "run_id": e.run_id,
            "document_id": e.document_id,
            "event_type": e.event_type,
            "message": e.message,
            "metadata": e.metadata,
            "created_at": e.created_at,
        }
        for e in events
    ]


@router.get("/runs/{run_id}/events/total-count")
async def get_events_total_count(
    run_id: uuid.UUID,
    event_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Get total event count for a run."""
    query = select(func.count(IngestionEvent.id)).where(IngestionEvent.run_id == run_id)

    if event_type:
        query = query.where(IngestionEvent.event_type == event_type)

    result = await db.execute(query)
    return {"total": result.scalar()}
