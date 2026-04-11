# PrepTurk -- Complete Feature Index

> 45 pages, 100+ features, fully offline, Turkey-first.

---

## CORE (6 pages)

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/dashboard` | Today view: weather warnings, medication reminders, exam countdown, recent docs, quick actions |
| Documents | `/documents` | Official document library with trust badges, faceted search, filtering |
| Search | `/search` | Hybrid search: PostgreSQL FTS + BM25 + vector + Turkish normalization |
| AI Asistan | `/ai-chat` | Local AI with RAG, citations, 7 modes (default, official-only, child-safe, step-by-step, compare, emergency, homework) |
| Education | `/education` | MEB/EBA/OGM textbook catalog with grade/subject filters |
| Maps | `/maps` | Offline map viewer with layers, saved places, GPX import |

## EMERGENCY (5 pages)

| Page | Path | Description |
|------|------|-------------|
| Acil Durum | `/acil` | **PUBLIC** (no auth) emergency numbers, quick reference cards, earthquake steps |
| Toplanma Alanlari | `/toplanma` | Assembly point finder by province/district/neighborhood with Google Maps links |
| Sablonlar | `/sablonlar` | 6 pre-written emergency message templates (safe, help, missing person, damage, medical, area status) |
| Su Aritma | `/su-aritma` | 5 water purification methods with step-by-step instructions, safety warnings |
| SOS Button | *floating* | Persistent red button on every page -- tap to call 112/110/155/156/177/183, keyboard shortcut `S` |

## HEALTH (5 pages)

| Page | Path | Description |
|------|------|-------------|
| Saglik | `/saglik` | Personal health profile: blood type, allergies, medications, doctors, emergency contacts |
| Kronik Hastalik | `/kronik-hastalik` | Emergency plans for 6 chronic conditions: diabetes, hypertension, asthma, heart disease, epilepsy, allergies |
| Semptom Kontrol | `/semptom-kontrol` | Conservative triage tool (NOT diagnosis): 12 symptoms, color-coded severity, 112 triggers |
| Psikolojik Saglik | `/psikolojik-saglik` | Crisis mental health: grounding techniques, helping children, community resilience |
| Pandemi | `/pandemi-hazirlik` | Home quarantine setup, 2-week supply lists, isolation mental health |

## SURVIVAL (7 pages)

| Page | Path | Description |
|------|------|-------------|
| Gida Saklama | `/gida-saklama` | 6 food preservation methods: drying, salting, fermentation, canning, smoking, freezing |
| Barinak/Isinma | `/barinak-isinma` | Shelter & warmth: improvised heating (with CO warnings), insulation, regional winter guides |
| Mesafe Tahmin | `/mesafe-tahmin` | 6 distance estimation methods without GPS: step counting, time-based, thumb-jump, triangulation |
| Yildiz Navigasyon | `/yildiz-navigasyon` | Celestial navigation: Polaris, sun position, stick shadow, moon phases, watch method |
| Hazirlik Zaman Cizelgesi | `/hazirlik-zaman-cizelgesi` | 5-phase outage timeline: hours 0-24 through week 3+ |
| Mevsim Hazirlik | `/mevsim-hazirlik` | 12-month preparedness calendar with provincial climate notes |
| Sehir/Koy | `/sehir-koy` | Urban vs rural survival comparison for Turkey |

## ENERGY (5 pages)

| Page | Path | Description |
|------|------|-------------|
| Dusuk Guc | `/dusuk-guc` | Low Power Mode: battery detection, grayscale mode, "before battery dies" printable summary |
| Gunes Sarj | `/gunes-sarj` | Solar charging session tracker with mAh calculations, 15-province sun hour data |
| Guc Hesaplayici | `/guc-hesaplayici` | Offline power calculator: what can you run with your solar/battery setup |
| Envanter | `/envanter` | Household inventory: water, food, meds, batteries, fuel, cash with "days remaining" countdowns |
| Radyo Frekans | `/radyo-frekans` | TRT frequencies by province, amateur radio bands, DIY antenna guide |

## COMMUNICATION (5 pages)

| Page | Path | Description |
|------|------|-------------|
| QR Mesaj | `/qr-mesaj` | Offline P2P messaging via QR codes: encode, decode, scan, export/import |
| Topluluk Kaynak | `/topluluk-kaynak` | Community resource board: have/need/help/info posts with filtering and expiry |
| Takas Rehberi | `/takas-rehberi` | Fair trade price reference with crisis-era ratios and community price board |
| Veri Senkronizasyon | `/veri-senkronizasyon` | P2P data sync: export/import all data as JSON, USB backup, seed kit |
| Topluluk | `/topluluk` | Family emergency plan, neighborhood mutual aid, building directory |

## EDUCATION (3 pages)

| Page | Path | Description |
|------|------|-------------|
| Sinav | `/sinav` | Exam countdown (LGS/YKS/KPSS/ALES) with live timer, subject checklist, progress tracking |
| Cocuk Aktivite | `/cocuk-aktivite` | Emergency activity packs for kids: 3 age bands, 6 categories, 24+ activities |
| Cocuk Kimlik | `/cocuk-kimlik` | Printable child ID/reunification cards: wallet-size, bilingual, photo support |

## SECURITY (2 pages)

| Page | Path | Description |
|------|------|-------------|
| Guvenlik Planlama | `/guvenlik-planlama` | Civil unrest safety: situational awareness, safe room, de-escalation |
| EMP | `/emp-hazirlik` | EMP/grid collapse guide: immediate actions, Faraday cage, long-term adaptation |

## SETTINGS (built into UI)

| Feature | Location | Description |
|---------|----------|-------------|
| Easy Mode | TopBar toggle | 50% larger fonts, simplified 5-item sidebar, hides metadata |
| Voice Input/Output | AI Chat toolbar | Turkish speech-to-text and text-to-speech via Web Speech API |
| Onboarding Tour | First visit / Settings | 6-step interactive tour, skippable, restartable |
| Low Power Mode | `/dusuk-guc` | Grayscale, disables heavy features, kills animations |
| Homework Mode | AI Chat toolbar | AI acts as teacher: hints not answers |

---

## STORAGE

All personal data stored in **localStorage** for offline access:

| Key | Data |
|-----|------|
| `prepturk:healthProfile` | Blood type, allergies, medications, doctors, contacts |
| `prepturk:studyProgress` | Exam selection, subject completion, study sessions |
| `prepturk:familyPlan` | Family members, meeting points, emergency contacts |
| `prepturk:neighborhood` | Vulnerable neighbors, resource inventory |
| `prepturk:building` | Apartment registry, medical flags |
| `prepturk:inventory` | All household inventory items |
| `prepturk:qrMessages` | QR-encoded message history |
| `prepturk:solarSessions` | Solar charging session logs |
| `prepturk:easyMode` | Easy mode toggle state |
| `prepturk:powerMode` | Low power mode state |
| `prepturk:homeworkMode` | Homework mode toggle state |
| `prepturk:barterPrices` | Fair trade price reference |
| `prepturk:priceLog` | Historical price tracking |
| `prepturk:communityResources` | Community resource board posts |
| `prepturk:childCards` | Child ID card profiles |
| `prepturk:timelineChecklist` | Outage timeline completion |
| `prepturk:tourCompleted` | Onboarding tour state |

---

## PRIORITY MATRIX

| Priority | Pages | When to Use |
|----------|-------|-------------|
| **P0 -- Critical** | Acil, Sablonlar, Su Aritma, Envanter | First 72 hours of any emergency |
| **P1 -- High** | QR Mesaj, Kronik Hastalik, Veri Sync, Gunes Sarj, Radyo, Gida Saklama, Barinak, Guc Hesaplayici | Day 3+ survival and coordination |
| **P2 -- Medium** | Topluluk Kaynak, Semptom, Psikolojik, Mevsim, Mesafe, Yildiz | Sustained resilience and quality of life |
| **P3 -- Niche** | Takas, Cocuk Aktivite, Cocuk Kimlik, Zaman Cizelgesi, Sehir/Koy, EMP, Pandemi, Guvenlik | Specific scenarios, long-term events |

---

## ACCESSIBILITY

| Feature | Who It Helps | What It Does |
|---------|-------------|--------------|
| Easy Mode | Elderly, low-vision, overwhelmed users | 50% larger fonts, simplified nav |
| Voice Input | Low-literacy, hands-busy | Turkish speech-to-text in AI chat |
| Voice Output | Visually impaired | Turkish text-to-speech for AI answers |
| Onboarding Tour | First-time users | 6-step guided introduction |
| Public Emergency Page | Non-authenticated users | Emergency info without login |
| Touch-Friendly Targets | Tablet/mobile users | 44px minimum interactive elements |
| Colorblind-Safe | Colorblind users | Icons + text on all color-coded elements |
| Print-Friendly | All users | Every guide card printable |
