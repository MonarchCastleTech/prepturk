import logging
import os
from typing import Any, Dict, List, Optional

from slugify import slugify

from app.adapters.base import BaseAdapter
from app.parsers.pdf_parser import parse_pdf_content
from app.storage.file_storage import FileStorage

logger = logging.getLogger("worker.adapters.pdf")


class PdfAdapter(BaseAdapter):
    """Adapter for fetching and parsing PDF documents."""

    def __init__(self, manifest_data: Dict[str, Any]):
        super().__init__(manifest_data)
        self.storage = FileStorage()

    async def fetch(self) -> List[Dict[str, Any]]:
        """Fetch PDF and return document data."""
        url = self.base_url
        logger.info("Fetching PDF from: %s", url)

        response = await self._fetch_with_retry(url)
        if response is None:
            logger.info("Content not modified, skipping: %s", url)
            return []

        if not self._validate_content_type(response, ["application/pdf"]):
            # Some servers serve PDFs with generic content-type
            content_type = response.headers.get("Content-Type", "").lower()
            if "application/pdf" not in content_type and "octet-stream" not in content_type:
                logger.warning("Not PDF content: %s", content_type)
                return []

        doc_data = await self.parse(response)
        return [doc_data]

    async def parse(self, raw_data: Any) -> Dict[str, Any]:
        """Parse PDF into document data."""
        import httpx
        if isinstance(raw_data, httpx.Response):
            pdf_bytes = raw_data.content
            response = raw_data
        else:
            pdf_bytes = raw_data
            response = None

        # Save raw PDF first
        slug_candidate = slugify("pdf-document", max_length=200)
        pdf_path = await self.storage.save_binary(
            slug_candidate,
            pdf_bytes,
            category="originals",
            extension="pdf",
        )

        # Parse PDF content
        parsed = parse_pdf_content(pdf_bytes, pdf_path)

        sha256 = self._compute_sha256(pdf_bytes)
        domain = self._extract_domain(self.base_url)

        doc_data = {
            "title": parsed.get("title", "Untitled PDF"),
            "slug": slugify(
                parsed.get("title", "pdf-document"),
                max_length=400,
                word_boundary=True,
            ),
            "source_url": self.base_url,
            "source_domain": domain,
            "extracted_text": parsed.get("text", ""),
            "summary": parsed.get("summary", ""),
            "author": parsed.get("author"),
            "publisher": parsed.get("publisher"),
            "published_at": parsed.get("published_at"),
            "language": self.manifest.get("language_default", "tr"),
            "mime_type": "application/pdf",
            "original_format": "pdf",
            "file_extension": "pdf",
            "file_size_bytes": len(pdf_bytes),
            "sha256": sha256,
            "page_count": parsed.get("page_count"),
            "metadata": {
                "provenance": self._capture_provenance(response) if response else {},
                "pdf_metadata": parsed.get("metadata", {}),
            },
        }

        return doc_data

    async def store(
        self, document: Any, doc_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Store PDF content and extracted text."""
        text = doc_data.get("extracted_text", "")
        if not text:
            logger.info("No extracted text for PDF: %s", doc_data.get("slug"))
            return {"status": "no_text", "text": ""}

        storage = FileStorage()
        slug = doc_data.get("slug", "unknown")

        # Save extracted text
        text_path = await storage.save_text(
            slug,
            text,
            category="extracted",
            extension="txt",
        )

        # Re-download and store original if not mirrored yet
        storage_mode = self.manifest.get("default_storage_mode", "pointer-only")
        file_path = None
        if storage_mode == "mirrored":
            try:
                response = await self._fetch_with_retry(self.base_url)
                if response:
                    file_path = await storage.save_binary(
                        slug,
                        response.content,
                        category="originals",
                        extension="pdf",
                    )
            except Exception as exc:
                logger.warning("Failed to store PDF original for %s: %s", slug, exc)

        return {
            "status": "stored",
            "text": text,
            "text_path": text_path,
            "file_path": file_path or doc_data.get("metadata", {}).get("pdf_path"),
        }
