# Yonetici Kilavuzu / Admin Guide

## Ilk Kurulum Sihirbazi / Initial Setup Wizard

### Kurulum Adimlari

Sistem ilk kez `http://localhost:3000` adresinden acildiginda kurulum sihirbazi otomatik olarak baslar:

1. **Yonetici Hesabi Olustur**
   - Email adresi
   - Kullanici adi
   - Guclu sifre (en az 8 karakter)
   - Gorunen ad

2. **Modul Secimi**
   - Belgeler (varsayilan: acik)
   - AI Asistan (varsayilan: acik, Ollama gerektirir)
   - Egitim Rafi (varsayilan: acik)
   - Harita Gorunumu (varsayilan: acik)
   - Kisisel Kasa (varsayilan: acik)
   - Il Paketleri (varsayilan: acik)

3. **Baslangic Icerik Paketleri**
   - Hangi il paketlerinin yuklenecegi secilir
   - Resmi kaynak senkronizasyonu baslatilir

4. **Il Senkronizasyon**
   - Secilen kaynaklardan icerik indirilir
   - Embedding'ler hesaplanir
   - Qdrant indeksleri olusturulur

### Manuel Kurulum

Sihirbaz basarili olmazsa:

```bash
# .env dosyasini olusturun
cp .env.example .env

# .env dosyasini duzenleyin
# APP_SECRET_KEY, POSTGRES_PASSWORD, QDRANT_API_KEY degerlerini degistirin

# Sistem baslatin
make install
# veya
bash scripts/install.sh

# Demo veri yukleyin
make seed
```

Demo veri ile olusturulan hesap:
- Kullanici: `admin`
- Sifre: `admin123456`

## Kullanicı Yonetimi / User Management

### Kullanicı Listeleme

API endpoint: `GET /api/users`

```sql
-- Veritabanindan kullanicilari listele
SELECT id, username, email, display_name, is_active, totp_enabled,
       created_at, last_login
FROM users
ORDER BY created_at DESC;
```

### Yeni Kullanicı Olusturma

Admin panel uzerinden veya API ile:

```bash
curl -X POST http://localhost:8000/api/users \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "yenikullanici",
    "password": "guclu-sifre-123",
    "display_name": "Yeni Kullanici"
  }'
```

### Kullanicı Aktif/Pasif Yapma

```sql
-- Kullanicı pasif yap
UPDATE users SET is_active = false WHERE username = 'kullanici_adi';

-- Kullanicı aktif yap
UPDATE users SET is_active = true WHERE username = 'kullanici_adi';
```

### Kullanicı Silme

```sql
-- ONCE iliskili kayitlari temizle
DELETE FROM sessions WHERE user_id = '<user-id>';
DELETE FROM bookmarks WHERE user_id = '<user-id>';
DELETE FROM notes WHERE user_id = '<user-id>';
DELETE FROM vault_files WHERE user_id = '<user-id>';
DELETE FROM user_roles WHERE user_id = '<user-id>';
-- Sonra kullaniciyi sil
DELETE FROM users WHERE id = '<user-id>';
```

## Rol Atama / Role Assignment

### Mevcut Roller

| Rol | Aciklama |
|-----|----------|
| `admin` | Tam sistem yoneticisi |
| `editor` | Icerik duzenleyici |
| `viewer` | Sadece goruntuleme |
| `child-safe-viewer` | Cocuklar icin guvenli goruntuleme |

### Rol Atama (SQL)

```sql
-- Kullanicıya rol ata
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'kullanici_adi' AND r.name = 'editor';

-- Rolunu degistir (once eskisini kaldir)
DELETE FROM user_roles WHERE user_id = (SELECT id FROM users WHERE username = 'kullanici_adi');
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'kullanici_adi' AND r.name = 'viewer';
```

### Rol Atama (API)

```bash
curl -X POST http://localhost:8000/api/users/<user-id>/roles \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "editor"}'
```

### Kullanicı Rollarini Kontrol Etme

```sql
SELECT u.username, r.name, r.description, r.permissions
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'kullanici_adi';
```

## Kaynak Yapilandirmasi / Source Configuration

### Kaynak Listeleme

```bash
curl http://localhost:8000/api/sources \
  -H "Authorization: Bearer <admin-token>"
```

### Kaynak Durumunu Kontrol Etme

```sql
SELECT name, base_url, fetch_strategy, default_storage_mode,
       default_trust_level, is_active, last_sync_at, last_success_at,
       last_error, error_count, total_documents
FROM source_manifests
ORDER BY name;
```

### Kaynak Etkinlestirme/Devre Disi Birakma

```sql
-- Kaynak devre disi birak
UPDATE source_manifests SET is_active = false WHERE name = 'kaynak_adi';

-- Kaynak etkinlestir
UPDATE source_manifests SET is_active = true WHERE name = 'kaynak_adi';
```

### Kaynak Manuel Senkronizasyonu

```bash
# Belirli kaynagi senkronize et
curl -X POST http://localhost:8000/api/ingestion/sources/<kaynak-adi>/sync \
  -H "Authorization: Bearer <admin-token>"

# Tum kaynaklari senkronize et
curl -X POST http://localhost:8000/api/ingestion/sync \
  -H "Authorization: Bearer <admin-token>"
```

## Ingestion Izleme / Ingestion Monitoring

### Ingestion Run'larini Goruntuleme

```bash
curl http://localhost:8000/api/ingestion/runs \
  -H "Authorization: Bearer <admin-token>"
```

### Veritabanindan Ingestion Durumu

```sql
-- Son 20 ingestion run
SELECT
    sm.name as source,
    ir.status,
    ir.documents_found,
    ir.documents_fetched,
    ir.documents_indexed,
    ir.documents_failed,
    ir.started_at,
    ir.completed_at
FROM ingestion_runs ir
JOIN source_manifests sm ON ir.source_id = sm.id
ORDER BY ir.started_at DESC
LIMIT 20;

-- Basarisiz belgeler
SELECT title, source_url, ingestion_status, parse_status, review_status
FROM documents
WHERE ingestion_status = 'failed' OR parse_status = 'failed'
ORDER BY created_at DESC;
```

### Docker Loglari

```bash
# Worker loglarini izle
docker compose logs -f worker

# Son 100 satir
docker compose logs --tail=100 worker

# Belirli kaynagi filtrele
docker compose logs worker 2>&1 | grep "afad"
```

## Gozden Gecirme Kuyrugu Yonetimi / Review Queue Management

### Gozden Gecirme Bekleyen Belgeler

```sql
SELECT
    d.title,
    d.source_url,
    d.trust_level,
    d.rights_status,
    d.storage_mode,
    r.priority,
    r.created_at
FROM review_queue r
JOIN documents d ON r.document_id = d.id
WHERE r.status = 'review_needed'
ORDER BY r.priority DESC, r.created_at ASC;
```

### Belge Onaylama

```sql
-- Onaylama
UPDATE review_queue
SET status = 'approved', review_result = 'approved', reviewed_at = NOW()
WHERE document_id = '<document-id>';

UPDATE documents
SET review_status = 'approved'
WHERE id = '<document-id>';

-- Reddetme
UPDATE review_queue
SET status = 'rejected', review_result = 'rejected', reviewed_at = NOW(), notes = 'Red sebebi'
WHERE document_id = '<document-id>';

UPDATE documents
SET review_status = 'rejected'
WHERE id = '<document-id>';
```

## Ayarlar Yonetimi / Settings Management

### Mevcut Ayarlari Goruntuleme

```sql
SELECT key, value, description, is_system, updated_at
FROM settings
ORDER BY key;
```

### Varsayilan Ayarlar

| Key | Varsayilan | Aciklama |
|-----|-----------|----------|
| `app.language` | `"tr"` | Varsayilan uygulama dili |
| `ai.default_model` | `"qwen2.5:7b-instruct"` | Varsayilan AI modeli |
| `ai.embedding_model` | `"nomic-embed-text:latest"` | Varsayilan embedding modeli |
| `ai.official_only_default` | `false` | AI icin varsayilan resmi kaynak modu |
| `ai.child_safe_default` | `true` | AI icin varsayilan cocuk guvenli mod |
| `storage.max_gb` | `100` | Maksimum depolama alani (GB) |
| `network.lan_mode` | `false` | LAN modu |
| `search.results_per_page` | `20` | Arama sayfa basina sonuc |

### Ayar Guncelleme

```sql
-- Ayar guncelleme
UPDATE settings
SET value = '"en"', updated_at = NOW()
WHERE key = 'app.language';

-- Yeni ayar ekleme
INSERT INTO settings (key, value, description, is_system)
VALUES ('custom.setting', '"value"', 'Aciklama', false);
```

### API ile Ayar Guncelleme

```bash
# Ayar guncelle
curl -X PUT http://localhost:8000/api/settings/app.language \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"value": "en"}'
```

## Yedekleme ve Geri Yukleme / Backup & Restore

### Yedekleme

```bash
# Makefile ile
make backup

# Manuel
bash scripts/backup.sh
```

**Yedek Icerigi:**
- PostgreSQL veritabani dump'i (binary veya SQL)
- `/storage` dizini (originals, extracted, vault, vb.)
- `/data` dizini
- `.env` dosyasi
- `checksums.sha256` (butunluk dogrulama)
- `manifest.json` (yedek meta verileri)

### Yedek Konumu

```
backups/
└── backup-YYYYMMDD_HHMMSS/
    ├── db_dump.dump (veya db_dump.sql)
    ├── storage.tar.gz
    ├── data.tar.gz
    ├── .env.backup
    ├── checksums.sha256
    └── manifest.json
```

### Geri Yukleme

```bash
# Makefile ile
make restore BACKUP_DIR=backups/backup-YYYYMMDD_HHMMSS

# Manuel
bash scripts/restore.sh backups/backup-YYYYMMDD_HHMMSS
```

**Geri Yukleme Adimlari:**
1. Mevcut veritabani silinir
2. Yedekten veritabani geri yuklenir
3. Storage ve data dizinleri geri yuklenir
4. `.env` dosyasi geri yuklenir
5. Checksum'lar dogrulanir

### Otomatik Yedekleme (Cron)

```bash
# Her gun saat 02:00'de yedek al
0 2 * * * cd /path/to/prepturk && bash scripts/backup.sh
```

## Sistem Saglik Kontrolleri / System Health Checks

### Health Endpoint

```bash
curl http://localhost:8000/api/health | python -m json.tool
```

### Makefile Komutu

```bash
make health
```

### Manuel Kontroller

```bash
# Docker servis durumu
docker compose ps

# Veritabani baglantisi
docker compose exec db pg_isready -U nomad

# Qdrant saglik kontrolu
curl http://localhost:6333/healthz

# API saglik kontrolu
curl http://localhost:8000/api/health

# Frontend erisimi
curl -I http://localhost:3000
```

### Saglik Kontrol SQL

```sql
-- Toplam belge sayisi
SELECT COUNT(*) FROM documents WHERE deleted_at IS NULL;

-- Indekslenmis belge sayisi
SELECT COUNT(*) FROM documents WHERE indexed_at IS NOT NULL;

-- Gozden gecirme bekleyen belgeler
SELECT COUNT(*) FROM review_queue WHERE status = 'review_needed';

-- Aktif kullanicı sayisi
SELECT COUNT(*) FROM users WHERE is_active = true;

-- Aktif oturum sayisi
SELECT COUNT(*) FROM sessions WHERE expires_at > NOW();

-- Son denetim kayitlari
SELECT action, resource_type, created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;
```

## Sik Karsilasilan Sorunlar / Troubleshooting Common Issues

### Problem: Veritabani Baglantisi Basarisiz

**Belirtiler:**
- `Connection refused` hatasi
- API baslamiyor

**Cozum:**
```bash
# Veritabani konteynerini kontrol et
docker compose ps db

# Veritabani yeniden baslat
docker compose restart db

# Loglari kontrol et
docker compose logs db

# Gerekirse veritabanini yeniden olustur
docker compose down -v db
docker compose up -d db
# NOT: Veriler silinir! Once yedek alin.
```

### Problem: Ollama Baglanamiyor

**Belirtiler:**
- AI yanit vermiyor
- `Connection refused` veya timeout

**Cozum:**
```bash
# Ollama'nin calistigini kontrol et
curl http://localhost:11434/api/tags

# Model yuklu mu kontrol et
ollama list

# Gerekirse modeli yukle
ollama pull qwen2.5:7b-instruct
ollama pull nomic-embed-text

# .env dosyasinda URL'yi kontrol et
# OLLAMA_BASE_URL=http://host.docker.internal:11434
```

### Problem: Qdrant Collection Bulunamadi

**Belirtiler:**
- Embedding kaydi basarisiz
- Vektor aramasi calismiyor

**Cozum:**
```bash
# Qdrant collection'larini kontrol et
curl http://localhost:6333/collections

# Gerekirse collection olustur
curl -X PUT http://localhost:6333/collections/documents \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 768,
      "distance": "Cosine"
    }
  }'
```

### Problem: Web Arayuzu Acilmiyor

**Belirtiler:**
- `http://localhost:3000` acilmiyor
- 502 Bad Gateway

**Cozum:**
```bash
# Frontend konteynerini kontrol et
docker compose ps web

# Frontend loglarini kontrol et
docker compose logs web

# Frontend yeniden baslat
docker compose restart web

# Port cakismasini kontrol et
netstat -tulpn | grep 3000
```

### Problem: Ingestion Run Takiliyor

**Belirtiler:**
- Run uzun suredir `running` durumunda
- Ilerleme kaydedilmiyor

**Cozum:**
```sql
-- Run'i iptal et
UPDATE ingestion_runs
SET status = 'cancelled', completed_at = NOW()
WHERE status = 'running' AND started_at < NOW() - INTERVAL '1 hour';
```

```bash
# Worker'i yeniden baslat
docker compose restart worker

# Rate limit'i dusur (manifest'te)
# rate_limit_per_minute: 10 --> 5
```

## LAN Modu Yapilandirmasi / LAN Mode Configuration

### LAN Modunu Etkinlestirme

`.env` dosyasinda:

```env
LAN_MODE=true
LAN_ALLOWED_IPS=192.168.1.0/24
```

### Caddy Yapilandirmasi

LAN modunda Caddy'nin tum arayuzleri dinlemesi gerekir:

```
# infra/caddy/Caddyfile
http://:80 {
    encode gzip

    handle /* {
        reverse_proxy web:3000
    }

    handle /api/* {
        reverse_proxy api:8000
    }
}
```

### Erisim

LAN'daki diger cihazlar `http://<sunucu-ip>:80` uzerinden erisebilir.

### Guvenlik Onlemleri

- Yalnizca guvenilir aglarda LAN modunu acin
- MUMKUNSE IP izin listesi kullanin
- Uretim ortamlarinda HTTPS yapilandirin
- Gereksiz servisleri kapatin

## AI Model Yonetimi / AI Model Management

### Model Degistirme

`.env` dosyasinda:

```env
# Orta seviye
OLLAMA_MODEL=qwen2.5:7b-instruct

# Guclu sunucu
OLLAMA_MODEL=mixtral:8x7b-instruct
```

```bash
# Yeni modeli yukle
ollama pull mixtral:8x7b-instruct

# Sistem yeniden baslat
docker compose restart api worker
```

### Embedding Modeli Degistirme

```env
OLLAMA_EMBEDDING_MODEL=nomic-embed-text:latest
```

Embedding modeli degistirildiginde tum mevcut embedding'ler yeniden hesaplanmalidir.

### Model Kaldirma

```bash
# Kullanilmayan modeli kaldir
ollama rm eski-model-adi
```

### OpenAI Alternatifi

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OLLAMA_MODEL=gpt-4o
```

**Not:** OpenAI kullaniminda internet baglantisi gerekir ve cevrimdisi calisma ozelligi kaybolur.
