# Sistem Mimarisi / System Architecture

## Genel Bakis / Overview

prepturk, Turkey icin tasarlanmis, tamamen cevrimdisi calisabilen bir bilgi ve dayaniklilik sistemidir. Sistem, resmi devlet belgelerini, afet/acil durum bilgilerini, egitim materyallerini, saglik rehberlerini ve harita verilerini yerel olarak depolar ve aranabilir hale getirir.

Teknoloji yigini:

| Katman | Teknoloji | Port |
|--------|-----------|------|
| Reverse Proxy | Caddy 2.8 | 80, 443 |
| Frontend | Next.js 15 + React + Tailwind CSS | 3000 |
| Backend API | FastAPI (Python 3.12) | 8000 |
| Ingestion Worker | Python 3.12 + httpx + pypdf | - |
| Veritabani | PostgreSQL 16 + pg_trgm + unaccent | 5432 |
| Vektor Veritabani | Qdrant v1.8.4 | 6333, 6334 |
| AI (opsiyonel) | Ollama (qwen2.5:7b-instruct) | 11434 |

## Bilesen Diyagrami / Component Diagram

```
                          INTERNET (Ilk Kurulum / Senkronizasyon)
                                      |
                                      v
+---------------------------------------------------------------------+
|                        Caddy Reverse Proxy                          |
|                     (:80 HTTP, :443 HTTPS)                          |
+--------------------------------+------------------------------------+
                                 |
              +------------------+------------------+
              |                                     |
              v                                     v
+-------------------------+          +------------------------------+
|    Next.js Frontend     |          |      FastAPI Backend API     |
|    (nomad-web:3000)     |          |      (nomad-api:8000)        |
|                         |          |                              |
|  Pages/Routes:          |<-------->|  Route Modulleri:            |
|  /dashboard             |  REST    |  /api/auth                   |
|  /documents             |  API     |  /api/documents              |
|  /search                |          |  /api/search                 |
|  /ai-chat               |          |  /api/ai/chat                |
|  /education             |          |  /api/education              |
|  /maps                  |          |  /api/maps                   |
|  /notes                 |          |  /api/notes                  |
|  /vault                 |          |  /api/vault                  |
|  /province-packs        |          |  /api/province-packs         |
|  /admin                 |          |  /api/admin/*                |
|  /login                 |          |  /api/ingestion              |
|  /setup                 |          |  /api/review                 |
+-------------------------+          |  /api/settings               |
                                     |  /api/users                  |
                                     |  /api/sources                |
                                     |  /api/exports                |
                                     |  /api/dashboard              |
                                     |  /health                     |
                                     +--------------+---------------+
                                                    |
              +------------------+------------------+------------------+
              |                  |                  |                  |
              v                  v                  v                  v
+-------------------+  +----------------+  +----------------+  +----------------+
|   PostgreSQL 16   |  |  Qdrant v1.8   |  | Ingestion      |  | Ollama AI      |
|                   |  |  Vector DB     |  | Worker         |  | (opsiyonel)    |
| Tables:           |  |                |  |                |  |                |
| - users           |  | Collections:   |  | Adapters:      |  | Model:         |
| - roles           |  | - documents    |  | - HtmlAdapter  |  | qwen2.5:7b     |
| - sessions        |  |                |  | - PdfAdapter   |  | Embedding:     |
| - documents       |  | Semantic       |  | - PointerAdapter| | nomic-embed    |
| - document_chunks |  | Search Index   |  |                |  |                |
| - source_manifests|  |                |  | Parsers:       |  | Base URL:      |
| - ingestion_runs  |  |                |  | - HTML Parser  |  | http://host    |
| - review_queue    |  |                |  | - PDF Parser   |  | .docker.       |
| - province_packs  |  |                |  | - Metadata     |  | .internal:     |
| - notes           |  |                |  |                |  | 11434          |
| - bookmarks       |  |                |  | OCR:           |  |                |
| - vault_files     |  |                |  | - Tesseract    |  |                |
| - ai_conversations|  |                |  |                |  |                |
| - ai_messages     |  |                |  | Embeddings:    |  |                |
| - ai_citations    |  |                |  | - Ollama       |  |                |
| - audit_logs      |  |                |  |                |  |                |
| - settings        |  |                |  | Storage:       |  |                |
+-------------------+  +----------------+  +----------------+  +----------------+
```

## Veri Akisi / Data Flow

### 1. Kaynak Ten Dokuman Yuklemesi (Ingestion Pipeline)

```
[YAML Manifest] --> [Ingestion Worker]
                         |
                         v
                   [Rate Limiter] --> robots.txt kontrol
                         |
                         v
                   [Adapter Secimi]
                    /      |      \
             HtmlAdapter  PdfAdapter  PointerAdapter
                   |          |            |
                   v          v            v
             [HTTP Fetch] [HTTP Fetch] [HEAD/GET Metadata]
                   |          |            |
                   v          v            v
             [HTML Parser] [PDF Parser] [Metadata Extract]
                   |          |            |
                   v          v            v
              [Text Extract] [Text+OCR]  [Pointer Record]
                   |          |            |
                   +----------+------------+
                              |
                              v
                       [Chunking (512 token, 64 overlap)]
                              |
                              v
                       [Embedding (nomic-embed-text via Ollama)]
                              |
                              v
                    [PostgreSQL: Document Record]
                    [Qdrant: Vektor Indexleme]
                              |
                              v
                       [Review Queue (opsiyonel)]
```

### 2. Kullanicinin Arama Yapmasi (Search Flow)

```
[Kullanici] --> [Next.js Frontend]
                     |
                     v
              [API: /api/search?q=...]
                     |
                     v
          +----------+-----------+
          |                      |
          v                      v
  [PostgreSQL FTS]        [Qdrant Vector Search]
  (tsvector GIN index)    (cosine similarity)
          |                      |
          +----------+-----------+
                     |
                     v
              [Sonuc Birlestirme + Siralama]
              (trust_level boost, recency boost)
                     |
                     v
              [JSON Response --> Frontend UI]
```

### 3. AI Sohbet Akisi (RAG Flow)

```
[Kullanici Sorusu] --> [Frontend /ai-chat]
                            |
                            v
                     [API: POST /api/ai/chat]
                            |
                            v
          +-----------------+-----------------+
          |                                   |
          v                                   v
  [PostgreSQL: Ilgili Belgeleri Bul]   [DocumentChunks Getir]
  (title/summary ILIKE query)          (chunk content)
          |                                   |
          +-----------------+-----------------+
                            |
                            v
                  [RAG Context Olustur]
                  (mode: default/official_only/
                   child_safe/explain_15/
                   step_by_step/compare)
                            |
                            v
                  [AI Yaniti Olustur + Citation Ekle]
                            |
                            v
                  [DB'ye Kaydet: ai_messages + ai_citations]
                            |
                            v
                  [Response: content + citations + confidence]
```

## Veritabani Semasi / Database Schema Overview

Veritabani PostgreSQL 16 uzerinde calisir. `infra/db/init.sql` dosyasi ile ilk kurulumda tum tablolar olusturulur.

### Temel Tablolar

| Tablo | Amaç | Anahtar Alanlar |
|-------|------|-----------------|
| `users` | Kullanici hesapları | id, email, username, password_hash, totp_enabled |
| `roles` | Roller (admin/editor/viewer/child-safe-viewer) | id, name, permissions (JSONB) |
| `user_roles` | Kullanici-rol esleşmesi | user_id, role_id |
| `sessions` | Oturum yonetimi | id, user_id, token, expires_at, ip_address |
| `documents` | Ana dokuman kayitlari (70+ sutun) | id, slug, title, trust_level, storage_mode, rights_status, sha256, search_vector (generated) |
| `document_versions` | Dokuman versiyon takibi | document_id, version_label, content_snapshot |
| `document_chunks` | RAG icin metin parcaciklari | document_id, chunk_index, content, qdrant_point_id |
| `source_manifests` | Kaynak yapilandirmalari | name, base_url, fetch_strategy, schedule, rate_limit |
| `ingestion_runs` | Yukleme calistirma kayitlari | source_id, status, documents_found/fetched/indexed/failed |
| `ingestion_events` | Yukleme olaylari | run_id, document_id, event_type, message |
| `review_queue` | icerik gozden gecirme | document_id, reviewer_id, status, priority |
| `province_packs` | Il bazli paketler | province_code, manifest, included_documents |
| `notes` | Kullanici notlari | user_id, title, content, is_emergency, tags |
| `bookmarks` | Kullanici yer imleri | user_id, document_id, collection_name |
| `ai_conversations` | AI sohbet ustbilgisi | user_id, mode, official_only, child_safe, vault_mode |
| `ai_messages` | AI sohbet mesaji | conversation_id, role, content, token_count |
| `ai_citations` | AI atiflari | message_id, document_id, confidence_score |
| `vault_files` | Sifreli kasa dosyalari | user_id, encrypted_path, encryption_algorithm |
| `audit_logs` | Denetim gunlugu | user_id, action, resource_type, details, ip_address |
| `settings` | Uygulama ayarlari | key, value (JSONB), is_system |
| `search_queries` | Arama sorgu kayitlari (anonim) | query_text, results_count, filters_applied |

### Ozel Veri Tipleri

PostgreSQL custom types:

- `trust_level`: official | institutional | community | personal
- `rights_status`: public-download | public-read-limited-redistribution | pointer-only | unknown-review-needed | user-owned
- `storage_mode`: mirrored | cached | pointer-only | user-uploaded
- `emergency_relevance`: none | low | medium | high | critical
- `medical_risk_level`: none | informational | caution | high-risk | emergency
- `ingestion_status`: pending | running | completed | failed | cancelled
- `review_status`: discovered | fetched | parsed | indexed | review_needed | approved | rejected | archived
- `parse_status`: pending | success | failed | partial | ocr_needed | ocr_completed

### Tam Metin Arama

`documents` tablosu `search_vector` adli generated tsvector sutunu icerir:

```sql
search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(subtitle, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(abstract, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(topic_tags, ' '), '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(institution, '')), 'D')
) STORED
```

Bu sutun uzerinde GIN index bulunur, bu da hizli tam metin aramasi saglar.

## API Tasarim Prensipleri / API Design Principles

### Genel Prensipler

- **RESTful**: Kaynak bazli URL yapisi (`/api/documents`, `/api/users`)
- **JWT Kimlik Dogrulama**: Bearer token ile korunan endpoint'ler
- **JSON Request/Response**: Tum API istek ve yanitlari JSON formatinda
- **Hata Yanitlari**: Standardize edilmis hata mesajlari (401, 403, 404, 500)
- **Sayfalama**: `page`, `page_size` parametreleri ile sayfalama
- **Filtreleme**: Query parametreleri ile filtreleme (`?category=`, `?trust_level=`, `?province=`)

### Endpoint Gruplari

| Grup | Path | Amaç |
|------|------|------|
| Auth | `/api/auth/*` | Giris, kayit, 2FA, token yonetimi |
| Documents | `/api/documents` | CRUD, filtreleme, metadata |
| Search | `/api/search` | Hibrit arama (FTS + Vektor) |
| AI Chat | `/api/ai/chat/*` | RAG tabanlı sohbet, conversation yonetimi |
| Education | `/api/education` | Egitim materyalleri |
| Maps | `/api/maps` | Harita verileri |
| Notes | `/api/notes` | Kullanicı notları |
| Vault | `/api/vault` | Sifreli kasa islemleri |
| Province Packs | `/api/province-packs` | Il paketleri import/export |
| Admin | `/api/admin/*` | Kullanici yonetimi, sistem ayarlari |
| Ingestion | `/api/ingestion` | Kaynak senkronizasyonu, run durumu |
| Review | `/api/review` | icerik gozden gecirme kuyrugu |
| Settings | `/api/settings` | Uygulama ayarlari |
| Sources | `/api/sources` | Kaynak manifestleri |
| Exports | `/api/exports` | Disa aktarma islemleri |
| Dashboard | `/api/dashboard` | Dashboard istatistikleri |

## Dagitim Mimarisi / Deployment Architecture

### Docker Compose Yapisi

Sistem 6 servis ile calisir (`docker-compose.yml`):

```
servisler:
  nomad-db       --> PostgreSQL 16 (persistent: postgres_data volume)
  nomad-qdrant   --> Qdrant v1.8.4 (persistent: qdrant_data volume)
  nomad-api      --> FastAPI Backend (Python 3.12)
  nomad-worker   --> Ingestion Worker (Python 3.12)
  nomad-web      --> Next.js Frontend (Node.js)
  nomad-caddy    --> Caddy Reverse Proxy (TLS termination)
```

### Servis Bagimliliklari

```
Caddy --> Web --> API --> DB
                  |     --> Qdrant
                  |
Worker ---------->|--> DB
                  |--> Qdrant
                  |--> Ollama (host.docker.internal:11434)
```

Worker, API servisi saglikli olana kadar baslamaz (health check bagimliligi).

### Depolama Hacimleri

| Volume/Hacim | Amaç |
|-------------|------|
| `postgres_data` | PostgreSQL veritabani |
| `qdrant_data` | Qdrant vektor indeksleri |
| `caddy_data` | Caddy TLS sertifikalari |
| `caddy_config` | Caddy yapilandirmasi |
| `./storage` | Dosya depolama (originals, extracted, previews, vault, exports) |
| `./content` | Manifest dosyalari, il paketleri |
| `./data` | Ek uygulama verisi |
| `./backups` | Yedek dosyalari |

## Ag Topolojisi / Network Topology

### Varsayilan Mod (localhost)

```
Kullanici Tarayicisi
       |
       v
  localhost:80 (Caddy)
       |
       +--> localhost:3000 (Web - Next.js)
       |
       +--> localhost:8000 (API - FastAPI)
              |
              +--> localhost:5432 (PostgreSQL - Docker internal)
              +--> localhost:6333 (Qdrant - Docker internal)
              +--> host.docker.internal:11434 (Ollama - host machine)
```

Tum servisler `nomad-net` adli Docker bridge aginda iletisim kurar.

### LAN Modu

`LAN_MODE=true` ayarlandiginda:

```
LAN Cihazi (192.168.1.x)
       |
       v
  Sunucu IP:80 (Caddy)
       |
       +--> Web --> API --> DB/Qdrant
```

LAN modu acikca etkinlestirilmelidir. `LAN_ALLOWED_IPS` cevresel degiskeni ile izin verilen IP araliklari tanimlanir.

**Uyarı**: Guvenli olmayan aglarda LAN modu ek riskler tasir.

## Guvenlik Sinirlari / Security Boundaries

```
+-------------------------------------------------------------------+
|  Ag Guvenlik Siniri (Caddy Reverse Proxy)                         |
|                                                                   |
|  +-------------------------------------------------------------+  |
|  |  Uygulama Katmani (API + Web)                               |  |
|  |                                                             |  |
|  |  +------------------+    +-------------------------------+  |  |
|  |  | Kimlik Dogrulama |    |  Rol Tabanlı Erisim (RBAC)   |  |  |
|  |  | (JWT + BCrypt)   |    |  admin/editor/viewer/child   |  |  |
|  |  +------------------+    +-------------------------------+  |  |
|  |                                                             |  |
|  +---------------------------+---------------------------------+  |
|                              |                                    |
|  +---------------------------+---------------------------------+  |
|  |  Veri Katmani (DB + Qdrant)                                 |  |
|  |                                                             |  |
|  |  +------------------+    +-------------------------------+  |  |
|  |  | PostgreSQL       |    |  Qdrant (Vektor)              |  |  |
|  |  | (sifreli erisim) |    |  (API key korumali)           |  |  |
|  |  +------------------+    +-------------------------------+  |  |
|  |                                                             |  |
|  +-------------------------------------------------------------+  |
|                                                                     |
|  +-------------------------------------------------------------+  |
|  |  Kasa Katmani (Vault)                                       |  |
|  |  AES-256-GCM sifreleme, kullanici anahtari ile korunur      |  |
|  +-------------------------------------------------------------+  |
|                                                                   |
+-------------------------------------------------------------------+
```

### Guvenlik Katmanlari

1. **Ag Katmani**: Caddy reverse proxy, localhost varsayilan, LAN modu secmeli
2. **Uygulama Katmani**: JWT kimlik dogrulama, RBAC, session yonetimi
3. **Veri Katmani**: PostgreSQL erisim kontrolu, Qdrant API key
4. **Depolama Katmani**: Dosya sistemi erisim izinleri
5. **Kasa Katmani**: AES-256-GCM sifreleme (kullanici basina anahtar)

## Donanim Profilleri / Hardware Profiles

| Profil | RAM | CPU | Disk | AI | Kullanim |
|--------|-----|-----|------|-----|----------|
| Dusuk (AI'siz) | 4GB | 2 cekirdek | 20GB | Kapali | Belge depolama, arama |
| Orta (Hafif AI) | 16GB | 4 cekirdek | 100GB | qwen2.5:7b | AI destekli arama, ozetleme |
| Guclu (Tam AI) | 32GB+ | 8+ cekirdek | 500GB+ SSD | mixtral:8x7b | Gelismis AI, cok kullanıcili |
