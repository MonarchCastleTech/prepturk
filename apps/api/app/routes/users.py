from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, delete
from typing import Optional
import uuid

from app.db.database import get_db
from app.db.models import User, Document, Role, UserRole, SourceManifest, IngestionRun, Note, ProvincePack, Setting
from app.schemas import *
from app.security.auth import get_current_active_user, require_admin

router = APIRouter()


@router.get("/", response_model=list[UserResponse])
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """List all users with pagination and filtering (admin only)."""
    query = select(User)

    if is_active is not None:
        query = query.where(User.is_active == is_active)

    if search:
        query = query.where(
            or_(
                User.username.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.display_name.ilike(f"%{search}%"),
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * page_size
    query = query.order_by(User.created_at.desc()).offset(offset).limit(page_size)

    result = await db.execute(query)
    users = result.scalars().all()

    return [UserResponse.model_validate(u) for u in users]


@router.get("/total-count")
async def get_users_total_count(
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Get total user count with applied filters (admin only)."""
    query = select(func.count(User.id))

    if is_active is not None:
        query = query.where(User.is_active == is_active)

    if search:
        query = query.where(
            or_(
                User.username.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.display_name.ilike(f"%{search}%"),
            )
        )

    result = await db.execute(query)
    return {"total": result.scalar()}


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Get a single user by ID (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kullanici bulunamadi")
    return UserResponse.model_validate(user)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    request: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Create a new user (admin only)."""
    from app.security.auth import get_password_hash

    existing = await db.execute(
        select(User).where((User.email == request.get("email")) | (User.username == request.get("username")))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Kullanici zaten mevcut")

    user = User(
        email=request["email"],
        username=request["username"],
        password_hash=get_password_hash(request.get("password", "default-password")),
        display_name=request.get("display_name"),
        language=request.get("language", "tr"),
        is_active=request.get("is_active", True),
    )
    db.add(user)
    await db.flush()

    # Assign roles if provided
    role_names = request.get("roles", [])
    if role_names:
        role_result = await db.execute(select(Role).where(Role.name.in_(role_names)))
        roles = role_result.scalars().all()
        for role in roles:
            db.add(UserRole(user_id=user.id, role_id=role.id))

    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    request: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Update a user (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kullanici bulunamadi")

    if "display_name" in request:
        user.display_name = request["display_name"]
    if "language" in request:
        user.language = request["language"]
    if "is_active" in request:
        user.is_active = request["is_active"]
    if "email" in request:
        existing = await db.execute(select(User).where(User.email == request["email"], User.id != user_id))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="E-posta adresi zaten kullaniliyor")
        user.email = request["email"]
    if "password" in request and request["password"]:
        from app.security.auth import get_password_hash
        user.password_hash = get_password_hash(request["password"])

    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Delete a user (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kullanici bulunamadi")
    await db.delete(user)
    await db.commit()
    return None


@router.post("/{user_id}/roles")
async def assign_roles(
    user_id: uuid.UUID,
    request: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Assign roles to a user (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kullanici bulunamadi")

    # Remove existing roles
    await db.execute(delete(UserRole).where(UserRole.user_id == user_id))

    # Add new roles
    role_names = request.get("roles", [])
    if role_names:
        role_result = await db.execute(select(Role).where(Role.name.in_(role_names)))
        roles = role_result.scalars().all()
        for role in roles:
            db.add(UserRole(user_id=user_id, role_id=role.id))

    await db.commit()
    return {"message": "Roller guncellendi"}
