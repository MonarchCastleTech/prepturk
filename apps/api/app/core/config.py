from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""

    app_name: str = "prepturk"
    app_env: str = "development"
    app_secret_key: str = "dev-secret-key-change-in-production"
    app_url: str = "http://localhost:3000"

    # Database
    database_url: str = "postgresql+asyncpg://prepturk:prepturk_password@db:5432/prepturk"

    # Qdrant
    qdrant_url: str = "http://qdrant:6333"
    qdrant_api_key: str = ""

    # AI
    ai_provider: str = "ollama"
    ollama_base_url: str = "http://127.0.0.1:11434"  # LOCALHOST ONLY
    ollama_model: str = "qwen2.5:7b-instruct"
    ollama_embedding_model: str = "nomic-embed-text:latest"
    openai_api_key: str = ""  # NOT USED -- offline only
    openai_base_url: str = ""  # NOT USED -- offline only

    # Storage
    storage_root: str = "/app/storage"
    storage_originals: str = "/app/storage/originals"
    storage_extracted: str = "/app/storage/extracted"
    storage_previews: str = "/app/storage/previews"
    storage_thumbnails: str = "/app/storage/thumbnails"
    storage_vault: str = "/app/storage/vault"
    storage_exports: str = "/app/storage/exports"

    # OPSEC
    airgap_mode: bool = False

    # Network
    lan_mode: bool = False
    lan_allowed_ips: str = "192.168.1.0/24"

    # Session
    session_max_age_hours: int = 24
    session_cookie_secure: bool = True

    # Rate Limiting
    rate_limit_per_minute: int = 60

    # Database pool
    db_pool_size: int = 5
    db_max_overflow: int = 10

    # OCR
    ocr_enabled: bool = False
    ocr_language: str = "tur+eng"

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
