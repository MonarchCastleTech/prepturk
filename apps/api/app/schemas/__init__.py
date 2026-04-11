from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any
from datetime import datetime
import uuid
from enum import Enum


# Auth schemas
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)
    totp_code: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)
    display_name: Optional[str] = None
    language: str = "tr"


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


# User schemas
class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    display_name: Optional[str] = None
    language: str
    is_active: bool
    totp_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    language: Optional[str] = None


# Document schemas
class TrustLevelEnum(str, Enum):
    official = "official"
    institutional = "institutional"
    community = "community"
    personal = "personal"


class RightsStatusEnum(str, Enum):
    public_download = "public-download"
    public_read_limited_redistribution = "public-read-limited-redistribution"
    pointer_only = "pointer-only"
    unknown_review_needed = "unknown-review-needed"
    user_owned = "user-owned"


class StorageModeEnum(str, Enum):
    mirrored = "mirrored"
    cached = "cached"
    pointer_only = "pointer-only"
    user_uploaded = "user-uploaded"


class DocumentCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    language: str = "tr"
    province: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    topic_tags: list[str] = []
    institution: Optional[str] = None
    trust_level: TrustLevelEnum = TrustLevelEnum.community
    storage_mode: StorageModeEnum = StorageModeEnum.pointer_only
    rights_status: RightsStatusEnum = RightsStatusEnum.unknown_review_needed
    source_url: Optional[str] = None
    summary: Optional[str] = None


class DocumentResponse(BaseModel):
    id: uuid.UUID
    slug: Optional[str] = None
    title: str
    subtitle: Optional[str] = None
    language: str
    province: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    topic_tags: list[str] = []
    institution: Optional[str] = None
    trust_level: TrustLevelEnum
    storage_mode: StorageModeEnum
    rights_status: RightsStatusEnum
    rights_note: Optional[str] = None
    source_url: Optional[str] = None
    source_domain: Optional[str] = None
    mime_type: Optional[str] = None
    file_size_bytes: Optional[int] = None
    sha256: Optional[str] = None
    published_at: Optional[datetime] = None
    acquired_at: Optional[datetime] = None
    emergency_relevance: Optional[str] = None
    medical_risk_level: Optional[str] = None
    child_safe: bool = True
    summary: Optional[str] = None
    citation_hint: Optional[str] = None
    review_status: Optional[str] = None
    pinned: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentDetail(DocumentResponse):
    abstract: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    version_label: Optional[str] = None
    issue_number: Optional[str] = None
    cross_references: list[str] = []
    related_documents: list[uuid.UUID] = []
    extracted_text_path: Optional[str] = None
    original_file_path: Optional[str] = None


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    topic_tags: Optional[list[str]] = None
    trust_level: Optional[TrustLevelEnum] = None
    rights_status: Optional[RightsStatusEnum] = None
    storage_mode: Optional[StorageModeEnum] = None
    pinned: Optional[bool] = None
    archived: Optional[bool] = None
    review_status: Optional[str] = None
    notes: Optional[str] = None


# Search schemas
class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    filters: Optional[dict[str, Any]] = None
    official_only: bool = False
    child_safe: bool = True
    page: int = 1
    page_size: int = 20
    sort_by: str = "relevance"


class SearchResult(BaseModel):
    id: uuid.UUID
    title: str
    subtitle: Optional[str] = None
    institution: Optional[str] = None
    category: Optional[str] = None
    trust_level: TrustLevelEnum
    storage_mode: StorageModeEnum
    rights_status: RightsStatusEnum
    child_safe: bool
    summary: Optional[str] = None
    created_at: datetime
    highlight: Optional[str] = None
    score: Optional[float] = None


class SearchResponse(BaseModel):
    results: list[SearchResult]
    total: int
    page: int
    page_size: int
    total_pages: int
    query: str
    filters_applied: dict[str, Any] = {}


# AI schemas
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    conversation_id: Optional[uuid.UUID] = None
    mode: str = "default"  # default, official_only, child_safe, explain_15, step_by_step, compare
    official_only: bool = False
    child_safe: bool = True
    vault_mode: bool = False
    document_ids: Optional[list[uuid.UUID]] = None


class CitationResponse(BaseModel):
    document_id: Optional[uuid.UUID] = None
    citation_text: Optional[str] = None
    page_reference: Optional[str] = None
    confidence_score: Optional[float] = None


class ChatResponse(BaseModel):
    conversation_id: uuid.UUID
    message_id: uuid.UUID
    content: str
    citations: list[CitationResponse] = []
    model: str
    confidence: Optional[str] = None


# Province Pack schemas
class ProvincePackResponse(BaseModel):
    id: uuid.UUID
    province_code: str
    province_name: str
    version: str
    is_active: bool
    included_documents_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Note schemas
class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    note_type: str = "general"
    is_pinned: bool = False
    is_emergency: bool = False
    province: Optional[str] = None
    tags: list[str] = []


class NoteResponse(BaseModel):
    id: uuid.UUID
    title: str
    content: Optional[str] = None
    note_type: str
    is_pinned: bool
    is_emergency: bool
    province: Optional[str] = None
    tags: list[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Source schemas
class SourceManifestResponse(BaseModel):
    id: uuid.UUID
    name: str
    base_url: str
    fetch_strategy: Optional[str] = None
    default_storage_mode: StorageModeEnum
    default_trust_level: TrustLevelEnum
    default_rights_status: RightsStatusEnum
    is_active: bool
    last_sync_at: Optional[datetime] = None
    last_success_at: Optional[datetime] = None
    last_error: Optional[str] = None
    total_documents: int = 0

    class Config:
        from_attributes = True


class IngestionRunResponse(BaseModel):
    id: uuid.UUID
    source_id: Optional[uuid.UUID] = None
    adapter_name: Optional[str] = None
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    documents_found: int = 0
    documents_fetched: int = 0
    documents_indexed: int = 0
    documents_failed: int = 0

    class Config:
        from_attributes = True


# Dashboard schemas
class DashboardStats(BaseModel):
    total_documents: int
    official_documents: int
    total_sources: int
    active_sources: int
    total_storage_bytes: int
    storage_used_bytes: int
    recent_documents: list[DocumentResponse]
    recent_ingestion_runs: list[IngestionRunResponse]
    province_packs_count: int
    pending_reviews: int


# Import to resolve forward references
from app.db.models import User
UserResponse.model_rebuild()
