import logging
from pydantic_settings import BaseSettings
from functools import lru_cache


class WorkerSettings(BaseSettings):
    """Ingestion worker settings."""

    app_name: str = "prepturk-worker"
    app_env: str = "development"

    # Database
    database_url: str = "postgresql+asyncpg://prepturk:prepturk_password@db:5432/prepturk"

    # Qdrant
    qdrant_url: str = "http://qdrant:6333"
    qdrant_api_key: str = ""

    # Ollama / Embeddings
    ollama_base_url: str = "http://host.docker.internal:11434"
    ollama_embedding_model: str = "nomic-embed-text:latest"

    # Storage
    storage_root: str = "/app/storage"

    # OCR
    ocr_enabled: bool = False
    ocr_language: str = "tur+eng"

    # OPSEC
    airgap_mode: bool = False

    # Rate Limiting
    rate_limit_per_minute: int = 60

    # Logging
    log_level: str = "INFO"
    log_format: str = "text"

    # Manifest directory
    manifest_dir: str = "/app/content/manifests/sources"

    # Chunking
    chunk_size: int = 512
    chunk_overlap: int = 64

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> WorkerSettings:
    return WorkerSettings()


def setup_logging() -> logging.Logger:
    """Configure logging for the worker."""
    settings = get_settings()
    level = getattr(logging, settings.log_level.upper(), logging.INFO)

    if settings.log_format == "json":
        formatter = logging.Formatter(
            '{"timestamp":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}'
        )
    else:
        formatter = logging.Formatter(
            "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        )

    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    logger = logging.getLogger("worker")
    logger.setLevel(level)
    logger.addHandler(handler)

    # Also configure SQLAlchemy logging at WARNING to avoid noise
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    return logger


logger = setup_logging()
