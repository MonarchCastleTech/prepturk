from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, delete
from typing import Optional
import uuid

from app.db.database import get_db
from app.db.models import User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting, DocumentVersion
from app.schemas import *
from app.security.auth import get_local_device_operator, require_admin

router = APIRouter()


async def _build_unique_document_slug(db: AsyncSession, title: str) -> str:
    from slugify import slugify

    base_slug = slugify(title)[:500] or str(uuid.uuid4())[:8]
    candidate = base_slug
    suffix = 2

    while True:
        result = await db.execute(select(Document.id).where(Document.slug == candidate))
        if result.scalar_one_or_none() is None:
            return candidate

        suffix_text = f"-{suffix}"
        candidate = f"{base_slug[: 500 - len(suffix_text)]}{suffix_text}"
        suffix += 1


@router.get("/", response_model=list[DocumentResponse])
async def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    province: Optional[str] = None,
    institution: Optional[str] = None,
    trust_level: Optional[TrustLevelEnum] = None,
    review_status: Optional[str] = None,
    archived: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """List documents with pagination and filtering."""
    query = select(Document).where(Document.deleted_at.is_(None))

    if category:
        query = query.where(Document.category == category)
    if province:
        query = query.where(Document.province == province)
    if institution:
        query = query.where(Document.institution == institution)
    if trust_level:
        query = query.where(Document.trust_level == trust_level)
    if review_status:
        query = query.where(Document.review_status == review_status)
    if archived is not None:
        query = query.where(Document.archived == archived)
    if search:
        query = query.where(
            or_(
                Document.title.ilike(f"%{search}%"),
                Document.summary.ilike(f"%{search}%"),
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * page_size
    query = query.order_by(Document.created_at.desc()).offset(offset).limit(page_size)

    result = await db.execute(query)
    documents = result.scalars().all()

    return [DocumentResponse.model_validate(d) for d in documents]


@router.get("/total-count")
async def get_documents_total_count(
    category: Optional[str] = None,
    province: Optional[str] = None,
    institution: Optional[str] = None,
    trust_level: Optional[TrustLevelEnum] = None,
    review_status: Optional[str] = None,
    archived: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Get total document count with applied filters."""
    query = select(func.count(Document.id)).where(Document.deleted_at.is_(None))

    if category:
        query = query.where(Document.category == category)
    if province:
        query = query.where(Document.province == province)
    if institution:
        query = query.where(Document.institution == institution)
    if trust_level:
        query = query.where(Document.trust_level == trust_level)
    if review_status:
        query = query.where(Document.review_status == review_status)
    if archived is not None:
        query = query.where(Document.archived == archived)
    if search:
        query = query.where(
            or_(
                Document.title.ilike(f"%{search}%"),
                Document.summary.ilike(f"%{search}%"),
            )
        )

    result = await db.execute(query)
    return {"total": result.scalar()}


@router.get("/{doc_id}", response_model=DocumentDetail)
async def get_document(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Get a single document by ID."""
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.deleted_at.is_(None))
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Belge bulunamadi")
    return DocumentDetail.model_validate(doc)


@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    request: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Create a new document."""
    slug_value = await _build_unique_document_slug(db, request.title)

    doc = Document(
        slug=slug_value,
        title=request.title,
        subtitle=request.subtitle,
        language=request.language,
        province=request.province,
        category=request.category,
        subcategory=request.subcategory,
        topic_tags=request.topic_tags,
        institution=request.institution,
        trust_level=request.trust_level,
        storage_mode=request.storage_mode,
        rights_status=request.rights_status,
        source_url=request.source_url,
        summary=request.summary,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return DocumentResponse.model_validate(doc)


@router.put("/{doc_id}", response_model=DocumentResponse)
async def update_document(
    doc_id: uuid.UUID,
    request: DocumentUpdate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Update a document."""
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.deleted_at.is_(None))
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Belge bulunamadi")

    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doc, field, value)

    await db.commit()
    await db.refresh(doc)
    return DocumentResponse.model_validate(doc)


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Soft delete a document."""
    from datetime import datetime, timezone
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.deleted_at.is_(None))
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Belge bulunamadi")

    doc.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return None


@router.delete("/{doc_id}/hard", status_code=status.HTTP_204_NO_CONTENT)
async def hard_delete_document(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Permanently delete a document (admin only)."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Belge bulunamadi")
    await db.delete(doc)
    await db.commit()
    return None


@router.get("/{doc_id}/versions", response_model=list[dict])
async def get_document_versions(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Get all versions of a document."""
    result = await db.execute(
        select(DocumentVersion)
        .where(DocumentVersion.document_id == doc_id)
        .order_by(DocumentVersion.created_at.desc())
    )
    versions = result.scalars().all()

    return [
        {
            "id": v.id,
            "version_label": v.version_label,
            "version_hash": v.version_hash,
            "notes": v.notes,
            "created_at": v.created_at,
        }
        for v in versions
    ]


@router.get("/{doc_id}/versions/{version_id}", response_model=dict)
async def get_document_version(
    doc_id: uuid.UUID,
    version_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Get a specific document version."""
    result = await db.execute(
        select(DocumentVersion).where(
            DocumentVersion.id == version_id,
            DocumentVersion.document_id == doc_id,
        )
    )
    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Belge versiyonu bulunamadi")

    return {
        "id": version.id,
        "document_id": version.document_id,
        "version_label": version.version_label,
        "version_hash": version.version_hash,
        "content_snapshot": version.content_snapshot,
        "metadata_snapshot": version.metadata_snapshot,
        "notes": version.notes,
        "created_at": version.created_at,
    }
