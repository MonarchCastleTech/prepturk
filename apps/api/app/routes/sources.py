from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, delete
from typing import Optional
import uuid

from app.db.database import get_db
from app.db.models import User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting
from app.schemas import *
from app.security.auth import get_current_active_user, require_admin

router = APIRouter()


@router.get("/", response_model=list[SourceManifestResponse])
async def list_sources(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """List source manifests with pagination and filtering."""
    query = select(SourceManifest)

    if is_active is not None:
        query = query.where(SourceManifest.is_active == is_active)
    if search:
        query = query.where(SourceManifest.name.ilike(f"%{search}%"))

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * page_size
    query = query.order_by(SourceManifest.created_at.desc()).offset(offset).limit(page_size)

    result = await db.execute(query)
    sources = result.scalars().all()

    return [SourceManifestResponse.model_validate(s) for s in sources]


@router.get("/total-count")
async def get_sources_total_count(
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Get total source count with applied filters."""
    query = select(func.count(SourceManifest.id))

    if is_active is not None:
        query = query.where(SourceManifest.is_active == is_active)
    if search:
        query = query.where(SourceManifest.name.ilike(f"%{search}%"))

    result = await db.execute(query)
    return {"total": result.scalar()}


@router.get("/{source_id}", response_model=dict)
async def get_source(
    source_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Get a single source manifest by ID."""
    result = await db.execute(select(SourceManifest).where(SourceManifest.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kaynak bulunamadi")
    return SourceManifestResponse.model_validate(source)


@router.post("/", response_model=SourceManifestResponse, status_code=status.HTTP_201_CREATED)
async def create_source(
    request: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Create a new source manifest (admin only)."""
    existing = await db.execute(select(SourceManifest).where(SourceManifest.name == request.get("name")))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bu isimde bir kaynak zaten mevcut")

    source = SourceManifest(
        name=request["name"],
        base_url=request["base_url"],
        fetch_strategy=request.get("fetch_strategy", "http"),
        robots_note=request.get("robots_note"),
        rate_limit_per_minute=request.get("rate_limit_per_minute", 30),
        default_storage_mode=request.get("default_storage_mode", "pointer-only"),
        default_trust_level=request.get("default_trust_level", "community"),
        default_rights_status=request.get("default_rights_status", "unknown-review-needed"),
        schedule=request.get("schedule"),
        content_selectors=request.get("content_selectors"),
        file_patterns=request.get("file_patterns", []),
        include_patterns=request.get("include_patterns", []),
        exclude_patterns=request.get("exclude_patterns", []),
        html_allowed=request.get("html_allowed", True),
        pdf_allowed=request.get("pdf_allowed", True),
        pointer_only_patterns=request.get("pointer_only_patterns", []),
        province_mapping=request.get("province_mapping"),
        language_default=request.get("language_default", "tr"),
        is_active=request.get("is_active", True),
    )
    db.add(source)
    await db.commit()
    await db.refresh(source)
    return SourceManifestResponse.model_validate(source)


@router.put("/{source_id}", response_model=SourceManifestResponse)
async def update_source(
    source_id: uuid.UUID,
    request: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Update a source manifest (admin only)."""
    result = await db.execute(select(SourceManifest).where(SourceManifest.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kaynak bulunamadi")

    updatable_fields = [
        "name", "base_url", "fetch_strategy", "robots_note", "rate_limit_per_minute",
        "default_storage_mode", "default_trust_level", "default_rights_status",
        "schedule", "content_selectors", "file_patterns", "include_patterns",
        "exclude_patterns", "html_allowed", "pdf_allowed", "pointer_only_patterns",
        "province_mapping", "language_default", "is_active",
    ]
    for field in updatable_fields:
        if field in request:
            setattr(source, field, request[field])

    await db.commit()
    await db.refresh(source)
    return SourceManifestResponse.model_validate(source)


@router.delete("/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_source(
    source_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Delete a source manifest (admin only)."""
    result = await db.execute(select(SourceManifest).where(SourceManifest.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kaynak bulunamadi")
    await db.delete(source)
    await db.commit()
    return None


@router.post("/{source_id}/sync", response_model=dict)
async def trigger_source_sync(
    source_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Trigger a sync for a source manifest. Creates a new ingestion run."""
    result = await db.execute(select(SourceManifest).where(SourceManifest.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kaynak bulunamadi")

    if not source.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Kaynak aktif degil")

    run = IngestionRun(
        source_id=source_id,
        adapter_name=source.fetch_strategy or "http",
        status="pending",
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)

    return {
        "message": "Senkronizasyon baslatildi",
        "run_id": run.id,
        "status": run.status,
    }
