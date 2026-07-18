"""Deterministic local file storage for ingested originals and extracts."""

import re
from pathlib import Path

import aiofiles

from app.config import get_settings


_SAFE_PART = re.compile(r"[^a-zA-Z0-9._-]+")
_ALLOWED_CATEGORIES = {"originals", "extracted", "previews", "thumbnails"}


class FileStorage:
    """Write worker artifacts beneath the configured storage root."""

    def __init__(self, root: str | Path | None = None) -> None:
        self.root = Path(root or get_settings().storage_root).resolve()

    def _target(self, slug: str, category: str, extension: str) -> Path:
        if category not in _ALLOWED_CATEGORIES:
            raise ValueError(f"Unsupported storage category: {category}")

        safe_slug = _SAFE_PART.sub("-", slug).strip(".-") or "document"
        safe_extension = _SAFE_PART.sub("", extension).strip(".") or "bin"
        category_root = (self.root / category).resolve()
        target = (category_root / f"{safe_slug}.{safe_extension}").resolve()

        if category_root not in target.parents:
            raise ValueError("Storage target escapes configured root")
        return target

    async def save_text(
        self,
        slug: str,
        content: str,
        *,
        category: str,
        extension: str = "txt",
    ) -> str:
        target = self._target(slug, category, extension)
        target.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(target, "w", encoding="utf-8", newline="\n") as handle:
            await handle.write(content)
        return str(target)

    async def save_binary(
        self,
        slug: str,
        content: bytes,
        *,
        category: str,
        extension: str,
    ) -> str:
        target = self._target(slug, category, extension)
        target.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(target, "wb") as handle:
            await handle.write(content)
        return str(target)
