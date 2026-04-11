from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, LargeBinary,
    String, Text, Index, UniqueConstraint, func
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET, ARRAY
from sqlalchemy.orm import relationship

from app.db.database import Base
import uuid
import enum


# Enums
class TrustLevel(str, enum.Enum):
    official = "official"
    institutional = "institutional"
    community = "community"
    personal = "personal"


class RightsStatus(str, enum.Enum):
    public_download = "public-download"
    public_read_limited_redistribution = "public-read-limited-redistribution"
    pointer_only = "pointer-only"
    unknown_review_needed = "unknown-review-needed"
    user_owned = "user-owned"


class StorageMode(str, enum.Enum):
    mirrored = "mirrored"
    cached = "cached"
    pointer_only = "pointer-only"
    user_uploaded = "user-uploaded"


class EmergencyRelevance(str, enum.Enum):
    none = "none"
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class MedicalRiskLevel(str, enum.Enum):
    none = "none"
    informational = "informational"
    caution = "caution"
    high_risk = "high-risk"
    emergency = "emergency"


class IngestionStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class ReviewStatus(str, enum.Enum):
    discovered = "discovered"
    fetched = "fetched"
    parsed = "parsed"
    indexed = "indexed"
    review_needed = "review_needed"
    approved = "approved"
    rejected = "rejected"
    archived = "archived"


class ParseStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"
    partial = "partial"
    ocr_needed = "ocr_needed"
    ocr_completed = "ocr_completed"


# Models
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(255))
    language = Column(String(10), default="tr")
    is_active = Column(Boolean, default=True)
    totp_secret = Column(String(255))
    totp_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))

    roles = relationship("Role", secondary="user_roles", back_populates="users")
    sessions = relationship("Session", back_populates="user")
    notes = relationship("Note", back_populates="user")
    bookmarks = relationship("Bookmark", back_populates="user")
    vault_files = relationship("VaultFile", back_populates="user")


class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    permissions = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", secondary="user_roles", back_populates="roles")


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(512), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(INET)
    user_agent = Column(Text)

    user = relationship("User", back_populates="sessions")


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(500), unique=True, index=True)
    title = Column(Text, nullable=False)
    subtitle = Column(Text)
    language = Column(String(10), default="tr")
    country = Column(String(10), default="TR")
    province = Column(String(100), index=True)
    district = Column(String(100))
    category = Column(String(100), index=True)
    subcategory = Column(String(100))
    topic_tags = Column(ARRAY(String), default=[])
    institution = Column(Text, index=True)
    source_type = Column(String(50))
    trust_level = Column(Enum(TrustLevel), default=TrustLevel.community)
    storage_mode = Column(Enum(StorageMode), default=StorageMode.pointer_only)
    rights_status = Column(Enum(RightsStatus), default=RightsStatus.unknown_review_needed)
    rights_note = Column(Text)
    canonical_url = Column(Text)
    source_url = Column(Text)
    source_domain = Column(String(255))
    original_format = Column(String(20))
    mime_type = Column(String(100))
    file_extension = Column(String(10))
    file_size_bytes = Column(Integer)
    sha256 = Column(String(64))
    etag = Column(String(255))
    last_modified_header = Column(String(255))
    published_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    acquired_at = Column(DateTime(timezone=True), server_default=func.now())
    indexed_at = Column(DateTime(timezone=True))
    effective_date = Column(DateTime(timezone=True))
    issue_number = Column(String(50))
    version_label = Column(String(50))
    version_hash = Column(String(64))
    supersedes_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    superseded_by_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    author = Column(Text)
    publisher = Column(Text)
    audience = Column(Text)
    emergency_relevance = Column(Enum(EmergencyRelevance), default=EmergencyRelevance.none)
    medical_risk_level = Column(Enum(MedicalRiskLevel), default=MedicalRiskLevel.none)
    child_safe = Column(Boolean, default=True)
    summary = Column(Text)
    abstract = Column(Text)
    extracted_text_path = Column(Text)
    original_file_path = Column(Text)
    preview_image_path = Column(Text)
    thumbnail_path = Column(Text)
    ocr_used = Column(Boolean, default=False)
    ocr_language = Column(String(50))
    chunk_count = Column(Integer, default=0)
    embedding_model = Column(String(100))
    ingestion_adapter = Column(String(100))
    ingestion_run_id = Column(UUID(as_uuid=True))
    ingestion_status = Column(String(50), default="pending")
    parse_status = Column(Enum(ParseStatus), default=ParseStatus.pending)
    validation_status = Column(String(50), default="pending")
    review_status = Column(Enum(ReviewStatus), default=ReviewStatus.discovered)
    notes = Column(Text)
    citation_hint = Column(Text)
    related_documents = Column(ARRAY(UUID(as_uuid=True)), default=[])
    cross_references = Column(ARRAY(String), default=[])
    search_boost = Column(Float, default=0)
    pinned = Column(Boolean, default=False)
    archived = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    versions = relationship("DocumentVersion", back_populates="document")
    chunks = relationship("DocumentChunk", back_populates="document")
    review_items = relationship("ReviewQueue", back_populates="document")


class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    version_label = Column(String(50))
    version_hash = Column(String(64))
    content_snapshot = Column(JSONB)
    metadata_snapshot = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text)

    document = relationship("Document", back_populates="versions")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer)
    embedding_model = Column(String(100))
    qdrant_point_id = Column(String(255))
    metadata = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="chunks")


class SourceManifest(Base):
    __tablename__ = "source_manifests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    base_url = Column(Text, nullable=False)
    fetch_strategy = Column(String(50))
    robots_note = Column(Text)
    rate_limit_per_minute = Column(Integer, default=30)
    default_storage_mode = Column(Enum(StorageMode), default=StorageMode.pointer_only)
    default_trust_level = Column(Enum(TrustLevel), default=TrustLevel.community)
    default_rights_status = Column(Enum(RightsStatus), default=RightsStatus.unknown_review_needed)
    schedule = Column(String(100))
    content_selectors = Column(JSONB)
    file_patterns = Column(ARRAY(String))
    include_patterns = Column(ARRAY(String))
    exclude_patterns = Column(ARRAY(String))
    html_allowed = Column(Boolean, default=True)
    pdf_allowed = Column(Boolean, default=True)
    pointer_only_patterns = Column(ARRAY(String))
    province_mapping = Column(JSONB)
    language_default = Column(String(10), default="tr")
    is_active = Column(Boolean, default=True)
    last_sync_at = Column(DateTime(timezone=True))
    last_success_at = Column(DateTime(timezone=True))
    last_error = Column(Text)
    error_count = Column(Integer, default=0)
    total_documents = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    ingestion_runs = relationship("IngestionRun", back_populates="source")


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("source_manifests.id"))
    adapter_name = Column(String(100))
    status = Column(Enum(IngestionStatus), default=IngestionStatus.pending)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    documents_found = Column(Integer, default=0)
    documents_fetched = Column(Integer, default=0)
    documents_indexed = Column(Integer, default=0)
    documents_failed = Column(Integer, default=0)
    error_log = Column(Text)
    metadata = Column(JSONB, default={})

    source = relationship("SourceManifest", back_populates="ingestion_runs")
    events = relationship("IngestionEvent", back_populates="run")


class IngestionEvent(Base):
    __tablename__ = "ingestion_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("ingestion_runs.id"), index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    event_type = Column(String(50))
    message = Column(Text)
    metadata = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    run = relationship("IngestionRun", back_populates="events")


class ReviewQueue(Base):
    __tablename__ = "review_queue"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), index=True)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(Enum(ReviewStatus), default=ReviewStatus.review_needed)
    priority = Column(Integer, default=0)
    notes = Column(Text)
    review_result = Column(String(50))
    reviewed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="review_items")


class ProvincePack(Base):
    __tablename__ = "province_packs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    province_code = Column(String(10), nullable=False, index=True)
    province_name = Column(String(100), nullable=False)
    version = Column(String(20), default="1.0.0")
    manifest = Column(JSONB, default={})
    included_documents = Column(ARRAY(UUID(as_uuid=True)), default=[])
    included_maps = Column(JSONB, default=[])
    included_contacts = Column(JSONB, default=[])
    included_notes = Column(JSONB, default=[])
    rights_manifest = Column(JSONB, default={})
    sha256_manifest = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Note(Base):
    __tablename__ = "notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title = Column(Text, nullable=False)
    content = Column(Text)
    note_type = Column(String(50), default="general")
    is_pinned = Column(Boolean, default=False)
    is_emergency = Column(Boolean, default=False)
    province = Column(String(100))
    tags = Column(ARRAY(String), default=[])
    related_documents = Column(ARRAY(UUID(as_uuid=True)), default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="notes")


class Bookmark(Base):
    __tablename__ = "bookmarks"
    __table_args__ = (UniqueConstraint("user_id", "document_id"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), index=True)
    collection_name = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="bookmarks")


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    title = Column(Text)
    mode = Column(String(50), default="default")
    model_used = Column(String(100))
    official_only = Column(Boolean, default=False)
    child_safe = Column(Boolean, default=True)
    vault_mode = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    messages = relationship("AIMessage", back_populates="conversation", order_by="AIMessage.created_at")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("ai_conversations.id", ondelete="CASCADE"), index=True)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer)
    model = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("AIConversation", back_populates="messages")
    citations = relationship("AICitation", back_populates="message")


class AICitation(Base):
    __tablename__ = "ai_citations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("ai_messages.id", ondelete="CASCADE"), index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    citation_text = Column(Text)
    page_reference = Column(Text)
    chunk_reference = Column(String(255))
    confidence_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    message = relationship("AIMessage", back_populates="citations")


class VaultFile(Base):
    __tablename__ = "vault_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    original_name = Column(Text, nullable=False)
    encrypted_path = Column(Text, nullable=False)
    file_size_bytes = Column(Integer)
    sha256 = Column(String(64))
    encryption_algorithm = Column(String(50), default="aes-256-gcm")
    mime_type = Column(String(100))
    metadata = Column(JSONB, default={})
    tags = Column(ARRAY(String), default=[])
    is_indexed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="vault_files")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True)
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(50))
    resource_id = Column(UUID(as_uuid=True))
    details = Column(JSONB, default={})
    ip_address = Column(INET)
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class Setting(Base):
    __tablename__ = "settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(JSONB, nullable=False)
    description = Column(Text)
    is_system = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
