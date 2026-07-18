import logging
from typing import Any, Dict, Optional

import trafilatura

logger = logging.getLogger("worker.parsers.html")


def parse_html_content(html: str, url: str = "") -> Dict[str, Any]:
    """Parse HTML content using trafilatura.

    Extracts title, body text, metadata from HTML.
    Cleans content and preserves structure where needed.

    Args:
        html: Raw HTML string
        url: Source URL for metadata

    Returns:
        Dict with keys: title, text, description, language
    """
    if not html or not html.strip():
        return {
            "title": "",
            "text": "",
            "description": "",
            "language": "tr",
        }

    try:
        # Extract content using trafilatura
        text = trafilatura.extract(
            html,
            include_comments=False,
            include_tables=True,
            include_links=False,
            favor_precision=True,
            target_language="tr",
        )

        # Extract metadata
        downloaded = trafilatura.bare_extraction(
            html,
            include_comments=False,
            include_tables=False,
            include_links=False,
            as_dict=True,
        )

        title = ""
        description = ""
        language = "tr"

        if isinstance(downloaded, dict):
            title = downloaded.get("title", "")
            description = downloaded.get("description", "")
            language = downloaded.get("language", "tr")

        # If trafilatura dict extraction didn't work, try string extraction
        if not text:
            text = trafilatura.extract(
                html,
                include_comments=False,
                include_tables=True,
                include_links=False,
                favor_precision=True,
            ) or ""

        # If still no title, try basic extraction
        if not title:
            import re
            title_match = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
            if title_match:
                title = title_match.group(1).strip()

        return {
            "title": title.strip() if title else "",
            "text": text.strip() if text else "",
            "description": description.strip() if description else "",
            "language": language or "tr",
        }

    except Exception as exc:
        logger.error("Error parsing HTML content from %s: %s", url, exc)
        return {
            "title": "",
            "text": "",
            "description": "",
            "language": "tr",
        }
