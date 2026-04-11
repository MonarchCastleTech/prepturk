from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, delete
from typing import Optional
import uuid
import os
import hashlib
from datetime import datetime, timezone

from app.db.database import get_db
from app.db.models import User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting, VaultFile
from app.schemas import *
from app.security.auth import get_local_device_operator
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()


def _get_vault_dir(user_id: uuid.UUID) -> str:
    """Get the vault directory for a user."""
    return os.path.join(settings.storage_vault, str(user_id))


def _encrypt_file(file_path: str, output_path: str, key: bytes) -> dict:
    """Encrypt a file using AES-256-GCM. Returns metadata about the encryption."""
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    aesgcm = AESGCM(key)
    nonce = os.urandom(12)

    with open(file_path, "rb") as f:
        plaintext = f.read()

    ciphertext = aesgcm.encrypt(nonce, plaintext, None)

    with open(output_path, "wb") as f:
        f.write(nonce + ciphertext)

    file_size = os.path.getsize(output_path)
    file_hash = hashlib.sha256(plaintext).hexdigest()

    return {
        "encrypted_size": file_size,
        "sha256": file_hash,
        "algorithm": "aes-256-gcm",
    }


def _decrypt_file(encrypted_path: str, output_path: str, key: bytes) -> int:
    """Decrypt a file using AES-256-GCM. Returns the size of the decrypted file."""
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    aesgcm = AESGCM(key)

    with open(encrypted_path, "rb") as f:
        data = f.read()

    nonce = data[:12]
    ciphertext = data[12:]
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)

    with open(output_path, "wb") as f:
        f.write(plaintext)

    return len(plaintext)


def _get_encryption_key(user_id: uuid.UUID) -> bytes:
    """Derive an encryption key from the app secret and user ID."""
    key_material = f"{settings.app_secret_key}-user-{user_id}".encode("utf-8")
    return hashlib.sha256(key_material).digest()


@router.post("/upload", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_vault_file(
    file: UploadFile = File(...),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Upload and encrypt a vault file."""
    vault_dir = _get_vault_dir(current_user.id)
    os.makedirs(vault_dir, exist_ok=True)

    temp_path = os.path.join(vault_dir, f"temp_{uuid.uuid4()}")
    encrypted_filename = f"{uuid.uuid4()}.enc"
    encrypted_path = os.path.join(vault_dir, encrypted_filename)

    try:
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)

        key = _get_encryption_key(current_user.id)
        encryption_info = _encrypt_file(temp_path, encrypted_path, key)

        file_tags = [t.strip() for t in tags.split(",")] if tags else []

        vault_file = VaultFile(
            user_id=current_user.id,
            original_name=file.filename or "unknown",
            encrypted_path=encrypted_path,
            file_size_bytes=encryption_info["encrypted_size"],
            sha256=encryption_info["sha256"],
            encryption_algorithm=encryption_info["algorithm"],
            mime_type=file.content_type or "application/octet-stream",
            tags=file_tags,
            is_indexed=False,
        )
        db.add(vault_file)
        await db.commit()
        await db.refresh(vault_file)

        return {
            "id": vault_file.id,
            "original_name": vault_file.original_name,
            "file_size_bytes": vault_file.file_size_bytes,
            "mime_type": vault_file.mime_type,
            "tags": vault_file.tags,
            "created_at": vault_file.created_at,
            "message": "Dosya sifrelenerek kaydedildi",
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.get("/", response_model=list[dict])
async def list_vault_files(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    tag: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """List user's vault files."""
    query = select(VaultFile).where(VaultFile.user_id == current_user.id)

    if tag:
        query = query.where(VaultFile.tags.contains([tag]))
    if search:
        query = query.where(VaultFile.original_name.ilike(f"%{search}%"))

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * page_size
    query = query.order_by(VaultFile.created_at.desc()).offset(offset).limit(page_size)

    result = await db.execute(query)
    files = result.scalars().all()

    return [
        {
            "id": f.id,
            "original_name": f.original_name,
            "file_size_bytes": f.file_size_bytes,
            "sha256": f.sha256,
            "encryption_algorithm": f.encryption_algorithm,
            "mime_type": f.mime_type,
            "metadata": f.metadata,
            "tags": f.tags,
            "is_indexed": f.is_indexed,
            "created_at": f.created_at,
            "updated_at": f.updated_at,
        }
        for f in files
    ]


@router.get("/total-count")
async def get_vault_files_total_count(
    tag: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Get total vault file count with applied filters."""
    query = select(func.count(VaultFile.id)).where(VaultFile.user_id == current_user.id)

    if tag:
        query = query.where(VaultFile.tags.contains([tag]))
    if search:
        query = query.where(VaultFile.original_name.ilike(f"%{search}%"))

    result = await db.execute(query)
    return {"total": result.scalar()}


@router.get("/{file_id}/download")
async def download_vault_file(
    file_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Download and decrypt a vault file."""
    from fastapi.responses import StreamingResponse

    result = await db.execute(
        select(VaultFile).where(VaultFile.id == file_id, VaultFile.user_id == current_user.id)
    )
    vault_file = result.scalar_one_or_none()
    if not vault_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sifreli dosya bulunamadi")

    if not os.path.exists(vault_file.encrypted_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sifreli dosya diskte bulunamadi")

    key = _get_encryption_key(current_user.id)
    output_path = os.path.join(settings.storage_vault, f"temp_decrypt_{uuid.uuid4()}")

    try:
        _decrypt_file(vault_file.encrypted_path, output_path, key)

        def file_iter():
            with open(output_path, "rb") as f:
                while chunk := f.read(8192):
                    yield chunk

        return StreamingResponse(
            file_iter(),
            media_type=vault_file.mime_type or "application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{vault_file.original_name}"',
                "X-Original-Size": str(vault_file.file_size_bytes),
            },
        )
    finally:
        if os.path.exists(output_path):
            os.remove(output_path)


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vault_file(
    file_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Delete a vault file."""
    result = await db.execute(
        select(VaultFile).where(VaultFile.id == file_id, VaultFile.user_id == current_user.id)
    )
    vault_file = result.scalar_one_or_none()
    if not vault_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sifreli dosya bulunamadi")

    if os.path.exists(vault_file.encrypted_path):
        os.remove(vault_file.encrypted_path)

    await db.delete(vault_file)
    await db.commit()
    return None


@router.put("/{file_id}/tags", response_model=dict)
async def update_vault_file_tags(
    file_id: uuid.UUID,
    request: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Update vault file tags."""
    result = await db.execute(
        select(VaultFile).where(VaultFile.id == file_id, VaultFile.user_id == current_user.id)
    )
    vault_file = result.scalar_one_or_none()
    if not vault_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sifreli dosya bulunamadi")

    vault_file.tags = request.get("tags", [])
    await db.commit()

    return {"message": "Etiketler guncellendi", "tags": vault_file.tags}
