# Service Documentation: In-Memory Cache & Broker Service (`database-redis`)

> **Technology**: Redis 7.2+  
> **Role in Polyglot Architecture**: High-Throughput In-Memory Caching, Async Job Tracking & Rate Limiting  
> **Managed Hosting**: Redis Cloud, Upstash, AWS ElastiCache, or Self-Hosted Redis  
> **Eviction Policy**: `volatile-lru` (Evict keys with an expire set using LRU)  

---

## 1. Role in the Polyglot Architecture

LLM generation and vector embedding queries inherently incur latency (3–10 seconds per request). To maintain sub-second UI responsiveness, Redis serves four crucial in-memory operational roles:

1. **Async Job Polling Buffer**: Decouples the frontend HTTP request from long-running ML generation tasks.
2. **Cohort Similarity Caching**: Caches baseline dietary plans for common constitutional combinations, drastically reducing unnecessary LLM API costs.
3. **Leaky-Bucket Rate Limiting**: Protects sensitive endpoints (auth, quiz submissions, diet generation) from abuse and DDoS attacks.
4. **JWT Revocation Denylist**: Allows immediate token revocation on user logout without forcing database queries on every authenticated request.

---

## 2. Key Namespaces & Data Structures

### 1. Diet Generation Job State (`job:{jobId}`)
- **Data Structure**: Redis Hash or JSON String
- **TTL**: 86,400 seconds (24 hours)
- **Schema**:
  ```json
  {
    "jobId": "job_9a8b7c6d",
    "status": "PROCESSING", // "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
    "progressPercent": 60,
    "currentStage": "Scanning Charaka Viruddha Ahara rules",
    "result": null,
    "error": null,
    "createdAt": 1731974400000,
    "updatedAt": 1731974403500
  }
  ```

### 2. Cohort Similarity Cache (`cohort:{hash}`)
- **Data Structure**: String (compressed JSON)
- **TTL**: 604,800 seconds (7 days)
- **Hash Key Formula**:
  `hash = sha256(dominantDosha + "_" + secondaryDosha + "_" + agniState + "_" + season + "_" + dietaryPreference)`
- **Behavior**: If two patients have identical Doshic imbalances, Agni states, and seasonal contexts, the system retrieves the validated cohort framework from Redis in `< 5ms`, personalizing only specific micro-adjustments instead of synthesizing from scratch.

### 3. Distributed Rate Limiter (`ratelimit:{scope}:{identifier}:{window}`)
- **Data Structure**: String Counter (Atomic `INCR` + `EXPIRE`)
- **TTL**: 60 seconds (1-minute sliding window)
- **Limits**:
  - `POST /api/v1/diet-jobs/start`: Max 5 requests per user per hour.
  - `POST /api/v1/auth/login`: Max 10 attempts per IP per 15 minutes.
  - Public assessment endpoints: Max 60 requests per IP per minute.

### 4. Revoked Token Denylist (`token:denylist:{jti}`)
- **Data Structure**: String (Flag `"1"`)
- **TTL**: Matches remainder of the JWT's `exp` claim.
- **Behavior**: On logout, the JWT identifier (`jti`) is written to Redis. Fast token verification checks this key in RAM before proceeding.

---

## 3. High Availability & Persistence Settings

- **RDB Snapshots**: Taken every 15 minutes if at least 1 key changed.
- **AOF (Append-Only File)**: Enabled with `appendfsync everysec` to prevent data loss during container restarts.
- **TLS Wire Encryption**: Required for all connections in staging and production (`rediss://`).
