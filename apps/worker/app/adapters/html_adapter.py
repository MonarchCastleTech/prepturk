import logging
import os
import re
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin, urlparse

import httpx
from slugify import slugify

from app.adapters.base import BaseAdapter
from app.parsers.html_parser import parse_html_content
from app.parsers.metadata_parser import extract_metadata
from app.storage.file_storage import FileStorage

logger = logging.getLogger("worker.adapters.html")


class HtmlAdapter(BaseAdapter):
    """Adapter for fetching and parsing HTML pages."""

    def __init__(self, manifest_data: Dict[str, Any]):
        super().__init__(manifest_data)
        self.storage = FileStorage()

    async def fetch(self) -> List[Dict[str, Any]]:
        """Fetch HTML page and return document data."""
        url = self.base_url
        logger.info("Fetching HTML from: %s", url)

        response = await self._fetch_with_retry(url)
        if response is None:
            logger.info("Content not modified, skipping: %s", url)
            return []

        if not self._validate_content_type(response, ["text/html"]):
            logger.warning("Not HTML content: %s", response.headers.get("Content-Type"))
            return []

        doc_data = await self.parse(response)
        return [doc_data]

    async def parse(self, raw_data: Any) -> Dict[str, Any]:
        """Parse HTML response into document data."""
        if isinstance(raw_data, httpx.Response):
            html_content = raw_data.text
            response = raw_data
        else:
            html_content = raw_data
            response = None

        # Extract content using trafilatura
        parsed = parse_html_content(html_content, self.base_url)

        # Extract metadata
        metadata = {}
        if response:
            metadata = extract_metadata(html_content, self.base_url)

        # Build document data
        title = parsed.get("title", "") or metadata.get("title", "Untitled")
        domain = self._extract_domain(self.base_url)

        doc_data = {
            "title": title,
            "slug": slugify(title, max_length=400, word_boundary=True),
            "source_url": self.base_url,
            "source_domain": domain,
            "canonical_url": metadata.get("canonical_url", self.base_url),
            "extracted_text": parsed.get("text", ""),
            "summary": parsed.get("description", "") or metadata.get("description", ""),
            "author": metadata.get("author"),
            "publisher": metadata.get("publisher"),
            "published_at": metadata.get("published_at"),
            "language": parsed.get("language", self.manifest.get("language_default", "tr")),
            "mime_type": "text/html",
            "original_format": "html",
            "file_extension": "html",
            "topic_tags": metadata.get("keywords", []),
            "metadata": {
                **metadata,
                "provenance": self._capture_provenance(response) if response else {},
            },
        }

        return doc_data

    async def store(
        self, document: Any, doc_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Store HTML content based on storage mode."""
        text = doc_data.get("extracted_text", "")
        if not text:
            logger.info("No extracted text to store for %s", doc_data.get("slug"))
            return {"status": "no_content", "text": ""}

        storage = FileStorage()

        # Save extracted text
        slug = doc_data.get("slug", "unknown")
        text_path = await storage.save_text(
            slug,
            text,
            category="extracted",
            extension="txt",
        )

        result = {
            "status": "stored",
            "text": text,
            "text_path": text_path,
        }

        # If mirrored, also save raw HTML
        storage_mode = self.manifest.get("default_storage_mode", "pointer-only")
        if storage_mode == "mirrored":
            try:
                client = await self._get_client()
                response = await self._fetch_with_retry(self.base_url)
                if response:
                    html_path = await storage.save_text(
                        slug,
                        response.text,
                        category="originals",
                        extension="html",
                    )
                    result["file_path"] = html_path
                    result["raw_html"] = response.text
                    logger.info("Stored mirrored HTML for %s", slug)
            except Exception as exc:
                logger.warning("Failed to mirror HTML for %s: %s", slug, exc)

        return result
