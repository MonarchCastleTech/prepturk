# prepturk Yol Haritasi

Bu doküman projenin gelisim asama ve planlarini içerir.

---

## Faz 1: MVP (Tamamlandi)

**Durum**: ✅ Tamamlandi

### Temel Altyapi
- [x] Monorepo yapilandirma
- [x] Docker Compose kurulumu
- [x] PostgreSQL veritabani
- [x] Qdrant vector veritabani
- [x] FastAPI backend
- [x] Next.js frontend
- [x] Caddy reverse proxy

### Kimlik Dogrulama ve Güvenlik
- [x] Yerel kullanici hesaplari
- [x] BCrypt sifre hash'leme
- [x] JWT token yönetimi
- [x] Rol tabanlı erisim (RBAC)
  - [x] admin
  - [x] editor
  - [x] viewer
  - [x] child-safe-viewer
- [x] TOTP 2FA destegi
- [x] Denetim günlügü

### Belge Yönetimi
- [x] Belge CRUD islemleri
- [x] Metadata semasi (40+ alan)
- [x] Güvenlik rozetleri
- [x] Haklar durumu
- [x] Depolama modlari
- [x] Sürüm takibi
- [x] Kaynakça zinciri
- [x] PDF/HTML önizleme

### Kaynak Uyarlayicilari
- [x] 36 resmî kaynak tanimi
- [x] HTML uyarlayici
- [x] PDF uyarlayici
- [x] Pointer-only uyarlayici
- [x] Kaynak manifestolari (YAML)
- [x] Zamanlama (cron jobs)

### Ingestion Pipeline
- [x] Otomatik içerik çekme
- [x] PDF metin çikarma
- [x] HTML metin çikarma (trafilatura)
- [x] OCR entegrasyonu (Tesseract)
- [x] Metin bölme (chunking)
- [x] Embedding olusturma (Ollama)
- [x] Qdrant indeksleme
- [x] Denetim kuyrugu

### Arama
- [x] PostgreSQL full-text search
- [x] Türkçe karakter normalizasyonu
- [x] Fuzzy eslestirme
- [x] Faceted arama
- [x] Resmi kaynak filtreleri
- [x] Önerilen aramalar

### AI Asistan
- [x] Ollama entegrasyonu
- [x] RAG pipeline
- [x] Kaynakça zorunlulugu
- [x] Güven göstergesi
- [x] Modlar:
  - [x] Varsayilan
  - [x] Sadece resmî
  - [x] Çocuga güvenli
  - [x] Adim adim
  - [x] Karsilastirma
  - [x] Acil durum
  - [x] Kisisel kasa

### Il Paketleri
- [x] Il paketi yapisi (YAML)
- [x] 6 baslangiç paketi (Ankara, Istanbul, Izmir, Hatay, Kahramanmaras, Van)
- [x] Il temas bilgileri
- [x] Il afet notlari
- [x] Paket olusturma scripti

### Kisisel Kasa
- [x] AES-256-GCM sifreleme
- [x] Dosya yükleme/indirme
- [x] Etiketleme
- [x] Özel AI asistan modu

### Yedekleme
- [x] Tam yedekleme scripti
- [x] Geri yükleme scripti
- [x] SHA256 dogrulama

---

## Faz 2: Il Ekosistemi

**Durum**: Planlaniyor
**Öncelik**: Yüksek
**Tahmini**: 2025 Q2-Q3

### Genisletilmis Il Kapsami
- [ ] 81 il tam paket
- [ ] Il müdürlükleri uyarlayicilari
- [ ] Valilik sayfasi içerikleri
- [ ] Il saglik müdürlükleri rehberleri
- [ ] Il MEM materyalleri

### Toplum Katilimi
- [ ] Topluluk katkili içerik sistemi
- [ ] Topluluk dogrulama mekanizmasi
- [ ] Kullanici derecelendirme
- [ ] STK içerik ortakliklari

### Mobil Uygulama
- [ ] React Native mobil uygulama
- [ ] Çevrimdisi erisim
- [ ] Acil durum bildirimleri
- [ ] Konum tabanlı bilgiler

### Harita Gelisitirmeleri
- [ ] PMTiles çevrimdisi haritalar
- [ ] Il/ilçe sinirlari
- [ ] Mahalle katmanlari
- [ ] GPX/KML import
- [ ] Acil toplanma alanlari veritabani

---

## Faz 3: Derin Egitim

**Durum**: Planlaniyor
**Öncelik**: Orta
**Tahmini**: 2025 Q3-Q4

### Kolibri Entegrasyonu
- [ ] Kolibri içerik senkronizasyonu
- [ ] Kurs katalog sistemi
- [ ] Ögrenme takibi
- [ ] Ilerleme raporlari

### Interaktif Içerik
- [ ] HTML5 interaktif kitaplar
- [ ] Video içerik destegi
- [ ] Quiz ve alistirma modülü
- [ ] Sinav hazirlik araçlari

### Egitim Analitik
- [ ] Ögrenme analitikleri
- [ ] Içerik popülerlik raporlari
- [ ] Eksik içerik tespiti
- [ ] Öneri sistemi

---

## Faz 4: Gelismis AI ve Aile Isbirligi

**Durum**: Planlaniyor
**Öncelik**: Düsük-Orta
**Tahmini**: 2026 Q1-Q2

### Gelismis AI
- [ ] Çoklu AI model destegi
- [ ] Model karsilastirma
- [ ] Otomatik özetleme
- [ ] Çeviri destegi
- [ ] Sesli yanit (TTS)

### Aile Isbirligi
- [ ] Aile acil durum plani
- [ ] Bulusma noktalari koordinasyonu
- [ ] Kisisel rehber senkronizasyonu
- [ ] Guvenli aile agi

### Arastirma Araci
- [ ] Akademik arastirma modu
- [ ] Karsilastirmali analiz
- [ ] Zaman serisi analizi
- [ ] Veri görsellestirme

---

## Öncelik Özeti

| Öncelik | Özellikler | Zaman Çerçevesi |
|---------|------------|-----------------|
| **Yüksek** | 81 il paket, mobil uygulama | 2025 Q2-Q3 |
| **Orta** | Kolibri, interaktif içerik | 2025 Q3-Q4 |
| **Düsük** | Gelismis AI, aile isbirligi | 2026 Q1-Q2 |

---

## Katkida Bulunma

Bu yol haritasina katkida bulunmak için GitHub Issues kullanin veya bir Pull Request açin.
