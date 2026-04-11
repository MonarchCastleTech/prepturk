# Guvenlik Dokumantasyonu / Security Documentation

## Tehtit Modeli / Threat Model

prepturk, afet ve acil durum bilgilerini iceren kritik bir sistem oldugundan, guvenlik tasarimin en onemli bilesenlerinden biridir. Asagidaki tehdit modellemesi sistemin guvenlik sinirlarini ve onlemlerini tanimlar.

### Varliklar / Assets

| Varlik | Hassasiyet | Ornek |
|--------|-----------|-------|
| Resmi belgeler (mirrored) | Dusuk-Orta | AFAD planlari, anayasa metinleri |
| Kullanici verileri | Yuksek | Sifreler, oturum tokenlari |
| Kasa dosyalari | Cok Yuksek | Kisisel sifreli belgeler |
| AI sohbet gecmişi | Orta | Sorulan sorular, verilen yanitlar |
| Sistem ayarlari | Orta | LAN modu, API anahtarlari |
| Denetim gunlukleri | Yuksek | Guvenlik olaylari, erisim kayitlari |

### Tehit Senaryolari / Threat Scenarios

| # | Senaryo | Olasilik | Etki | Onlem |
|---|---------|----------|------|-------|
| T1 | Yetkisiz erisim (dis agdan) | Orta | Yuksek | Varsayilan localhost, Caddy reverse proxy |
| T2 | Bruteforce saldirisi (login) | Yuksek | Orta | BCrypt hash, rate limiting, session kilitleme |
| T3 | Oturum ele gecirme | Orta | Yuksek | JWT token, guvenli cookie, expires_at |
| T4 | Veritabani sizintisi | Dusuk | Cok Yuksek | BCrypt sifre hash, minimum erisim |
| T5 | Kasa dosyasi ele gecirme | Dusuk | Cok Yuksek | AES-256-GCM sifreleme |
| T6 | Kaynak zehirlemesi | Orta | Yuksek | SHA256 dogrulama, trust level sistemi |
| T7 | XSS/CSRF (web arayuzu) | Orta | Orta | Next.js guvenlik onlemleri, CSRF token |
| T8 | Ag dinleme (LAN modu) | Orta | Yuksek | LAN modu uyarilari, IP izin listesi |

## Kimlik Dogrulama Akisi / Authentication Flow

### Giris Yapma

```
[Kullanici] --> [Email + Sifre] --> [POST /api/auth/login]
                                         |
                                         v
                                  [BCrypt Verify]
                                         |
                                    +----+----+
                                    |         |
                                 Basarili   Basarisiz
                                    |         |
                                    v         v
                          [JWT Token Olustur] [401 Yanit]
                                    |
                                    v
                          [Session DB'ye Kaydet]
                          (token, expires_at, ip, user_agent)
                                    |
                                    v
                          [2FA Kontrolu]
                               /      \
                         Aktif       Kapali
                           |           |
                           v           |
                    [TOTP Verify]      |
                           |           |
                      +----+----+      |
                      |         |      |
                   Basarili  Basarisiz  |
                      |         |      |
                      v         v      v
                  [200 + Token] [401] [200 + Token]
```

### JWT Token Yapisi

```python
# app/security/auth.py
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=settings.session_max_age_hours))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.app_secret_key, algorithm="HS256")
```

- **Algorithm**: HS256
- **Payload**: `{"sub": "<user_id>", "exp": <timestamp>}`
- **Süre**: Varsayilan 24 saat (`SESSION_MAX_AGE_HOURS`)
- **Secret**: `APP_SECRET_KEY` (.env dosyasinda tanimli)

### Token Dogrulama

Her korumali endpoint `get_current_active_user` dependency'si ile korunur:

```python
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = decode_access_token(credentials.credentials)
    user_id = token.get("sub")
    # User lookup and active status check
```

## Rol Tabanlı Erisim (RBAC) / Role-Based Access Control

### Roller / Roles

Sistemde 4 rol tanimlanmistir (`infra/db/init.sql`):

| Rol | Aciklama | İzinler |
|-----|----------|---------|
| `admin` | Tam sistem yoneticisi | `{"all": true}` - Tum islemler |
| `editor` | Icerik duzenleyici | `documents: [read, write, review]`, `sources: [read]`, `notes: [all]` |
| `viewer` | Sadece goruntuleme | `documents: [read]`, `search: [read]`, `notes: [own]` |
| `child-safe-viewer` | Cocuklar icin guvenli goruntuleme | `documents: [read_child_safe]`, `search: [read_child_safe]`, `ai: [child_safe]` |

### Rol Atama

Roller `user_roles` tablosu ile kullanıcılara atanir. Bir kullanici birden fazla role sahip olabilir.

```sql
-- Varsayilan roller init.sql ile yuklenir
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Tam sistem yoneticisi', '{"all": true}'),
('editor', 'Icerik duzenleyici', '{"documents": ["read", "write", "review"], "sources": ["read"], "notes": ["all"]}'),
('viewer', 'Sadece goruntuleme', '{"documents": ["read"], "search": ["read"], "notes": ["own"]}'),
('child-safe-viewer', 'Cocuklar icin guvenli goruntuleme', '{"documents": ["read_child_safe"], "search": ["read_child_safe"], "ai": ["child_safe"]}');
```

### Rol Kontrolu Ornegi

```python
async def require_admin(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Role).join(UserRole).where(UserRole.user_id == current_user.id)
    )
    user_roles = result.scalars().all()
    if not any(role.name == "admin" for role in user_roles):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yonetici yetkisi gerekli")
    return current_user
```

## Sifre Hashleme / Password Hashing

Sistem **BCrypt** algoritmasini kullanir:

```python
# app/security/auth.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

### Sifre Guvenlik Standartlari

- BCrypt otomatik tuz (salt) olusturur
- Varsayilan work factor: passlib varsayilani (12 round)
- Sifreler asla duz metin olarak saklanmaz
- Sifre sifirlama islemleri denetim gunlugune kaydedilir

## Oturum Yonetimi / Session Management

### Session Tablosu

| Alan | Tip | Aciklama |
|------|-----|----------|
| id | UUID | Oturum ID'si |
| user_id | UUID | Kullanici referansi |
| token | VARCHAR(512) | JWT token |
| expires_at | TIMESTAMP | Oturum sona erme zamani |
| created_at | TIMESTAMP | Oturum olusturma zamani |
| last_activity | TIMESTAMP | Son aktivite zamani |
| ip_address | INET | Giris yapilan IP adresi |
| user_agent | TEXT | Tarayici bilgisi |

### Oturum Guvenligi

- JWT token'lar `expires_at` zamanina kadar gecerlidir
- `SESSION_COOKIE_SECURE=false` varsayilan (gelistirme modu). Uretimde `true` yapilmalidir
- Oturumlar veritabaninda takip edilir, gerektiğinde iptal edilebilir
- Kullanici sifresini degistirdiginde tum oturumlar sonlandirilabilir

## TOTP 2FA Kurulumu / TOTP Two-Factor Authentication

Sistem TOTP (Time-based One-Time Password) 2FA'yi destekler.

```python
# app/security/auth.py
def verify_totp(token: str, secret: str) -> bool:
    import pyotp
    totp = pyotp.TOTP(secret)
    return totp.verify(token)
```

### 2FA Akisi

```
[Kullanici] --> [Hesap Ayarlari] --> [2FA Etkinlestir]
                                         |
                                         v
                                  [TOTP Secret Olustur]
                                  (pyotp.random_base32())
                                         |
                                         v
                                  [QR Code Goster]
                                  (kullanici Authenticator uygulamasina okutur)
                                         |
                                         v
                                  [Dogrulama Kodu Gir]
                                  (6 haneli kod)
                                         |
                                    +----+----+
                                    |         |
                                 Dogru     Yanlis
                                    |         |
                                    v         v
                          [totp_enabled = true] [Hata]
                                    |
                                    v
                          [Yedek Kodlar Goster]
                          (guvenli yerde saklanmali)
```

### Kullanici Modelinde 2FA Alanlari

- `totp_secret`: TOTP gizli anahtari (VARCHAR 255)
- `totp_enabled`: 2FA etkinlesme durumu (BOOLEAN)

## Ag Guvenligi / Network Security

### Varsayilan: Localhost Mode

Varsayilan olarak sistem yalnizca `localhost` uzerinden erisilebilir:

- Caddy: `http://localhost:80`
- Web: `http://localhost:3000`
- API: `http://localhost:8000`

Dis erisim mumkun degildir.

### LAN Modu

LAN modu `.env` dosyasinda `LAN_MODE=true` ayarlanarak etkinlestirilir:

```env
LAN_MODE=true
LAN_ALLOWED_IPS=192.168.1.0/24
```

**LAN Modu Uyarilari:**

- Yerel agdaki tum cihazlar sunucuya erisebilir
- IP izin listesi yapilandirmaniz onemle tavsiye edilir
- Guvenli olmayan aglarda (halka acik WiFi) ek onlemler alinmalidir
- Uretim ortamlarinda TLS sifreleme kullanılmalıdır

### Caddy Reverse Proxy Guvenligi

```
# infra/caddy/Caddyfile
http://localhost:80 {
    encode gzip
    servers {
        max_header_size 10MB
    }

    handle /* {
        reverse_proxy web:3000
    }

    handle /api/* {
        reverse_proxy api:8000
    }

    handle /health {
        reverse_proxy api:8000
    }
}
```

Uretim ortamlarinda `http://` yerine `https://` kullanılmalı ve TLS sertifikasi yapilandirilmalidir.

## Kasa Sifreleme / Vault Encryption

Kullanici kisisel belgeleri AES-256-GCM algoritmasi ile sifrelenir.

### VaultFile Modeli

| Alan | Deger |
|------|-------|
| encryption_algorithm | `aes-256-gcm` (sabit) |
| encrypted_path | Sifreli dosyanin depolama yolu |
| sha256 | Sifrelenmemis dosyanin hash degeri |
| file_size_bytes | Dosya boyutu |

### Sifreleme Prensipleri

- Her kullanici kendi kasa anahtarina sahiptir
- Sifreleme istemci tarafinda (client-side) yapilabilir
- Sunucu sifreli veriyi saklar, anahtari bilmez
- Kasa dosyalari API uzerinden erisilir, dogrudan dosya sistemi erisimi yoktur

### Depolama Yapisi

```
/app/storage/vault/
  ├── <user_id>/
  │   ├── <encrypted_file_1>.enc
  │   ├── <encrypted_file_2>.enc
  │   └── ...
  └── ...
```

## Denetim Gunlugu / Audit Logging

Tum kritik islemler `audit_logs` tablosuna kaydedilir.

### AuditLog Modeli

| Alan | Tip | Aciklama |
|------|-----|----------|
| id | UUID | Kayit ID |
| user_id | UUID | Islemi yapan kullanici |
| action | VARCHAR(100) | Islem tipi (login, document_create, vault_access, vb.) |
| resource_type | VARCHAR(50) | Etkilenen kaynak turu |
| resource_id | UUID | Etkilenen kaynak ID |
| details | JSONB | Islem detaylari |
| ip_address | INET | Islemi yapan IP |
| user_agent | TEXT | Tarayici bilgisi |
| created_at | TIMESTAMP | Islem zamani |

### Gunluklenen Islem Tipleri

- `login` / `logout` - Kullanici giris/cikis
- `login_failed` - Basarisiz giris denemesi
- `document_create` / `document_update` / `document_delete` - Belge islemleri
- `vault_upload` / `vault_download` / `vault_delete` - Kasa islemleri
- `settings_update` - Sistem ayari degisikligi
- `role_change` - Rol degisikligi
- `source_sync` - Kaynak senkronizasyonu
- `2fa_enabled` / `2fa_disabled` - 2FA durum degisikligi

## En Iyi Guvenlik Uygulamalari / Security Best Practices

### Kurulum Sonrasi Yapilmasi Gerekenler

1. **APP_SECRET_KEY'i degistirin**: Varsayilan gelistirme anahtarini kesinlikle kullanmayin
   ```env
   APP_SECRET_KEY=<openssl rand -hex 32 ile olusturun>
   ```

2. **Veritabani sifresini degistirin**:
   ```env
   POSTGRES_PASSWORD=<gucilu-rastgele-sifre>
   ```

3. **Qdrant API anahtarini degistirin**:
   ```env
   QDRANT_API_KEY=<gucilu-rastgele-anahtar>
   ```

4. **Uretimde HTTPS kullanin**: Caddy yapilandirmasini `https://` seklinde guncelleyin

5. **LAN modunu sadece gerektiginde acin**: `LAN_MODE=false` varsayilan

6. **SESSION_COOKIE_SECURE=true` yapin**: Uretim ortamlarinda

7. **Duzenli yedek alin**: `make backup` ile otomatik yedekleme yapin

8. **Denetim gunluklerini izleyin**: `audit_logs` tablosunu periyodik olarak kontrol edin

9. **Gereksiz kaynaklari devre disi birakin**: Kullanilmayan source manifest'lerde `is_active=false` yapin

10. **Sistem guncellemelerini takip edin**: Docker imajlarini ve bagimliliklari guncel tutun

## Sertlestirme Kontrol Listesi / Hardening Checklist

### Ag Guvenligi

- [ ] Varsayilan localhost modu kullaniliyor
- [ ] LAN modu gerekiyorsa `LAN_ALLOWED_IPS` sinirlandirildi
- [ ] Uretimde HTTPS etkin
- [ ] Gereksiz portlar kapali
- [ ] Docker ag izolasyonu yapildi

### Kimlik Dogrulama

- [ ] Guclu `APP_SECRET_KEY` tanimlandi
- [ ] Guclu veritabani sifresi kullaniliyor
- [ ] 2FA kullanıcılara ozendiriliyor
- [ ] Oturum sureleri makul (24 saat)
- [ ] Basarisiz giris denemeleri izleniyor

### Veri Guvenligi

- [ ] Sifreler BCrypt ile hash'lendi
- [ ] Kasa dosyalari AES-256-GCM ile sifrelenmis
- [ ] SHA256 checksum dogrulama aktif
- [ ] Denetim gunlukleri kaydediliyor
- [ ] Duzenli yedek aliniyor

### Uygulama Guvenligi

- [ ] Rate limiting etkin (`RATE_LIMIT_PER_MINUTE=60`)
- [ ] Input validasyonlari yapiliyor
- [ ] SQL injection koruması (parameterize sorgular)
- [ ] XSS koruması (Next.js otomatik escaping)
- [ ] Kaynak robots.txt uyumu kontrol ediliyor

### Isletim Sistemi / Docker

- [ ] Docker imajlari guncel
- [ ] Gereksiz servisler calismiyor
- [ ] Dosya sistemi izinleri dogru
- [ ] Log rotasyonu yapilandirildi
- [ ] Container resource limitleri tanimlandi

## Guvenlik Olaylarina Mudahale / Security Incident Response

### Veri Sizintisi Suphesi

1. Denetim gunluklerini kontrol edin: `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100;`
2. Supheli oturumlari tespit edin: `SELECT * FROM sessions WHERE last_activity > NOW() - INTERVAL '1 hour';`
3. Gerekirse oturumlari sonlandirin: `DELETE FROM sessions WHERE user_id = '<user_id>';`
4. Etkilenen kullanicilarin sifrelerini sifirlayin
5. `.env` dosyasindaki tum anahtarlari degistirin

### Bruteforce Saldirisi

1. Basarisiz giris denemelerini izleyin
2. Rate limiting ayarlarini gozden gecirin
3. Saldiri kaynagini engelleyin (IP bazinda)
4. Etkilenen hesaplari gecici olarak kilitleyin
