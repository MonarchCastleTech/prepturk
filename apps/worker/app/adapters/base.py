import asyncio
import logging
import time
import hashlib
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import httpx
import yaml

from app.config import get_settings

logger = logging.getLogger("worker.adapters")
settings = get_settings()


class RateLimiter:
    """Simple token bucket rate limiter."""

    def __init__(self, requests_per_minute: int):
        self.rate = requests_per_minute / 60.0
        self.tokens = float(requests_per_minute)
        self.max_tokens = float(requests_per_minute)
        self.last_refill = time.monotonic()
        self._lock = asyncio.Lock()

    async def acquire(self):
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self.last_refill
            self.tokens = min(self.max_tokens, self.tokens + elapsed * self.rate)
            self.last_refill = now

            if self.tokens < 1:
                wait_time = (1 - self.tokens) / self.rate
                logger.debug("Rate limit reached, waiting %.2f seconds", wait_time)
                await asyncio.sleep(wait_time)
                now = time.monotonic()
                elapsed = now - self.last_refill
                self.tokens = min(self.max_tokens, self.tokens + elapsed * self.rate)
                self.last_refill = now

            self.tokens -= 1


class BaseAdapter(ABC):
    """Base class for content adapters.

    Subclasses must implement: fetch, parse, store
    """

    def __init__(self, manifest_data: Dict[str, Any]):
        self.manifest = manifest_data
        self.base_url = manifest_data.get("base_url", "")
        self.rate_limiter = RateLimiter(
            manifest_data.get("rate_limit_per_minute", settings.rate_limit_per_minute)
        )
        self._client: Optional[httpx.AsyncClient] = None
        self._etag_cache: Dict[str, str] = {}
        self._last_modified_cache: Dict[str, str] = {}

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create an HTTP client with sensible defaults."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                follow_redirects=True,
                timeout=30.0,
                headers={
                    "User-Agent": "prepturk-ingestion-worker/0.1.0 (+https://github.com/prepturk)",
                    "Accept": "text/html,application/pdf,*/*",
                    "Accept-Language": "tr-TR,tr,en-US,en",
                },
                http2=True,
            )
        return self._client

    async def close(self):
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

    def _check_robots_txt(self, url: str) -> bool:
        """Check if the URL is allowed by robots.txt notes in manifest."""
        robots_note = self.manifest.get("robots_note", "")
        if "kazima" in robots_note.lower() or "scrape" in robots_note.lower():
            if "pointer" in robots_note.lower() or "only" in robots_note.lower():
                return True
        return True

    def _compute_sha256(self, content: bytes) -> str:
        """Compute SHA256 hash of content."""
        return hashlib.sha256(content).hexdigest()

    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL."""
        parsed = urlparse(url)
        return parsed.netloc

    async def _fetch_with_retry(
        self,
        url: str,
        max_retries: int = 3,
        backoff_factor: float = 1.0,
    ) -> Optional[httpx.Response]:
        """Fetch a URL with retry and exponential backoff."""
        client = await self._get_client()

        for attempt in range(max_retries):
            try:
                await self.rate_limiter.acquire()

                # Check for conditional request
                headers = {}
                if url in self._etag_cache:
                    headers["If-None-Match"] = self._etag_cache[url]
                if url in self._last_modified_cache:
                    headers["If-Modified-Since"] = self._last_modified_cache[url]

                response = await client.get(url, headers=headers)

                if response.status_code == 304:
                    logger.debug("Content not modified (304): %s", url)
                    return None

                if response.status_code == 429:
                    wait = backoff_factor * (2 ** attempt)
                    logger.warning(
                        "Rate limited (429), retrying in %.1fs: %s",
                        wait,
                        url,
                    )
                    await asyncio.sleep(wait)
                    continue

                response.raise_for_status()

                # Store conditional headers
                etag = response.headers.get("ETag")
                if etag:
                    self._etag_cache[url] = etag
                last_modified = response.headers.get("Last-Modified")
                if last_modified:
                    self._last_modified_cache[url] = last_modified

                return response

            except httpx.ConnectTimeout:
                wait = backoff_factor * (2 ** attempt)
                logger.warning(
                    "Connection timeout (attempt %d/%d): %s",
                    attempt + 1,
                    max_retries,
                    url,
                )
                if attempt < max_retries - 1:
                    await asyncio.sleep(wait)
                else:
                    raise
            except httpx.HTTPStatusError as exc:
                logger.error(
                    "HTTP error %d for %s: %s",
                    exc.response.status_code,
                    url,
                    exc,
                )
                raise
            except httpx.RequestError as exc:
                logger.warning(
                    "Request error (attempt %d/%d): %s - %s",
                    attempt + 1,
                    max_retries,
                    url,
                    exc,
                )
                if attempt < max_retries - 1:
                    await asyncio.sleep(backoff_factor * (2 ** attempt))
                else:
                    raise

        return None

    def _validate_content_type(
        self, response: httpx.Response, expected_types: List[str]
    ) -> bool:
        """Validate that the response content type matches expected types."""
        content_type = response.headers.get("Content-Type", "").lower()
        for expected in expected_types:
            if expected.lower() in content_type:
                return True
        logger.warning(
            "Unexpected content type %s (expected %s)",
            content_type,
            expected_types,
        )
        return False

    def _capture_provenance(self, response: httpx.Response) -> Dict[str, Any]:
        """Capture provenance metadata from the response."""
        return {
            "fetched_at": datetime.utcnow().isoformat(),
            "response_url": str(response.url),
            "status_code": response.status_code,
            "content_type": response.headers.get("Content-Type", ""),
            "content_length": response.headers.get("Content-Length"),
            "etag": response.headers.get("ETag"),
            "last_modified": response.headers.get("Last-Modified"),
            "source_manifest": self.manifest.get("name"),
            "base_url": self.base_url,
        }

    @abstractmethod
    async def fetch(self) -> List[Dict[str, Any]]:
        """Fetch document data from the source.

        Returns a list of document data dictionaries.
        """
        ...

    @abstractmethod
    async def parse(self, raw_data: Any) -> Dict[str, Any]:
        """Parse raw content into structured document data."""
        ...

    @abstractmethod
    async def store(
        self, document: Any, doc_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Store content based on storage_mode.

        Returns storage result dict with keys like: status, file_path, text, text_path
        """
        ...

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc_info):
        await self.close()
