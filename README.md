# PrepTürk: The Sovereign Preparedness Stack

<p align="center">
  <img src="apps/web/public/logo.png" width="320" alt="PrepTürk Tactical Command Center Logo">
</p>

<p align="center">
  <a href="README.md">🇬🇧 English</a> | <a href="README.tr.md">🇹🇷 Türkçe</a> | <a href="README.ru.md">🇷🇺 Русский</a> | <a href="README.ar.md">🇸🇾 العربية</a>
</p>

---

## 🛡️ Executive Summary

**PrepTürk** is a high-availability, airgapped intelligence and survival orchestration platform engineered for the Republic of Türkiye’s unique geographic and geopolitical risk profile. Unlike cloud-dependent solutions, PrepTürk is a **sovereign technical stack** designed to operate in environments with **zero internet connectivity**, power instability, and total infrastructure collapse.

It transforms consumer-grade hardware (Raspberry Pi, Laptops, Home Servers) into a hardened Command Center, housing verified government protocols, a local Large Language Model (LLM), and real-world hardware integrations for radio and mesh networking.

---

## 🛰️ Technical Domains

### 1. Intelligence & Sovereign AI
*   **Local RAG (Retrieval-Augmented Generation)**: Powered by **Ollama**, PrepTürk runs optimized LLMs (Qwen 0.5B to 7B) locally. It answers queries by citing its own local library of 36+ verified Turkish government sources.
*   **Semantic Search**: High-performance vector indexing via **Qdrant** allows for natural language search across thousands of pages of legislation and emergency manuals without an index server.
*   **Multilingual Support**: Fully localized in Turkish, English, Russian, and Arabic to support all residents and displaced persons in crisis zones.

### 2. Physical Layer & Hardware Integration
*   **SDR (Software-Defined Radio)**: Native interface for RTL-SDR dongles. Automatically scans and logs emergency frequencies (TRT FM, AFAD alerts) and decodes NOAA satellite weather imagery.
*   **LoRa Mesh (Meshtastic)**: Integrated mesh networking allows nodes to sync community boards and SOS signals over the airwaves (up to 10km) when cell towers fail.
*   **CBRN & Environmental Sensors**: Real-time logging for radiation (Geiger), air quality (PM2.5), and climate data via local sensor arrays.
*   **Local Whisper**: 100% private, on-device voice-to-text. No audio data ever hits the cloud.

### 3. Tactical Emergency Operations
*   **Civil Defense Protocols**: Verified AFAD "Siyah Alarm" (CBRN) and "Kırmızı Alarm" (Air Raid) procedures.
*   **Medical Triage**: A conservative symptom checker and emergency first-aid library containing hyper-compressed video loops for high-adrenaline maneuvers (CPR, Heimlich, Tourniquet).
*   **Hyper-Local Mapping**: Integrated **Tileserver-GL** serving vector map tiles directly from the local disk, ensuring navigation works without a single packet from the internet.

### 4. Logistics & Continuity
*   **Digital Dead Drop**: PWA-based file sharing via high-density QR packages and Ad-Hoc Wi-Fi hotspots.
*   **Resource Management**: Advanced inventory tracking with depletion alerts and solar yield calculators calibrated for the 81 provinces of Türkiye.
*   **Traditional Resilience**: A specialized module for Anatolian preservation techniques (Tarhana, Salça, Pekmez) and provincial agricultural calendars.

---

## 🏗️ The Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (React 19) | Hardened PWA with Service Worker Caching |
| **API** | FastAPI (Python 3.12) | Asynchronous High-Throughput Command Layer |
| **Database** | PostgreSQL 16 | Relational metadata and user roles |
| **Vector DB** | Qdrant | Semantic indexing and similarity search |
| **AI Engine** | Ollama | Local LLM & Embedding orchestration |
| **Reverse Proxy** | Caddy | Automatic internal HTTPS and static serving |

---

## 🔒 OPSEC & Hardening

PrepTürk is built on a **Paranoid-by-Default** security model:
*   **Airgap Enforcement**: A software-level lock prevents all outbound network requests from backend workers.
*   **Telemetry Stripping**: All Next.js and external analytics are removed.
*   **Local Font Stack**: Zero reliance on Google Fonts or external CDNs to prevent rendering stalls.
*   **Encrypted Vault**: Family documents are stored in an AES-256-GCM encrypted local enclave.

---

## 🚀 Deployment

### Prerequisites
*   **Hardware**: 4GB RAM minimum (16GB recommended for AI).
*   **Software**: Docker & Docker Compose.

### Quick Launch
```bash
git clone https://github.com/akgularda/prepturk.git
cd prepturk
docker compose up -d
```
*Access the Command Center at `http://localhost:3000`.*

---

## ⚖️ License & Responsibility

**PrepTürk** is licensed under the [AGPL-3.0 License](LICENSE).

**IMPORTANT**: This platform is a supplementary tool. In any emergency within the Republic of Türkiye, **always prioritize official government directives**. Contact **112** for all emergencies. This software is provided "as is" without warranty of any kind.

---
<p align="center">
  <i>"Assume nothing will be there when you need it. Own the infrastructure of your survival."</i><br>
  <b>Dedicated to the resilience of the people of Türkiye.</b>
</p>
