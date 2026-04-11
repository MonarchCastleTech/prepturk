# PrepTürk

<p align="center">
  <img src="apps/web/public/logo.png" width="256" alt="PrepTürk Tactical Logo">
</p>

> **Türkiye's Sovereign Offline Preparedness Command Center**
>
> 🇹🇷 *Türkiye İçin Çevrimdışı Bilgi, Eğitim, Resmî Belge ve Dayanıklılık Sistemi*
>
> _Assume the grid will fail. Own your data. Protect your community._

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-green.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/downloads/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Offline-First](https://img.shields.io/badge/Airgapped-Ready-orange.svg)](#offline-first-design)

---

## 🛑 The Problem

When a major crisis hits—like the devastating 2023 earthquakes—the digital infrastructure we take for granted vanishes. Cell towers fail. Government portals drop offline. Critical response protocols become inaccessible exactly when they are needed most. Communities are left blind, unable to find neighborhood assembly points, critical first-aid procedures, or official disaster response plans. 

## 🛡️ The Solution

**PrepTürk** is an uncompromising, offline-first intelligence and survival platform engineered specifically for Türkiye's risk profile. It is not a cloud service. It is a sovereign command center that runs entirely on your own hardware. 

Once synced, PrepTürk requires **zero internet connection** to provide:
*   Instant access to official government guidelines (AFAD, Ministry of Health, MEB).
*   AI-powered semantic search across local document repositories.
*   Lifesaving medical and survival protocols tailored for Turkish realities.
*   Educational resources to maintain continuity for children during prolonged outages.
*   A cryptographic, private vault for your family's critical documents.

Put it on a Raspberry Pi in a go-bag, a home server, or an old laptop. When the grid goes down, PrepTürk stays up.

---

## ⚡ Core Capabilities

PrepTürk provides a cohesive, unified dashboard encompassing **45 unique features** across 6 critical operational domains. 

### 1. Emergency & Crisis Command
*   **Zero-Latency SOS**: Instantly surfaces critical offline procedures and numbers (112, 110, 155, 156, 177).
*   **Procedural Checklists**: Actionable, step-by-step responses for Earthquakes, Fires, Floods, and CBRN threats.
*   **Assembly Points**: Hyper-local mapping of official gathering areas for all 81 provinces.

### 2. Verified Health & Medical Intelligence
*   **Strict Provenance**: All medical advice is mirrored strictly from official Turkish Ministry of Health (Sağlık Bakanlığı) and AFAD sources.
*   **Symptom Checker**: A conservative triage engine designed to identify *when to call 112*, not to diagnose. 
*   **Chronic Condition Management**: Detailed emergency protocols for Diabetes, Hypertension, Asthma, and more.

### 3. Survival & Resource Management
*   **Resource Calculators**: Accurately predict solar panel yields and battery runtimes based on your local province.
*   **Sustenance Guides**: Water purification methods and traditional Turkish food preservation techniques.
*   **Inventory Tracking**: Monitor your household stockpiles (water, fuel, medication) with visual depletion alerts.

### 4. Sovereign AI Assistant (Local LLM)
*   **100% Airgapped**: Powered by Ollama. Your queries never leave your device.
*   **RAG Integration**: The assistant answers questions by cross-referencing your locally stored official documents and cites its sources.
*   **Safety Guardrails**: Hardcoded to refuse medical diagnoses and aggressively prioritize official protocols during emergencies.

### 5. Education & Continuity
*   **Uninterrupted Learning**: Hosts mirrored MEB textbook catalogs and interactive materials.
*   **Exam Readiness**: Integrated study timers and countdowns for LGS, YKS, and KPSS.
*   **Child-Safe Mode**: A specialized UI that simplifies language and curates content for younger users during stressful events.

### 6. Personal Encrypted Vault
*   **AES-256-GCM Security**: Store your family's deeds, IDs, and financial records in a locally encrypted enclave.
*   **Printable Go-Packs**: Generate physical paper backups of your emergency plans and child ID cards in one click.

---

## 🏗️ Architecture

PrepTürk is built on a resilient, modern tech stack designed for extreme portability and low resource footprint.

*   **Frontend**: Next.js 15 (React 19) — Provides a fast, app-like experience with robust caching and offline PWA capabilities.
*   **Backend**: FastAPI (Python 3.12) — High-performance asynchronous API handling document ingestion, search, and AI orchestration.
*   **Database**: PostgreSQL 16 — Manages user roles, document metadata, and full-text search (FTS).
*   **Vector Search**: Qdrant — Enables blazing-fast semantic search and RAG capabilities.
*   **Local AI**: Ollama — Runs optimized LLMs (e.g., `qwen2.5:7b-instruct`) locally on CPU or GPU.
*   **Deployment**: Fully containerized via Docker Compose for one-click deployment across Linux, macOS, and Windows.

---

## 🔒 OPSEC & Security Model

We treat your data and security with the utmost paranoia.

*   **Airgap Mode**: A strict `AIRGAP_MODE` configuration completely disables all outbound network requests from the backend workers.
*   **Network Isolation**: The API enforces an aggressive `Content-Security-Policy (CSP)` preventing the browser from calling out to external analytics, fonts, or tracking scripts.
*   **Local Fonts Only**: No reliance on Google Fonts. The UI uses native system fonts to ensure flawless rendering offline.
*   **No Telemetry**: Next.js telemetry is permanently disabled.
*   **Zero-Trust Setup**: Requires secure password configuration out of the box; JWT auth with optional TOTP 2FA.

---

## 🚀 Quick Start

**Minimum Requirements:** 4GB RAM, 2-core CPU, 20GB Storage. (16GB RAM recommended for Local AI features).

### 1. Clone & Configure
```bash
git clone https://github.com/your-org/prepturk.git
cd prepturk
cp .env.example .env
```
*Edit `.env` to set your `APP_SECRET_KEY` and database passwords.*

### 2. Deploy
```bash
docker compose up -d
```

### 3. Initialize
Navigate to `http://localhost:3000` to complete the initial setup wizard, create your admin account, and trigger the first local sync of official documents.

---

## 🤝 Contributing

PrepTürk is an open-source project dedicated to the resilience of the Turkish people. We welcome contributions to adapters, province packs, UI improvements, and documentation.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## ⚖️ License & Disclaimer

**PrepTürk** is licensed under the [AGPL-3.0 License](LICENSE).

**DISCLAIMER:** This software is provided for informational and preparedness purposes only. It is **NOT** a replacement for official emergency services, professional medical advice, or government directives. In any emergency in Türkiye, **always call 112** and follow the instructions of AFAD and local authorities. 

---
<p align="center">
  <i>Deprem bölgelerindeki vatandaşlarımıza adanmıştır.</i><br>
  <b>Türkiye için, Türkiye'den.</b>
</p>
