# Haklar ve Provenans / Rights and Provenance

## Genel Bakis / Overview

prepturk sisteminde her belgenin kaynagi, guvenilirlik duzeyi, hak durumu ve saklama sekli acikca tanimlanir. Bu dokumantasyon, belgelerin nereden geldigini, ne kadar guvenilir oldugunu ve yasal olarak nasil kullanilabilecegini aciklar.

## Depolama Modlari / Storage Modes

Sistemde 4 depolama modu bulunur. Her kaynak manifest'inde `default_storage_mode` olarak tanimlanir.

### 1. Mirrored (Yansitilmis)

Belge yasal olarak indirilebilir ve yerel olarak tam olarak saklanir.

**Ne zaman kullanilir:**
- Resmi kurum belgeleri (AFAD, Saglik Bakanligi, MEB)
- Acikca herkese acik belgeler
- `rights_status: public-download` olan kaynaklar

**Depolama:**
```
/storage/originals/<slug>.pdf veya .html
/storage/extracted/<slug>.txt
```

**Ornek Kaynaklar:**
- `afad_deprem_tehlike_bilgi.yaml` --> `default_storage_mode: mirrored`
- `afad_tamp.yaml` --> `default_storage_mode: mirrored`
- `saglik_ilk_yardim_kitabi.yaml` --> `default_storage_mode: mirrored`
- `anayasa.yaml` --> `default_storage_mode: mirrored`

### 2. Cached (Onbellik)

Belge erisim kolayligi icin yerel olarak onbellege alinir, ancak asil kaynak onemlidir.

**Ne zaman kullanilir:**
- Resmi kurumlarin ancak sinirli yeniden dagitim hakki olan belgeleri
- Sik erisilen referans belgeleri
- `rights_status: public-read-limited-redistribution` olan kaynaklar

**Ornek Kaynaklar:**
- `titck_kub_kt.yaml` --> `default_storage_mode: cached`
- `meb_eba_ekitap.yaml` --> `default_storage_mode: cached`
- `mta_yerbilimleri.yaml` --> `default_storage_mode: cached`
- `mgm_uyarilar.yaml` --> `default_storage_mode: cached`

### 3. Pointer-Only (Yalnizca Gosterci)

Yalnizca metadata ve orijinal URL kaydedilir. Otomatik yeniden dagitim yapilmaz.

**Ne zaman kullanilir:**
- Hizmet portallari (turkiye.gov.tr entegrasyonlari)
- Icerik kazima yapilmamasi gereken kaynaklar
- Kullanici etkilesimi gerektiren sayfalar

**Ornek Kaynaklar:**
- `diyanet_kuran_portal.yaml` --> `default_storage_mode: pointer-only`
- `kygm_ekitap.yaml` --> `default_storage_mode: pointer-only`
- `ktb_ekitap.yaml` --> `default_storage_mode: pointer-only`
- `turkiye_deprem_tehlike_haritasi_hizmet.yaml` --> `default_storage_mode: pointer-only`
- `turkiye_toplanma_alani.yaml` --> `default_storage_mode: pointer-only`

### 4. User-Uploaded (Kullanici Yuklemesi)

Kullanici tarafindan manuel olarak yuklenen dosyalar.

**Ne zaman kullanilir:**
- Kullanicinin kendi belgeleri
- Il paketleri ile dagitilen dosyalar
- Not ekleri

## Guvenilirlik Duzeyleri / Trust Levels

4 guvenilirlik duzeyi tanimlanmistir (`content/manifests/taxonomy/trust-levels.json`):

| ID | Ad (TR) | Renk | Icon | Oncelik | Aciklama | Ornek |
|----|---------|------|------|---------|----------|-------|
| `official` | Resmî | #22c55e | shield-check | 1 | Bakanlik, baskanlik, AFAD, MEB | Anayasa, TAMP, Saglik rehberleri |
| `institutional` | Kurumsal | #3b82f6 | building-2 | 2 | Universiteler, belediyeler | MTA haritalari, TTK Nutuk |
| `community` | Topluluk | #f59e0b | users | 3 | Kurationlu gayriresmî kaynaklar | STK raporlari |
| `personal` | Kisisel | #a855f7 | file | 4 | Kullanici yuklemeleri | Ozel belgeler |

### Guvenilirlik Onceligi

Arama sonuclarinda ve AI yanitlarinda `official` kaynaklar oncelikle kullanilir. `official_only` modunda yalnizca resmi kaynaklardan yanit uretilir.

## Hak Durumu Enum'leri / Rights Status Enum

5 hak durumu tanimlanmistir (`content/manifests/taxonomy/rights-status.json`):

| ID | Ad (TR) | Aciklama | Iliskili Depolama Modu |
|----|---------|----------|----------------------|
| `public-download` | Herkese Acik Indirme | Yasal olarak indirilebilir ve saklanabilir | mirrored |
| `public-read-limited-redistribution` | Herkese Acik Okuma / Sinirli Yeniden Dagitim | Okunabilir ancak yeniden dagitim kisitli | cached |
| `pointer-only` | Yalnizca Gosterci | Yalnizca metadata ve orijinal URL | pointer-only |
| `unknown-review-needed` | Bilinmiyor / Inceleme Gerekli | Hak durumu belirsiz | - |
| `user-owned` | Kullanici Sahipli | Kullanici tarafindan yuklenen, kullaniciya ait | user-uploaded |

## Provenans Metadata Alanlari / Provenance Metadata Fields

Her belge asagidaki provenans bilgilerini icerir:

### Dokuman Tablosu Iliskili Alanlar

| Alan | Tip | Aciklama |
|------|-----|----------|
| `source_url` | TEXT | Belgenin kaynak URL'si |
| `source_domain` | VARCHAR(255) | Kaynagin et alani |
| `canonical_url` | TEXT | Belgenin canonical URL'si |
| `institution` | TEXT | Belgeyi yayinlayan kurum |
| `trust_level` | ENUM | Guvenilirlik duzeyi |
| `storage_mode` | ENUM | Depolama modu |
| `rights_status` | ENUM | Hak durumu |
| `rights_note` | TEXT | Ek haklar aciklamasi |
| `sha256` | VARCHAR(64) | Dosya SHA256 hash degeri |
| `etag` | VARCHAR(255) | HTTP ETag (degisiklik takibi) |
| `last_modified_header` | VARCHAR(255) | HTTP Last-Modified |
| `acquired_at` | TIMESTAMP | Sisteme yuklenme zamani |
| `published_at` | TIMESTAMP | Kaynakta yayinlanma zamani |
| `effective_date` | TIMESTAMP | Belgenin gecerlilik tarihi |
| `issue_number` | VARCHAR(50) | Yayin sayisi (varsa) |
| `version_label` | VARCHAR(50) | Versiyon etiketi |
| `version_hash` | VARCHAR(64) | Icerik hash'i (versiyon takibi) |
| `ingestion_adapter` | VARCHAR(100) | Hangi adapter ile yuklendigi |
| `ingestion_run_id` | UUID | Hangi ingestion run ile yuklendigi |
| `citation_hint` | TEXT | Onerilen atif formati |

### Ingestion Event Provenansi

Her ingestion calistirmasinda asagidaki bilgiler yakalanir:

```python
# app/adapters/base.py - _capture_provenance()
{
    "fetched_at": datetime.utcnow().isoformat(),
    "response_url": str(response.url),
    "status_code": response.status_code,
    "content_type": response.headers.get("Content-Type", ""),
    "content_length": response.headers.get("Content-Length"),
    "etag": response.headers.get("ETag"),
    "last_modified": response.headers.get("Last-Modified"),
    "source_manifest": self.manifest.get("name"),
    "base_url": self.base_url,
}
```

## SHA256Checksum Dogrulama / SHA256 Checksum Verification

Her indirilen dosyanin SHA256 hash'i hesaplanir ve kaydedilir:

```python
# app/adapters/base.py
def _compute_sha256(self, content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()
```

### Kullanim Amaclari

1. **Butunluk Dogrulama**: Dosyanin degistirilmedigini dogrular
2. **Versiyon Takibi**: Icerik degistiginde hash degisir
3. **Yedekleme Guvenilirligi**: Yedek dosyalari dogrulanabilir
4. **Il Paketleri**: Pack icerigi dogrulanabilir

### Il Paketlerinde SHA256

Province pack builder her dosya icin SHA256 hesaplar:

```python
# scripts/build_province_pack.py
def compute_file_hash(file_path: str) -> str:
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()
```

## Versiyon Zinciri Takibi / Version Chain Tracking

Belgeler versiyonlandiginda onceki ve sonraki versiyonlar arasıda bag kurulur:

### Dokuman Tablosu Versiyon Alanlari

| Alan | Aciklama |
|------|----------|
| `supersedes_document_id` | Bu belgenin yerine gectigi eski belge ID'si |
| `superseded_by_document_id` | Bu belgenin yerine gecen yeni belge ID'si |
| `version_label` | Versiyon etiketi (orn: "v2.1", "2024-guncelleme") |
| `version_hash` | Bu versiyonun icerik hash'i |

### Document Versions Tablosu

Her versiyon icin tam snapshot saklanir:

| Alan | Tip | Aciklama |
|------|-----|----------|
| `document_id` | UUID | Ana belge referansi |
| `version_label` | VARCHAR(50) | Versiyon etiketi |
| `version_hash` | VARCHAR(64) | Icerik hash |
| `content_snapshot` | JSONB | Icerik snapshot'u |
| `metadata_snapshot` | JSONB | Metadata snapshot'u |
| `notes` | TEXT | Versiyon notlari |

## Atif Format / Citation Format

Her belge icin onerilen atif formati `citation_hint` alaninda saklanir.

### Standart Atif Sablonu

```
[Kurum]. ([Yayin Tarihi]). [Belge Basligi]. [URL]. Erisim Tarihi: [Erisim Tarihi]. SHA256: [sha256]
```

### Ornek

```
AFAD. (2024). Turkiye Afet Mudahale Plani (TAMP).
https://www.afad.gov.tr/turkiye-afet-mudahale-plani.
Erisim Tarihi: 2026-04-07. SHA256: a1b2c3d4...
```

### AI Citations

AI sohbet yanitlarinda her atif asagidaki bilgileri icerir:

| Alan | Tip | Aciklama |
|------|-----|----------|
| `document_id` | UUID | Atif yapilan belge |
| `citation_text` | TEXT | Atif metni (ilk 500 karakter) |
| `page_reference` | TEXT | Sayfa referansi (varsa) |
| `chunk_reference` | VARCHAR(255) | Chunk referansi |
| `confidence_score` | FLOAT | Guven skoru (0-1) |

## Riskli Konular Icerik Politikasi / Content Policy for Risky Topics

### Mantar Zehirlenmesi ve Yabani Bitkiler

`saglik_mantar_uyari.yaml` kaynagi ozel bir durum ornegidir:

```yaml
name: saglik_mantar_uyari
base_url: "https://www.saglik.gov.tr/TR-55310/mantar-zehirlenmeleri-uzerine-yapilan-basin-aciklamasi.html"
fetch_strategy: "html_page"
robots_note: "Uyari amaclı kaynak, mutfak rehberi degil"
default_storage_mode: mirrored
default_trust_level: official
```

**Politika:**
- Mantar teshisi veya yabani bitki tuketimi konusunda kesinlikle tavsiye verilmez
- Her zaman resmi saglik kuruluslarina basvurulmasi önerilir
- AI yanitlarinda uyari oncelikli akis kullanilir
- `medical_risk_level: high-risk` veya `emergency` olarak isaretlenir

### KBRN (Kimyasal, Biyolojik, Radyolojik, Nukleer)

AFAD KBRN kaynaklari `official` trust level ile mirrored olarak saklanir:

- `afad_kbrn.yaml`
- `afad_kbrn_library.yaml`
- `afad_nukleer_korunma.yaml`
- `afad_urap.yaml` (Ulusal Radyasyon Acil Durum Plani)

**Politika:**
- Bilgilendirme amaclidir, profesyonel egitim yerine gecmez
- Acil durumlarda AFAD ve resmi kuruluslarin talimatlari izlenmelidir

### Ilac Bilgileri (TİTCK)

TİTCK KUB/KT kaynaklari `cached` modunda ve `public-read-limited-redistribution` hak durumu ile saklanir:

```yaml
name: titck_kub_kt
base_url: "https://www.titck.gov.tr/kubkt"
default_storage_mode: cached
default_trust_level: official
default_rights_status: public-read-limited-redistribution
```

**Politika:**
- Ilac sorularinda TİTCK KUB/KT birincil kaynak olarak kullanilir
- AI doktor tavsiyesi vermez, yalnizca belge bilgilerini sunar
- `medical_risk_level: caution` olarak isaretlenir

## Yasal Degerlendirmeler / Legal Considerations

### Kaynak Icerik Lisanslari

- **Resmi kaynaklar**: Genellikle kamu bilgisi olarak kabul edilir, ancak her kurumun kendi politikasi vardir
- **Kurumsal kaynaklar**: Kurumun lisans kosullarina tabidir
- **Topluluk kaynaklari**: Kaynagin lisansina saygi gostermelidir
- **Kullanici yuklemeleri**: Yukleyici, icerigin yasal haklarina sahip oldugunu beyan eder

### Yeniden Dagitim Sinirlamalari

- `pointer-only` kaynaklarin icerigi indirilmez veya yeniden dagitilmaz
- `cached` kaynaklar yerel erisim icin saklanir, disariya acilmaz
- `mirrored` kaynaklar resmi kurumlarin acik izinli belgeleridir

### Kisisel Verilerin Korunmasi (KVKK)

- Kullanici verileri (email, sifre, oturum) minimum seviyede tutulur
- Arama sorgulari anonimize edilir (kullanici ID'si saklanmaz)
- Kasa dosyalari AES-256-GCM ile sifrelenir
- Denetim gunlukleri guvenlik amaclariyla saklanir

### Sorumluluk Reddi

Sistem bilgi saglama amaciyla tasarlanmistir:

- Afet ve acil durumlarda her zaman resmi talimatlari takip edin
- Saglik bilgilerinde doktorunuza danisin
- Sistem saglik hizmeti sunmaz
- Icerik dogrulugu kaynaklara baglidir
