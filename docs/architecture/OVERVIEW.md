# AyurVarta — Distributed System Architecture & Polyglot Persistence Overview

> **Architecture Style**: Microservices & Polyglot Persistence  
> **Target Environment**: Production Distributed Cloud  
> **Status**: Verified Specification  
> **Last Updated**: November 2026  

---

## 1. High-Level Distributed Architecture

AyurVarta is split into discrete, purpose-built distributed services to guarantee high availability, strict separation of concerns, and optimized compute resource allocation:

```mermaid
flowchart TD
    subgraph ClientTier["🌐 Presentation Tier"]
        SPA["Frontend SPA (React 19)<br/>Hosted: Vercel / Cloudflare Pages<br/>• Assessments & Quizzes<br/>• User Health Dashboard<br/>• Interactive Diet Planner<br/>• Video Tele-Consultation UI"]
    end

    subgraph IngressTier["🛡️ Ingress & Gateway"]
        Gateway["API Gateway & Reverse Proxy<br/>• Rate Limiting & SSL Termination<br/>• Route Routing to Services<br/>• Request ID / Correlation Injection"]
    end

    subgraph ServiceTier["⚙️ Application & Compute Tier (Separately Hosted)"]
        BackendSvc["Core Backend Service (FastAPI)<br/>Hosted: AWS ECS / Render / Cloud Run<br/>• Auth & RBAC (JWT & OAuth)<br/>• Assessment Calculation Engine<br/>• Ayurvedic Ontology Verifier<br/>• Async Job Orchestration"]
        
        MLSvc["ML Inference & RAG Service (FastAPI / vLLM)<br/>Hosted: GPU Cloud / Vertex AI / RunPod<br/>• Embedding Generation<br/>• Dense + Rasa/Guna Vector Search<br/>• Gemini 2.5 / Groq LLM Generation<br/>• Viruddha Ahara Clinical Guardrails"]

        AgoraRTC["Agora Cloud RTC<br/>Hosted: Agora Global SD-RTN<br/>• Sub-second WebRTC Video/Audio"]
    end

    subgraph PolyglotTier["💾 Polyglot Persistence Tier"]
        MongoDB[("MongoDB 7.0+ (Atlas)<br/>Document Store<br/>• Users & Profiles<br/>• Assessment Responses<br/>• Daily Diet Logs & Adherence<br/>• Knowledge Graph Triples")]
        
        VectorDB[("Vector DB (Pinecone / Qdrant)<br/>Semantic Vector Store<br/>• 384/768-dim Food Vectors<br/>• Classical Sanskrit Scripture Chunks<br/>• Rasa & Guna Metadata Indexes")]
        
        RedisStore[("Redis 7.2+ (Redis Cloud)<br/>In-Memory Cache & Broker<br/>• Diet Job Status & Async Polling<br/>• Cohort Similarity Caching<br/>• Rate Limit Leaky Buckets")]
    end

    SPA -->|HTTPS + JWT Bearer| Gateway
    SPA -.->|WebRTC Signaling & Stream| AgoraRTC
    Gateway -->|Internal Routing| BackendSvc
    BackendSvc -->|Document CRUD| MongoDB
    BackendSvc -->|Job Polling & Caching| RedisStore
    BackendSvc -->|Internal gRPC/REST + HMAC/mTLS| MLSvc
    MLSvc -->|Vector Similarity Queries| VectorDB
    MLSvc -->|Cache Frequent Prompts| RedisStore
```

---

## 2. Why Polyglot Persistence?

Ayurvedic digital healthcare requires handling three completely different types of data shapes and query patterns. A single database cannot optimize for all three without severe trade-offs.

| Database Engine | Data Type / Model | Why It Is Used in AyurVarta | Stored Collections / Keys |
| :--- | :--- | :--- | :--- |
| **MongoDB Atlas** | Document / JSON Hierarchical & Graph Triples | Assessment answer trees, user health profiles, and dietary history have variable schemas and nested objects. Flexible schema allows painless evolution of quiz questionnaires without migrations. Also stores subject-predicate-object knowledge triples (`kg_entities`, `kg_relations`). | `users`, `assessments`, `diet_plans`, `diet_logs`, `kg_entities`, `kg_relations` |
| **Pinecone / Qdrant** | High-Dimensional Dense & Sparse Vectors | Enables semantic search over classical Ayurvedic dietary items based on natural language queries, clinical conditions, tastes (*Rasas*), and elemental qualities (*Gunas*). Metadata filtering allows instant elimination of patient food allergens. | `ayurvedic-foods-v2` index (with namespaces for food items and scripture passages) |
| **Redis** | In-Memory Key-Value & Atomic Data Structures | Generation of custom diet plans takes 4–12 seconds via LLMs. Storing job state (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) in Redis enables sub-millisecond polling for the frontend. Redis also caches similar cohort diets (e.g. "Vata-dominant + Manda Agni in Grishma season") to avoid redundant LLM invocations. | `job:{jobId}`, `cohort:{hash}`, `ratelimit:{ip}:{minute}`, `token:denylist:{jti}` |

---

## 3. Distributed Service Boundaries

Each service in the architecture owns its exclusive boundary and runtime:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AyurVarta Platform                            │
├─────────────────────┬──────────────────────┬───────────────────────────┤
│ Service             │ Boundary Ownership   │ Prohibited Activities     │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ Frontend SPA        │ Presentation, User   │ Direct database calls,    │
│                     │ Interaction, WebRTC  │ Direct LLM API keys in    │
│                     │ client handling.     │ client code (in prod).    │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ Core Backend        │ Business logic, auth │ Running heavy GPU LLM     │
│                     │ validation, workflow │ inference or raw vector   │
│                     │ orchestration.       │ distance calculations.    │
├─────────────────────┼──────────────────────┼───────────────────────────┤
│ ML Inference        │ Vector retrieval,    │ Direct user auth, user    │
│                     │ LLM generation,      │ profile editing, managing │
│                     │ clinical guardrails. │ payment transactions.     │
└─────────────────────┴──────────────────────┴───────────────────────────┘
```

---

## 4. End-to-End User Flow: Clinical Diet Plan Generation

Here is how all distributed components collaborate during a complete diet generation lifecycle:

```mermaid
sequenceDiagram
    autonumber
    actor User as Patient / User
    participant FE as Frontend SPA
    participant GW as API Gateway
    participant BE as Core Backend Svc
    participant RD as Redis Cache
    participant MG as MongoDB
    participant ML as ML Inference Svc
    participant VDB as Vector DB (Pinecone)

    User->>FE: Completes Prakriti, Vikriti & Agni Quizzes
    FE->>GW: POST /api/v1/assessments (JWT)
    GW->>BE: Forward assessment payload
    BE->>MG: Save assessment scores into `assessments`
    BE-->>FE: Return Assessment Summary (e.g. Vata 54%, Pitta 28%, Kapha 18%)

    User->>FE: Clicks "Generate Ayurvedic Diet Plan"
    FE->>GW: POST /api/v1/diet-jobs/start
    GW->>BE: Forward Diet Generation Request
    BE->>RD: Check Cohort Cache (hash of Doshas + Agni + Season)
    alt Cache Hit
        RD-->>BE: Cached Diet Plan
        BE-->>FE: Job status COMPLETED (Immediate)
    else Cache Miss
        BE->>RD: Create Job `job:{uuid}` -> status: PENDING
        BE-->>FE: Return { jobId: "uuid", status: "PENDING" }
        BE-)ML: POST /internal/v1/rag/generate-diet (async/background)
        
        ML->>ML: Expand query with classical Rasas & Gunas
        ML->>VDB: Query top-K food items (filter out allergens)
        VDB-->>ML: Return 15 candidate Ayurvedic foods
        ML->>ML: Invoke Gemini 2.5 / Groq with clinical constraints
        ML->>ML: Run Viruddha Ahara Guardrail (18 Charaka Rules)
        ML-->>BE: Return validated Diet Plan JSON
        
        BE->>MG: Persist plan in `diet_plans`
        BE->>RD: Update `job:{uuid}` -> COMPLETED + cache result
    end

    loop Every 2.5s until COMPLETED
        FE->>GW: GET /api/v1/diet-jobs/{jobId}
        GW->>BE: Query job
        BE->>RD: Read `job:{uuid}`
        RD-->>BE: { status: "COMPLETED", plan: { ... } }
        BE-->>FE: Return Diet Plan Payload
    end

    FE->>User: Renders personalized meal chart & safety alerts
```

---

## 5. Security & Distributed Tracing

1. **Request Correlation ID**: Every inbound HTTP request at the API Gateway receives an `X-Request-Id` (e.g., `req_8f12a84c`). This header is propagated across Core Backend, Redis, ML Service, and in every structured log line.
2. **Internal Service Authentication**: The ML service is not exposed to the public internet. It accepts incoming traffic only from the Core Backend IP/VPC with an `X-Internal-Service-Key` HMAC header.
3. **Secrets Management**: All third-party secrets (`GEMINI_API_KEY`, `PINECONE_API_KEY`, `MONGODB_URI`, `REDIS_URL`, `AGORA_APP_CERTIFICATE`) are injected at runtime via environment variables or secret managers (AWS Secrets Manager, GCP Secret Manager, or Doppler).
