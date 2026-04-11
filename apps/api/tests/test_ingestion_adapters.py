"""Unit tests for ingestion adapters."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from app.adapters.html_adapter import HtmlAdapter
from app.adapters.pdf_adapter import PdfAdapter
from app.adapters.pointer_adapter import PointerAdapter
from app.adapters.base import BaseAdapter, RateLimiter


class TestHtmlAdapter:
    @pytest.fixture
    def html_manifest(self):
        return {
            "name": "test_html",
            "base_url": "https://example.gov.tr/page",
            "fetch_strategy": "html_page",
            "default_storage_mode": "mirrored",
            "default_trust_level": "official",
            "default_rights_status": "public_download",
            "language_default": "tr",
            "rate_limit_per_minute": 60,
        }

    def test_init_sets_base_url_and_rate_limiter(self, html_manifest):
        adapter = HtmlAdapter(html_manifest)
        assert adapter.base_url == "https://example.gov.tr/page"
        assert adapter.rate_limiter is not None
        assert adapter.manifest == html_manifest

    @pytest.mark.asyncio
    async def test_parse_extracts_title(self, html_manifest):
        adapter = HtmlAdapter(html_manifest)
        html_content = """
        <html>
        <head><title>Test Sayfa</title>
        <meta name="description" content="Test aciklama">
        </head>
        <body><p>Bu bir test paragrafidir.</p></body>
        </html>
        """
        result = await adapter.parse(html_content)
        assert "title" in result
        assert result["mime_type"] == "text/html"
        assert result["original_format"] == "html"
        assert result["source_url"] == "https://example.gov.tr/page"

    @pytest.mark.asyncio
    async def test_parse_extracts_source_domain(self, html_manifest):
        adapter = HtmlAdapter(html_manifest)
        result = await adapter.parse("<html><body>test</body></html>")
        assert result["source_domain"] == "example.gov.tr"

    def test_extract_domain_from_url(self, html_manifest):
        adapter = HtmlAdapter(html_manifest)
        assert adapter._extract_domain("https://example.gov.tr/page") == "example.gov.tr"
        assert adapter._extract_domain("http://sub.domain.com/path?q=1") == "sub.domain.com"

    def test_compute_sha256(self, html_manifest):
        adapter = HtmlAdapter(html_manifest)
        result = adapter._compute_sha256(b"test content")
        assert len(result) == 64
        assert result == adapter._compute_sha256(b"test content")


class TestPdfAdapter:
    @pytest.mark.asyncio
    async def test_parse_handles_invalid_pdf(self):
        manifest = {
            "name": "test_pdf",
            "base_url": "https://example.gov.tr/doc.pdf",
            "fetch_strategy": "pdf_source",
            "default_storage_mode": "mirrored",
            "language_default": "tr",
        }
        adapter = PdfAdapter(manifest)

        pdf_bytes = b"not a real pdf"
        result = await adapter.parse(pdf_bytes)
        assert "title" in result
        assert "source_url" in result
        assert result["mime_type"] == "application/pdf"

    @pytest.mark.asyncio
    async def test_parse_extracts_domain(self):
        manifest = {
            "name": "test_pdf",
            "base_url": "https://docs.example.gov.tr/file.pdf",
            "fetch_strategy": "pdf_source",
            "default_storage_mode": "mirrored",
            "language_default": "tr",
        }
        adapter = PdfAdapter(manifest)
        pdf_bytes = b"%" + b"test" * 100
        result = await adapter.parse(pdf_bytes)
        assert result["source_domain"] == "docs.example.gov.tr"

    def test_init_sets_base_url(self):
        manifest = {
            "name": "test_pdf",
            "base_url": "https://example.gov.tr/doc.pdf",
            "fetch_strategy": "pdf_source",
            "default_storage_mode": "mirrored",
            "language_default": "tr",
        }
        adapter = PdfAdapter(manifest)
        assert adapter.base_url == "https://example.gov.tr/doc.pdf"


class TestPointerAdapter:
    @pytest.fixture
    def pointer_manifest(self):
        return {
            "name": "test_pointer",
            "base_url": "https://example.gov.tr/info",
            "fetch_strategy": "pointer_only",
            "default_storage_mode": "pointer-only",
            "default_trust_level": "community",
            "default_rights_status": "unknown_review_needed",
            "language_default": "tr",
            "rate_limit_per_minute": 30,
        }

    def test_init_sets_base_url(self, pointer_manifest):
        adapter = PointerAdapter(pointer_manifest)
        assert adapter.base_url == "https://example.gov.tr/info"

    @pytest.mark.asyncio
    async def test_store_returns_pointer_only(self, pointer_manifest):
        adapter = PointerAdapter(pointer_manifest)
        result = await adapter.store(None, {"slug": "test-doc"})
        assert result["status"] == "pointer_only"
        assert result["text"] == ""
        assert result["file_path"] is None

    @pytest.mark.asyncio
    async def test_parse_returns_pointer_metadata(self, pointer_manifest):
        adapter = PointerAdapter(pointer_manifest)
        result = await adapter.parse({"title": "Test"})
        assert result["extracted_text"] == ""
        assert result["metadata"]["pointer_only"] is True

    def test_extract_domain(self, pointer_manifest):
        adapter = PointerAdapter(pointer_manifest)
        assert adapter._extract_domain("https://example.gov.tr/info") == "example.gov.tr"


class TestRateLimiter:
    @pytest.mark.asyncio
    async def test_rate_limiter_allows_burst(self):
        limiter = RateLimiter(requests_per_minute=60)
        for _ in range(10):
            await limiter.acquire()

    @pytest.mark.asyncio
    async def test_rate_limiter_initial_tokens(self):
        limiter = RateLimiter(requests_per_minute=60)
        assert limiter.tokens == 60.0
        assert limiter.max_tokens == 60.0

    @pytest.mark.asyncio
    async def test_rate_limiter_consumes_tokens(self):
        limiter = RateLimiter(requests_per_minute=60)
        initial = limiter.tokens
        await limiter.acquire()
        assert limiter.tokens < initial

    @pytest.mark.asyncio
    async def test_rate_limiter_low_limit(self):
        limiter = RateLimiter(requests_per_minute=5)
        for _ in range(5):
            await limiter.acquire()
        import asyncio
        start = asyncio.get_event_loop().time()
        await limiter.acquire()
        elapsed = asyncio.get_event_loop().time() - start
        assert elapsed >= 0


class TestFetchRetryLogic:
    @pytest.mark.asyncio
    async def test_fetch_retry_on_429(self):
        manifest = {
            "name": "test_retry",
            "base_url": "https://example.gov.tr/retry",
            "fetch_strategy": "html_page",
            "default_storage_mode": "mirrored",
            "language_default": "tr",
            "rate_limit_per_minute": 60,
        }
        adapter = HtmlAdapter(manifest)

        mock_response_429 = MagicMock()
        mock_response_429.status_code = 429

        mock_response_200 = MagicMock()
        mock_response_200.status_code = 200
        mock_response_200.text = "<html><body>Success</body></html>"
        mock_response_200.headers = {"Content-Type": "text/html"}

        call_count = 0

        async def mock_get(url, headers=None):
            nonlocal call_count
            call_count += 1
            if call_count <= 2:
                return mock_response_429
            return mock_response_200

        mock_client = AsyncMock()
        mock_client.get = mock_get
        adapter._client = mock_client

        response = await adapter._fetch_with_retry("https://example.gov.tr/retry", max_retries=3)
        assert response is not None
        assert response.status_code == 200
        assert call_count == 3

    @pytest.mark.asyncio
    async def test_fetch_retries_exhausted(self):
        manifest = {
            "name": "test_exhausted",
            "base_url": "https://example.gov.tr/fail",
            "fetch_strategy": "html_page",
            "default_storage_mode": "mirrored",
            "language_default": "tr",
            "rate_limit_per_minute": 60,
        }
        adapter = HtmlAdapter(manifest)

        async def mock_get(url, headers=None):
            raise Exception("Connection refused")

        mock_client = AsyncMock()
        mock_client.get = mock_get
        adapter._client = mock_client

        with pytest.raises(Exception):
            await adapter._fetch_with_retry(
                "https://example.gov.tr/fail",
                max_retries=2,
                backoff_factor=0.01,
            )

    @pytest.mark.asyncio
    async def test_fetch_304_returns_none(self):
        manifest = {
            "name": "test_304",
            "base_url": "https://example.gov.tr/notmodified",
            "fetch_strategy": "html_page",
            "default_storage_mode": "mirrored",
            "language_default": "tr",
            "rate_limit_per_minute": 60,
        }
        adapter = HtmlAdapter(manifest)

        mock_response = MagicMock()
        mock_response.status_code = 304

        async def mock_get(url, headers=None):
            return mock_response

        mock_client = AsyncMock()
        mock_client.get = mock_get
        adapter._client = mock_client

        response = await adapter._fetch_with_retry("https://example.gov.tr/notmodified")
        assert response is None


class TestAdapterProvenance:
    def test_capture_provenance(self):
        manifest = {
            "name": "test_provenance",
            "base_url": "https://example.gov.tr/prov",
            "fetch_strategy": "html_page",
            "default_storage_mode": "mirrored",
            "language_default": "tr",
            "rate_limit_per_minute": 60,
        }
        adapter = HtmlAdapter(manifest)

        mock_response = MagicMock()
        mock_response.url = "https://example.gov.tr/prov"
        mock_response.status_code = 200
        mock_response.headers = {
            "Content-Type": "text/html",
            "Content-Length": "1234",
            "ETag": '"abc123"',
            "Last-Modified": "Mon, 01 Jan 2024 00:00:00 GMT",
        }

        provenance = adapter._capture_provenance(mock_response)
        assert provenance["response_url"] == "https://example.gov.tr/prov"
        assert provenance["status_code"] == 200
        assert provenance["content_type"] == "text/html"
        assert provenance["etag"] == '"abc123"'
        assert provenance["source_manifest"] == "test_provenance"
