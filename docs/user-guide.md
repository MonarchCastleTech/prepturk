# Kullanici Kilavuzu / User Guide

## Baslangic / Getting Started

### Sisteme Erisim

1. Tarayicinizda `http://localhost:3000` adresine gidin
2. Giris sayfasinda kullanici adi ve sifrenizi girin
3. "Giris Yap" butonuna tiklayin

### Ilk Kurulum

Sistem ilk kez acildiginda kurulum sihirbazi sizi yonlendirir:

1. Yonetici hesabi olusturun
2. Modulleri secin
3. Il paketlerini yukleyin
4. Ilk senkronizasyonu baslatin

### Demo Hesap

Demo veri yuklendiyse:
- Kullanici adi: `admin`
- Sifre: `admin123456`

**Not:** Demo sifreyi mutlaka degistirin.

## Navigasyon / Navigation Overview

### Ana Sayfa (Dashboard)

`/dashboard` - Sisteme giris yaptiginizda ilk gordugunuz sayfa:

- Toplam belge sayisi
- Son eklenen belgeler
- Aktif kaynaklar
- Il paketleri durumu
- Hızlı arama cubugu

### Ana Menu

| Menu | URL | Aciklama |
|------|-----|----------|
| Dashboard | `/dashboard` | Genel bakis |
| Belgeler | `/documents` | Tum belgeler |
| Arama | `/search` | Gelmis arama |
| AI Sohbet | `/ai-chat` | AI asistan |
| Egitim | `/education` | Egitim materyalleri |
| Haritalar | `/maps` | Harita gorunumu |
| Notlar | `/notes` | Kisisel notlar |
| Kasa | `/vault` | Sifreli kasa |
| Il Paketleri | `/province-packs` | Il paketleri |
| Yonetim | `/admin` | Yonetim paneli (admin) |

## Dashboard

Dashboard sayfasinda asagidaki bilesenler bulunur:

### Istatistik Kartlari

- **Toplam Belge**: Sisteme yuklenen belge sayisi
- **Indekslenmis**: Vektor indeksi olusturulan belge sayisi
- **Gozden Gecirme Bekleyen**: Review kuyrugundaki belge sayisi
- **Aktif Kaynaklar**: Etkin kaynak manifest sayisi

### Son Eklenen Belgeler

En son eklenen 5-10 belge listelenir:
- Belge basligi
- Kurum
- Guvenilirlik rozeti (Resmî/Kurumsal/Topluluk/Kisisel)
- Eklenme tarihi

### Hızlı Arama

Dashboard uzerinden dogrudan arama yapabilirsiniz.

## Belge Goruntuleme / Documents

### Belge Listesi

`/documents` sayfasinda tum belgeler listelenir:

**Filtreleme Secenekleri:**
- Kategori (Resmî Cekirdek, Afet ve Acil Durum, Saglik, vb.)
- Guvenilirlik duzeyi (Resmî, Kurumsal, Topluluk, Kisisel)
- Il
- Kurum
- Depolama modu

**Sirlama:**
- En yeni
- En eski
- Basliga gore (A-Z)
- Guvenilirlik seviyesine gore

### Belge Detay Sayfasi

Bir belgeye tikladiginizda:

- **Baslik ve Ozet**: Belgenin basligi ve ozeti
- **Kaynak Bilgileri**: Kaynak URL, kurum, guvenilirlik rozeti
- **Metadata**: Yayin tarihi, edinme tarihi, SHA256, dosya formati
- **Icerik**: Cikarilan metin (varsa)
- **Ilgili Belgeler**: Baglantili belgeler
- **Not Ekle**: Belgeye kisisel not ekleme

### Belge Indirme

- `mirrored` belgeler: Tam dosya indirilebilir (PDF, HTML)
- `cached` belgeler: Onbellekten erisim
- `pointer-only` belgeler: Yalnizca kaynak URL'ye yonlendirme

## Arama / Searching Documents

### Arama Sayfasi

`/search` sayfasinda gelismis arama yapabilirsiniz:

### Arama Turleri

1. **Tam Metin Aramasi (FTS)**
   - PostgreSQL tsvector uzerinde arama
   - Baslik, ozet, kurum alanlarinda
   - Turkce karakter destegi (unaccent)

2. **Semantik Arama (Vektor)**
   - Qdrant uzerinde benzerlik aramasi
   - Anlamsal eslesme
   - Dogal dil sorgulari

3. **Hibrit Arama**
   - Her iki yontem birlestirilir
   - En ilgili sonuclar ustte

### Arama Filtreleri

- Kategori
- Guvenilirlik duzeyi
- Il / Ilce
- Kurum
- Tarih araligi
- Depolama modu
- Cocuk guvenli icerik

### Arama Sonuclari

Her sonuc kartinda:
- Baslik
- Ozet (ilk 200 karakter)
- Guvenilirlik rozeti
- Kurum
- Iliskili etiketler
- Eslesme skoru

## AI Asistan / Using AI Assistant

### AI Sohbet Sayfasi

`/ai-chat` sayfasinda AI asistan ile sohbet edebilirsiniz.

### Modlar

| Mod | Aciklama |
|-----|----------|
| `default` | Standart yanit |
| `explain_15` | 15 yasinda bir gence anlatir gibi |
| `step_by_step` | Adim adim aciklama |
| `compare` | Farkli kaynaklardan karsilastirma |

### Ayarlar

- **Official Only**: Yalnizca resmi kaynaklardan yanit
- **Child Safe**: Cocuk guvenli icerik
- **Vault Mode**: Yalnizca kasa dosyalarinda ara

### Sohbet Yonetimi

- Yeni sohbet baslat
- Onceki sohbetleri goruntule
- Sohbet sil
- Mesaj sil

### Citations (Kaynakca)

Her AI yaniti kaynakca icerir:
- Hangi belgelerin kullanildigi
- Alinti metni
- Guven skoru

## Egitim Rafi / Education Shelf

### Egitim Sayfasi

`/education` sayfasinda egitim materyallerine erisebilirsiniz:

### Icerik Tipleri

- MEB ders kitaplari
- EBA e-kitaplar
- OGM becerci temelli kitaplar
- Interaktif icerikler

### Kategoriye Gore Filtreleme

- Ilkokul
- Ortaokul
- Lise
- Genel egitim

### Cevrimdisi Erisim

Tum egitim materyalleri yerel olarak depolanir, internet baglantisi olmadan erisilebilir.

## Harita Gorunumu / Map Viewer

### Harita Sayfasi

`/maps` sayfasinda harita uzerinde bilgi goruntuleyebilirsiniz:

### Harita Katmanlari

- Il sinirlari
- Hastane konumlari
- Acil toplanma alanlari
- AFAD birimleri
- Meteoroloji istasyonlari

### Il Bazli Gorunum

Belirli bir ili sectiginizde:
- Il sinirlari vurgulanir
- Ilgili belgeler listelenir
- Acil durum iletisim bilgileri gosterilir

## Kisisel Kasa / Personal Vault

### Kasa Sayfasi

`/vault` sayfasinda kisisel belgelerinizi sifreli olarak saklayabilirsiniz.

### Dosya Yukleme

1. "Dosya Yukle" butonuna tiklayin
2. Dosyayi secin
3. Sifreleme anahtarinizi girin (ilk kullanimda olusturulur)
4. Yukleme tamamlanir

### Dosya Yonetimi

- Dosyalari goruntule
- Etiket ekle
- Indir (sifre cozulur)
- Sil

### Guvenlik

- Dosyalar AES-256-GCM ile sifrelenir
- Sifre cozme islemi istemci tarafinda yapilir
- Sunucu sifreli veriyi saklar, anahtari bilmez

### AI ile Kasa Aramasi

`vault_mode` etkinlestirildiginde AI asistan yalnizca kasa dosyalarinizda arama yapar.

## Not Yonetimi / Notes Management

### Notlar Sayfasi

`/notes` sayfasinda kisisel notlarinizi yonetebilirsiniz.

### Not Olusturma

1. "Yeni Not" butonuna tiklayin
2. Baslik girin
3. Icerik yazin
4. Etiket ekleyin (opsiyonel)
5. Il iliskilendirin (opsiyonel)
6. Ilgili belge baglayin (opsiyonel)
7. Kaydedin

### Not Tipleri

- **Genel**: Standart notlar
- **Acil Durum**: Acil durum notlari (ozel isaretleme)

### Not Ozellikleri

- Sabitleme (pin)
- Etiketleme
- Il iliskilendirme
- Belge baglama
- Arama

## Il Paketleri / Province Packs

### Il Paketleri Sayfasi

`/province-packs` sayfasinda il paketlerini yonetebilirsiniz:

### Paket Goruntuleme

- Mevcut paketler listelenir
- Her paketin detaylari goruntulenir
- Iletisim bilgileri
- Acil durum notlari

### Paket Ice Aktarma

1. "Paket Ice Aktar" butonuna tiklayin
2. ZIP dosyasini secin
3. Paket bilgilerini kontrol edin
4. Onaylayin

### Paket Disa Aktarma

1. Paketi secin
2. "Disa Aktar" butonuna tiklayin
3. ZIP dosyasi indirilir

## Klavye Kisayollari / Keyboard Shortcuts

| Kisayol | Aksiyon |
|---------|---------|
| `Ctrl+K` / `Cmd+K` | Arama cubugunu ac |
| `Ctrl+/` | Klavye kisayollari yardimi |
| `Escape` | Acik menuyu/pencereyi kapat |
| `Tab` | Sonraki odaklanilabilir oge |
| `Shift+Tab` | Onceki odaklanilabilir oge |
| `Enter` | Secimi onayla |
| `Arrow Keys` | Liste/sonuclar arasi gezinme |
| `Ctrl+N` | Yeni not olustur |
| `Ctrl+D` | Dokumanlara git |

### Erisilebilirlik

- Tum arayuz klavye ile gezinilebilir
- Yuksek kontrast modu desteklenir
- Turkce karakterler tam desteklenir
- Ekran okuyucu uyumlu

## Print-Friendly Ozellikleri / Print-Friendly Features

### Yazdirma

Belgeler yazdirma dostu formatla sunulabilir:

- Gereksiz arayuz elemanlari gizlenir
- Sadece icerik goruntulenir
- Kaynak bilgileri korunur
- Sayfa sonlari optimize edilir

### Yazdirma Ipuclari

1. Belge detay sayfasinda `Ctrl+P` yapin
2. Yazdirma onizlemesinde gereksiz elemanlar otomatik gizlenir
3. Kaynakca bilgileri alt kisimda yer alir

## Cocuk Guvenli Mod / Child-Safe Mode

### Nedir?

Cocuk guvenli mod, cocuklarin guvenli iceriklere erismesini saglar:

- Zararli veya uygunsuz icerikler filtrelenir
- Yalnizca `child_safe=true` olarak isaretlenen belgeler gosterilir
- AI yanitlari cocuklar icin uygun dilde uretilir

### Nasil Etkinlesir?

1. `child-safe-viewer` rolune sahip hesapla giris yapin
2. Veya ayarlardan cocuk guvenli modu acin

### Cocuk Guvenli Arayuz

- Basitlestirilmis menu
- Buyuk ikonlar
- Renkli guvenilirlik rozetleri
- Korunan AI sohbeti

## Sistem Durumunu Kontrol Etme

### Saglik Sayfasi

`/api/health` endpoint'i sistem durumunu gosterir:

```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "qdrant": "connected",
    "ollama": "connected"
  }
}
```

### Kullanici Bilgileri

Profil sayfasinda:
- Kullanici bilgileri
- Rol bilgileri
- 2FA durumu
- Oturum bilgileri

## Sik Kullanilan Islemler

### Belge Arama

1. Ust menuden "Arama"ya tiklayin
2. Arama cubuguna anahtar kelimeleri girin
3. Filtreleri uygulayin
4. Sonuclari goruntuleyin

### AI'ya Soru Sorma

1. "AI Sohbet"e gidin
2. Sorunuzu yazin
3. Mod secin (default, explain_15, step_by_step, compare)
4. "Gonder"e tiklayin
5. Yaniti ve kaynakcalari inceleyin

### Not Ekleme

1. "Notlar"a gidin
2. "Yeni Not" butonuna tiklayin
3. Baslik ve icerik girin
4. Kaydedin

### Il Paketi Yukleme

1. "Il Paketleri"ne gidin
2. "Paket Ice Aktar" butonuna tiklayin
3. ZIP dosyasini secin
4. Onaylayin
