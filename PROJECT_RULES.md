# AyurVarta — Distributed System Project Rules & Conventions

> **Source of Truth**: Derived from `Vibe_Rules.md` for the AyurVarta distributed polyglot platform.
> **Last Updated**: November 2026

---

## 1. Project Summary & Architecture Philosophy

**AyurVarta** is an enterprise, polyglot-persistent, distributed clinical wellness platform. It blends classical Ayurvedic medicine (Prakriti, Vikriti, Agni, Shad-Rasa, Viruddha Ahara, Ritucharya) with modern clinical AI (RAG, vector similarity, and LLMs).

### Core Architectural Principles
1. **Strict Service Independence**: Every service is decoupled, separately hosted, and independently deployable.
2. **Polyglot Persistence**: Different data storage engines are chosen strictly for their specialized strengths:
   - **MongoDB**: Unstructured and hierarchical clinical records, user profiles, daily logs, and Knowledge Graph triples.
   - **Vector DB (Pinecone / Qdrant)**: High-dimensional semantic embeddings for food items, recipes, and classical Ayurvedic scriptures.
   - **Redis**: High-throughput distributed caching, async job tracking, and token/rate-limit buckets.
3. **Decoupled ML Inference**: Heavy AI/ML workloads (embedding calculation, RAG synthesis, Charaka Viruddha Ahara safety guardrails) run on an independent ML service, isolated from customer-facing CRUD traffic.
4. **Zero Shared Databases**: Services do not query each other's databases directly. All communication occurs over documented REST/gRPC interfaces with Bearer JWT or internal API tokens.

---

## 2. Distributed Services Map

| Service Name | Primary Stack | Hosting / Infrastructure | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Frontend Service** | React 19, React Router v7, Tailwind | Vercel / Cloudflare Pages / S3+CloudFront | User interface, assessments, dashboard, Agora video call UI, PDF generation |
| **Core Backend (Gateway)** | Node.js 20+, Express.js, MongoDB Driver | Render / AWS ECS / Google Cloud Run | API Gateway, auth, profile management, assessment scoring, job orchestration |
| **ML Inference Service** | Python 3.11+, FastAPI / vLLM, Groq (`llama-3.3-70b-versatile`) | RunPod / Modal / GCP Vertex AI / Dedicated GPU | Semantic vector expansion (`BAAI/bge-small-en-v1.5`), RAG generation, Viruddha Ahara clinical safety verification |
| **Document Store (MongoDB)** | MongoDB 7.0+ (Atlas) | Managed Cloud Database | Users, assessment records, diet logs, and Knowledge Graph triples (`kg_entities`, `kg_relations`) |
| **Vector DB (Pinecone)** | Pinecone Serverless / Qdrant | Managed Vector Cloud | Dense vectors (384/768-dim) for foods, herbs, and Ayurvedic formulations |
| **Cache & Broker (Redis)** | Redis 7.2+ | Managed Upstash / Redis Cloud | Diet generation job state cache, cohort similarity cache, rate limits |

---

## 3. Communication & Inter-Service Security

1. **Frontend ↔ Core Backend**:
   - Protocol: HTTPS REST with Bearer JWT tokens.
   - Standard path prefix: `/api/v1/`.
   - Credentials stored in secure, `httpOnly` cookies in production (or sanitized local storage in demo mode).
2. **Core Backend ↔ ML Inference Service**:
   - Protocol: Internal HTTPS / gRPC with shared internal secret header: `X-Internal-Service-Key: <secret>`.
   - Timeout: 60-120 seconds with retry and exponential backoff for long LLM generation calls.
3. **Core Backend ↔ MongoDB**:
   - Connection via TLS-encrypted connection string (`mongodb+srv://`).
4. **ML Service ↔ Vector DB**:
   - Direct secure HTTPS REST / gRPC API connection using isolated read-only or read/write API keys.
5. **Services ↔ Redis**:
   - TLS connection with authentication password (`rediss://`).

---

## 4. Standard API Response & Error Schema

All backend and ML services must adhere to this standardized JSON contract for predictability:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_01HXYZ873ABCD",
    "timestamp": "2026-11-19T00:30:00Z"
  }
}
```

### Standardized Error Format (Per Vibe Rules Phase 2 & 6)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid Dosha score distribution.",
    "details": [
      { "field": "vata", "issue": "Score must be between 0 and 100" }
    ],
    "requestId": "req_01HXYZ873ABCD"
  }
}
```

---

## 5. Standard Health Checks

Every service must implement lightweight health probes:
- `GET /health` → Returns HTTP 200 `{"status": "ok", "service": "<name>", "version": "1.0.0"}`
- `GET /ready` → Checks internal connectivity (e.g. database ping, model weights loaded)

---

## 6. Definition of Done (DoD)

Before any feature or service modification is committed:
1. Service-specific unit and integration tests pass.
2. No API keys, credentials, or secrets in commit history.
3. Relevant `.env.example` file is updated.
4. Input validation is strictly enforced with Pydantic v2 (Backend/ML) or schema validators (Frontend).
5. All error states (loading, empty, error, unauthorized) are gracefully handled in UI components.
