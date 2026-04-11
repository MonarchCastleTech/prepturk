import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import async_session_factory
from app.models import (
    Document, DocumentChunk, IngestionRun, IngestionEvent, SourceManifest,
    StorageMode, IngestionStatus, ParseStatus, ReviewStatus,
)
from app.adapters.html_adapter import HtmlAdapter
from app.adapters.pdf_adapter import PdfAdapter
from app.adapters.pointer_adapter import PointerAdapter
from app.embeddings.ollama_embeddings import OllamaEmbeddings
from app.storage.file_storage import FileStorage
from app.utils.chunking import chunk_text

logger = logging.getLogger("worker.ingestion")
settings = get_settings()


def _select_adapter(manifest_data: Dict[str, Any]):
    """Select the appropriate adapter based on fetch_strategy."""
    strategy = manifest_data.get("fetch_strategy", "pointer_only")
    if strategy == "html_page":
        return HtmlAdapter(manifest_data)
    elif strategy == "pdf_source":
        return PdfAdapter(manifest_data)
    else:
        return PointerAdapter(manifest_data)


async def _create_run(
    session: AsyncSession,
    source_manifest: SourceManifest,
    adapter_name: str,
) -> IngestionRun:
    """Create a new ingestion run record."""
    run = IngestionRun(
        source_id=source_manifest.id,
        adapter_name=adapter_name,
        status=IngestionStatus.running,
    )
    session.add(run)
    await session.flush()
    await session.refresh(run)
    return run


async def _log_event(
    session: AsyncSession,
    run_id: uuid.UUID,
    event_type: str,
    message: str,
    document_id: Optional[uuid.UUID] = None,
    metadata: Optional[Dict] = None,
):
    """Log an ingestion event."""
    from app.models import IngestionEvent as IE
    ie = IE(
        run_id=run_id,
        document_id=document_id,
        event_type=event_type,
        message=message,
        metadata=metadata or {},
    )
    session.add(ie)


async def _create_document(
    session: AsyncSession,
    doc_data: Dict[str, Any],
    manifest_data: Dict[str, Any],
    run_id: uuid.UUID,
    adapter_name: str,
) -> Document:
    """Create or update a document record."""
    source_url = doc_data.get("source_url", manifest_data.get("base_url", ""))
    slug = doc_data.get("slug")
    if not slug:
        from slugify import slugify
        title = doc_data.get("title", "untitled")
        slug = slugify(title, max_length=400, word_boundary=True)

    # Check for existing document
    stmt = select(Document).where(Document.slug == slug)
    result = await session.execute(stmt)
    existing = result.scalar_one_or_none()

    storage_mode_str = manifest_data.get("default_storage_mode", "pointer-only")
    try:
        storage_mode = StorageMode(storage_mode_str)
    except ValueError:
        storage_mode = StorageMode.pointer_only

    trust_level_str = manifest_data.get("default_trust_level", "community")
    from app.models import TrustLevel, RightsStatus
    try:
        trust_level = TrustLevel(trust_level_str)
    except ValueError:
        trust_level = TrustLevel.community

    rights_status_str = manifest_data.get("default_rights_status", "unknown-review-needed")
    try:
        rights_status = RightsStatus(rights_status_str)
    except ValueError:
        rights_status = RightsStatus.unknown_review_needed

    from urllib.parse import urlparse
    parsed = urlparse(source_url)
    source_domain = parsed.netloc

    if existing:
        # Update existing document
        for key, value in doc_data.items():
            if hasattr(existing, key) and value is not None:
                setattr(existing, key, value)
        existing.updated_at = datetime.now(timezone.utc)
        existing.ingestion_run_id = run_id
        existing.ingestion_adapter = adapter_name
        existing.storage_mode = storage_mode
        existing.trust_level = trust_level
        existing.rights_status = rights_status
        existing.source_domain = source_domain
        await session.flush()
        await session.refresh(existing)
        return existing
    else:
        doc = Document(
            slug=slug,
            title=doc_data.get("title", "Untitled"),
            subtitle=doc_data.get("subtitle"),
            source_url=source_url,
            source_domain=source_domain,
            canonical_url=doc_data.get("canonical_url", source_url),
            language=manifest_data.get("language_default", "tr"),
            trust_level=trust_level,
            storage_mode=storage_mode,
            rights_status=rights_status,
            institution=doc_data.get("institution"),
            category=doc_data.get("category"),
            subcategory=doc_data.get("subcategory"),
            topic_tags=doc_data.get("topic_tags", []),
            author=doc_data.get("author"),
            publisher=doc_data.get("publisher"),
            summary=doc_data.get("summary"),
            abstract=doc_data.get("abstract"),
            mime_type=doc_data.get("mime_type"),
            original_format=doc_data.get("original_format"),
            file_extension=doc_data.get("file_extension"),
            ingestion_run_id=run_id,
            ingestion_adapter=adapter_name,
            parse_status=ParseStatus.pending,
            review_status=ReviewStatus.discovered,
        )
        session.add(doc)
        await session.flush()
        await session.refresh(doc)
        return doc


async def _index_in_qdrant(
    document: Document,
    chunks: List[DocumentChunk],
    embeddings: OllamaEmbeddings,
):
    """Index document chunks in Qdrant."""
    if not chunks:
        return

    try:
        texts = [chunk.content for chunk in chunks]
        vectors = await embeddings.embed_batch(texts)

        qdrant_client = embeddings.qdrant_client
        if qdrant_client is None:
            logger.warning("Qdrant client not available, skipping vector index")
            return

        collection_name = "documents"

        # Ensure collection exists
        from qdrant_client.models import Distance, VectorParams, PointStruct
        if not qdrant_client.collection_exists(collection_name):
            qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=len(vectors[0]),
                    distance=Distance.COSINE,
                ),
            )

        points = []
        for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
            point_id = str(uuid.uuid4())
            chunk.qdrant_point_id = point_id
            points.append(
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "document_id": str(document.id),
                        "document_slug": document.slug,
                        "document_title": document.title,
                        "chunk_index": chunk.chunk_index,
                        "source_url": document.source_url or "",
                        "trust_level": document.trust_level.value if document.trust_level else "community",
                        "category": document.category or "",
                        "institution": document.institution or "",
                        "language": document.language or "tr",
                    },
                )
            )

        if points:
            qdrant_client.upsert(collection_name=collection_name, points=points)
            logger.info(
                "Indexed %d chunks for document %s in Qdrant",
                len(points),
                document.slug,
            )
    except Exception as exc:
        logger.error("Failed to index document %s in Qdrant: %s", document.slug, exc)
        raise


async def run_ingestion_for_manifest(manifest_data: Dict[str, Any]) -> Dict[str, Any]:
    """Run the full ingestion pipeline for a single manifest.

    This is the main entry point called by the scheduler.
    """
    manifest_name = manifest_data["name"]
    logger.info("=== Starting ingestion for manifest: %s ===", manifest_name)

    adapter = _select_adapter(manifest_data)
    adapter_name = type(adapter).__name__

    async with async_session_factory() as session:
        # Find the source manifest in DB
        stmt = select(SourceManifest).where(SourceManifest.name == manifest_name)
        result = await session.execute(stmt)
        source_manifest = result.scalar_one_or_none()

        if not source_manifest:
            logger.warning(
                "Source manifest '%s' not found in DB, creating placeholder",
                manifest_name,
            )
            source_manifest = SourceManifest(
                name=manifest_name,
                base_url=manifest_data.get("base_url", ""),
                fetch_strategy=manifest_data.get("fetch_strategy", "pointer_only"),
                default_storage_mode=manifest_data.get("default_storage_mode", "pointer-only"),
                default_trust_level=manifest_data.get("default_trust_level", "community"),
                default_rights_status=manifest_data.get("default_rights_status", "unknown-review-needed"),
                is_active=True,
            )
            session.add(source_manifest)
            await session.flush()
            await session.refresh(source_manifest)

        # Create ingestion run
        run = await _create_run(session, source_manifest, adapter_name)
        logger.info("Created ingestion run %s for manifest %s", run.id, manifest_name)

        stats = {
            "documents_found": 0,
            "documents_fetched": 0,
            "documents_indexed": 0,
            "documents_failed": 0,
            "errors": [],
        }

        try:
            # Fetch documents from source
            logger.info("Fetching documents from %s", manifest_data.get("base_url"))
            documents = await adapter.fetch()
            stats["documents_found"] = len(documents)
            logger.info("Found %d document(s) to process", len(documents))

            # Initialize services
            storage = FileStorage()
            ollama = OllamaEmbeddings()

            for i, doc_data in enumerate(documents):
                doc_stats = {
                    "index": i,
                    "url": doc_data.get("source_url", manifest_data.get("base_url")),
                }
                try:
                    logger.info(
                        "[%d/%d] Processing: %s",
                        i + 1,
                        len(documents),
                        doc_data.get("title", "unknown"),
                    )

                    # Create/update document record
                    document = await _create_document(
                        session, doc_data, manifest_data, run.id, adapter_name
                    )
                    stats["documents_fetched"] += 1

                    # Store content based on storage mode
                    content_result = await adapter.store(document, doc_data)
                    if content_result:
                        logger.debug(
                            "Content stored for %s: %s",
                            document.slug,
                            content_result.get("status"),
                        )

                    # Extract text
                    extracted_text = doc_data.get("extracted_text", "")
                    if not extracted_text and content_result:
                        extracted_text = content_result.get("text", "")

                    # OCR if needed
                    ocr_used = False
                    if (
                        not extracted_text
                        and doc_data.get("mime_type") == "application/pdf"
                        and settings.ocr_enabled
                    ):
                        logger.info("Running OCR on document %s", document.slug)
                        from app.ocr.tesseract import run_ocr
                        file_path = content_result.get("file_path") if content_result else None
                        if file_path:
                            extracted_text = await run_ocr(file_path)
                            ocr_used = bool(extracted_text)
                            document.ocr_used = ocr_used
                            if ocr_used:
                                document.ocr_language = settings.ocr_language
                                document.parse_status = ParseStatus.ocr_completed

                    if extracted_text:
                        document.extracted_text_path = content_result.get("text_path") if content_result else None
                        document.parse_status = ParseStatus.success
                    else:
                        document.parse_status = ParseStatus.partial

                    # Chunk text
                    chunks = []
                    if extracted_text:
                        chunk_list = chunk_text(
                            extracted_text,
                            chunk_size=settings.chunk_size,
                            overlap=settings.chunk_overlap,
                        )
                        for idx, chunk_content in enumerate(chunk_list):
                            chunk = DocumentChunk(
                                document_id=document.id,
                                chunk_index=idx,
                                content=chunk_content,
                                metadata={
                                    "source": manifest_name,
                                    "document_slug": document.slug,
                                },
                            )
                            session.add(chunk)
                            chunks.append(chunk)

                        document.chunk_count = len(chunks)
                        logger.info(
                            "Created %d chunk(s) for document %s",
                            len(chunks),
                            document.slug,
                        )

                    # Generate embeddings and index in Qdrant
                    if chunks:
                        await _index_in_qdrant(document, chunks, ollama)
                        document.embedding_model = settings.ollama_embedding_model
                        document.indexed_at = datetime.now(timezone.utc)
                        stats["documents_indexed"] += 1
                    else:
                        logger.info(
                            "No chunks to index for document %s (pointer-only or no text)",
                            document.slug,
                        )
                        stats["documents_indexed"] += 1

                    await session.flush()

                except Exception as exc:
                    stats["documents_failed"] += 1
                    error_msg = f"Error processing doc {i}: {exc}"
                    stats["errors"].append(error_msg)
                    logger.error(error_msg, exc_info=True)

                    # Log the error event
                    from app.models import IngestionEvent as IE
                    error_event = IE(
                        run_id=run.id,
                        event_type="error",
                        message=error_msg,
                        metadata={"index": i},
                    )
                    session.add(error_event)

            # Update run statistics
            run.documents_found = stats["documents_found"]
            run.documents_fetched = stats["documents_fetched"]
            run.documents_indexed = stats["documents_indexed"]
            run.documents_failed = stats["documents_failed"]
            run.status = IngestionStatus.completed
            run.completed_at = datetime.now(timezone.utc)

            # Update source manifest stats
            source_manifest.last_sync_at = datetime.now(timezone.utc)
            source_manifest.last_success_at = datetime.now(timezone.utc)
            source_manifest.total_documents = max(
                source_manifest.total_documents or 0,
                stats["documents_found"],
            )

            await session.commit()

            logger.info(
                "=== Ingestion complete for %s: found=%d, fetched=%d, indexed=%d, failed=%d ===",
                manifest_name,
                stats["documents_found"],
                stats["documents_fetched"],
                stats["documents_indexed"],
                stats["documents_failed"],
            )

        except Exception as exc:
            logger.error("Ingestion run failed for %s: %s", manifest_name, exc, exc_info=True)
            run.status = IngestionStatus.failed
            run.error_log = str(exc)
            run.completed_at = datetime.now(timezone.utc)

            source_manifest.last_error = str(exc)
            source_manifest.error_count = (source_manifest.error_count or 0) + 1

            await session.commit()
            raise

    return stats


def create_ingestion_job(manifest_data: Dict[str, Any]):
    """Create an async job function for the scheduler."""

    async def job_func():
        try:
            await run_ingestion_for_manifest(manifest_data)
        except Exception as exc:
            logger.error(
                "Scheduled job failed for manifest %s: %s",
                manifest_data.get("name"),
                exc,
                exc_info=True,
            )

    return job_func


# Alias for scheduler import
run_ingestion = run_ingestion_for_manifest
