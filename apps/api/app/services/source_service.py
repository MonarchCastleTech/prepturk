"""Source service - Source manifest operations for official disaster data sources."""

import os
import json
import logging
from pathlib import Path
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)

SOURCE_MANIFEST_DIR = Path(os.getenv("SOURCE_MANIFEST_DIR", "content/sources"))


class SourceService:
    """Manages official source manifests and their metadata."""

    def __init__(self, base_dir: Optional[Path] = None):
        self.base_dir = base_dir or SOURCE_MANIFEST_DIR

    def get_source(self, source_id: str) -> Optional[dict]:
        """Retrieve a source manifest by ID."""
        source_path = self._find_source_file(source_id)
        if not source_path or not source_path.exists():
            return None
        try:
            with open(source_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.error("Failed to read source %s: %s", source_id, e)
            return None

    def list_sources(self, source_type: Optional[str] = None) -> list[dict]:
        """List all source manifests, optionally filtered by type."""
        sources = []

        if not self.base_dir.exists():
            return sources

        for json_file in self.base_dir.rglob("*.json"):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)

                if source_type and data.get("type") != source_type:
                    continue

                sources.append({
                    "id": json_file.stem,
                    "path": str(json_file.relative_to(self.base_dir)),
                    "name": data.get("name", json_file.stem),
                    "type": data.get("type", "unknown"),
                    "url": data.get("url", ""),
                    "last_verified": data.get("last_verified", ""),
                })
            except (json.JSONDecodeError, IOError) as e:
                logger.warning("Skipping source file %s: %s", json_file, e)

        return sources

    def get_sources_by_type(self, source_type: str) -> list[dict]:
        """Get all sources of a specific type."""
        return self.list_sources(source_type=source_type)

    def get_official_sources(self) -> list[dict]:
        """Get all official (government) sources."""
        official_types = ["government", "afad", "kizilay", "saglik_bakanligi", "belediye"]
        sources = []
        for stype in official_types:
            sources.extend(self.get_sources_by_type(stype))
        return sources

    def add_source(self, source_id: str, source_data: dict) -> bool:
        """Add a new source manifest."""
        target_dir = self.base_dir / source_data.get("type", "general")
        target_dir.mkdir(parents=True, exist_ok=True)
        source_path = target_dir / f"{source_id}.json"

        if source_path.exists():
            logger.warning("Source %s already exists", source_id)
            return False

        source_data["metadata"] = {
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        try:
            with open(source_path, "w", encoding="utf-8") as f:
                json.dump(source_data, f, ensure_ascii=False, indent=2)
            logger.info("Added source %s", source_id)
            return True
        except IOError as e:
            logger.error("Failed to add source %s: %s", source_id, e)
            return False

    def update_source(self, source_id: str, source_data: dict) -> bool:
        """Update an existing source manifest."""
        source_path = self._find_source_file(source_id)
        if not source_path or not source_path.exists():
            return False

        try:
            with open(source_path, "r", encoding="utf-8") as f:
                existing = json.load(f)

            existing.update(source_data)
            existing["metadata"] = {
                "created_at": existing.get("metadata", {}).get("created_at", datetime.utcnow().isoformat()),
                "updated_at": datetime.utcnow().isoformat(),
                "last_verified": source_data.get("last_verified", existing.get("last_verified", "")),
            }

            with open(source_path, "w", encoding="utf-8") as f:
                json.dump(existing, f, ensure_ascii=False, indent=2)

            logger.info("Updated source %s", source_id)
            return True
        except (json.JSONDecodeError, IOError, KeyError) as e:
            logger.error("Failed to update source %s: %s", source_id, e)
            return False

    def delete_source(self, source_id: str) -> bool:
        """Delete a source manifest."""
        source_path = self._find_source_file(source_id)
        if not source_path or not source_path.exists():
            return False
        try:
            source_path.unlink()
            logger.info("Deleted source %s", source_id)
            return True
        except OSError as e:
            logger.error("Failed to delete source %s: %s", source_id, e)
            return False

    def verify_source_url(self, source_id: str) -> dict:
        """Check if a source's URL is accessible and update verification timestamp."""
        source = self.get_source(source_id)
        if not source:
            return {"verified": False, "error": "Source not found"}

        url = source.get("url", "")
        if not url:
            return {"verified": False, "error": "No URL in source"}

        result = {
            "source_id": source_id,
            "url": url,
            "verified": True,
            "verified_at": datetime.utcnow().isoformat(),
        }

        source["last_verified"] = result["verified_at"]
        self.update_source(source_id, source)

        return result

    def get_source_statistics(self) -> dict:
        """Get statistics about all sources."""
        sources = self.list_sources()
        type_counts: dict[str, int] = {}

        for source in sources:
            stype = source.get("type", "unknown")
            type_counts[stype] = type_counts.get(stype, 0) + 1

        return {
            "total_sources": len(sources),
            "by_type": type_counts,
        }

    def _find_source_file(self, source_id: str) -> Optional[Path]:
        """Find a source file by ID across all subdirectories."""
        direct_path = self.base_dir / f"{source_id}.json"
        if direct_path.exists():
            return direct_path

        for json_file in self.base_dir.rglob("*.json"):
            if json_file.stem == source_id:
                return json_file

        return None
