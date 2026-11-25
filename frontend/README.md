# AyurVarta Frontend (`frontend-service`)

This is the React 19 Single Page Application for the AyurVarta Ayurvedic Wellness & Diet Planner platform.

The backend and AI services are intentionally decoupled and hosted separately:

- **Frontend Client (React 19)**: `Ayurvarta/frontend`
- **Core Backend & API Gateway (Node.js / Express)**: `Ayurvarta/backend`
- **ML Inference & RAG Service (Python / FastAPI + Groq)**: `Ayurvarta/ml-service`

## What This Frontend Connects To

The app communicates with the Node.js Core Backend via REST + JWT:

- `POST /generate-diet-plan` / `POST /diet-jobs/start`
- `GET /diet-jobs/{job_id}` & `GET /diet-jobs/latest`
- `POST /diet-logs`, `GET /diet-logs`, `DELETE /diet-logs/{log_id}`
- `POST /assessments`, `GET /assessments/latest`
- `POST /api/v1/ai/chat` (Groq AI proxy)
- Auth routes under `/auth/*`

## Environment

Create `.env` (or copy from `.env.example`):

```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_GROQ_API_KEY=
REACT_APP_GROQ_MODEL=llama-3.3-70b-versatile
REACT_APP_AGORA_APP_ID=
```

## Run Locally

1. Start the Core Backend (from `Ayurvarta/backend`):

```bash
npm install
npm run dev
```

2. Start the Frontend (from `Ayurvarta/frontend`):

```bash
npm install
npm start
```

3. Open `http://localhost:3000`
