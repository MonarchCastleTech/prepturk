-- prepturk Database Initialization
-- This script runs on first container startup

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create custom types
CREATE TYPE trust_level AS ENUM ('official', 'institutional', 'community', 'personal');
CREATE TYPE rights_status AS ENUM ('public-download', 'public-read-limited-redistribution', 'pointer-only', 'unknown-review-needed', 'user-owned');
CREATE TYPE storage_mode AS ENUM ('mirrored', 'cached', 'pointer-only', 'user-uploaded');
CREATE TYPE emergency_relevance AS ENUM ('none', 'low', 'medium', 'high', 'critical');
CREATE TYPE medical_risk_level AS ENUM ('none', 'informational', 'caution', 'high-risk', 'emergency');
CREATE TYPE ingestion_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE review_status AS ENUM ('discovered', 'fetched', 'parsed', 'indexed', 'review_needed', 'approved', 'rejected', 'archived');
CREATE TYPE parse_status AS ENUM ('pending', 'success', 'failed', 'partial', 'ocr_needed', 'ocr_completed');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    language VARCHAR(10) DEFAULT 'tr',
    is_active BOOLEAN DEFAULT true,
    totp_secret VARCHAR(255),
    totp_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles mapping
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(500) UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT,
    language VARCHAR(10) DEFAULT 'tr',
    country VARCHAR(10) DEFAULT 'TR',
    province VARCHAR(100),
    district VARCHAR(100),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    topic_tags TEXT[] DEFAULT '{}',
    institution TEXT,
    source_type VARCHAR(50),
    trust_level trust_level DEFAULT 'community',
    storage_mode storage_mode DEFAULT 'pointer-only',
    rights_status rights_status DEFAULT 'unknown-review-needed',
    rights_note TEXT,
    canonical_url TEXT,
    source_url TEXT,
    source_domain VARCHAR(255),
    original_format VARCHAR(20),
    mime_type VARCHAR(100),
    file_extension VARCHAR(10),
    file_size_bytes BIGINT,
    sha256 VARCHAR(64),
    etag VARCHAR(255),
    last_modified_header VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    indexed_at TIMESTAMP WITH TIME ZONE,
    effective_date TIMESTAMP WITH TIME ZONE,
    issue_number VARCHAR(50),
    version_label VARCHAR(50),
    version_hash VARCHAR(64),
    supersedes_document_id UUID REFERENCES documents(id),
    superseded_by_document_id UUID REFERENCES documents(id),
    author TEXT,
    publisher TEXT,
    audience TEXT,
    emergency_relevance emergency_relevance DEFAULT 'none',
    medical_risk_level medical_risk_level DEFAULT 'none',
    child_safe BOOLEAN DEFAULT true,
    summary TEXT,
    abstract TEXT,
    extracted_text_path TEXT,
    original_file_path TEXT,
    preview_image_path TEXT,
    thumbnail_path TEXT,
    ocr_used BOOLEAN DEFAULT false,
    ocr_language VARCHAR(50),
    chunk_count INTEGER DEFAULT 0,
    embedding_model VARCHAR(100),
    ingestion_adapter VARCHAR(100),
    ingestion_run_id UUID,
    ingestion_status VARCHAR(50) DEFAULT 'pending',
    parse_status parse_status DEFAULT 'pending',
    validation_status VARCHAR(50) DEFAULT 'pending',
    review_status review_status DEFAULT 'discovered',
    notes TEXT,
    citation_hint TEXT,
    related_documents UUID[] DEFAULT '{}',
    cross_references TEXT[] DEFAULT '{}',
    search_boost REAL DEFAULT 0,
    pinned BOOLEAN DEFAULT false,
    archived BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Full text search vectors
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(subtitle, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(summary, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(abstract, '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(array_to_string(topic_tags, ' '), '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(institution, '')), 'D')
    ) STORED
);

-- Create indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_trust_level ON documents(trust_level);
CREATE INDEX IF NOT EXISTS idx_documents_storage_mode ON documents(storage_mode);
CREATE INDEX IF NOT EXISTS idx_documents_province ON documents(province);
CREATE INDEX IF NOT EXISTS idx_documents_institution ON documents(institution);
CREATE INDEX IF NOT EXISTS idx_documents_review_status ON documents(review_status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_search_vector ON documents USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_documents_topic_tags ON documents USING GIN(topic_tags);

-- Document versions
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_label VARCHAR(50),
    version_hash VARCHAR(64),
    content_snapshot JSONB,
    metadata_snapshot JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Document chunks for RAG
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    embedding_model VARCHAR(100),
    qdrant_point_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);

-- Document relations
CREATE TABLE IF NOT EXISTS document_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    target_document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    relation_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_document_id, target_document_id, relation_type)
);

-- Source manifests
CREATE TABLE IF NOT EXISTS source_manifests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    base_url TEXT NOT NULL,
    fetch_strategy VARCHAR(50),
    robots_note TEXT,
    rate_limit_per_minute INTEGER DEFAULT 30,
    default_storage_mode storage_mode DEFAULT 'pointer-only',
    default_trust_level trust_level DEFAULT 'community',
    default_rights_status rights_status DEFAULT 'unknown-review-needed',
    schedule VARCHAR(100),
    content_selectors JSONB,
    file_patterns TEXT[],
    include_patterns TEXT[],
    exclude_patterns TEXT[],
    html_allowed BOOLEAN DEFAULT true,
    pdf_allowed BOOLEAN DEFAULT true,
    pointer_only_patterns TEXT[],
    province_mapping JSONB,
    language_default VARCHAR(10) DEFAULT 'tr',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_success_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    error_count INTEGER DEFAULT 0,
    total_documents INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingestion runs
CREATE TABLE IF NOT EXISTS ingestion_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES source_manifests(id),
    adapter_name VARCHAR(100),
    status ingestion_status DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    documents_found INTEGER DEFAULT 0,
    documents_fetched INTEGER DEFAULT 0,
    documents_indexed INTEGER DEFAULT 0,
    documents_failed INTEGER DEFAULT 0,
    error_log TEXT,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_source_id ON ingestion_runs(source_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_status ON ingestion_runs(status);

-- Ingestion events
CREATE TABLE IF NOT EXISTS ingestion_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID REFERENCES ingestion_runs(id),
    document_id UUID REFERENCES documents(id),
    event_type VARCHAR(50),
    message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_events_run_id ON ingestion_events(run_id);

-- Review queue
CREATE TABLE IF NOT EXISTS review_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id),
    reviewer_id UUID REFERENCES users(id),
    status review_status DEFAULT 'review_needed',
    priority INTEGER DEFAULT 0,
    notes TEXT,
    review_result VARCHAR(50),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(status);
CREATE INDEX IF NOT EXISTS idx_review_queue_document_id ON review_queue(document_id);

-- Province packs
CREATE TABLE IF NOT EXISTS province_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province_code VARCHAR(10) NOT NULL,
    province_name VARCHAR(100) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',
    manifest JSONB DEFAULT '{}',
    included_documents UUID[] DEFAULT '{}',
    included_maps JSONB DEFAULT '[]',
    included_contacts JSONB DEFAULT '[]',
    included_notes JSONB DEFAULT '[]',
    rights_manifest JSONB DEFAULT '{}',
    sha256_manifest TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_province_packs_code ON province_packs(province_code);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    note_type VARCHAR(50) DEFAULT 'general',
    is_pinned BOOLEAN DEFAULT false,
    is_emergency BOOLEAN DEFAULT false,
    province VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    related_documents UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    collection_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, document_id)
);

-- Search queries (anonymized, no PII)
CREATE TABLE IF NOT EXISTS search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    filters_applied JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at DESC);

-- AI conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT,
    mode VARCHAR(50) DEFAULT 'default',
    model_used VARCHAR(100),
    official_only BOOLEAN DEFAULT false,
    child_safe BOOLEAN DEFAULT true,
    vault_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI messages
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);

-- AI citations
CREATE TABLE IF NOT EXISTS ai_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES ai_messages(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id),
    citation_text TEXT,
    page_reference TEXT,
    chunk_reference VARCHAR(255),
    confidence_score REAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vault files (encrypted personal storage)
CREATE TABLE IF NOT EXISTS vault_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    encrypted_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    sha256 VARCHAR(64),
    encryption_algorithm VARCHAR(50) DEFAULT 'aes-256-gcm',
    mime_type VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_indexed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vault_files_user_id ON vault_files(user_id);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Tam sistem yoneticisi', '{"all": true}'),
('editor', 'Icerik duzenleyici', '{"documents": ["read", "write", "review"], "sources": ["read"], "notes": ["all"]}'),
('viewer', 'Sadece goruntuleme', '{"documents": ["read"], "search": ["read"], "notes": ["own"]}'),
('child-safe-viewer', 'Cocuklar icin guvenli goruntuleme', '{"documents": ["read_child_safe"], "search": ["read_child_safe"], "ai": ["child_safe"]}');

-- Insert default settings
INSERT INTO settings (key, value, description, is_system) VALUES
('app.language', '"tr"', 'Varsayilan uygulama dili', true),
('ai.default_model', '"qwen2.5:7b-instruct"', 'Varsayilan AI modeli', true),
('ai.embedding_model', '"nomic-embed-text:latest"', 'Varsayilan embedding modeli', true),
('ai.official_only_default', 'false', 'AI icin varsayilan resmi kaynak modu', false),
('ai.child_safe_default', 'true', 'AI icin varsayilan cocuk guvenli mod', false),
('storage.max_gb', '100', 'Maksimum depolama alani (GB)', true),
('network.lan_mode', 'false', 'LAN modu', true),
('search.results_per_page', '20', 'Arama sonucu sayfa basina gosterilecek sonuc sayisi', false);
