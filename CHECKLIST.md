# AyurVarta — Implementation Checklist & Progress Tracker

> **Project**: AyurVarta (SIH 2025) — Personalized Ayurvedic Diet Generation RAG  
> **Status**: In Active Development  
> **Last Updated**: November 2026  

---

## 📊 High-Level Status Dashboard

| Phase | Scope | Target Sprints | Status | Progress |
| :--- | :--- | :---: | :---: | :---: |
| **0. Quick Wins** | Repo health, test runner & config fixes | Immediate | **DONE** | 100% |
| **1A. Ayurvedic Ontology** | Tridosha, Shad-Rasa, Gunas, Agni, Viruddha Ahara, Ritucharya | Sprint 1 | **DONE** | 100% |
| **1B. Pipeline Integration** | Connect ontology to Pinecone search, prompt & safety checks | Sprint 1 | **DONE** | 100% |
| **1C. Knowledge Graph** | MongoDB entity triples & graph relationships | Sprint 2 | **PENDING** | 0% |
| **2. Retrieval Pipeline** | Query router, hybrid dense+BM25, graph search, reranker | Sprint 3–4 | **IN PROGRESS** | 25% |
| **3. Clinical Guardrails** | Strict Pydantic output validation, CRAG, source citations | Sprint 5–6 | **IN PROGRESS** | 30% |
| **4. Feedback & Observability** | Adherence-driven scoring, structured logging, fine-tuning | Sprint 6+ | **PENDING** | 0% |

---

## ✅ Phase 0: Quick Wins & Repository Health
- [x] **Frontend test suite fix**: Fixed broken test assertion in `Ayurvarta/frontend/src/App.test.js`.
- [x] **Jest environment compatibility**: Added virtual mocks for `react-router-dom` v7 and `agora-rtc-sdk-ng` (`npm test` passes 100%).
- [x] **Firebase export fix**: Fixed truncated `expor` token in `Ayurvarta/frontend/src/firebase/config.js`.
- [x] **Production build check**: Verified `npm run build` succeeds cleanly producing static production bundle.

---

## ✅ Phase 1A: Ayurvedic Knowledge Ontology
- [x] **Tridosha & Concept Rules** (`backend/babayogi/ontology/dosha_rules.json`):
  - [x] Tridosha (Vata, Pitta, Kapha) with elements, seats, qualities, and balance indicators.
  - [x] Shad-Rasa (6 tastes: Madhura, Amla, Lavana, Katu, Tikta, Kashaya) with elemental makeup, Virya, Vipaka, and numeric dosha effects (-2 to +2).
  - [x] Vimshati Guna (20 qualities in 10 opposite pairs) mapped to dosha increase/decrease.
  - [x] Chaturvidha Agni (Sama, Vishama, Tikshna, Manda) with diagnostic signs and herbal remedies.
  - [x] Sapta Dhatu (7 bodily tissues) with sequential nourishment flow.
  - [x] Dvandvaja Prakriti (6 dual-dosha combinations) with priority dietary focus.
- [x] **Viruddha Ahara Incompatibility Rules** (`backend/babayogi/ontology/viruddha_rules.json`):
  - [x] Charaka's 18 categories of food incompatibility (Ashtadasha Viruddha).
  - [x] 20 specific food combination rules (e.g. equal honey + ghee, heated honey, milk + fish, milk + sour fruit, curd at night, etc.) with classical citations (*Charaka*, *Vagbhata*, *Sushruta*).
  - [x] Severity categorization (`critical`, `high`, `medium`, `low`).
  - [x] Multilingual food aliases for fuzzy and token matching (e.g. *madhu / shahad / raw honey*).
- [x] **Ritucharya Seasonal Regimens** (`backend/babayogi/ontology/ritu_charya.json`):
  - [x] 6 Ritus (Shishira, Vasanta, Grishma, Varsha, Sharad, Hemanta).
  - [x] Uttarayana (depleting) & Dakshinayana (nourishing) ayana cycles.
  - [x] Seasonal dosha accumulation, aggravation, and pacification states.
  - [x] Seasonal Agni strengths and dietary recommendations (foods to favor, foods to reduce).
  - [x] English-to-Ritu and Month-to-Ritu automatic resolution mapping.
- [x] **Pydantic v2 Schema Validator** (`backend/babayogi/ontology/schema.py`):
  - [x] Strict validation models for all concepts, preventing silent schema drift.
  - [x] `validate_all()` function ensuring all 3 JSON files strictly match schemas.
- [x] **Runtime Query Engine** (`backend/babayogi/ontology/loader.py`):
  - [x] `AyurvedicOntology` class with cached lookup indexes.
  - [x] `get_pacifying_rasas()` & `get_aggravating_rasas()`.
  - [x] `get_pacifying_qualities()`.
  - [x] `resolve_season()` supporting English season names and month numbers.
  - [x] `check_viruddha()` with token/word-boundary fuzzy alias matching.
  - [x] `build_context()` packaging profile, dosha, agni, and seasonal context for LLM generation.
- [x] **CLI Verification Suite** (`backend/babayogi/ontology/verify.py`):
  - [x] Automated test runner (`python -m ontology.verify`) checking schema, cross-references, and runtime queries.
  - [x] Windows UTF-8 terminal encoding support with colored pass/fail reporting.

---

## ✅ Phase 1B: Ontology Pipeline Integration
- [x] **Semantic query expansion**: In `backend/babayogi/logic.py`, Pinecone queries now automatically include ontology-derived pacifying tastes (Rasas) and qualities (Gunas).
- [x] **Deterministic prompt grounding**: Injected verified Ayurvedic rules into the Gemini 2.5 Pro prompt to constrain meal plan generation.
- [x] **Viruddha safety post-check**: Implemented post-generation safety scan on all recommended foods; appends `viruddha_safety_checks` warnings directly into the API response.

---

## ⏳ Phase 1C: Knowledge Graph & Data Ingestion
- [ ] **Data Sourcing**: Extract structured text chunks from classical texts (*Charaka Samhita*, *Bhavaprakasha Nighantu*).
- [ ] **Semantic Chunker** (`ingestion/chunker.py`): Chunk text by dish, herb, and seasonal rule with ontology tags.
- [ ] **Entity Triple Extractor** (`ingestion/graph_builder.py`): Extract `(Food) -> [pacifies] -> (Dosha)` triples into MongoDB `kg_entities` and `kg_relations`.
- [ ] **Automated CLI Ingestion** (`ingestion/run_pipeline.py`): End-to-end command to re-index foods and rebuild knowledge triples.

---

## ⏳ Phase 2: Advanced Retrieval Pipeline
- [x] **Ontology Query Enrichment** (Initial version live in `logic.py`).
- [ ] **Query Router** (`retrieval/query_router.py`):
  - [ ] Classify user query intent (meal plan vs acute symptom vs general inquiry).
  - [ ] Route across dense semantic search, sparse lexical search, and deterministic graph traversal.
- [ ] **Hybrid Search** (`retrieval/vector_search.py`):
  - [ ] Dense vector retrieval (Gemini embeddings) + Sparse BM25 retrieval for exact spice/dish names.
- [ ] **Knowledge Graph Traversal** (`retrieval/graph_search.py`):
  - [ ] Deterministic graph query against MongoDB `kg_relations` for absolute contraindications and guaranteed pacifying dishes.
- [ ] **Cross-Encoder Reranker** (`retrieval/reranker.py`):
  - [ ] Re-score candidate foods using `sentence-transformers` Cross-Encoder before prompt assembly.
- [ ] **Reciprocal Rank Fusion (RRF)** (`retrieval/fusion.py`):
  - [ ] Merge scored candidate lists from vector, graph, and lexical retrievers with weighted reciprocal rank fusion.

---

## ⏳ Phase 3: Clinical Guardrails & Robust Generation
- [x] **Viruddha Ahara Guardrail** (Initial version live in `logic.py`).
- [ ] **Schema Validator** (`guardrails/schema_validator.py`):
  - [ ] Pydantic output model enforcing exact food slots, portions, and meal timings.
- [ ] **Allergy Cross-Checker** (`guardrails/allergy_checker.py`):
  - [ ] Hard rejection of any recommended dish containing declared allergens.
- [ ] **CRAG (Corrective RAG) Evaluator** (`guardrails/crag_evaluator.py`):
  - [ ] Grounding score computation (ratio of recommended foods present in verified retrieved context).
  - [ ] Trigger re-retrieval loop if grounding score falls below threshold (< 0.70).
- [ ] **Citation & Provenance Injector** (`guardrails/citation_injector.py`):
  - [ ] Tag every recommended item with its backing text or database entry (e.g. *Charaka Samhita Sutra 27*).
- [ ] **Frontend Provenance Display**:
  - [ ] Update `DietPlan.js` UI to render citation badges and Viruddha safety warnings.

---

## ⏳ Phase 4: Feedback Loop & Observability
- [ ] **Adherence Feedback Loop**:
  - [ ] Wire `/diet-logs` adherence ratings back into candidate re-ranking (boost liked dishes, penalize abandoned dishes).
- [ ] **Structured Logging & Tracing**:
  - [ ] Structured JSON logging capturing retrieval counts, candidate scores, guardrail status, and latency.
- [ ] **Domain Embedding Fine-Tuning**:
  - [ ] Evaluate fine-tuned Ayurvedic embedding model vs generic embeddings.

---

## 🛠️ Verification Commands

```bash
# 1. Verify Ayurvedic Ontology integrity (all tests must pass)
cd backend/babayogi
python -m ontology.verify

# 2. Run backend API locally
cd backend/babayogi
uvicorn main:app --reload --port 8000

# 3. Run frontend unit tests
cd Ayurvarta/frontend
npm test -- --watchAll=false

# 4. Build frontend production bundle
cd Ayurvarta/frontend
npm run build
```
