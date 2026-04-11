from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional
import uuid
import os
from datetime import datetime, timezone

from app.db.database import get_db
from app.db.models import User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting
from app.schemas import *
from app.security.auth import get_current_active_user, require_admin
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()


@router.post("/documents", response_model=dict)
async def export_documents(
    request: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Export documents to PDF or markdown format."""
    format_type = request.get("format", "markdown")
    document_ids = request.get("document_ids", [])
    category = request.get("category")
    province = request.get("province")
    include_metadata = request.get("include_metadata", True)

    if not document_ids and not category and not province:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Disari aktarmak icin belge ID'leri, kategori veya il saglanmali",
        )

    # Fetch documents
    query = select(Document).where(Document.deleted_at.is_(None))

    if document_ids:
        query = query.where(Document.id.in_(document_ids))
    if category:
        query = query.where(Document.category == category)
    if province:
        query = query.where(Document.province == province)

    result = await db.execute(query)
    documents = result.scalars().all()

    if not documents:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disari aktarilacak belge bulunamadi")

    os.makedirs(settings.storage_exports, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"export_{timestamp}_{current_user.id}"

    if format_type == "pdf":
        file_path = await _export_to_pdf(documents, filename, include_metadata)
    else:
        file_path = await _export_to_markdown(documents, filename, include_metadata)

    file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0

    return {
        "message": "Disari aktarma basarili",
        "format": format_type,
        "documents_count": len(documents),
        "filename": os.path.basename(file_path),
        "file_size_bytes": file_size,
        "file_path": file_path,
    }


@router.post("/collections", response_model=dict)
async def export_collections(
    request: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Export a collection/bookmarks to PDF or markdown."""
    from app.db.models import Bookmark

    format_type = request.get("format", "markdown")
    collection_name = request.get("collection_name", "default")
    include_metadata = request.get("include_metadata", True)

    result = await db.execute(
        select(Bookmark).where(
            Bookmark.user_id == current_user.id,
            Bookmark.collection_name == collection_name,
        )
    )
    bookmarks = result.scalars().all()

    if not bookmarks:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disari aktarilacak koleksiyon bulunamadi")

    doc_ids = [bm.document_id for bm in bookmarks if bm.document_id]
    if not doc_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Koleksiyonda disari aktarilacak belge yok",
        )

    doc_result = await db.execute(
        select(Document).where(Document.id.in_(doc_ids), Document.deleted_at.is_(None))
    )
    documents = doc_result.scalars().all()

    os.makedirs(settings.storage_exports, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"collection_{collection_name}_{timestamp}"

    if format_type == "pdf":
        file_path = await _export_to_pdf(documents, filename, include_metadata)
    else:
        file_path = await _export_to_markdown(documents, filename, include_metadata)

    file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0

    return {
        "message": "Koleksiyon disari aktarildi",
        "format": format_type,
        "collection_name": collection_name,
        "documents_count": len(documents),
        "filename": os.path.basename(file_path),
        "file_size_bytes": file_size,
        "file_path": file_path,
    }


@router.post("/province-pack/{pack_id}", response_model=dict)
async def export_province_pack(
    pack_id: uuid.UUID,
    request: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Export a province pack to PDF or markdown."""
    format_type = request.get("format", "markdown")

    result = await db.execute(select(ProvincePack).where(ProvincePack.id == pack_id))
    pack = result.scalar_one_or_none()
    if not pack:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Il paketi bulunamadi")

    if not pack.included_documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Il paketinde disari aktarilacak belge yok",
        )

    doc_result = await db.execute(
        select(Document).where(
            Document.id.in_(pack.included_documents),
            Document.deleted_at.is_(None),
        )
    )
    documents = doc_result.scalars().all()

    os.makedirs(settings.storage_exports, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"province_pack_{pack.province_code}_{timestamp}"

    if format_type == "pdf":
        file_path = await _export_to_pdf(documents, filename, include_metadata=True)
    else:
        file_path = await _export_to_markdown(documents, filename, include_metadata=True)

    file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0

    return {
        "message": "Il paketi disari aktarildi",
        "format": format_type,
        "province": pack.province_name,
        "province_code": pack.province_code,
        "documents_count": len(documents),
        "filename": os.path.basename(file_path),
        "file_size_bytes": file_size,
        "file_path": file_path,
    }


@router.get("/history", response_model=list[dict])
async def get_export_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get export history (based on files in the exports directory)."""
    exports_dir = settings.storage_exports

    if not os.path.exists(exports_dir):
        return []

    files = []
    for filename in os.listdir(exports_dir):
        filepath = os.path.join(exports_dir, filename)
        if os.path.isfile(filepath):
            stat = os.stat(filepath)
            files.append(
                {
                    "filename": filename,
                    "size_bytes": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_ctime, tz=timezone.utc),
                }
            )

    files.sort(key=lambda x: x["created_at"], reverse=True)
    return files[:50]


async def _export_to_markdown(
    documents: list[Document],
    filename: str,
    include_metadata: bool = True,
) -> str:
    """Export documents to a markdown file."""
    output_path = os.path.join(settings.storage_exports, f"{filename}.md")

    lines = [
        f"# Turkiye Nomad - Disari Aktarma",
        f"",
        f"**Tarih:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}",
        f"**Belge Sayisi:** {len(documents)}",
        f"",
        f"---",
        f"",
    ]

    for i, doc in enumerate(documents, 1):
        lines.append(f"## {i}. {doc.title}")
        lines.append("")

        if doc.subtitle:
            lines.append(f"*{doc.subtitle}*")
            lines.append("")

        if include_metadata:
            lines.append("**Metadata:**")
            lines.append(f"- Kategori: {doc.category or 'Belirtilmemis'}")
            lines.append(f"- Il: {doc.province or 'Belirtilmemis'}")
            if doc.district:
                lines.append(f"- Ilce: {doc.district}")
            if doc.institution:
                lines.append(f"- Kurum: {doc.institution}")
            lines.append(f"- Guvenilirlik: {doc.trust_level}")
            if doc.source_url:
                lines.append(f"- Kaynak: {doc.source_url}")
            if doc.published_at:
                lines.append(f"- Yayin Tarihi: {doc.published_at.strftime('%Y-%m-%d')}")
            lines.append("")

        if doc.summary:
            lines.append("**Ozet:**")
            lines.append("")
            lines.append(doc.summary)
            lines.append("")

        if doc.abstract:
            lines.append("**Ozet (Detayli):**")
            lines.append("")
            lines.append(doc.abstract)
            lines.append("")

        if doc.topic_tags:
            lines.append(f"**Etiketler:** {', '.join(doc.topic_tags)}")
            lines.append("")

        lines.append("---")
        lines.append("")

    content = "\n".join(lines)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    return output_path


async def _export_to_pdf(
    documents: list[Document],
    filename: str,
    include_metadata: bool = True,
) -> str:
    """Export documents to a PDF file using markdown as intermediate."""
    md_path = await _export_to_markdown(documents, filename, include_metadata)

    output_path = os.path.join(settings.storage_exports, f"{filename}.pdf")

    # Generate PDF from markdown using a simple approach
    try:
        import markdown
        from weasyprint import HTML

        with open(md_path, "r", encoding="utf-8") as f:
            md_content = f.read()

        html_content = markdown.markdown(md_content, extensions=["tables", "fenced_code"])
        html_full = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: sans-serif; padding: 2cm; line-height: 1.6; }}
                h1 {{ color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 0.3em; }}
                h2 {{ color: #16213e; margin-top: 2em; }}
                hr {{ border: none; border-top: 1px solid #ccc; margin: 1em 0; }}
            </style>
        </head>
        <body>{html_content}</body>
        </html>
        """
        HTML(string=html_full).write_pdf(output_path)
    except ImportError:
        # Fallback: just create the markdown file and rename
        output_path = md_path

    return output_path
