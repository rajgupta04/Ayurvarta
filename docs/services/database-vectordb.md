# Service Documentation: Vector Database Service (`database-vectordb`)

> **Technology**: Pinecone Serverless (or Qdrant / Milvus self-hosted)  
> **Role in Polyglot Architecture**: Semantic Retrieval & Embedding Store for Ayurvedic Foods & Scriptures  
> **Index Name**: `ayurvedic-foods-v2`  
> **Metric**: Cosine Similarity  
> **Vector Dimension**: 384 dimensions (`BAAI/bge-small-en-v1.5` via FastEmbed)  

---

## 1. Role in the Polyglot Architecture

The Vector Database provides sub-second semantic search over high-dimensional text embeddings. In the AyurVarta architecture:
- Natural language clinical queries (e.g. *"light warm grounding dinner for dry skin and variable digestion in winter"*) are converted into dense vector embeddings.
- The Vector DB computes cosine nearest-neighbors against hundreds of classical Ayurvedic dishes, ingredients, and medicinal dietary preparations.
- Crucially, it applies **hard metadata filtering** directly inside the vector search query, eliminating candidate foods containing patient allergies before the LLM prompt is assembled.

---

## 2. Namespaces & Metadata Schemas

The index is partitioned into two distinct namespaces:

### Namespace 1: `foods` (Ayurvedic Food Library)
Every vector represents a classical dish or ingredient alongside rich Ayurvedic metadata:

```json
{
  "id": "food_mung_soup_01",
  "values": [0.034, -0.012, 0.089, ...], // 384-dimensional dense vector
  "metadata": {
    "name": "Mung Bean and Ginger Soup (Mudga Yusha)",
    "category": "Soup / Warm Meal",
    "rasas": ["Madhura", "Kashaya"],
    "gunas": ["Laghu", "Ruksha"],
    "virya": "Sheeta",
    "vipaka": "Madhura",
    "dosha_vata": -1,
    "dosha_pitta": -2,
    "dosha_kapha": -1,
    "allergens": [],
    "seasons": ["varsha", "sharad", "vasanta", "all_seasons"],
    "classical_reference": "Charaka Samhita Sutrasthana 27",
    "preparation_time_minutes": 25,
    "is_digestive_fire_enhancer": true
  }
}
```

### Namespace 2: `scriptures` (Classical Ayurvedic Formulations)
Stores chunked passages from *Charaka Samhita*, *Sushruta Samhita*, and *Bhavaprakasha Nighantu* for citation grounding and verification.

```json
{
  "id": "text_charaka_sutra_27_12",
  "values": [0.011, 0.045, -0.063, ...],
  "metadata": {
    "book": "Charaka Samhita",
    "chapter": "Sutrasthana 27: Annapanavidhi",
    "verse": "12-14",
    "topic": "Properties of Mudga (Green Gram)",
    "sanskrit_shloka": "मुद्गो रूक्षो लघुः शीतो मधुरः कफपित्तहा...",
    "english_translation": "Mung bean is astringent and sweet, light to digest, cooling, and pacifies both Kapha and Pitta."
  }
}
```

---

## 3. Query Construction with Metadata Filtering

During the RAG pipeline execution, the ML Inference Service executes filtered queries against Pinecone:

```python
# Executed in ml-service/pipeline/vector_retriever.py
query_response = index.query(
    namespace="foods",
    vector=query_embedding,
    top_k=15,
    include_metadata=True,
    filter={
        # Filter 1: Eliminate any item with patient's registered allergens
        "allergens": { "$nin": ["gluten", "peanuts", "dairy"] },
        # Filter 2: Match current season
        "seasons": { "$in": ["hemanta", "all_seasons"] },
        # Filter 3: Ensure food does not severely aggravate patient's dominant Vikriti
        "dosha_vata": { "$lte": 0 }
    }
)
```

---

## 4. Ingestion & Index Maintenance

- **Ingestion Pipeline**: Text documents and food item catalogs are sanitized, chunked, and embedded via automated CLI script (`ingestion/run_pipeline.py`).
- **Idempotency**: Upserts use deterministic UUIDs generated from the food item code (`uuid5(NAMESPACE_DNS, food_name)`) so running the ingestion script repeatedly never generates duplicate vector entries.
- **Backups**: Pinecone index collections are periodically snapshotted before schema updates.
