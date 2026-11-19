# Service Documentation: Document Database Service (`database-mongodb`)

> **Technology**: MongoDB 7.0+ (Enterprise or MongoDB Atlas)  
> **Role in Polyglot Architecture**: Primary Persistent Document & Knowledge Graph Store  
> **Managed Hosting**: MongoDB Atlas (Multi-AZ Replica Set)  
> **Access Protocol**: Encrypted TLS wire protocol (`mongodb+srv://`)  

---

## 1. Role in the Polyglot Architecture

MongoDB serves as AyurVarta's central operational and clinical document store. It is selected specifically because:
1. **Dynamic Diagnostic Schemas**: Ayurvedic questionnaires contain variable branching questions, multi-select symptom trees, and evolving score breakdowns that vary between baseline Prakriti, transient Vikriti, and digestive Agni.
2. **Deeply Nested Clinical Plans**: Diet plans contain multi-tiered JSON hierarchies (days, meals, ingredients, preparation rules, rasas, contraindications) that map naturally into MongoDB BSON documents without awkward multi-table relational joins.
3. **Knowledge Graph Triples**: Classical Ayurvedic relationships (*Food → pacifies → Dosha*, *Herb → ignites → Agni*) are stored as entity and relation collections for direct graph queries.

---

## 2. Core Collections & Data Schemas

### 1. `users` Collection
Stores patient and practitioner authentication profiles.
```json
{
  "_id": { "$oid": "654c1a2e7f..." },
  "email": "patient@example.com",
  "passwordHash": "$2b$12$e8YkZJ...",
  "role": "patient",
  "displayName": "Ananya Sharma",
  "profile": {
    "age": 28,
    "gender": "female",
    "primaryHealthGoal": "stress and digestion",
    "allergies": ["peanuts", "lactose"]
  },
  "createdAt": { "$date": "2026-11-10T10:00:00Z" },
  "updatedAt": { "$date": "2026-11-18T14:30:00Z" }
}
```

### 2. `assessments` Collection
Stores results of Prakriti, Vikriti, and Agni diagnostic tests.
```json
{
  "_id": { "$oid": "654c2b9a1e..." },
  "userId": { "$oid": "654c1a2e7f..." },
  "type": "prakriti", 
  "scores": {
    "Vata": 54.5,
    "Pitta": 27.3,
    "Kapha": 18.2
  },
  "dominantDosha": "Vata",
  "secondaryDosha": "Pitta",
  "rawAnswers": {
    "body_frame": "thin",
    "skin_type": "dry_rough",
    "sleep_pattern": "light_interrupted"
  },
  "capturedAt": { "$date": "2026-11-18T15:00:00Z" }
}
```

### 3. `diet_plans` Collection
Stores generated personalized diet plans, rationales, and safety checks.
```json
{
  "_id": { "$oid": "654c3d4a8b..." },
  "userId": { "$oid": "654c1a2e7f..." },
  "jobId": "job_9a8b7c6d",
  "season": "Hemanta",
  "doshaProfile": {
    "prakriti": "Vata-Pitta",
    "agni": "Vishama"
  },
  "dailyMealPlan": { ... },
  "viruddhaSafetyChecks": [
    { "rule": "Charaka-18: Honey Heating Check", "status": "PASSED" }
  ],
  "sourceCitations": [
    { "food": "Moong Dal", "classicalText": "Charaka Samhita, Sutrasthana 27" }
  ],
  "createdAt": { "$date": "2026-11-18T15:05:00Z" }
}
```

### 4. `diet_logs` Collection
Tracks daily patient meal logging and adherence scores.
```json
{
  "_id": { "$oid": "654c4e1f9c..." },
  "userId": { "$oid": "654c1a2e7f..." },
  "date": "2026-11-18",
  "mealType": "Lunch",
  "adherenceRating": 5,
  "foodConsumed": "Warm mung soup with basmati rice and ghee",
  "digestiveFeelingAfterMeal": "Light and energized",
  "createdAt": { "$date": "2026-11-18T19:30:00Z" }
}
```

### 5. `kg_entities` & `kg_relations` (Ayurvedic Knowledge Graph)
Stores classical ontology triples for deterministic relationship traversal.
- **`kg_entities`**:
  `{ "_id": "food_mung_bean", "name": "Mung Bean (Mudga)", "type": "Food", "rasa": ["Madhura", "Kashaya"], "virya": "Sheeta" }`
- **`kg_relations`**:
  `{ "_id": "rel_01", "source": "food_mung_bean", "relation": "PACIFIES", "target": "dosha_pitta", "classicalRef": "Bhavaprakasha Nighantu" }`

---

## 3. Database Indexes & Query Optimization

In accordance with Phase 7 of `Vibe_Rules.md`, the following indexes are strictly enforced:

| Collection | Indexed Fields | Type | Purpose |
| :--- | :--- | :---: | :--- |
| `users` | `{ email: 1 }` | Unique | Fast user lookup & duplicate prevention |
| `assessments` | `{ userId: 1, type: 1, capturedAt: -1 }` | Compound | Fast retrieval of patient's latest assessments |
| `diet_plans` | `{ userId: 1, createdAt: -1 }` | Compound | Fast loading of user's active and past diet plans |
| `diet_plans` | `{ jobId: 1 }` | Unique Sparse | Linking asynchronous jobs to generated plans |
| `diet_logs` | `{ userId: 1, date: -1 }` | Compound | Adherence charts & monthly compliance reporting |
| `kg_relations`| `{ source: 1, relation: 1 }` | Compound | Knowledge Graph traversal from entity outward |

---

## 4. Backup & Disaster Recovery

- **Continuous Cloud Backups**: Point-In-Time Restore (PITR) enabled via MongoDB Atlas with a 7-day restore window.
- **Daily Snapshots**: Automated daily snapshots retained for 30 days.
- **Connection Security**: Strict IP access list (VPC peering or specific Backend container IPs only). All connections require TLS 1.3 encryption.
