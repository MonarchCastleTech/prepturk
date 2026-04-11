# Kaynak Politikasi / Source Policy

## Genel Bakis / Overview

prepturk sistemi, resmi ve guvenilir kaynaklardan icerik toplamak uzere tasarlanmistir. Her kaynak bir YAML manifest dosyasi ile tanimlanir. Bu dokumantasyon kaynak yonetimi, adapter tipleri, getirme stratejileri ve yeni kaynak ekleme sureclerini aciklar.

## Kaynak Matrisi / Source Matrix (36 Kaynak)

Sistemde 36 kaynak manifesti tanimlanmistir (`content/manifests/sources/`):

### AFAD (8 kaynak)

| Manifest | URL | Strateji | Depolama | Guvenilirlik | Hak |
|----------|-----|----------|----------|-------------|-----|
| `afad_deprem_tehlike_bilgi.yaml` | afad.gov.tr/turkiye-deprem-tehlike-haritasi | html_page | mirrored | official | public-download |
| `afad_tamp.yaml` | afad.gov.tr/turkiye-afet-mudahale-plani | html_page | mirrored | official | public-download |
| `afad_urap.yaml` | afad.gov.tr/ulusal-radyasyon-acil-durum-plani-urap | html_page | mirrored | official | public-download |
| `afad_tarap.yaml` | afad.gov.tr/turkiye-afet-risk-azaltma-plani-tarap | html_page | mirrored | official | public-download |
| `afad_kbrn.yaml` | afad.gov.tr/kbrn | html_sitemap | mirrored | official | public-download |
| `afad_kbrn_library.yaml` | afad.gov.tr/kbrn/kitapkitapcik | html_sitemap | mirrored | official | public-download |
| `afad_nukleer_korunma.yaml` | afad.gov.tr/kbrn/nukleer-savaslarda-korunma | html_page | mirrored | official | public-download |
| `afad_acil_durum_cantasi.yaml` | afad.gov.tr/afet-ve-acil-durum-cantasi-nasil-hazirlanmali | html_page | mirrored | official | public-download |

### Saglik Bakanligi (3 kaynak)

| Manifest | URL | Strateji | Depolama | Guvenilirlik | Hak |
|----------|-----|----------|----------|-------------|-----|
| `saglik_ilk_yardim_kitabi.yaml` | ekutuphane.saglik.gov.tr | pdf_direct | mirrored | official | public-download |
| `saglik_ilk_yardim_sunumlari.yaml` | saglik.gov.tr | html_sitemap | mirrored | official | public-download |
| `saglik_mantar_uyari.yaml` | saglik.gov.tr/TR-55310 | html_page | mirrored | official | public-download |
| `saglik_uzem.yaml` | saglik.gov.tr | html_sitemap | mirrored | official | public-download |

### MEB / Egitim (6 kaynak)

| Manifest | URL | Strateji | Depolama | Guvenilirlik | Hak |
|----------|-----|----------|----------|-------------|-----|
| `meb_eba_ekitap.yaml` | eba.gov.tr/ekitap | html_sitemap | cached | official | public-read-limited-redistribution |
| `meb_eba_etkilesimli.yaml` | eba.gov.tr | html_sitemap | cached | official | public-read-limited-redistribution |
| `meb_mevzuat.yaml` | meb.gov.tr | html_sitemap | cached | official | public-read-limited-redistribution |
| `meb_ozel_egitim_kitaplari.yaml` | meb.gov.tr | html_sitemap | cached | official | public-read-limited-redistribution |
| `ogm_beceri_temelli.yaml` | ogmmateryal.eba.gov.tr | html_sitemap | cached | official | public-read-limited-redistribution |
| `ogm_etkilesimli_kitaplar.yaml` | ogmmateryal.eba.gov.tr | html_sitemap | cached | official | public-read-limited-redistribution |
| `ogm_materyal.yaml` | ogmmateryal.eba.gov.tr | html_sitemap | cached | official | public-read-limited-redistribution |

### TİTCK / Diyanet / MTA / MGM / KGM / NDK (8 kaynak)

| Manifest | Kurum | Strateji | Depolama | Guvenilirlik |
|----------|-------|----------|----------|-------------|
| `titck_kub_kt.yaml` | TİTCK | html_sitemap | cached | official |
| `diyanet_kuran_portal.yaml` | Diyanet | pointer_only | pointer-only | official |
| `diyanet_kuran_yayinlar.yaml` | Diyanet | pointer_only | pointer-only | official |
| `mta_yerbilimleri.yaml` | MTA | html_page | cached | official |
| `mgm_uyarilar.yaml` | MGM | html_page | cached | official |
| `mgm_uyari_liste.yaml` | MGM | html_sitemap | cached | official |
| `kgm_yol_durumu.yaml` | KGM | html_page | cached | official |
| `kgm_calisma_yollar.yaml` | KGM | html_page | cached | official |

### Anayasa / KTB / KYGM / TTK (5 kaynak)

| Manifest | Kurum | Strateji | Depolama | Guvenilirlik |
|----------|-------|----------|----------|-------------|
| `anayasa.yaml` | Anayasa Mahkemesi | html_sitemap | mirrored | official |
| `ktb_ekitap.yaml` | KTB | pointer_only | pointer-only | official |
| `kygm_ekitap.yaml` | KYGM | pointer_only | pointer-only | official |
| `ttk_nutuk.yaml` | TTK | html_sitemap | cached | official |
| `ndk_radyasyon_acil.yaml` | NDK | html_page | mirrored | official |
| `ndk_radyasyon_uyari_isaretleri.yaml` | NDK | html_page | mirrored | official |

### Turkiye.gov.tr / Hizmet Portal (3 kaynak)

| Manifest | URL | Strateji | Depolama | Guvenilirlik |
|----------|-----|----------|----------|-------------|
| `turkiye_deprem_tehlike_haritasi_hizmet.yaml` | turkiye.gov.tr | pointer_only | pointer-only | official |
| `turkiye_toplanma_alani.yaml` | turkiye.gov.tr | pointer_only | pointer-only | official |
| `turkiye_hizmetler.yaml` | turkiye.gov.tr | pointer_only | pointer-only | official |

## Adapter Tipleri / Adapter Types

Sistemde 3 adapter tipi bulunur (`apps/worker/app/adapters/`):

### 1. HTML Adapter (`HtmlAdapter`)

**Dosya:** `html_adapter.py`

**Ne yapar:**
- HTML sayfalarini indirir
- `trafilatura` ile icerik cikarimi yapar
- Baslik, ozet, yazar, yayinci meta verilerini cikarir
- `mirrored` modunda ham HTML'yi de saklar

**Kullanim:**
```yaml
fetch_strategy: "html_page"       # Tek sayfa
fetch_strategy: "html_sitemap"    # Sitemap/coklu sayfa
html_allowed: true
```

**Parser:** `app/parsers/html_parser.py` - `parse_html_content()`

### 2. PDF Adapter (`PdfAdapter`)

**Dosya:** `pdf_adapter.py`

**Ne yapar:**
- PDF dosyalarini indirir
- `pypdf` ile metin cikarimi yapar (basarisiz olursa `pymupdf` fallback)
- PDF metadata'sini cikarir (baslik, yazar, sayfalar)
- SHA256 hash hesaplar
- `mirrored` modunda ham PDF'yi saklar

**Kullanim:**
```yaml
fetch_strategy: "pdf_direct"
pdf_allowed: true
```

**Parser:** `app/parsers/pdf_parser.py` - `parse_pdf_content()`

### 3. Pointer Adapter (`PointerAdapter`)

**Dosya:** `pointer_adapter.py`

**Ne yapar:**
- URL'nin erisilebilir oldugunu dogrular (HEAD request)
- Sayfa metadata'sini cikarir
- Icerik INDIRMEZ
- Yalnizca referans bilgisi saklar

**Kullanim:**
```yaml
fetch_strategy: "pointer_only"
default_storage_mode: pointer-only
```

## Getirme Stratejileri / Fetch Strategies

| Strateji | Aciklama | Adapter |
|----------|----------|---------|
| `html_page` | Tek HTML sayfasi | HtmlAdapter |
| `html_sitemap` | Sitemap veya coklu sayfa tarama | HtmlAdapter |
| `pdf_direct` | Dogrudan PDF indirme | PdfAdapter |
| `pointer_only` | Yalnizca metadata, icerik yok | PointerAdapter |

### Kosullu Istekler (Conditional Requests)

Adapter'lar HTTP `If-None-Match` (ETag) ve `If-Modified-Since` basliklarini kullanarak gereksiz indirmeleri onler:

```python
# app/adapters/base.py
if url in self._etag_cache:
    headers["If-None-Match"] = self._etag_cache[url]
if url in self._last_modified_cache:
    headers["If-Modified-Since"] = self._last_modified_cache[url]

response = await client.get(url, headers=headers)
if response.status_code == 304:
    return None  # Icerik degismemis, atla
```

## Rate Limiting

Her kaynak manifest'inde `rate_limit_per_minute` tanimlanir:

```python
# app/adapters/base.py - RateLimiter
class RateLimiter:
    def __init__(self, requests_per_minute: int):
        self.rate = requests_per_minute / 60.0
        self.tokens = float(requests_per_minute)
        self.max_tokens = float(requests_per_minute)
```

### Token Bucket Algoritmasi

- Her kaynak icin ayri rate limiter
- Varsayilan: 30 istek/dakika (genel ayar)
- Resmi kaynaklar genellikle 10-20 istek/dakika
- 429 (Too Many Requests) alindiginda exponential backoff uygulanir

### Ornek Rate Limit Ayarlari

| Kaynak | Limit | Neden |
|--------|-------|-------|
| MGM | 20/dk | Sik guncellenen veri |
| KGM | 20/dk | Sik guncellenen veri |
| AFAD | 15/dk | Buyuk dosyalar |
| MEB/EBA | 10/dk | Genis icerik |
| TİTCK | 10/dk | Sinirli erisim |
| Anayasa | 10/dk | Nadir guncelleme |

## Robots.txt Uyumu / Robots.txt Compliance

Her kaynak manifest'inde `robots_note` alani bulunur:

```yaml
robots_note: "Resmî kurum, kamu tüzel kişiliği"
```

Adapter'lar robots.txt notlarini kontrol eder:

```python
# app/adapters/base.py
def _check_robots_txt(self, url: str) -> bool:
    robots_note = self.manifest.get("robots_note", "")
    if "kazima" in robots_note.lower() or "scrape" in robots_note.lower():
        if "pointer" in robots_note.lower() or "only" in robots_note.lower():
            return True
    return True  # Varsayilan: izin ver (resmi kurumlar)
```

**Not:** Resmi kurumlar genellikle kamuya acik bilgi sundugundan, sistem `pointer-only` stratejisi ile minimum yuk getirecek sekilde tasarlanmistir.

## Zamanlama Yapilandirmasi / Schedule Configuration

Her kaynak bir cron ifadesi ile zamanlanabilir:

```yaml
schedule: "0 3 * * 1"  # Her Pazartesi 03:00
```

### Ornek Zamanlamalar

| Kaynak | Cron | Aciklama |
|--------|------|----------|
| Anayasa | `0 3 * * 0` | Her Pazar 03:00 (haftalik) |
| AFAD kaynaklari | `0 3 * * 1` | Her Pazartesi 03:00 |
| MEB/EBA | `0 4 * * 0` | Her Pazar 04:00 |
| Saglik | `0 4 * * 2` | Her Sali 04:00 |
| TİTCK | `0 5 * * 0` | Her Pazar 05:00 |
| MGM | `0 */6 * * *` | Her 6 saatte bir |
| KGM | `0 */4 * * *` | Her 4 saatte bir |
| Pointer-only | `null` | Zamanlama yok (manuel) |

## Kaynak Saglik Izleme / Source Health Monitoring

`source_manifests` tablosu saglik bilgilerini takip eder:

| Alan | Tip | Aciklama |
|------|-----|----------|
| `is_active` | BOOLEAN | Kaynak etkin mi |
| `last_sync_at` | TIMESTAMP | Son senkronizasyon zamani |
| `last_success_at` | TIMESTAMP | Son basarili senkronizasyon |
| `last_error` | TEXT | Son hata mesaji |
| `error_count` | INTEGER | Toplam hata sayisi |
| `total_documents` | INTEGER | Toplam bulunan belge sayisi |

### Ingestion Run Takibi

Her senkronizasyon calistirmasi `ingestion_runs` tablosuna kaydedilir:

| Alan | Tip | Aciklama |
|------|-----|----------|
| `source_id` | UUID | Hangi kaynaga ait |
| `adapter_name` | VARCHAR(100) | Kullanilan adapter |
| `status` | ENUM | pending/running/completed/failed/cancelled |
| `started_at` | TIMESTAMP | Baslangic zamani |
| `completed_at` | TIMESTAMP | Bitis zamani |
| `documents_found` | INTEGER | Bulunan belge sayisi |
| `documents_fetched` | INTEGER | Indirilen belge sayisi |
| `documents_indexed` | INTEGER | Indekslenen belge sayisi |
| `documents_failed` | INTEGER | Basarisiz belge sayisi |
| `error_log` | TEXT | Hata kayitlari |

## Yeni Kaynak Ekleme / Adding New Sources

### Adim 1: YAML Manifest Olusturun

`content/manifests/sources/` dizininde yeni bir YAML dosyasi olusturun:

```yaml
name: kurum_kayak_adi
base_url: "https://www.kurum.gov.tr/sayfa"
alternate_url: "https://alternate-url.gov.tr/sayfa"  # opsiyonel
fetch_strategy: "html_page"  # html_page, html_sitemap, pdf_direct, pointer_only
robots_note: "Resmî kurum, kamu tüzel kişiliği"
rate_limit_per_minute: 15
default_storage_mode: mirrored  # mirrored, cached, pointer-only
default_trust_level: official  # official, institutional, community, personal
default_rights_status: public-download  # public-download, public-read-limited-redistribution, pointer-only, unknown-review-needed
schedule: "0 3 * * 1"  # cron ifadesi veya null
content_selectors:
  mime_types: ["text/html", "application/pdf"]
  file_patterns: ["*.pdf"]
html_allowed: true
pdf_allowed: true
province_mapping: null  # il esleme (gelecekte)
language_default: tr
```

### Adim 2: Dogru Adapter ve Strateji Secin

| Icerik Tipi | fetch_strategy | Adapter |
|-------------|---------------|---------|
| Tek HTML sayfa | `html_page` | HtmlAdapter |
| Coklu sayfa / sitemap | `html_sitemap` | HtmlAdapter |
| PDF dokuman | `pdf_direct` | PdfAdapter |
| Referans / portal | `pointer_only` | PointerAdapter |

### Adim 3: Depolama Modunu Belirleyin

- Kurumun yeniden dagitim politikalari kontrol edin
- `public-download` --> `mirrored`
- `public-read-limited-redistribution` --> `cached`
- Portal / hizmet --> `pointer-only`

### Adim 4: Hak Durumunu Belirleyin

Kaynagin lisans ve yeniden dagitim kosullarini arastirin. Emin degilseniz `unknown-review-needed` kullanin.

### Adim 5: Zamanlama Ayarlayin

- Sik guncellenen veriler (hava durumu, yol durumu): saatlik
- Orta siklikta (egitim materyalleri): haftalik
- Nadir guncellenen (anayasa, kanunlar): haftalik veya aylik
- Portal sayfalar: `null` (manuel)

### Adim 6: Test Edin

1. Yeni manifest'i kaydedin
2. Ingestion API uzerinden manuel senkronizasyon baslatin:
   ```bash
   curl -X POST http://localhost:8000/api/ingestion/sync -H "Authorization: Bearer <token>"
   ```
3. Loglari kontrol edin: `docker compose logs -f worker`
4. Veritabaninda kaynak durumunu kontrol edin:
   ```sql
   SELECT name, is_active, last_sync_at, last_success_at, error_count
   FROM source_manifests WHERE name = 'kurum_kayak_adi';
   ```

## Kaynak Gozden Gecirme Is Akisi / Source Review Workflow

### 1. Kesif (Discovered)

Kaynak manifest'i eklendiginde dokuman `discovered` durumunda baslar.

### 2. Indirme (Fetched)

Adapter icerigi indirir. Basarili ise `fetched`.

### 3. Ayrıştırma (Parsed)

Parser metni ve metadata'yi cikarir. Basarili ise `parsed`.

### 4. Indeksleme (Indexed)

Chunk'lar olusturulur, embedding'ler hesaplanir, Qdrant'a yuklenir. `indexed`.

### 5. Gozden Gecirme (Review Needed)

Otomatik islenemeyen veya hak durumu belirsiz belgeler `review_needed` durumuna girer.

### 6. Onay / Red (Approved / Rejected)

Editor veya Admin belgeleri gozden gecirir:

- **Approved**: Belge onaylanir, arama sonuclarinda gorunur
- **Rejected**: Belge reddedilir, gizlenir
- **Archived**: Belge arşivlenir, arama sonuclarinda gorunmez

### Review Queue Yonetimi

```sql
-- Gozden gecirme bekleyen belgeler
SELECT d.title, d.source_url, d.trust_level, d.rights_status, r.priority
FROM review_queue r
JOIN documents d ON r.document_id = d.id
WHERE r.status = 'review_needed'
ORDER BY r.priority DESC, r.created_at ASC;
```

## Kaynak Devre Disi Birakma

Bir kaynagi gecici veya kalici olarak devre disi birakmak icin:

```yaml
# YAML dosyasinda
is_active: false
```

Veya veritabaninda:

```sql
UPDATE source_manifests SET is_active = false WHERE name = 'kaynak_adi';
```

Devre disi kaynaklar senkronizasyon islemlerinde atlanir.
