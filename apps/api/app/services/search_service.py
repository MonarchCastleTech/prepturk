"""Search service - Search orchestration for disaster documents and knowledge."""

import os
import json
import logging
from pathlib import Path
from typing import Optional
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)

CONTENT_DIR = Path(os.getenv("CONTENT_DIR", "content/manifests"))


class SearchService:
    """Handles search across documents, provinces, and disaster knowledge."""

    def __init__(self, base_dir: Optional[Path] = None):
        self.base_dir = base_dir or CONTENT_DIR
        self._index: dict[str, list[dict]] = {}

    def build_index(self) -> int:
        """Build or rebuild the search index from content files."""
        self._index = {"documents": [], "provinces": [], "topics": []}

        for json_file in self.base_dir.rglob("*.json"):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)

                entry = {
                    "id": json_file.stem,
                    "path": str(json_file.relative_to(self.base_dir)),
                    "content": json.dumps(data, ensure_ascii=False),
                }

                if "province" in str(json_file).lower() or "il" in str(json_file).lower():
                    self._index["provinces"].append(entry)
                elif "topic" in str(json_file).lower() or "konu" in str(json_file).lower():
                    self._index["topics"].append(entry)
                else:
                    self._index["documents"].append(entry)

            except (json.JSONDecodeError, IOError) as e:
                logger.warning("Index skip %s: %s", json_file, e)

        total = sum(len(v) for v in self._index.values())
        logger.info("Search index built: %d entries", total)
        return total

    def search(self, query: str, limit: int = 10, category: Optional[str] = None) -> list[dict]:
        """Search across indexed content with relevance scoring."""
        if not self._index:
            self.build_index()

        query_lower = query.lower().strip()
        if not query_lower:
            return []

        results = []
        search_spaces = [self._index] if not category else {category: self._index.get(category, [])}

        for space_name, entries in search_spaces.items():
            for entry in entries:
                score = self._score_entry(query_lower, entry)
                if score > 0:
                    results.append({
                        "id": entry["id"],
                        "category": space_name,
                        "path": entry["path"],
                        "score": score,
                        "preview": self._generate_preview(entry["content"], query_lower),
                    })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]

    def search_provinces(self, province_name: str) -> list[dict]:
        """Search specifically for province-related documents."""
        if not self._index:
            self.build_index()

        results = []
        query_lower = province_name.lower()

        for entry in self._index.get("provinces", []):
            score = self._score_entry(query_lower, entry)
            if score > 0.1:
                results.append({
                    "id": entry["id"],
                    "path": entry["path"],
                    "score": score,
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results

    def search_topics(self, topic: str) -> list[dict]:
        """Search for educational topic documents."""
        if not self._index:
            self.build_index()

        results = []
        query_lower = topic.lower()

        for entry in self._index.get("topics", []) + self._index.get("documents", []):
            score = self._score_entry(query_lower, entry)
            if score > 0.15:
                results.append({
                    "id": entry["id"],
                    "path": entry["path"],
                    "score": score,
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results

    def get_autocomplete_suggestions(self, partial: str, limit: int = 5) -> list[str]:
        """Generate autocomplete suggestions from indexed content."""
        if not self._index:
            self.build_index()

        suggestions = set()
        partial_lower = partial.lower()

        for entry_list in self._index.values():
            for entry in entry_list:
                if partial_lower in entry["id"].lower():
                    suggestions.add(entry["id"])

                try:
                    data = json.loads(entry["content"])
                    if isinstance(data, dict):
                        for key in data:
                            if partial_lower in str(key).lower():
                                suggestions.add(str(key))
                except json.JSONDecodeError:
                    pass

        return sorted(suggestions)[:limit]

    def _score_entry(self, query: str, entry: dict) -> float:
        """Score a search entry against the query."""
        score = 0.0
        content = entry["content"].lower()
        entry_id = entry["id"].lower()

        if query == entry_id:
            score += 10.0
        elif entry_id.startswith(query):
            score += 5.0
        elif query in entry_id:
            score += 3.0

        if query in content:
            score += 1.0

        similarity = SequenceMatcher(None, query, entry_id).ratio()
        if similarity > 0.6:
            score += similarity * 2.0

        return score

    def _generate_preview(self, content: str, query: str, max_length: int = 150) -> str:
        """Generate a content preview highlighting the query match."""
        idx = content.lower().find(query)
        if idx == -1:
            return content[:max_length] + "..."

        start = max(0, idx - 50)
        end = min(len(content), idx + len(query) + 100)
        snippet = content[start:end]

        if start > 0:
            snippet = "..." + snippet
        if end < len(content):
            snippet = snippet + "..."

        return snippet
