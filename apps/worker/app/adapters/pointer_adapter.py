import logging
from typing import Any, Dict, List, Optional

import httpx
from slugify import slugify

from app.adapters.base import BaseAdapter
from app.parsers.metadata_parser import extract_metadata_from_url

logger = logging.getLogger("worker.adapters.pointer")


class PointerAdapter(BaseAdapter):
    """Adapter for pointer-only documents.

    Only fetches metadata, does NOT download content.
    Validates URL accessibility and stores metadata.
    """

    async def fetch(self) -> List[Dict[str, Any]]:
        """Fetch metadata from URL and return document data."""
        url = self.base_url
        logger.info("Fetching metadata (pointer-only) from: %s", url)

        # HEAD request to validate accessibility
        is_accessible = await self._check_url_accessible(url)
        if not is_accessible:
            logger.warning("URL not accessible: %s", url)
            return [
                {
                    "title": f"Pointer: {url}",
                    "slug": slugify(f"pointer-{url}", max_length=400, word_boundary=True),
                    "source_url": url,
                    "source_domain": self._extract_domain(url),
                    "extracted_text": "",
                    "metadata": {"accessibility_check": "failed"},
                }
            ]

        # Try to get metadata via GET request
        doc_data = await self._fetch_metadata(url)
        return [doc_data]

    async def parse(self, raw_data: Any) -> Dict[str, Any]:
        """Parse metadata from response."""
        if isinstance(raw_data, httpx.Response):
            html = raw_data.text
            metadata = extract_metadata_from_url(html, self.base_url)
            return {
                "title": metadata.get("title", f"Pointer: {self.base_url}"),
                "source_url": self.base_url,
                "source_domain": self._extract_domain(self.base_url),
                "canonical_url": metadata.get("canonical_url", self.base_url),
                "summary": metadata.get("description", ""),
                "author": metadata.get("author"),
                "publisher": metadata.get("publisher"),
                "published_at": metadata.get("published_at"),
                "extracted_text": "",
                "mime_type": raw_data.headers.get("Content-Type", "text/html"),
                "metadata": {
                    **metadata,
                    "provenance": self._capture_provenance(raw_data),
                    "pointer_only": True,
                },
            }
        return {
            "title": f"Pointer: {self.base_url}",
            "source_url": self.base_url,
            "extracted_text": "",
            "metadata": {"pointer_only": True},
        }

    async def store(
        self, document: Any, doc_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Pointer-only adapter does NOT store content.

        Only metadata is stored via the document record.
        """
        logger.debug(
            "Pointer-only: not downloading content for %s",
            doc_data.get("slug"),
        )
        return {
            "status": "pointer_only",
            "text": "",
            "file_path": None,
            "text_path": None,
        }

    async def _check_url_accessible(self, url: str) -> bool:
        """Check if URL is accessible via HEAD request."""
        try:
            client = await self._get_client()
            await self.rate_limiter.acquire()
            response = await client.head(url)
            return response.status_code < 400
        except Exception as exc:
            logger.debug("HEAD request failed for %s: %s", url, exc)
            # Try GET as fallback
            try:
                response = await self._fetch_with_retry(url)
                return response is not None
            except Exception:
                return False

    async def _fetch_metadata(self, url: str) -> Dict[str, Any]:
        """Fetch page and extract metadata only."""
        try:
            response = await self._fetch_with_retry(url)
            if response is None:
                return {
                    "title": f"Pointer: {url}",
                    "slug": slugify(f"pointer-{url}", max_length=400, word_boundary=True),
                    "source_url": url,
                    "source_domain": self._extract_domain(url),
                    "extracted_text": "",
                    "metadata": {"pointer_only": True},
                }
            return await self.parse(response)
        except Exception as exc:
            logger.warning("Failed to fetch metadata from %s: %s", url, exc)
            return {
                "title": f"Pointer: {url}",
                "slug": slugify(f"pointer-{url}", max_length=400, word_boundary=True),
                "source_url": url,
                "source_domain": self._extract_domain(url),
                "extracted_text": "",
                "metadata": {"pointer_only": True, "fetch_error": str(exc)},
            }
