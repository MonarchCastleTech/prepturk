from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, Float, Enum as SAEnum, ForeignKey, func, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET, ARRAY
from sqlalchemy.orm import relationship
from app.db import Base
import uuid
import enum


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


class SourceManifest(Base):
    __tablename__ = "source_manifests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    base_url = Column(Text, nullable=False)
    fetch_strategy = Column(String(50))
    robots_note = Column(Text)
    rate_limit_per_minute = Column(Integer, default=30)
    default_storage_mode = Column(SAEnum(StorageMode), default=StorageMode.pointer_only)
    default_trust_level = Column(SAEnum(TrustLevel), default=TrustLevel.community)
    default_rights_status = Column(SAEnum(RightsStatus), default=RightsStatus.unknown_review_needed)
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
    status = Column(SAEnum(IngestionStatus), default=IngestionStatus.pending)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    documents_found = Column(Integer, default=0)
    documents_fetched = Column(Integer, default=0)
    documents_indexed = Column(Integer, default=0)
    documents_failed = Column(Integer, default=0)
    error_log = Column(Text)
    metadata_ = Column("metadata", JSONB, default=dict)

    source = relationship("SourceManifest", back_populates="ingestion_runs")
    events = relationship("IngestionEvent", back_populates="run")


class IngestionEvent(Base):
    __tablename__ = "ingestion_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("ingestion_runs.id"), index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    event_type = Column(String(50))
    message = Column(Text)
    metadata_ = Column("metadata", JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    run = relationship("IngestionRun", back_populates="events")


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
    trust_level = Column(SAEnum(TrustLevel), default=TrustLevel.community)
    storage_mode = Column(SAEnum(StorageMode), default=StorageMode.pointer_only)
    rights_status = Column(SAEnum(RightsStatus), default=RightsStatus.unknown_review_needed)
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
    emergency_relevance = Column(SAEnum(EmergencyRelevance), default=EmergencyRelevance.none)
    medical_risk_level = Column(SAEnum(MedicalRiskLevel), default=MedicalRiskLevel.none)
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
    parse_status = Column(SAEnum(ParseStatus), default=ParseStatus.pending)
    validation_status = Column(String(50), default="pending")
    review_status = Column(SAEnum(ReviewStatus), default=ReviewStatus.discovered)
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
    metadata_ = Column("metadata", JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="chunks")
