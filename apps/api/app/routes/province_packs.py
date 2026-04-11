from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, delete
from typing import Optional
import uuid

from app.db.database import get_db
from app.db.models import User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting
from app.schemas import *
from app.security.auth import get_local_device_operator, require_admin

router = APIRouter()


@router.get("/", response_model=list[ProvincePackResponse])
async def list_province_packs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """List province packs with pagination and filtering."""
    query = select(ProvincePack)

    if is_active is not None:
        query = query.where(ProvincePack.is_active == is_active)
    if search:
        query = query.where(
            or_(
                ProvincePack.province_name.ilike(f"%{search}%"),
                ProvincePack.province_code.ilike(f"%{search}%"),
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * page_size
    query = query.order_by(ProvincePack.province_name.asc()).offset(offset).limit(page_size)

    result = await db.execute(query)
    packs = result.scalars().all()

    results = []
    for p in packs:
        pack_dict = ProvincePackResponse.model_validate(p).model_dump()
        pack_dict["included_documents_count"] = len(p.included_documents) if p.included_documents else 0
        results.append(pack_dict)

    return results


@router.get("/total-count")
async def get_packs_total_count(
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Get total province pack count with applied filters."""
    query = select(func.count(ProvincePack.id))

    if is_active is not None:
        query = query.where(ProvincePack.is_active == is_active)
    if search:
        query = query.where(
            or_(
                ProvincePack.province_name.ilike(f"%{search}%"),
                ProvincePack.province_code.ilike(f"%{search}%"),
            )
        )

    result = await db.execute(query)
    return {"total": result.scalar()}


@router.get("/{pack_id}", response_model=dict)
async def get_province_pack(
    pack_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Get a single province pack by ID."""
    result = await db.execute(select(ProvincePack).where(ProvincePack.id == pack_id))
    pack = result.scalar_one_or_none()
    if not pack:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Il paketi bulunamadi")

    return {
        "id": pack.id,
        "province_code": pack.province_code,
        "province_name": pack.province_name,
        "version": pack.version,
        "manifest": pack.manifest,
        "included_documents": pack.included_documents,
        "included_maps": pack.included_maps,
        "included_contacts": pack.included_contacts,
        "included_notes": pack.included_notes,
        "rights_manifest": pack.rights_manifest,
        "sha256_manifest": pack.sha256_manifest,
        "is_active": pack.is_active,
        "included_documents_count": len(pack.included_documents) if pack.included_documents else 0,
        "created_at": pack.created_at,
        "updated_at": pack.updated_at,
    }


@router.post("/", response_model=ProvincePackResponse, status_code=status.HTTP_201_CREATED)
async def create_province_pack(
    request: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Create a new province pack (admin only)."""
    pack = ProvincePack(
        province_code=request["province_code"],
        province_name=request["province_name"],
        version=request.get("version", "1.0.0"),
        manifest=request.get("manifest", {}),
        included_documents=request.get("included_documents", []),
        included_maps=request.get("included_maps", []),
        included_contacts=request.get("included_contacts", []),
        included_notes=request.get("included_notes", []),
        rights_manifest=request.get("rights_manifest", {}),
        sha256_manifest=request.get("sha256_manifest"),
        is_active=request.get("is_active", True),
    )
    db.add(pack)
    await db.commit()
    await db.refresh(pack)
    return ProvincePackResponse.model_validate(pack)


@router.put("/{pack_id}", response_model=ProvincePackResponse)
async def update_province_pack(
    pack_id: uuid.UUID,
    request: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Update a province pack (admin only)."""
    result = await db.execute(select(ProvincePack).where(ProvincePack.id == pack_id))
    pack = result.scalar_one_or_none()
    if not pack:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Il paketi bulunamadi")

    updatable_fields = [
        "province_code", "province_name", "version", "manifest",
        "included_documents", "included_maps", "included_contacts",
        "included_notes", "rights_manifest", "sha256_manifest", "is_active",
    ]
    for field in updatable_fields:
        if field in request:
            setattr(pack, field, request[field])

    await db.commit()
    await db.refresh(pack)
    return ProvincePackResponse.model_validate(pack)


@router.delete("/{pack_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_province_pack(
    pack_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Delete a province pack (admin only)."""
    result = await db.execute(select(ProvincePack).where(ProvincePack.id == pack_id))
    pack = result.scalar_one_or_none()
    if not pack:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Il paketi bulunamadi")
    await db.delete(pack)
    await db.commit()
    return None


@router.get("/{pack_id}/content", response_model=dict)
async def get_pack_content(
    pack_id: uuid.UUID,
    content_type: Optional[str] = Query(None, description="Filter by content type: documents, maps, contacts, notes"),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Get the content of a province pack."""
    result = await db.execute(select(ProvincePack).where(ProvincePack.id == pack_id))
    pack = result.scalar_one_or_none()
    if not pack:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Il paketi bulunamadi")

    content = {
        "pack_id": pack.id,
        "province_code": pack.province_code,
        "province_name": pack.province_name,
        "version": pack.version,
    }

    if content_type is None or content_type == "documents":
        doc_ids = pack.included_documents or []
        if doc_ids:
            docs_result = await db.execute(
                select(Document).where(Document.id.in_(doc_ids), Document.deleted_at.is_(None))
            )
            docs = docs_result.scalars().all()
            content["documents"] = [
                {"id": d.id, "title": d.title, "category": d.category, "province": d.province}
                for d in docs
            ]
        else:
            content["documents"] = []

    if content_type is None or content_type == "maps":
        content["maps"] = pack.included_maps or []

    if content_type is None or content_type == "contacts":
        content["contacts"] = pack.included_contacts or []

    if content_type is None or content_type == "notes":
        content["notes"] = pack.included_notes or []

    return content
