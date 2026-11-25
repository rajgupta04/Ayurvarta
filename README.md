<div align="center">

<img src="docs/assets/ayurvarta-hero.svg" alt="AyurVarta — Ancient Ayurvedic Science Meets Groq AI & Polyglot Microservices" width="100%" />

<br />

<h3><strong>Where 5,000-Year-Old Ayurvedic Science Meets Ultra-Fast Groq AI &amp; Polyglot Microservices</strong></h3>

*Submitted for **Smart India Hackathon (SIH 2025)***

[![React 19](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](frontend)
[![Node.js 20](https://img.shields.io/badge/Core_Backend-Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](backend)
[![FastAPI ML](https://img.shields.io/badge/ML_Service-Python_FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](ml-service)
[![Groq AI](https://img.shields.io/badge/LLM_Engine-Groq_LPU-F55036?style=for-the-badge&logo=lightning&logoColor=white)](docs/services/ml-inference-service.md)
[![MongoDB](https://img.shields.io/badge/Document_DB-MongoDB_7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](docs/services/database-mongodb.md)
[![Pinecone](https://img.shields.io/badge/Vector_DB-Pinecone_/_Qdrant-000000?style=for-the-badge)](docs/services/database-vectordb.md)
[![Redis](https://img.shields.io/badge/Cache_&_Queue-Redis_7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](docs/services/database-redis.md)
[![Docker](https://img.shields.io/badge/Orchestration-Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](docker-compose.yml)

[Architecture](#-distributed-polyglot-architecture) · [Why Polyglot?](#-why-polyglot-persistence) · [60s Patient Flow](#-the-60-second-patient-journey) · [Backend Plan](docs/architecture/backend-plan.md) · [Documentation](#-service-documentation-hub) · [Quick Start](#-quick-start)

</div>

---

## ✨ Why AyurVarta?

Modern nutrition apps reduce human health to generic calorie math—ignoring digestive capacity, seasonal transitions, and dangerous ingredient pairings.

**AyurVarta** reimagines personalized digital healthcare by uniting classical **Ayurvedic diagnostics** with a **distributed, clinically guarded AI pipeline**:

| Standard Diet Apps | 🌿 AyurVarta Clinical Platform |
| :--- | :--- |
| One-size-fits-all calorie macros | Evaluates **Prakriti** (constitution), **Vikriti** (imbalance), and **Agni** (digestive fire) |
| Static recipe lists | Semantic retrieval grounded in **Shad-Rasa** (6 tastes) & **Vimshati Guna** (20 qualities) |
| No food-pairing safety checks | Screens every meal against **Charaka's 18 *Viruddha Ahara*** incompatibility rules |
| Slow, monolithic servers | Decoupled **React + Node.js + Python/Groq ML** services with **3-tier Polyglot Persistence** |

---

## 🏛️ Distributed Polyglot Architecture

Every component in AyurVarta is independently hosted, loosely coupled, and governed by strict service boundaries—with **zero shared databases** and end-to-end `X-Request-Id` tracing.

```mermaid
flowchart TD
    subgraph ClientTier["🌐 Presentation Tier (Vercel / Cloudflare Pages)"]
        FE["React 19 SPA<br/>Quizzes · Diet Charts · PDF Export · Meal Logs · Agora UI"]
    end

    subgraph GatewayTier["⚡ Core Backend & API Gateway (Node.js 20 + Express)"]
        BE["API Orchestrator<br/>JWT Auth & RBAC · Assessment Scoring · Async Job Broker · Agora Token Authority"]
    end

    subgraph AITier["🧠 Dedicated ML & Clinical RAG Tier (Python FastAPI + Groq LPU)"]
        ML["ML Inference Service<br/>BGE-Small 384d Embeddings · Groq Llama 3.3 70B / GPT-OSS 120B · Viruddha Guardrails"]
    end

    subgraph PolyglotTier["💾 Polyglot Persistence Tier"]
        MG[("MongoDB Atlas<br/>Clinical Docs & Knowledge Graph")]
        VDB[("Pinecone / Qdrant<br/>384-dim Food & Scripture Vectors")]
        RD[("Redis 7.2<br/>Job Queue · Cohort Cache · Rate Limits")]
    end

    Agora["📹 Agora Cloud RTC<br/>Low-Latency Tele-Consultation"]

    FE -->|"HTTPS + Bearer JWT"| BE
    FE -.->|"WebRTC Stream"| Agora
    BE -->|"Document CRUD & Audit Logs"| MG
    BE -->|"Async Job Polling & Token Denylist"| RD
    BE -->|"Internal REST + X-Internal-Service-Key"| ML
    ML -->|"Metadata-Filtered Cosine Search"| VDB
    ML -->|"Prompt & Cohort Caching"| RD
```

---

## 💾 Why Polyglot Persistence?

Ayurvedic clinical data spans hierarchical questionnaires, dense vector embeddings, and real-time job queues. Instead of forcing one database to do everything poorly, AyurVarta assigns each engine to what it does best:

| Storage Engine | Data Paradigm | What It Owns | Why It Excels Here |
| :--- | :--- | :--- | :--- |
| **MongoDB 7.0+** | Document Store & KG Triples | `users`, `assessments`, `diet_plans`, `diet_logs`, `audit_logs`, `kg_entities`, `kg_relations` | Evolves smoothly alongside dynamic quiz schemas and deeply nested meal plans without rigid migrations. |
| **Pinecone / Qdrant** | High-Dimensional Vector DB | `ayurvedic-foods-v2` (`foods` & `scriptures` namespaces, 384-dim `BAAI/bge-small-en-v1.5`) | Sub-second semantic matching on tastes/qualities with hard `$nin` allergen filtering *before* LLM synthesis. |
| **Redis 7.2+** | In-Memory Store & Broker | `job:{id}`, `cohort:{sha256}`, `ratelimit:{scope}:{id}`, `token:denylist:{jti}` | Enables instant frontend polling, caches identical Dosha/Agni/Season cohorts, and enforces rate limits in RAM. |

---

## 🔄 The 60-Second Patient Journey

```text
  1. Diagnose          2. Dispatch           3. Retrieve           4. Guard & Synthesize      5. Track & Consult
 ┌─────────────┐     ┌──────────────┐     ┌────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
 │ Prakriti,   │     │ Node.js API  │     │ Pinecone $nin  │     │ Groq Llama 3.3 70B  │     │ 1–5 Adherence    │
 │ Vikriti &   │ ──▶ │ checks Redis │ ──▶ │ strips patient │ ──▶ │ builds meal plan +  │ ──▶ │ Logs, PDF Export │
 │ Agni Quiz   │     │ Cohort Cache │     │ allergens &    │     │ Charaka 18 Viruddha │     │ & Agora Video    │
 │             │     │ & queues job │     │ matches Ritu   │     │ checks verify safety│     │ Tele-Consultation│
 └─────────────┘     └──────────────┘     └────────────────┘     └─────────────────────┘     └──────────────────┘
```

1. **Constitutional Profiling**: Users complete interactive assessments measuring baseline *Prakriti*, active *Vikriti*, and digestive *Agni*.
2. **Instant Cohort Lookup**: The Node.js Core Backend hashes the user's dosha/Agni/season profile to check **Redis** for an already-validated cohort framework.
3. **Allergy-Safe Vector Retrieval**: On a cache miss, the isolated Python ML service embeds the expanded *Shad-Rasa*/*Guna* query and queries **Pinecone/Qdrant**, filtering out registered allergens via metadata exclusions.
4. **Groq Synthesis + *Viruddha Ahara* Guardrail**: **Groq LPU** (`llama-3.3-70b-versatile` / `openai/gpt-oss-120b`) generates structured daily meals, immediately audited against Charaka's 18 food incompatibility rules (e.g., no heated honey, no fish + dairy, no night curd).
5. **Adherence & Telehealth**: Patients log daily meal adherence, export clean PDF diet charts (`html2canvas` + `jsPDF`), chat with the Groq Ayurvedic assistant, and join **Agora RTC** video consultations with practitioners.

---

## 🧩 Core Platform Capabilities

- **🧬 Tri-Pillar Diagnostic Engine**: Interactive multi-step Prakriti, Vikriti, and Agni assessments with live Chart.js visualizations and historical trend tracking.
- **⚡ Groq-Powered Clinical RAG**: Sub-second inference powered by Groq (`llama-3.3-70b-versatile` & `openai/gpt-oss-120b`) paired with 384-dim semantic vector search.
- **🛡️ *Viruddha Ahara* Clinical Safety**: Automated post-generation rules engine catching toxic food combinations, preparation hazards, and seasonal mismatches.
- **📹 Real-Time Tele-Consultation**: Secure patient-practitioner video appointments powered by Agora RTC SDK with server-signed channel tokens.
- **📊 Adherence & Habit Analytics**: Daily meal compliance tracking (1–5 rating + digestive notes) persisted in MongoDB.
- **📄 One-Click Clinical PDF Export**: Crisp client-side generation of full diet charts, guidelines, and spice recommendations.

---

## 📚 Service & Architecture Documentation Hub

Explore dedicated specifications, schemas, contracts, and engineering plans:

| Document | Focus | Stack / Scope |
| :--- | :--- | :--- |
| **[Architecture Overview](docs/architecture/OVERVIEW.md)** | System topology, boundaries & end-to-end sequence flows | Distributed Microservices |
| **[Node.js Backend Plan](docs/architecture/backend-plan.md)** | **6-phase implementation blueprint & exact frontend contracts** | Node.js 20, Express, MongoDB, Redis |
| **[Frontend Service](docs/services/frontend-service.md)** | SPA pages, assessments, Agora video, Groq client & PDF export | React 19, Router v7, Chart.js |
| **[Core Backend Service](docs/services/core-backend-service.md)** | API Gateway, JWT/RBAC, job orchestration & telehealth tokens | Node.js 20, Express ES Modules |
| **[ML Inference & RAG Service](docs/services/ml-inference-service.md)** | Embeddings, vector search, Groq synthesis & Viruddha guardrails | Python 3.11+, FastAPI, Groq, FastEmbed |
| **[MongoDB Document Store](docs/services/database-mongodb.md)** | BSON schemas, Knowledge Graph triples & compound indexes | MongoDB 7.0+ (Atlas) |
| **[Vector Database Service](docs/services/database-vectordb.md)** | `ayurvedic-foods-v2` namespaces, metadata filters & cosine metrics | Pinecone Serverless / Qdrant |
| **[Redis Cache & Broker](docs/services/database-redis.md)** | Job state machine, cohort hashing, rate limits & token denylist | Redis 7.2+ |
| **[Project Rules](PROJECT_RULES.md) & [Vibe Rules](Vibe_Rules.md)** | Error envelopes, correlation IDs, security & DoD checklists | Engineering Standards |

---

## 📂 Repository Map

```text
Ayurvarta/
├── frontend/                  # 🌐 React 19 Client SPA (Docker + Nginx ready)
│   ├── src/api/               #    REST clients (auth, assessments, diet jobs, Groq AI)
│   ├── src/pages/             #    Assessments, Dashboard, DietPlan, PersonalAI, VideoConsult
│   └── Dockerfile             #    Multi-stage Node 20 -> Nginx Alpine build
├── backend/                   # ⚡ Node.js 20 Core Backend & API Gateway
│   ├── src/server.js          #    Express entry, X-Request-Id, /health & /ready probes
│   ├── src/config/index.js    #    Centralized env configuration
│   └── Dockerfile             #    Production node:20-alpine container
├── ml-service/                # 🧠 Python FastAPI ML & Groq RAG Service
│   ├── app.py                 #    Internal RAG endpoint (/internal/v1/rag/generate-diet)
│   ├── config.py              #    Groq, Pinecone & BGE-Small settings
│   └── Dockerfile             #    Python 3.11-slim container
├── docs/                      # 📚 Centralized architecture, service docs & backend plan
├── docker-compose.yml         # 🐳 Full polyglot stack (MongoDB, Redis, Qdrant, 3 services)
├── PROJECT_RULES.md           # 📜 Persistent rules & API contracts
└── Vibe_Rules.md              # ✅ Microservice engineering master checklist
```

---

## 🚀 Quick Start

### Option A: One-Command Full Stack (Docker Compose)

Spin up **MongoDB, Redis, Qdrant Vector DB, ML Service, Node.js Backend, and React Frontend** together:

```bash
# Set your Groq API key (optional in dev mode; stubbed fallback works out of the box)
export GROQ_API_KEY="gsk_your_key_here"

docker-compose up --build
```

| Service | Local URL | Health Probe |
| :--- | :--- | :--- |
| **Frontend SPA** | `http://localhost:3000` | `http://localhost:3000/` |
| **Core Backend (Node.js)** | `http://localhost:8000` | `http://localhost:8000/health` |
| **ML Inference Service (Groq)** | `http://localhost:8001` | `http://localhost:8001/health` |
| **Qdrant Vector Dashboard** | `http://localhost:6333/dashboard` | — |

---

<details>
<summary><b>🛠️ Option B: Run Individual Services Locally (Click to Expand)</b></summary>

#### 1. Core Backend Service (`Node.js 20+`)
```bash
cd backend
cp .env.example .env
npm install
npm run dev          # Hot-reloads on http://localhost:8000
```

#### 2. ML Inference Service (`Python 3.11+`)
```bash
cd ml-service
cp .env.example .env
python -m venv venv
# Windows: .\venv\Scripts\activate  |  macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

#### 3. Frontend SPA (`React 19`)
```bash
cd frontend
cp .env.example .env
npm install
npm test -- --watchAll=false
npm start            # Opens http://localhost:3000
```

</details>

<details>
<summary><b>🗺️ Additional Roadmaps & Audits (Click to Expand)</b></summary>

- [**Implementation Checklist**](docs/CHECKLIST.md) — Track sprint progress across ontology, RAG, and guardrails.
- [**Clinical RAG Gap Analysis**](docs/architecture/gap-analysis.md) — Baseline comparison against clinical RAG benchmarks.
- [**Full Multi-Phase RAG Plan**](docs/architecture/implementation-plan.md) — Deep-dive ingestion, hybrid retrieval, and CRAG roadmap.

</details>

---

<div align="center">

Built with classical precision and modern distributed engineering · **Team AyurVarta (SIH 2025)**

</div>
