"""Document service - CRUD operations for disaster documents."""

import os
import json
import logging
from pathlib import Path
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)

CONTENT_DIR = Path(os.getenv("CONTENT_DIR", "content/manifests"))


class DocumentService:
    """Handles CRUD operations for disaster-related documents."""

    def __init__(self, base_dir: Optional[Path] = None):
        self.base_dir = base_dir or CONTENT_DIR

    def get_document(self, doc_id: str) -> Optional[dict]:
        """Retrieve a document by its ID from the content directory."""
        doc_path = self._resolve_path(doc_id)
        if not doc_path or not doc_path.exists():
            return None
        try:
            with open(doc_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.error("Failed to read document %s: %s", doc_id, e)
            return None

    def list_documents(self, category: Optional[str] = None) -> list[dict]:
        """List all documents, optionally filtered by category."""
        documents = []
        search_dirs = [self.base_dir]
        if category:
            search_dirs = [self.base_dir / category]

        for search_dir in search_dirs:
            if not search_dir.exists():
                continue
            for json_file in search_dir.rglob("*.json"):
                try:
                    with open(json_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        documents.append({
                            "id": json_file.stem,
                            "path": str(json_file.relative_to(self.base_dir)),
                            "data": data,
                        })
                except (json.JSONDecodeError, IOError) as e:
                    logger.warning("Skipping unreadable file %s: %s", json_file, e)

        return documents

    def create_document(self, doc_id: str, data: dict, category: str = "general") -> bool:
        """Create a new document in the content directory."""
        target_dir = self.base_dir / category
        target_dir.mkdir(parents=True, exist_ok=True)
        doc_path = target_dir / f"{doc_id}.json"

        if doc_path.exists():
            logger.warning("Document %s already exists, refusing to overwrite", doc_id)
            return False

        data["metadata"] = {
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "version": 1,
        }

        try:
            with open(doc_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info("Created document %s in category %s", doc_id, category)
            return True
        except IOError as e:
            logger.error("Failed to create document %s: %s", doc_id, e)
            return False

    def update_document(self, doc_id: str, data: dict, category: str = "general") -> bool:
        """Update an existing document."""
        doc_path = self._resolve_path(doc_id, category)
        if not doc_path or not doc_path.exists():
            logger.warning("Document %s not found for update", doc_id)
            return False

        try:
            with open(doc_path, "r", encoding="utf-8") as f:
                existing = json.load(f)

            existing["data"] = data
            existing["metadata"] = {
                "created_at": existing.get("metadata", {}).get("created_at", datetime.utcnow().isoformat()),
                "updated_at": datetime.utcnow().isoformat(),
                "version": existing.get("metadata", {}).get("version", 0) + 1,
            }

            with open(doc_path, "w", encoding="utf-8") as f:
                json.dump(existing, f, ensure_ascii=False, indent=2)

            logger.info("Updated document %s (version %d)", doc_id, existing["metadata"]["version"])
            return True
        except (json.JSONDecodeError, IOError, KeyError) as e:
            logger.error("Failed to update document %s: %s", doc_id, e)
            return False

    def delete_document(self, doc_id: str, category: str = "general") -> bool:
        """Delete a document by its ID."""
        doc_path = self._resolve_path(doc_id, category)
        if not doc_path or not doc_path.exists():
            return False
        try:
            doc_path.unlink()
            logger.info("Deleted document %s", doc_id)
            return True
        except OSError as e:
            logger.error("Failed to delete document %s: %s", doc_id, e)
            return False

    def get_document_metadata(self, doc_id: str) -> Optional[dict]:
        """Get only the metadata of a document without loading full content."""
        doc = self.get_document(doc_id)
        if doc is None:
            return None
        return doc.get("metadata")

    def search_documents(self, query: str) -> list[dict]:
        """Search documents by ID or content (simple substring match)."""
        results = []
        query_lower = query.lower()

        for doc in self.list_documents():
            doc_str = json.dumps(doc, ensure_ascii=False).lower()
            if query_lower in doc_str or query_lower in doc["id"].lower():
                results.append(doc)

        return results

    def _resolve_path(self, doc_id: str, category: Optional[str] = None) -> Optional[Path]:
        """Resolve a document path by trying common categories."""
        if category:
            path = self.base_dir / category / f"{doc_id}.json"
            if path.exists():
                return path

        for subdir in self.base_dir.rglob("*.json"):
            if subdir.stem == doc_id:
                return subdir

        return None
