# Ingestion Pipeline / Icerik Yukleme Hatti

## Genel Bakis / Overview

Ingestion (icerik yukleme) pipeline'i, kaynaklardan otomatik olarak icerik toplama, isleme, parcalama, embedding hesaplama ve indeksleme surecini yonetir. Worker servisi (`nomad-worker`) bu surecleri sorumludur.

### Pipeline Asamaları

```
[1. Kaynak Manifestleri]
         |
         v
[2. Adapter Secimi] --> HtmlAdapter / PdfAdapter / PointerAdapter
         |
         v
[3. HTTP Fetch] --> Rate Limiting + Retry + Conditional Requests
         |
         v
[4. Parsing] --> HTML Parser / PDF Parser / Metadata Extraction
         |
         v
[5. OCR] (opsiyonel) --> Tesseract (tur+eng)
         |
         v
[6. Chunking] --> 512 token boyut, 64 token overlap
         |
         v
[7. Embedding] --> Ollama nomic-embed-text
         |
         v
[8. Storage] --> PostgreSQL + Qdrant
         |
         v
[9. Review Queue] (opsiyonel)
```

## Adapter Sistemi / Adapter System

Uc adapter tipi bulunur (`apps/worker/app/adapters/`):

### Base Adapter

Tum adapter'lar `BaseAdapter` sinifindan turetilir:

```python
# app/adapters/base.py
class BaseAdapter(ABC):
    def __init__(self, manifest_data: Dict[str, Any]):
        self.manifest = manifest_data
        self.base_url = manifest_data.get("base_url", "")
        self.rate_limiter = RateLimiter(
            manifest_data.get("rate_limit_per_minute", settings.rate_limit_per_minute)
        )
```

**Saglanan Ozellikler:**

| Ozellik | Aciklama |
|---------|----------|
| RateLimiter | Token bucket algoritmasi |
| Retry + Backoff | Exponential backoff (max 3 deneme) |
| Conditional Requests | ETag / If-Modified-Since desteği |
| Robots.txt Kontrol | Manifest'teki `robots_note` kontrolu |
| SHA256 Hesaplama | Icerik butunluk dogrulama |
| Provenance Yakalama | HTTP yanit metadata'si |

### HtmlAdapter

```python
# app/adapters/html_adapter.py
class HtmlAdapter(BaseAdapter):
    async def fetch(self) -> List[Dict[str, Any]]
    async def parse(self, raw_data: Any) -> Dict[str, Any]
    async def store(self, document: Any, doc_data: Dict[str, Any]) -> Optional[Dict[str, Any]]
```

**Is Akisi:**
1. HTML sayfasi indirilir
2. `trafilatura` ile icerik cikarimi
3. Metadata ekstraksiyonu (baslik, yazar, tarih, keywords)
4. `mirrored` modunda ham HTML de saklanir
5. Cikarilan metin `/storage/extracted/<slug>.txt` olarak kaydedilir

### PdfAdapter

```python
# app/adapters/pdf_adapter.py
class PdfAdapter(BaseAdapter):
    async def fetch(self) -> List[Dict[str, Any]]
    async def parse(self, raw_data: Any) -> Dict[str, Any]
    async def store(self, document: Any, doc_data: Dict[str, Any]) -> Optional[Dict[str, Any]]
```

**Is Akisi:**
1. PDF dosyasi indirilir
2. `pypdf` ile metin cikarimi (basarisiz olursa `pymupdf` fallback)
3. PDF metadata'si cikarilir (baslik, yazar, sayfa sayisi)
4. SHA256 hash hesaplanir
5. `mirrored` modunda ham PDF `/storage/originals/<slug>.pdf` olarak saklanir

### PointerAdapter

```python
# app/adapters/pointer_adapter.py
class PointerAdapter(BaseAdapter):
    async def fetch(self) -> List[Dict[str, Any]]
    async def parse(self, raw_data: Any) -> Dict[str, Any]
    async def store(self, document: Any, doc_data: Dict[str, Any]) -> Optional[Dict[str, Any]]
```

**Is Akisi:**
1. HEAD request ile URL erisilebilirlik kontrolu
2. GET request ile metadata ekstraksiyonu
3. Icerik INDIRILMEZ
4. Yalnizca referans bilgisi saklanir

## Parser Sistemi / Parser System

### HTML Parser (`app/parsers/html_parser.py`)

```python
def parse_html_content(html_content: str, base_url: str) -> Dict[str, Any]:
    # trafilatura ile icerik cikarimi
    return {
        "title": ...,
        "text": ...,
        "description": ...,
        "language": ...,
    }
```

**Kullanilan Kutuphaneler:**
- `trafilatura`: Ana icerik cikarimi (reklam, navigasyon, vs. temizler)
- `BeautifulSoup` (opsiyonel): Ek HTML parsing

### PDF Parser (`app/parsers/pdf_parser.py`)

```python
def parse_pdf_content(pdf_bytes: bytes, file_path: str = "") -> Dict[str, Any]:
    # 1. pypdf ile dene
    # 2. Basarisiz olursa pymupdf ile dene
    return {
        "title": ...,
        "text": ...,
        "author": ...,
        "publisher": ...,
        "page_count": ...,
        "summary": ...,
    }
```

**PDF Text Extraction Stratejisi:**
1. Once `pypdf` denenir (hafif, hizli)
2. Text cikarimi basarisiz olursa `pymupdf` (fitz) fallback olarak kullanilir
3. Her sayfa ayri ayri islenir, metin birlestirilir

### Metadata Parser (`app/parsers/metadata_parser.py`)

HTML ve URL'lerden metadata cikarimi:

- `<title>` etiketi
- `<meta name="description">`
- `<meta name="author">`
- `<meta name="keywords">`
- `<meta property="og:*">`
- Canonical URL
- Yayin tarihi

## OCR Entegrasyonu / OCR Integration

OCR (Optical Character Recognition) ozelligi taranmis PDF'lerde ve resimlerdeki metni cikarmak icin kullanilir.

### Yapilandirma

```env
OCR_ENABLED=false
OCR_LANGUAGE=tur+eng
```

### Tesseract OCR (`app/ocr/tesseract.py`)

```python
# OCR yapilandirmasi
def run_ocr(image_path: str, language: str = "tur+eng") -> str:
    # Tesseract ile metin cikarimi
    return extracted_text
```

**Desteklenen Diller:**
- `tur`: Turkce
- `eng`: Ingilizce
- `tur+eng`: Turkce + Ingilizce (varsayilan)

### OCR Ne Zaman Kullanilir

1. PDF'den text cikarimi bos veya cok az icerik dondururse
2. `parse_status: ocr_needed` durumuna gecer
3. OCR tamamlandiginda `parse_status: ocr_completed` olur
4. `ocr_used: true` belge kaydina islenir

## Chunking Stratejisi / Chunking Strategy

Metin parcalari (chunks), RAG (Retrieval Augmented Generation) icin onemlidir.

### Varsayilan Ayarlar (`app/config.py`)

```python
chunk_size: int = 512    # Token boyutu
chunk_overlap: int = 64  # Overlap boyutu
```

### Chunking Islemi

```
[Tam Metin (5000 token)]
         |
         v
[Chunk 1: token 0-512]
[Chunk 2: token 448-960]   (512-64=448'den baslar)
[Chunk 3: token 896-1408]
[Chunk 4: token 1344-1856]
...
```

**Neden Overlap?**
- Baglam korunur
- Arama dogrulugu artar
- Semantic search'te daha iyi sonuclar

### Chunk Veritabani Kaydi

```sql
-- document_chunks tablosu
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY,
    document_id UUID REFERENCES documents(id),
    chunk_index INTEGER,
    content TEXT NOT NULL,
    token_count INTEGER,
    embedding_model VARCHAR(100),
    qdrant_point_id VARCHAR(255),
    metadata JSONB
);
```

## Embedding Pipeline / Embedding Pipeline

### Model Yapilandirmasi

```env
OLLAMA_EMBEDDING_MODEL=nomic-embed-text:latest
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

### Ollama Embeddings (`app/embeddings/ollama_embeddings.py`)

```python
async def generate_embedding(text: str) -> List[float]:
    # Ollama API cagrisi
    # POST /api/embeddings
    return embedding_vector
```

**Embedding Model: `nomic-embed-text`**
- Acik kaynak
- Turkce dahil coklu dil destegi
- 768 boyutlu vektor
- Semantic search icin optimize edilmis

### Indexleme Akisi

```
[Chunk Text] --> [Ollama Embedding API] --> [768-D Vektor]
                                              |
                                              v
                                       [Qdrant Collection]
                                       (cosine similarity)
                                              |
                                              v
                                       [qdrant_point_id kaydedilir]
                                       (document_chunks tablosuna)
```

## Qdrant Indeksleme / Qdrant Indexing

### Qdrant Yapilandirmasi

```env
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=change-this-qdrant-key
```

### Collection Yapisi

Qdrant collection'inda her bir chunk bir point olarak saklanir:

```
Point {
    id: "<chunk-uuid>",
    vector: [0.123, -0.456, ...],  // 768 boyutlu embedding
    payload: {
        "document_id": "<doc-uuid>",
        "chunk_index": 0,
        "content": "chunk metni...",
        "title": "belge basligi",
        "trust_level": "official",
        "source_url": "https://...",
    }
}
```

### Vektor Aramasi

```python
# Qdrant arama sorgusu
search_result = qdrant_client.query_points(
    collection_name="documents",
    query=embedding_vector,
    limit=10,
    with_payload=True,
)
```

## Hata Yonetimi / Error Handling

### Retry Mekanizmasi

```python
async def _fetch_with_retry(self, url, max_retries=3, backoff_factor=1.0):
    for attempt in range(max_retries):
        try:
            # ... istek ...
        except httpx.ConnectTimeout:
            wait = backoff_factor * (2 ** attempt)
            await asyncio.sleep(wait)
        except httpx.HTTPStatusError:
            # 429 --> backoff, digerleri --> raise
        except httpx.RequestError:
            # Network hatalari --> retry
```

### Ingestion Status Takibi

| Durum | Aciklama |
|-------|----------|
| `pending` | Beklemede |
| `running` | Calisiyor |
| `completed` | Tamamlandi |
| `failed` | Basarisiz |
| `cancelled` | Iptal edildi |

### Parse Status Takibi

| Durum | Aciklama |
|-------|----------|
| `pending` | Ayrıştırma bekliyor |
| `success` | Basarili |
| `failed` | Basarisiz |
| `partial` | Kismen basarili |
| `ocr_needed` | OCR gerekli |
| `ocr_completed` | OCR tamamlandi |

### Ingestion Events

Her onemli olay `ingestion_events` tablosuna kaydedilir:

```sql
-- ingestion_events tablosu
CREATE TABLE ingestion_events (
    id UUID PRIMARY KEY,
    run_id UUID,
    document_id UUID,
    event_type VARCHAR(50),
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMP
);
```

**Event Tipleri:**
- `document_discovered`: Yeni belge kesfedildi
- `fetch_started`: Indirme basladi
- `fetch_completed`: Indirme tamamlandi
- `parse_completed`: Ayrıştırma tamamlandi
- `chunk_created`: Chunk olusturuldu
- `embedding_generated`: Embedding hesaplandi
- `indexed`: Qdrant'a eklendi
- `error`: Hata olustu

## Ingestion Izleme / Monitoring Ingestion

### API Endpoint'leri

```
GET /api/ingestion/runs          # Tum ingestion run'lar
GET /api/ingestion/runs/{id}     # Belirli run detayi
GET /api/ingestion/sources       # Kaynak listesi ve durum
POST /api/ingestion/sync         # Manuel senkronizasyon
POST /api/ingestion/sources/{name}/sync  # Belirli kaynagi senkronize et
```

### Docker Loglari

```bash
# Worker loglarini izle
docker compose logs -f worker

# Belirli kaynagi filtrele
docker compose logs worker | grep "afad_deprem"
```

### Veritabani Sorgulari

```sql
-- Son ingestion run'lari
SELECT source_id, status, documents_found, documents_indexed,
       documents_failed, started_at, completed_at
FROM ingestion_runs
ORDER BY started_at DESC
LIMIT 20;

-- Kaynak saglik durumu
SELECT name, is_active, last_sync_at, last_success_at,
       last_error, error_count, total_documents
FROM source_manifests
ORDER BY last_sync_at DESC;

-- Basarisiz belgeler
SELECT d.title, d.source_url, d.parse_status, d.ingestion_status
FROM documents d
WHERE d.ingestion_status = 'failed' OR d.parse_status = 'failed'
ORDER BY d.created_at DESC;
```

## Sorun Giderme / Troubleshooting

### Problem: Kaynak Ulasilamiyor

**Belirtiler:**
- `last_error` alaninda baglanti hatasi
- `error_count` artiyor

**Cozum:**
1. URL'yi tarayicida test edin
2. `alternate_url` tanimliysa deneyin
3. DNS cozumlemesini kontrol edin
4. Gerekirse `is_active=false` yapin

### Problem: PDF Text Cikarimi Bos

**Belirtiler:**
- `parse_status: ocr_needed`
- `extracted_text` bos

**Cozum:**
1. OCR'i etkinlestirin: `OCR_ENABLED=true`
2. Tesseract dil paketlerini yukleyin: `tesseract-ocr-tur`
3. Belgeyi manuel olarak kontrol edin (taranmis olabilir)

### Problem: Embedding Uretimi Basarisiz

**Belirtiler:**
- Ollama baglanti hatasi
- `qdrant_point_id` null

**Cozum:**
1. Ollama servisinin calistigini dogrulayin: `curl http://localhost:11434/api/tags`
2. Embedding modelinin yuklu oldugunu kontrol edin: `ollama pull nomic-embed-text`
3. `OLLAMA_BASE_URL` dogru ayarlandigini kontrol edin

### Problem: Ingestion Run Takili Kaliyor

**Belirtiler:**
- `status: running` ama uzun suredir tamamlanmadi
- Loglarda ilerleme yok

**Cozum:**
1. Worker container'ini yeniden baslatin: `docker compose restart worker`
2. Run'i iptal edin (veritabaninda): `UPDATE ingestion_runs SET status='cancelled' WHERE id='...'`
3. Rate limit ayarlarini dusurun
4. Kaynak URL'yi manuel test edin

### Problem: Qdrant'a Yazma Basarisiz

**Belirtiler:**
- 401 Unauthorized hatasi
- Collection bulunamadi

**Cozum:**
1. `QDRANT_API_KEY` dogrulugu kontrol edin
2. Qdrant servis durumunu kontrol edin: `curl http://localhost:6333/healthz`
3. Collection varligini kontrol edin

### Problem: Chunk Sayisi Beklenenden Az

**Belirtiler:**
- `chunk_count` alani dusuk
- RAG aramasi yetersiz sonuc donduruyor

**Cozum:**
1. Chunk boyutunu dusurun (512 --> 256)
2. Chunk overlap'i artirin (64 --> 128)
3. OCR sonrasinda yeniden chunking yapin

## Manuel Ingestion Komutlari

### Tum Kaynaklari Senkronize Et

```bash
curl -X POST http://localhost:8000/api/ingestion/sync \
  -H "Authorization: Bearer <token>"
```

### Belirli Kaynagi Senkronize Et

```bash
curl -X POST http://localhost:8000/api/ingestion/sources/afad_deprem_tehlike_bilgi/sync \
  -H "Authorization: Bearer <token>"
```

### Ingestion Run Durumunu Kontrol Et

```bash
curl http://localhost:8000/api/ingestion/runs/<run-id> \
  -H "Authorization: Bearer <token>"
```
