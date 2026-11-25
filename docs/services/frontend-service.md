# Service Documentation: Frontend Client Service (`frontend-service`)

> **Directory**: [`frontend/`](../../frontend)  
> **Type**: Presentation Tier / Single Page Application (SPA)  
> **Hosting Options**: Vercel, Cloudflare Pages, AWS Amplify, Netlify, or S3 + CloudFront CDN  
> **Runtime / Stack**: React 19.1, React Router v7.9, Tailwind CSS, Chart.js, Agora RTC SDK  

---

## 1. Role & Architectural Responsibilities

The Frontend Service is the primary interface for users, patients, and Ayurvedic practitioners. It handles:
- **Constitutional Diagnostic Interfaces**:
  - Interactive multi-step questionnaires for Prakriti, Vikriti, and Agni assessments.
  - Client-side validation of quiz inputs and real-time score visualization via Chart.js.
- **Diet Plan Visualization & Adherence Tracking**:
  - Polling async diet generation jobs (`/diet-jobs/:id`) with non-blocking UI loading spinners.
  - Normalizing and rendering meal plans, contraindications (*Viruddha Ahara* alerts), and seasonal (*Ritucharya*) recommendations.
  - Interactive daily meal logging with adherence scoring (1–5 scale).
  - One-click client-side vector PDF generation using `html2canvas` and `jsPDF`.
- **Tele-Consultations**:
  - In-browser low-latency WebRTC video/audio consultation rooms powered by `agora-rtc-sdk-ng`.
- **AI Wellness Conversational Widget**:
  - Interactive chatbot for daily routine (*Dinacharya*) lifestyle inquiries.

---

## 2. Key Modules & Page Structure

```
frontend/src/
├── api/
│   ├── assessment.js          # API client for saving & fetching assessment scores
│   └── diet.js                # API client for diet job start, polling, and logs
├── components/
│   ├── AgniDailyModal.js      # Quick daily digestive fire check modal
│   ├── Chatbot.js             # Floating Ayurvedic conversational assistant
│   ├── DietPreferencesModal.js# Dietary restrictions, cuisine, and allergy selectors
│   ├── ProtectedRoute.js      # Client-side route guard enforcing authenticated sessions
│   └── TriCardQuestion.js     # Three-pillar card layout for Prakriti assessment
├── contexts/
│   └── AuthContext.js         # React Context managing session tokens, user state, and RBAC
├── pages/
│   ├── PrakritiAssessment.js  # Baseline constitution test
│   ├── VikritiAssessment.js   # Current imbalance diagnostic
│   ├── AgniAssessment.js      # Digestive metabolism diagnostic
│   ├── Dashboard.js           # Patient health overview, charts, and food library
│   ├── DietPlan.js            # Live diet plan view, daily tracker, and PDF export
│   └── VideoConsultation.js   # Agora RTC tele-consultation room
└── utils/
    ├── assessmentStorage.js   # Client caching of draft questionnaire scores
    └── profileStorage.js      # LocalStorage backup for offline profile hydration
```

---

## 3. Communication & Inter-Service API Contracts

The Frontend Service communicates exclusively with the **Core Backend Gateway**:

| Operation | Method | Route | Description |
| :--- | :---: | :--- | :--- |
| **Save Assessment** | `POST` | `/api/v1/assessments` | Sends raw quiz responses and computed Dosha percentages. |
| **Get Latest Assessments**| `GET` | `/api/v1/assessments/latest`| Retrieves historical Prakriti/Vikriti/Agni scores for charts. |
| **Start Diet Generation** | `POST` | `/api/v1/diet-jobs/start` | Dispatches diet generation task with user constraints. |
| **Poll Diet Job** | `GET` | `/api/v1/diet-jobs/:jobId` | Polls task status until `COMPLETED` or `FAILED`. |
| **Log Meal Adherence** | `POST` | `/api/v1/diet-logs` | Logs meal compliance score, notes, and photos. |
| **Join Tele-consult** | `POST` | `/api/v1/telehealth/token` | Requests a short-lived Agora RTC channel token. |

---

## 4. UI / UX State Management (Per Vibe Rules Phase 4)

In accordance with Phase 4 of `Vibe_Rules.md`, all user flows in this service handle:
1. **Loading States**: Full-page skeleton screens and inline circular spinners on all asynchronous network calls (e.g. while diet generation is pending).
2. **Empty States**: If a user visits the Dashboard without completing assessments, guidance cards prompt them to take the Prakriti quiz before generating diets.
3. **Error Feedback**: User-friendly toasts and alerts that do not expose backend stack traces.
4. **Session Expiry**: Interceptors capture 401 Unauthorized responses and redirect users to the `/auth` route while preserving the redirect URL in query params.

---

## 5. Environment Variables (`frontend/.env`)

```ini
# Backend Gateway URL (Leave blank to use local setupProxy.js)
REACT_APP_API_BASE_URL=https://api.ayurvarta.com

# Real-time Video Consultation (Agora)
REACT_APP_AGORA_APP_ID=your_agora_app_id_here

# Optional: Embedded AI Assistant Key (Development mode only)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 6. How to Run Locally

```bash
cd frontend
npm install
npm test -- --watchAll=false    # Run unit and mock integration tests
npm start                       # Starts development server on http://localhost:3000
```
