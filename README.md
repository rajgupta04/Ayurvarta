# AyurVarta - Ayurvedic Diet Planner

This workspace is split into two independent apps:

- Frontend app: `Ayurvarta/frontend` (React)
- Backend app: `../backend/babayogi` (FastAPI + RAG pipeline)

## Project Intent

AyurVarta generates personalized Ayurvedic diet guidance from:

- Prakriti and Vikriti scores
- Agni and lifestyle context
- Dietary preferences, allergies, and seasonal factors

The backend uses a RAG workflow to retrieve relevant Ayurvedic food knowledge and generate structured plans.

## Local Development

1. Run backend:

```bash
cd ../backend/babayogi
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

2. Run frontend:

```bash
cd frontend
npm install
npm start
```

3. Ensure frontend env (`frontend/.env`) contains:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
```

## Deployment Model

- Deploy frontend and backend separately.
- Point frontend `REACT_APP_API_BASE_URL` to the backend deployment URL.
- Configure backend `CORS_ORIGINS` to include frontend origins.
