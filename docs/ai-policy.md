# AI Politikasi / AI Policy

## Genel Bakis / Overview

prepturk, yerel belgeler uzerinden RAG (Retrieval Augmented Generation) tabanlı bir AI asistan sunar. AI modeli tamamen yerel olarak calisir (Ollama), internet baglantisi gerektirmez ve her yanit kaynakcalardir.

## AI Model Yapilandirmasi / AI Model Configuration

### Varsayilan Ayarlar

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=qwen2.5:7b-instruct
OLLAMA_EMBEDDING_MODEL=nomic-embed-text:latest
```

### Model Secenekleri

| Ayar | Varsayilan | Aciklama |
|------|-----------|----------|
| `AI_PROVIDER` | `ollama` | AI saglayici (ollama veya openai) |
| `OLLAMA_MODEL` | `qwen2.5:7b-instruct` | Sohbet modeli |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text:latest` | Embedding modeli |
| `OPENAI_API_KEY` | (bos) | OpenAI kullaniliyorsa API anahtari |
| `OPENAI_BASE_URL` | (bos) | OpenAI alternatif base URL |

### Model Secim Rehberi / Model Selection Guide

| Donanim | Sohbet Modeli | Embedding Modeli | RAM Gereksinimi |
|---------|--------------|------------------|-----------------|
| Dusuk (AI'siz) | Kapali | Kapali | 4GB |
| Orta | `qwen2.5:7b-instruct` | `nomic-embed-text` | 16GB |
| Guclu | `mixtral:8x7b-instruct` | `nomic-embed-text` | 32GB+ |

### Model Yukleme

```bash
# Sohbet modelini yukle
ollama pull qwen2.5:7b-instruct

# Embedding modelini yukle
ollama pull nomic-embed-text
```

## RAG Pipeline

### RAG (Retrieval Augmented Generation) Akisi

```
[Kullanici Sorusu]
         |
         v
[1. Soruyu Anla] --> Keyword + Semantic Search
         |
         v
[2. Ilgili Belgeleri Bul]
   +-- PostgreSQL FTS (title, summary, institution)
   +-- Qdrant Vector Search (semantic similarity)
         |
         v
[3. DocumentChunks Getir] --> Ilgili chunk'lari birlestir
         |
         v
[4. RAG Context Olustur]
   +-- Belge basliklari
   +-- Ozetler
   +-- Chunk icerikleri (limit: ~2000 karakter)
         |
         v
[5. AI Yaniti Olustur] --> Mode + Context + Question
         |
         v
[6. Citations Ekle] --> Her iddia icin kaynak referansi
         |
         v
[7. DB'ye Kaydet] --> ai_messages + ai_citations
         |
         v
[8. Response] --> content + citations + confidence
```

### RAG Implementasyonu (`app/routes/ai_chat.py`)

```python
def _generate_rag_response(query, documents, chunks, mode):
    if not documents and not chunks:
        return ("Sorunuz icin yerel belgelerde ilgili icerik bulunamadi...",
                "no_sources")

    # Context olustur
    context_parts = []
    for doc in documents[:3]:
        if doc.summary:
            context_parts.append(f"Belge: {doc.title}\nOzet: {doc.summary}")

    for chunk in chunks[:5]:
        context_parts.append(chunk.content[:300])

    context = "\n\n".join(context_parts)

    # Mode'a gore prefix
    if mode == "official_only":
        prefix = "Asagidaki bilgiler resmi kaynaklardan derlenmistir:\n\n"
    elif mode == "child_safe":
        prefix = "Asagidaki bilgiler cocuklar icin uygun kaynaklardan derlenmistir:\n\n"
    elif mode == "explain_15":
        prefix = "15 yasindaki bir gencte anlatir gibi aciklayayim:\n\n"
    elif mode == "step_by_step":
        prefix = "Adim adim aciklayayim:\n\n"
    elif mode == "compare":
        prefix = "Farkli kaynaklardan bilgileri karsilastirarak sunuyorum:\n\n"
```

## Citations Gereksinimleri / Citation Requirements

### Zorunlu Citations

Her AI yaniti kaynakca ile desteklenmelidir:

- Her iddia en az bir belgeye dayandirilmalidir
- Citation metni en fazla 500 karakter olabilir
- Guven skoru (0-1) her citation icin kaydedilir
- Belge ID'si referans olarak saklanir

### Citation Veritabani Kaydi

```sql
-- ai_citations tablosu
CREATE TABLE ai_citations (
    id UUID PRIMARY KEY,
    message_id UUID REFERENCES ai_messages(id),
    document_id UUID REFERENCES documents(id),
    citation_text TEXT,
    page_reference TEXT,
    chunk_reference VARCHAR(255),
    confidence_score REAL,
    created_at TIMESTAMP
);
```

### Guven Skorlari

| Skor | Seviye | Anlam |
|------|--------|-------|
| 0.85+ | Yuksek | 2+ belge ve 3+ chunk bulundu |
| 0.5-0.85 | Orta | 1+ belge bulundu |
| 0.5- | Dusuk | Sinirli icerik |
| - | no_sources | Ilgili belge bulunamadi |

## Yanit Format Standartlari / Answer Format Standards

### Yanit Yapisi

1. **Mode Prefix**: Secilen moda gore giris cumlesi
2. **Soru Tekrari**: "Sorunuz: ..."
3. **Bilgi Kaynagi**: "Elimdeki belgelerden cikarilan bilgiler:"
4. **Belge Listesi**: Numaralandirilmis belgeler (baslik + kurum + ozet)
5. **Ilgili Icerikler**: Chunk'lardan alintilar

### Ornek Yanit

```
Asagidaki bilgiler resmi kaynaklardan derlenmistir:

Sorunuz: Deprem cantasinda neler bulunmali?

Elimdeki belgelerden cikarilan bilgiler:

1. Afet ve Acil Durum Cantasi Nasil Hazirlanmali (AFAD):
   Su, konserve gida, el feneri, pil, ilk yardim malzemeleri...

2. Turkiye Afet Mudahale Plani (TAMP) (AFAD):
   Her hane en az 72 saatlik erzak stokuna sahip olmalidir...

Ilgili iceriklerden alintilar:
- Cantada en az 3 gun yetecek miktarda su ve gida...
```

## Acil Durum Yanit Politikasi / Emergency Answer Policy

### Acil Durum Belirtileri

AI asistan asagidaki durumlarda ozel davranir:

1. **Tibbi Acil Durum**: "112'yi arayin" oncelikli yanit
2. **Afet Durumu**: "AFAD talimatlarini takip edin"
3. **Tehlikeli Konular**: Mantar zehirlenmesi, KBRN gibi konularda uyari

### Acil Durum Yanit Sablonu

```
UYARI: Bu bir acil durum sorusudur.

1. Hemen 112'yi arayin
2. AFAD'in resmi talimatlarini takip edin:
   - [Belge referansi]
3. En yakin saglik kurulusuna basvurun

Not: Bu sistem bilgi saglama amaclidir, profesyonel yardim yerine gecmez.
```

### Medical Risk Seviyeleri

| Seviye | Davranis | Ornek |
|--------|----------|-------|
| `none` | Normal yanit | Genel saglik bilgileri |
| `informational` | Bilgilendirme + kaynak | Ilac bilgileri |
| `caution` | Uyari + kaynak | Yabani bitki tuketimi |
| `high-risk` | Guclu uyari + resmi kaynak | Mantar zehirlenmesi |
| `emergency` | Acil durum protokolu | KBRN maruziyeti |

## Cocuk Guvenli Modu / Child-Safe Mode

### `child_safe` Modu

```python
# Conversation olustururken
conversation = AIConversation(
    child_safe=True,
    # ...
)

# Sorguda filtreleme
if request.child_safe:
    doc_query = doc_query.where(Document.child_safe == True)
```

**Ozellikleri:**
- Yalnizca `child_safe=true` olarak isaretlenen belgeler kullanilir
- Sifreli icerik filtrelenir
- Dil daha sade ve anlasilirdir
- `explain_15` modu ile kombin edilebilir

### Child-Safe Viewer Rolü

`child-safe-viewer` rolune sahip kullanicilar:
- Yalnizca cocuk guvenli belgeleri goruntuleyebilir
- AI yalnizca cocuk guvenli modda calisir
- Kasa ve admin ozelliklerine erisim yoktur

## Official-Only Mode

### `official_only` Modu

```python
if request.official_only:
    doc_query = doc_query.where(Document.trust_level == "official")
```

**Ozellikleri:**
- Yalnizca `trust_level=official` belgeler kullanilir
- Topluluk ve kisisel icerikler filtre lenir
- En yuksek guvenilirlik seviyesi
- `prefix: "Asagidaki bilgiler resmi kaynaklardan derlenmistir:"`

### Ne Zaman Kullanilmali

- Kritik saglik sorulari
- Afet ve acil durum planlamasi
- Yasal mevzuat sorulari
- Resmi belge dogrulama

## Private Vault Mode

### `vault_mode`

```python
conversation = AIConversation(
    vault_mode=True,
    # ...
)
```

**Ozellikleri:**
- AI yalnizca kullanıcının kasa dosyalarini tarar
- Genel belgeler kullanilmaz
- Kasa dosyalari AES-256-GCM ile sifrelenmistir
- Kullanicinin sorulari ve belgeleri gizli tutulur

### Guvenlik

- Vault mode'da AI yanitlari yalnizca kullanıcının kendi dosyalarina dayanir
- Sifreli dosyalar once cozulur, sonra indekslenir
- Diger kullanicilar bu icerige erisemez

## Prompt Sablonlari / Prompt Templates

### Varsayilan Mod (`default`)

```
Asagidaki belgelerden yararlanarak soruyu yanitla:

[CONTEXT: Belge basliklari, ozetler, chunk icerikleri]

Soru: [kullanici sorusu]

Yanit:
```

### Adim Adim Mod (`step_by_step`)

```
Konuyu adim adim acikla:

[CONTEXT]

Soru: [kullanici sorusu]

Adim adim aciklama:
```

### 15 Yas Aciklama Modu (`explain_15`)

```
15 yasindaki bir gence anlatir gibi acikla:

[CONTEXT]

Soru: [kullanici sorusu]

Aciklama:
```

### Karsilastirma Modu (`compare`)

```
Farkli kaynaklardan bilgileri karsilastir:

[CONTEXT]

Soru: [kullanici sorusu]

Karsilastirma:
```

## Model Sinirlamaları ve Sorumluluk Reddi / AI Limitations and Disclaimers

### Bilinen Sinirlamalar

1. **Yerel Bilgi Tabani**: AI yalnizca sisteme yuklenen belgelerden bilir. Internet erisimi yoktur.

2. **Guncellik**: Belgeler senkronize edilmedikce eski bilgiler icerebilir. `acquired_at` tarihini kontrol edin.

3. **Uydurma (Hallucination)**: Model, belgelerde olmayan bilgileri uydurabilir. Her zaman citation'lari kontrol edin.

4. **Dil Destegi**: Turkce anlama iyidir, ancak karmasik teknik terimlerde hatalar olabilir.

5. **Baglam Siniri**: RAG context penceresi sinirlidir (~2000 karakter). Uzun belgelerin tumu dahil edilemeyebilir.

6. **Embedding Dogrulugu**: Semantic search her zaman en ilgili belgeyi bulamayabilir. Keyword search ile desteklenmelidir.

### Sorumluluk Reddi

```
AI asistan saglik hizmeti sunmaz. Saglik sorulariniz icin doktorunuza
danisin. Afet durumlarinda resmi kuruluslarin (AFAD, 112) talimatlarini
takip edin. AI yanitlari bilgilendirme amaclidir ve profesyonel tavsiye
yerine gecmez.
```

### Dogrulama Onerileri

1. Her AI yanitinda citation'lari kontrol edin
2. Kritik bilgiler icin orijinal belgeyi okuyun
3. `official_only` modunu kritik sorular icin kullanin
4. Guven skorunu (`confidence`) dikkate alin
5. `no_sources` yanitlarinda bilgi eksikligini kabul edin

## AI Sohbet Yonetimi / AI Conversation Management

### Conversation Endpoint'leri

| Endpoint | Method | Aciklama |
|----------|--------|----------|
| `/api/ai/chat` | POST | Yeni veya mevcut sohbete mesaj gonder |
| `/api/ai/conversations` | GET | Kullanicinin sohbetlerini listele |
| `/api/ai/conversations/{id}` | GET | Belirli sohbeti getir |
| `/api/ai/conversations/{id}` | DELETE | Sohbeti sil |
| `/api/ai/conversations/{id}/messages/{msg_id}` | DELETE | Mesaji sil |

### Chat Request Parametreleri

```python
class ChatRequest:
    conversation_id: Optional[UUID]   # Mevcut sohbet ID (opsiyonel)
    messages: List[Message]           # Mesaj gecmisi
    mode: str                         # default/explain_15/step_by_step/compare
    official_only: bool               # Yalnizca resmi kaynaklar
    child_safe: bool                  # Cocuk guvenli mod
    vault_mode: bool                  # Kasa modu
    document_ids: List[UUID]          # Belirli belgeleri kullan
```

### Chat Response Yapisi

```python
class ChatResponse:
    conversation_id: UUID             # Sohbet ID
    message_id: UUID                  # Yanit mesaj ID
    content: str                      # AI yaniti
    citations: List[CitationResponse] # Kaynakcalar
    model: str                        # Kullanilan model
    confidence: str                   # high/medium/low/no_sources
```

## AI Denetimi / AI Auditing

### Kayit Altina Alinan Bilgiler

- Her sohbet `ai_conversations` tablosuna kaydedilir
- Her mesaj `ai_messages` tablosuna kaydedilir
- Her citation `ai_citations` tablosuna kaydedilir
- Kullanilan model ve token sayisi saklanir
- Sohbet modu (official_only, child_safe, vault_mode) kaydedilir

### Kullanicinin Verileri

- Kullanicilar kendi sohbetlerini gorebilir ve silebilir
- Admin'ler tum sohbetleri gorebilir (denetim amaciyla)
- `vault_mode` sohbetleri yalnizca ilgili kullanici tarafindan gorulebilir
