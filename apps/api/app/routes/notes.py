from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, delete
from typing import Optional
import uuid

from app.db.database import get_db
from app.db.models import User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting
from app.schemas import *
from app.security.auth import get_local_device_operator

router = APIRouter()


@router.get("/", response_model=list[NoteResponse])
async def list_notes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    note_type: Optional[str] = None,
    is_pinned: Optional[bool] = None,
    is_emergency: Optional[bool] = None,
    province: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """List user's notes with pagination and filtering."""
    query = select(Note).where(Note.user_id == current_user.id)

    if note_type:
        query = query.where(Note.note_type == note_type)
    if is_pinned is not None:
        query = query.where(Note.is_pinned == is_pinned)
    if is_emergency is not None:
        query = query.where(Note.is_emergency == is_emergency)
    if province:
        query = query.where(Note.province == province)
    if tag:
        query = query.where(Note.tags.contains([tag]))
    if search:
        query = query.where(
            or_(
                Note.title.ilike(f"%{search}%"),
                Note.content.ilike(f"%{search}%"),
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * page_size
    query = query.order_by(Note.is_pinned.desc(), Note.updated_at.desc()).offset(offset).limit(page_size)

    result = await db.execute(query)
    notes = result.scalars().all()

    return [NoteResponse.model_validate(n) for n in notes]


@router.get("/total-count")
async def get_notes_total_count(
    note_type: Optional[str] = None,
    is_pinned: Optional[bool] = None,
    is_emergency: Optional[bool] = None,
    province: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Get total note count with applied filters."""
    query = select(func.count(Note.id)).where(Note.user_id == current_user.id)

    if note_type:
        query = query.where(Note.note_type == note_type)
    if is_pinned is not None:
        query = query.where(Note.is_pinned == is_pinned)
    if is_emergency is not None:
        query = query.where(Note.is_emergency == is_emergency)
    if province:
        query = query.where(Note.province == province)
    if tag:
        query = query.where(Note.tags.contains([tag]))
    if search:
        query = query.where(
            or_(
                Note.title.ilike(f"%{search}%"),
                Note.content.ilike(f"%{search}%"),
            )
        )

    result = await db.execute(query)
    return {"total": result.scalar()}


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Get a single note by ID."""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not bulunamadi")
    return NoteResponse.model_validate(note)


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    request: NoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Create a new note."""
    note = Note(
        user_id=current_user.id,
        title=request.title,
        content=request.content,
        note_type=request.note_type,
        is_pinned=request.is_pinned,
        is_emergency=request.is_emergency,
        province=request.province,
        tags=request.tags,
        related_documents=[],
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return NoteResponse.model_validate(note)


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: uuid.UUID,
    request: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Update a note."""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not bulunamadi")

    updatable_fields = [
        "title", "content", "note_type", "is_pinned", "is_emergency",
        "province", "tags", "related_documents",
    ]
    for field in updatable_fields:
        if field in request:
            setattr(note, field, request[field])

    await db.commit()
    await db.refresh(note)
    return NoteResponse.model_validate(note)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Delete a note."""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not bulunamadi")
    await db.delete(note)
    await db.commit()
    return None
