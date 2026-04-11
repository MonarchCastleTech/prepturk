import logging
from typing import List, Optional

import httpx
from qdrant_client import QdrantClient

from app.config import get_settings

logger = logging.getLogger("worker.embeddings")
settings = get_settings()


class OllamaEmbeddings:
    """Ollama embedding client with batching and error handling."""

    def __init__(self):
        self.base_url = settings.ollama_base_url.rstrip("/")
        self.model = settings.ollama_embedding_model
        self._client: Optional[httpx.AsyncClient] = None
        self._qdrant_client: Optional[QdrantClient] = None

    @property
    def qdrant_client(self) -> Optional[QdrantClient]:
        """Get or create Qdrant client (synchronous)."""
        if self._qdrant_client is None:
            try:
                self._qdrant_client = QdrantClient(
                    url=settings.qdrant_url,
                    api_key=settings.qdrant_api_key or None,
                    timeout=30,
                )
            except Exception as exc:
                logger.error("Failed to connect to Qdrant: %s", exc)
                return None
        return self._qdrant_client

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client for Ollama."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=60.0,
            )
        return self._client

    async def embed(self, text: str) -> List[float]:
        """Generate embedding for a single text."""
        result = await self._embed_texts([text])
        return result[0]

    async def embed_batch(
        self,
        texts: List[str],
        batch_size: int = 32,
    ) -> List[List[float]]:
        """Generate embeddings for a list of texts with batching.

        Args:
            texts: List of texts to embed
            batch_size: Number of texts per batch

        Returns:
            List of embedding vectors
        """
        all_embeddings = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            logger.debug(
                "Embedding batch %d-%d of %d texts",
                i,
                i + len(batch),
                len(texts),
            )
            batch_embeddings = await self._embed_texts(batch)
            all_embeddings.extend(batch_embeddings)

        logger.info(
            "Generated %d embeddings for %d texts",
            len(all_embeddings),
            len(texts),
        )
        return all_embeddings

    async def _embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Call Ollama API to generate embeddings."""
        if not texts:
            return []

        client = await self._get_client()
        embeddings = []

        for text in texts:
            try:
                response = await client.post(
                    "/api/embed",
                    json={
                        "model": self.model,
                        "input": text,
                    },
                )
                response.raise_for_status()
                data = response.json()

                if "embeddings" in data and data["embeddings"]:
                    embeddings.append(data["embeddings"][0])
                else:
                    logger.warning("Empty embedding returned for text: %s", text[:100])
                    embeddings.append([0.0] * 768)  # Default dimension

            except httpx.ConnectError:
                logger.error(
                    "Cannot connect to Ollama at %s. Is it running?",
                    self.base_url,
                )
                raise
            except httpx.HTTPStatusError as exc:
                logger.error(
                    "Ollama HTTP error %d: %s",
                    exc.response.status_code,
                    exc.response.text,
                )
                raise
            except Exception as exc:
                logger.error("Ollama embedding failed: %s", exc)
                raise

        return embeddings

    async def close(self):
        """Close HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

        if self._qdrant_client:
            self._qdrant_client.close()
            self._qdrant_client = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc_info):
        await self.close()
