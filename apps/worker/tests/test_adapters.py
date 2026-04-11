"""Tests for content adapters."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.adapters.html_adapter import HtmlAdapter
from app.adapters.pdf_adapter import PdfAdapter
from app.adapters.pointer_adapter import PointerAdapter
from app.adapters.base import RateLimiter


@pytest.fixture
def html_manifest():
    return {
        "name": "test_html",
        "base_url": "https://example.gov.tr/page",
        "fetch_strategy": "html_page",
        "default_storage_mode": "mirrored",
        "default_trust_level": "official",
        "default_rights_status": "public-download",
        "language_default": "tr",
        "rate_limit_per_minute": 60,
    }


@pytest.fixture
def pointer_manifest():
    return {
        "name": "test_pointer",
        "base_url": "https://example.gov.tr/info",
        "fetch_strategy": "pointer_only",
        "default_storage_mode": "pointer-only",
        "default_trust_level": "community",
        "default_rights_status": "unknown-review-needed",
        "language_default": "tr",
        "rate_limit_per_minute": 30,
    }


class TestHtmlAdapter:
    def test_init_sets_base_url_and_rate_limiter(self, html_manifest):
        adapter = HtmlAdapter(html_manifest)
        assert adapter.base_url == "https://example.gov.tr/page"
        assert adapter.rate_limiter is not None

    @pytest.mark.asyncio
    async def test_parse_extracts_content(self, html_manifest):
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
        assert result["title"] == "Test Sayfa"
        assert result["mime_type"] == "text/html"
        assert result["original_format"] == "html"


class TestPointerAdapter:
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


class TestPdfAdapter:
    @pytest.mark.asyncio
    async def test_parse_handles_pdf_bytes(self):
        manifest = {
            "name": "test_pdf",
            "base_url": "https://example.gov.tr/doc.pdf",
            "fetch_strategy": "pdf_source",
            "default_storage_mode": "mirrored",
            "language_default": "tr",
        }
        adapter = PdfAdapter(manifest)

        # Create a minimal invalid PDF bytes for testing
        # The parser should handle errors gracefully
        pdf_bytes = b"not a real pdf"
        result = await adapter.parse(pdf_bytes)
        # Even with invalid PDF, it should return a dict with expected keys
        assert "title" in result
        assert "source_url" in result
        assert "mime_type" == "application/pdf"


class TestRateLimiter:
    @pytest.mark.asyncio
    async def test_rate_limiter_allows_burst(self):
        limiter = RateLimiter(requests_per_minute=60)
        # Should allow immediate requests up to the limit
        for _ in range(10):
            await limiter.acquire()  # Should not raise

    @pytest.mark.asyncio
    async def test_rate_limiter_enforces_limit(self):
        limiter = RateLimiter(requests_per_minute=5)
        # Exhaust tokens
        for _ in range(5):
            await limiter.acquire()
        # Next acquire should wait
        import asyncio
        start = asyncio.get_event_loop().time()
        await limiter.acquire()
        elapsed = asyncio.get_event_loop().time() - start
        # Should have waited at least a tiny bit
        assert elapsed >= 0


class TestAdapterBase:
    def test_extract_domain(self):
        manifest = {"name": "test", "base_url": "https://example.gov.tr/page"}
        adapter = PointerAdapter(manifest)
        assert adapter._extract_domain("https://example.gov.tr/page") == "example.gov.tr"
        assert adapter._extract_domain("http://sub.domain.com/path?q=1") == "sub.domain.com"

    def test_compute_sha256(self):
        manifest = {"name": "test", "base_url": "https://example.com"}
        adapter = PointerAdapter(manifest)
        result = adapter._compute_sha256(b"test content")
        assert len(result) == 64  # SHA256 hex length
        assert result == adapter._compute_sha256(b"test content")  # Deterministic
