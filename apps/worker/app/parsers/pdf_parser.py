import logging
from datetime import datetime
from typing import Any, Dict, Optional

logger = logging.getLogger("worker.parsers.pdf")


def parse_pdf_content(pdf_bytes: bytes, file_path: str = "") -> Dict[str, Any]:
    """Parse PDF and extract text and metadata.

    Uses pypdf for text extraction, falls back to pymupdf if needed.

    Args:
        pdf_bytes: Raw PDF bytes
        file_path: Path to PDF file (for pymupdf fallback)

    Returns:
        Dict with keys: title, text, author, publisher, page_count, metadata
    """
    result = {
        "title": "",
        "text": "",
        "author": "",
        "publisher": "",
        "published_at": None,
        "page_count": 0,
        "summary": "",
        "metadata": {},
    }

    # Try pypdf first
    result = _parse_with_pypdf(pdf_bytes, result)

    # If pypdf failed to extract text, try pymupdf
    if not result["text"].strip():
        result = _parse_with_pymupdf(pdf_bytes, result)

    # Generate summary from first portion of text
    if result["text"]:
        words = result["text"].split()
        result["summary"] = " ".join(words[:200]) if len(words) > 200 else result["text"]

    return result


def _parse_with_pypdf(pdf_bytes: bytes, result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract text and metadata using pypdf."""
    try:
        from pypdf import PdfReader
        from io import BytesIO

        reader = PdfReader(BytesIO(pdf_bytes))

        # Extract metadata
        if reader.metadata:
            meta = reader.metadata
            if meta.title:
                result["title"] = meta.title
            if meta.author:
                result["author"] = meta.author
            if meta.creator:
                result["publisher"] = meta.creator
            if meta.subject:
                result["metadata"]["subject"] = meta.subject

        result["page_count"] = len(reader.pages)

        # Extract text from all pages
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

        result["text"] = "\n\n".join(text_parts)

    except Exception as exc:
        logger.warning("pypdf extraction failed: %s", exc)

    return result


def _parse_with_pymupdf(pdf_bytes: bytes, result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract text using pymupdf (fitz) as fallback."""
    try:
        import fitz  # pymupdf

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        result["page_count"] = len(doc)

        # Extract metadata
        meta = doc.metadata
        if meta:
            if meta.get("title"):
                result["title"] = meta["title"]
            if meta.get("author"):
                result["author"] = meta["author"]
            if meta.get("producer"):
                result["publisher"] = meta["producer"]
            if meta.get("creationDate"):
                result["metadata"]["creation_date"] = meta["creationDate"]

        # Extract text from all pages
        text_parts = []
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text_parts.append(page_text)

        result["text"] = "\n\n".join(text_parts)
        doc.close()

    except Exception as exc:
        logger.warning("pymupdf extraction failed: %s", exc)

    return result
