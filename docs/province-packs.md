# Il Paketleri / Province Packs

## Genel Bakis / Overview

Il paketleri, belirli bir il icin afet hazirlik bilgilerini, resmi kaynaklari, iletisim bilgilerini ve acil durum notlarini bir arada iceren tasinabilir paketlerdir. Her il paketi bir YAML manifest dosyasi ile tanimlanir.

### Mevcut Paketler (`content/manifests/province-packs/`)

| Il | Kod | Bolge | Nufus |
|----|-----|-------|-------|
| Ankara | 06 | Ic Anadolu | 5.782.285 |
| Istanbul | 34 | Marmara | - |
| Izmir | 35 | Ege | - |
| Hatay | 31 | Akdeniz | - |
| Kahramanmaras | 46 | Akdeniz | - |
| Van | 65 | Dogu Anadolu | - |

## Paket Yapisi / Pack Structure

### YAML Manifest Yapisi

```yaml
id: ankara                         # Paket ID (genellikle il kisa adi)
province_code: "06"                # Il kodu (2 haneli)
province_name: Ankara              # Il adi
version: "1.0.0"                   # Paket versiyonu (semver)
generated_at: "2024-01-01T00:00:00Z"  # Olusturma zamani
description_tr: "Ankara ili afet hazirlik ve resmi kaynaklar paketi"
region: "İç Anadolu"               # Bolge adi
population: 5782285                # Nufus (opsiyonel)

contacts:                          # Acil durum iletisim bilgileri
  afad:
    name: "Ankara AFAD İl Müdürlüğü"
    phone: "0312-4470000"
    address: "Çankaya, Ankara"
    website: "https://ankara.afad.gov.tr"
  valilik:
    name: "Ankara Valiliği"
    phone: "0312-4102000"
    website: "https://ankara.gov.tr"
  saglik_il:
    name: "Ankara İl Sağlık Müdürlüğü"
    phone: "0312-4342700"
    website: "https://ankaraism.saglik.gov.tr"
  il_mem:
    name: "Ankara İl Milli Eğitim Müdürlüğü"
    phone: "0312-4152000"
    website: "https://ankara.meb.gov.tr"

emergency_notes:                   # Acil durum notlari
  - "Ankara deprem kuşağı üzerinde bulunan bir ildir."
  - "Kizilay ve Çankaya bölgeleri yogun yerleşim alanlaridir."
  - "Ankara'da çok sayida hastane ve saglik kurumu bulunmaktadir."

included_maps:                     # Dahil edilen haritalar
  - type: "province_boundary"
    source: "local"
  - type: "hospital_locations"
    source: "imported"
  - type: "emergency_assembly_areas"
    source: "user_defined"

rights_manifest:                   # Haklar manifesti
  official_documents: "public-download"
  institutional_documents: "public-read-limited-redistribution"
  user_content: "user-owned"
```

## YAML Semasi / YAML Schema

### Zorunlu Alanlar

| Alan | Tip | Aciklama | Ornek |
|------|-----|----------|-------|
| `id` | string | Paket tanimlayicisi | `ankara` |
| `province_code` | string | Il kodu (2 haneli) | `"06"` |
| `province_name` | string | Il adi | `Ankara` |
| `description_tr` | string | Turkce aciklama | `...` |
| `region` | string | Bolge adi | `İç Anadolu` |

### Opsiyonel Alanlar

| Alan | Tip | Varsayilan | Aciklama |
|------|-----|-----------|----------|
| `version` | string | `"1.0.0"` | Paket versiyonu |
| `generated_at` | string (ISO8601) | - | Olusturma zamani |
| `population` | integer | - | Il nufusu |
| `contacts` | object | `{}` | Iletisim bilgileri |
| `emergency_notes` | array[string] | `[]` | Acil durum notlari |
| `included_maps` | array[object] | `[]` | Harita tanimlari |
| `rights_manifest` | object | `{}` | Haklar tanimi |

### Contact Nesnesi Yapisi

Her contact girisi asagidaki alanlari ice rebilir:

| Alan | Tip | Aciklama |
|------|-----|----------|
| `name` | string | Kurum adi |
| `phone` | string | Telefon numarasi |
| `address` | string | Adres |
| `website` | string | Web sitesi URL'si |

### Map Nesnesi Yapisi

| Alan | Tip | Aciklama |
|------|-----|----------|
| `type` | string | Harita tipi (`province_boundary`, `hospital_locations`, `emergency_assembly_areas`, vb.) |
| `source` | string | Veri kaynagi (`local`, `imported`, `user_defined`) |

## Paket Olusturma / Creating Packs

### Yontem 1: Manuel YAML Olusturma

1. `content/manifests/province-packs/` dizininde yeni YAML dosyasi olusturun
2. Yukaridaki semaya uygun olarak doldurun
3. `make pack-<il-adi>` ile paketi build edin

### Yontem 2: Build Script Kullanma

```bash
# Ankara paketi olustur
python scripts/build_province_pack.py 06 --output ./packs --api-url http://localhost:8000

# Token ile (kimlik dogrulamali)
python scripts/build_province_pack.py 34 --output ./packs --api-url http://localhost:8000 --token <jwt-token>
```

### Build Script Is Akisi (`scripts/build_province_pack.py`)

```
[1. Province YAML Yukle]
         |
         v
[2. API'den Ilgili Belgeleri Sorgula]
   +-- province_code ile filtrele
   +-- emergency_guide kategori (province_code "00")
         |
         v
[3. Build Directory Olustur]
   {pack_id}-pack/
   ├── province.yaml          (kopya)
   ├── documents/             (belge metadata JSON'lari)
   │   ├── belge-1.json
   │   ├── belge-2.json
   │   └── ...
   ├── pack-manifest.json     (genel manifest)
   └── README.md              (ozet dosya)
         |
         v
[4. ZIP Archive Olustur]
   {pack_id}-pack.zip
```

### Makefile Komutlari

```bash
make pack-ankara          # Ankara paketi
make pack-istanbul        # Istanbul paketi
make pack-izmir           # Izmir paketi
make pack-hatay           # Hatay paketi
make pack-kahramanmaras   # Kahramanmaras paketi
make pack-van             # Van paketi
```

## Belge Dahil Etme / Including Documents

### Otomatik Dahil Etme

Build script, API'yi sorgulayarak il ile ilgili belgeleri otomatik olarak pakete ekler:

```python
# scripts/build_province_pack.py
def query_api_documents(province_code: str, api_url: str, token: str = None) -> list:
    # 1. Il koduna gore belgeleri sorgula
    response = httpx.get(f"{api_url}/api/documents", params={"province_code": province_code})

    # 2. Genel acil durum rehberlerini ekle (province_code "00")
    response = httpx.get(f"{api_url}/api/documents", params={
        "province_code": "00",
        "category": "emergency_guide"
    })
```

### Manuel Dahil Etme

YAML manifest'inde `included_documents` alani ile belirli belge ID'leri tanimlanabilir:

```yaml
included_documents:
  - "<document-uuid-1>"
  - "<document-uuid-2>"
```

### Dokuman Metadata JSON Yapisi

Paket icindeki her belge JSON dosyasi olarak saklanir:

```json
{
  "id": "<uuid>",
  "title": "Belge Basligi",
  "source_url": "https://...",
  "source_type": "afad",
  "category": "emergency_guide",
  "trust_level": "official",
  "province": "Ankara",
  "extracted_text_path": "/storage/extracted/belge.txt",
  "sha256": "abc123..."
}
```

## Iletisim Bilgileri / Contact Information

### Standart Contact Tipleri

| Tip | Aciklama | Zorunlu mu? |
|-----|----------|-------------|
| `afad` | AFAD Il Mudurlugu | Evet |
| `valilik` | Valilik | Evet |
| `saglik_il` | Il Saglik Mudurlugu | Evet |
| `il_mem` | Il Milli Egitim Mudurlugu | Hayir |
| `belediye` | Buyuksehir Belediyesi | Hayir |
| `jandarma` | Il Jandarma Komutanligi | Hayir |
| `itfaiye` | Itfaiye Mudurlugu | Hayir |
| `polis` | Emniyet Mudurlugu | Hayir |

### Contact Ekleme Ornegi

```yaml
contacts:
  afad:
    name: "Hatay AFAD İl Müdürlüğü"
    phone: "0326-0000000"
    address: "Antakya, Hatay"
    website: "https://hatay.afad.gov.tr"
  hospital:
    name: "Hatay Devlet Hastanesi"
    phone: "0326-0000001"
    address: "Antakya, Hatay"
```

## Acil Durum Notlari / Emergency Notes

`emergency_notes` alani, o ile ozgu acil durum bilgilerini icerir.

### Icerik Onerileri

- Deprem bolgesi bilgisi
- Riskli alanlar
- Onemli toplanma alanlari
- Bolgeye ozel riskler (sel, heyelan, vb.)
- Onemli kurum ve kuruluslar

### Ornek

```yaml
emergency_notes:
  - "Hatay 2023 Kahramanmaras depremlerinden en cok etkilenen illerden biridir."
  - "Antakya bolgesi yogun hasar gormustur."
  - "Samandag ve Payas sahilleri tsunami riski tasimaktadir."
  - "Bolgede cok sayida gecici barinma merkezi bulunmaktadir."
```

## Paket Dagitimi / Pack Distribution

### ZIP Paket Yapisi

```
ankara-pack.zip
└── ankara-pack/
    ├── province.yaml
    ├── pack-manifest.json
    ├── README.md
    └── documents/
        ├── afet-mudahale-plani.json
        ├── acil-toplanma-alanlari.json
        └── saglik-kurumlari.json
```

### DAGITIM Kanalları

1. **GitHub Releases**: Paketler GitHub uzerinden yayinlanabilir
2. **Dogrudan Indirme**: Web arayuzunden indirilebilir
3. **USB/Dagitim**: Cevrimdisi ortamlarda USB ile dagitilabilir
4. **API Uzerinden**: `/api/province-packs/import` ile yuklenebilir

## Ice Aktarma / Import

### Web Arayuzu ile

1. Admin Panel --> Il Paketleri
2. "Paket Ice Aktar" butonu
3. ZIP dosyasini secin
4. Onaylayin

### API ile

```bash
curl -X POST http://localhost:8000/api/province-packs/import \
  -H "Authorization: Bearer <token>" \
  -F "file=@ankara-pack.zip"
```

### Disa Aktarma / Export

```bash
curl -X GET http://localhost:8000/api/province-packs/ankara/export \
  -H "Authorization: Bearer <token>" \
  --output ankara-pack.zip
```

### Paket Dogrulama

Ice aktarma sirasinda:

1. `pack-manifest.json` parse edilir
2. SHA256 checksum'lar dogrulanir
3. Belge metadata'lari veritabanina eklenir
4. Iletisim bilgileri guncellenir

## Baslangic Paketleri / Starter Packs Overview

Sistemle birlikte gelen 6 baslangic paketi:

### Ankara (06)
- Bolge: Ic Anadolu
- Ozellik: Baskent, devlet kurumlari merkezi
- Icerik: AFAD planlari, hastane konumlari, toplanma alanlari

### Istanbul (34)
- Bolge: Marmara
- Ozellik: En buyuk sehir, deprem riski yuksek
- Icerik: Deprem hazirlik, afet planlari

### Izmir (35)
- Bolge: Ege
- Ozellik: Deprem riski, sahil sehri
- Icerik: Deprem ve tsunami hazirlik

### Hatay (31)
- Bolge: Akdeniz
- Ozellik: 2023 depremlerinden etkilenmis
- Icerik: Afet sonrası durum, barinma bilgileri

### Kahramanmaras (46)
- Bolge: Akdeniz
- Ozellik: 2023 depremlerinin merkezi
- Icerik: Afet bilgileri, yardim kurulyslari

### Van (65)
- Bolge: Dogu Anadolu
- Ozellik: 2011 depremlerinden etkilenmis
- Icerik: Deprem hazirlik, bolgesel bilgiler

## Paket Versiyonlama / Pack Versioning

Paketler semantik versiyonlama kullanir:

```
major.minor.patch
```

- **major**: Yapısal degisiklikler (yeni contact tipleri, alan degisiklikleri)
- **minor**: Yeni icerik eklemeleri (belgeler, notlar)
- **patch**: Hata duzeltmeleri (typo, duzeltilmis bilgiler)

### Versiyon Guncelleme

YAML manifest'inde `version` alanini guncelleyin:

```yaml
version: "1.1.0"  # Minor guncelleme
```

Build script `generated_at` alanini otomatik olarak gunceller.
