import logging
import re
from datetime import datetime
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup

logger = logging.getLogger("worker.parsers.metadata")


def extract_metadata(html: str, base_url: str = "") -> Dict[str, Any]:
    """Extract metadata from HTML content.

    Extracts Dublin Core metadata, OG tags, structured data, and normalizes dates.

    Args:
        html: Raw HTML string
        base_url: Base URL for resolving relative URLs

    Returns:
        Dict with metadata fields
    """
    metadata: Dict[str, Any] = {
        "title": "",
        "description": "",
        "author": "",
        "publisher": "",
        "keywords": [],
        "canonical_url": "",
        "published_at": None,
        "modified_at": None,
        "og_data": {},
        "dc_data": {},
    }

    try:
        soup = BeautifulSoup(html, "lxml")

        # Title
        title_tag = soup.find("title")
        if title_tag and title_tag.string:
            metadata["title"] = title_tag.string.strip()

        # Meta description
        desc_tag = soup.find("meta", attrs={"name": "description"})
        if desc_tag and desc_tag.get("content"):
            metadata["description"] = desc_tag["content"].strip()

        # Author
        author_tag = soup.find("meta", attrs={"name": "author"})
        if author_tag and author_tag.get("content"):
            metadata["author"] = author_tag["content"].strip()

        # Publisher
        publisher_tag = soup.find("meta", attrs={"name": "publisher"})
        if publisher_tag and publisher_tag.get("content"):
            metadata["publisher"] = publisher_tag["content"].strip()

        # Keywords
        keywords_tag = soup.find("meta", attrs={"name": "keywords"})
        if keywords_tag and keywords_tag.get("content"):
            metadata["keywords"] = [
                k.strip() for k in keywords_tag["content"].split(",") if k.strip()
            ]

        # Canonical URL
        canonical_tag = soup.find("link", attrs={"rel": "canonical"})
        if canonical_tag and canonical_tag.get("href"):
            metadata["canonical_url"] = urljoin(base_url, canonical_tag["href"])

        # OG tags
        og_data = _extract_og_tags(soup, base_url)
        metadata["og_data"] = og_data

        # If no title from regular tags, try OG
        if not metadata["title"] and og_data.get("title"):
            metadata["title"] = og_data["title"]
        if not metadata["description"] and og_data.get("description"):
            metadata["description"] = og_data["description"]

        # Dublin Core
        dc_data = _extract_dublin_core(soup)
        metadata["dc_data"] = dc_data

        # Dates
        metadata["published_at"] = _extract_date(soup, "article:published_time") or _extract_date(
            soup, "date"
        )
        metadata["modified_at"] = _extract_date(soup, "article:modified_time")

        # JSON-LD structured data
        json_ld = _extract_json_ld(soup)
        if json_ld:
            metadata["structured_data"] = json_ld
            if not metadata["author"] and json_ld.get("author"):
                metadata["author"] = json_ld["author"]
            if not metadata["publisher"] and json_ld.get("publisher"):
                metadata["publisher"] = json_ld["publisher"]

    except Exception as exc:
        logger.error("Error extracting metadata: %s", exc)

    return metadata


def extract_metadata_from_url(html: str, base_url: str = "") -> Dict[str, Any]:
    """Extract lightweight metadata from HTML (alias for extract_metadata)."""
    return extract_metadata(html, base_url)


def _extract_og_tags(soup: BeautifulSoup, base_url: str) -> Dict[str, str]:
    """Extract Open Graph tags."""
    og_data = {}
    og_prefix = "og:"

    for meta in soup.find_all("meta", attrs={"property": True}):
        prop = meta.get("property", "")
        if prop.startswith(og_prefix):
            key = prop[len(og_prefix):]
            value = meta.get("content", "")
            if value:
                og_data[key] = value

    # Resolve relative image URLs
    if "image" in og_data and not og_data["image"].startswith(("http://", "https://")):
        og_data["image"] = urljoin(base_url, og_data["image"])

    return og_data


def _extract_dublin_core(soup: BeautifulSoup) -> Dict[str, str]:
    """Extract Dublin Core metadata elements."""
    dc_data = {}
    dc_prefixes = ["DC.", "DC:", "dcterms."]

    for meta in soup.find_all("meta", attrs={"name": True}):
        name = meta.get("name", "")
        content = meta.get("content", "")
        if not content:
            continue

        for prefix in dc_prefixes:
            if name.startswith(prefix):
                key = name[len(prefix):]
                dc_data[key] = content
                break

    return dc_data


def _extract_date(soup: BeautifulSoup, attr_value: str) -> Optional[datetime]:
    """Extract and normalize a date from meta tags."""
    # Check meta tags
    for meta in soup.find_all("meta"):
        if meta.get("property") == attr_value or meta.get("name") == attr_value:
            date_str = meta.get("content", "")
            return _normalize_date(date_str)

    # Check time elements
    for time_elem in soup.find_all("time"):
        datetime_attr = time_elem.get("datetime", "")
        if datetime_attr:
            return _normalize_date(datetime_attr)

    return None


def _normalize_date(date_str: str) -> Optional[datetime]:
    """Normalize date strings to datetime objects."""
    if not date_str:
        return None

    date_str = date_str.strip()

    # Try ISO format first
    for fmt in [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%f%z",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%d",
        "%d.%m.%Y",
        "%d/%m/%Y",
    ]:
        try:
            dt = datetime.strptime(date_str[:26], fmt)
            return dt
        except (ValueError, IndexError):
            continue

    return None


def _extract_json_ld(soup: BeautifulSoup) -> Dict[str, Any]:
    """Extract JSON-LD structured data."""
    results = {}

    for script in soup.find_all("script", type="application/ld+json"):
        if script.string:
            try:
                import json
                data = json.loads(script.string)

                if isinstance(data, dict):
                    if data.get("@type") == "Article":
                        results["type"] = "article"
                        results["headline"] = data.get("headline", "")
                        results["author"] = data.get("author", "")
                        results["publisher"] = data.get("publisher", "")
                        if isinstance(data.get("publisher"), dict):
                            results["publisher"] = data["publisher"].get("name", "")
                        results["date_published"] = data.get("datePublished", "")
                    elif data.get("@type") == "WebPage":
                        results["type"] = "webpage"
                        results["name"] = data.get("name", "")
                        results["description"] = data.get("description", "")
                elif isinstance(data, list) and data:
                    # Take the first item if it's a list
                    return _extract_json_ld_from_list(data)

            except (json.JSONDecodeError, Exception) as exc:
                logger.debug("Failed to parse JSON-LD: %s", exc)

    return results


def _extract_json_ld_from_list(data_list: List[Dict]) -> Dict[str, Any]:
    """Extract structured data from JSON-LD array."""
    for item in data_list:
        if isinstance(item, dict):
            if item.get("@type") == "Article":
                return {
                    "type": "article",
                    "headline": item.get("headline", ""),
                    "author": item.get("author", ""),
                    "publisher": item.get("publisher", ""),
                }

    return {}
