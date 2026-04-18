# AyurVarta Frontend

This is the React frontend for the Ayurvedic Diet Planner experience.

The backend is intentionally separate and lives in a different folder/repository:

- Frontend: `Ayurvarta/frontend`
- RAG backend (FastAPI): `backend/babayogi`

## What This Frontend Connects To

The app uses these backend APIs:

- `POST /generate-diet-plan`
- `POST /diet-jobs/start`
- `GET /diet-jobs/{job_id}`
- `GET /diet-jobs/latest`
- `POST /diet-logs`
- `GET /diet-logs`
- `DELETE /diet-logs/{log_id}`
- Auth routes under `/auth/*`

## Environment

Create `.env` (or copy from `.env.example`):

```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_GEMINI_API_KEY=
```

## Run Locally

1. Start backend (from `backend/babayogi`):

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

2. Start frontend (from `Ayurvarta/frontend`):

```bash
npm install
npm start
```

3. Open `http://localhost:3000`

## Available Scripts

- `npm start` - run dev server
- `npm test` - run tests
- `npm run build` - production build

## Notes

- `src/setupProxy.js` is configured for local dev routes but frontend API calls already support direct base URL via `REACT_APP_API_BASE_URL`.
- If backend and frontend are deployed separately, set `REACT_APP_API_BASE_URL` to the deployed backend origin.
