from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional
import uuid

from app.db.database import get_db
from app.db.models import User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting
from app.schemas import *
from app.security.auth import get_current_active_user, require_admin

router = APIRouter()


@router.get("/", response_model=list[dict])
async def list_settings(
    is_system: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all application settings."""
    query = select(Setting)

    if is_system is not None:
        query = query.where(Setting.is_system == is_system)

    query = query.order_by(Setting.key.asc())

    result = await db.execute(query)
    settings = result.scalars().all()

    return [
        {
            "id": s.id,
            "key": s.key,
            "value": s.value,
            "description": s.description,
            "is_system": s.is_system,
            "updated_at": s.updated_at,
        }
        for s in settings
    ]


@router.get("/{setting_key}", response_model=dict)
async def get_setting(
    setting_key: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a single setting by key."""
    result = await db.execute(select(Setting).where(Setting.key == setting_key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ayar bulunamadi")

    return {
        "id": setting.id,
        "key": setting.key,
        "value": setting.value,
        "description": setting.description,
        "is_system": setting.is_system,
        "updated_at": setting.updated_at,
    }


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_setting(
    request: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Create a new setting (admin only)."""
    existing = await db.execute(select(Setting).where(Setting.key == request.get("key")))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bu anahtarla bir ayar zaten mevcut")

    setting = Setting(
        key=request["key"],
        value=request["value"],
        description=request.get("description"),
        is_system=request.get("is_system", False),
    )
    db.add(setting)
    await db.commit()
    await db.refresh(setting)

    return {
        "id": setting.id,
        "key": setting.key,
        "value": setting.value,
        "description": setting.description,
        "is_system": setting.is_system,
        "updated_at": setting.updated_at,
        "message": "Ayar olusturuldu",
    }


@router.put("/{setting_key}", response_model=dict)
async def update_setting(
    setting_key: str,
    request: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Update a setting (admin only)."""
    result = await db.execute(select(Setting).where(Setting.key == setting_key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ayar bulunamadi")

    if "value" in request:
        setting.value = request["value"]
    if "description" in request:
        setting.description = request["description"]

    await db.commit()
    await db.refresh(setting)

    return {
        "id": setting.id,
        "key": setting.key,
        "value": setting.value,
        "description": setting.description,
        "is_system": setting.is_system,
        "updated_at": setting.updated_at,
        "message": "Ayar guncellendi",
    }


@router.delete("/{setting_key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_setting(
    setting_key: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Delete a setting (admin only)."""
    result = await db.execute(select(Setting).where(Setting.key == setting_key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ayar bulunamadi")

    if setting.is_system:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sistem ayarlari silinemez")

    await db.delete(setting)
    await db.commit()
    return None
