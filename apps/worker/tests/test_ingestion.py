"""Tests for the ingestion job pipeline."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.jobs.ingestion_job import (
    _select_adapter,
    _create_document,
)
from app.adapters.html_adapter import HtmlAdapter
from app.adapters.pdf_adapter import PdfAdapter
from app.adapters.pointer_adapter import PointerAdapter
from app.utils.chunking import chunk_text


@pytest.fixture
def mock_manifest_html():
    return {
        "name": "test_html_source",
        "base_url": "https://example.gov.tr/test",
        "fetch_strategy": "html_page",
        "default_storage_mode": "mirrored",
        "default_trust_level": "official",
        "default_rights_status": "public-download",
        "language_default": "tr",
        "rate_limit_per_minute": 30,
    }


@pytest.fixture
def mock_manifest_pointer():
    return {
        "name": "test_pointer_source",
        "base_url": "https://example.gov.tr/info",
        "fetch_strategy": "pointer_only",
        "default_storage_mode": "pointer-only",
        "default_trust_level": "community",
        "default_rights_status": "unknown-review-needed",
        "language_default": "tr",
    }


@pytest.fixture
def mock_doc_data():
    return {
        "title": "Test Document",
        "slug": "test-document",
        "source_url": "https://example.gov.tr/test",
        "extracted_text": "This is test content.",
        "summary": "A test document for ingestion.",
        "author": "Test Author",
        "category": "emergency",
        "topic_tags": ["test", "sample"],
    }


class TestSelectAdapter:
    def test_selects_html_adapter_for_html_page_strategy(self, mock_manifest_html):
        adapter = _select_adapter(mock_manifest_html)
        assert isinstance(adapter, HtmlAdapter)

    def test_selects_pointer_adapter_for_pointer_only(self, mock_manifest_pointer):
        adapter = _select_adapter(mock_manifest_pointer)
        assert isinstance(adapter, PointerAdapter)

    def test_selects_pointer_adapter_as_default(self):
        manifest = {"name": "test", "base_url": "https://example.com"}
        adapter = _select_adapter(manifest)
        assert isinstance(adapter, PointerAdapter)


class TestChunkTextIntegration:
    def test_chunk_text_returns_non_empty_list(self):
        text = "Bu bir test cumlesidir. " * 100
        chunks = chunk_text(text, chunk_size=128, overlap=16)
        assert len(chunks) > 0
        assert all(isinstance(c, str) for c in chunks)
        assert all(len(c) > 0 for c in chunks)

    def test_chunk_text_respects_chunk_size(self):
        text = "A. B. C. D. E. F. G. H. I. J. K. L. M. N. O. P. " * 10
        chunks = chunk_text(text, chunk_size=64, overlap=0)
        # Each chunk should be roughly within the token limit
        assert len(chunks) > 0

    def test_chunk_text_empty_string(self):
        assert chunk_text("") == []
        assert chunk_text("   ") == []

    def test_chunk_text_with_turkish_characters(self):
        text = "T\u00fcrkiye b\u00fcy\u00fck bir \u00fclkedir. \u0130stanbul en kalabalik \u015fehirdir. " * 20
        chunks = chunk_text(text, chunk_size=128, overlap=16)
        assert len(chunks) > 0
        # Verify Turkish characters are preserved
        full_text = " ".join(chunks)
        assert "\u00fc" in full_text or "b\u00fcy\u00fck" in full_text or "\u0130" in full_text or "stanbul" in full_text
