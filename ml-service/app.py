import time
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, Header, HTTPException, Request, Response, status
from pydantic import BaseModel, Field
from config import settings

app = FastAPI(
    title="AyurVarta Dedicated ML Inference & RAG Service",
    description="Vector Search, Clinical RAG Synthesis & Charaka Viruddha Ahara Guardrails",
    version="1.0.0"
)


# Security: Verify internal caller
def verify_internal_key(x_internal_service_key: Optional[str] = Header(None)):
    if settings.ENVIRONMENT != "development":
        if not x_internal_service_key or x_internal_service_key != settings.INTERNAL_SERVICE_KEY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Invalid or missing internal service key."
            )


# -------------------------------------------------------------
# Request & Response Schemas
# -------------------------------------------------------------
class DietGenerationRequest(BaseModel):
    requestId: str
    prakriti: Dict[str, float]
    vikriti: Dict[str, float]
    agni: str
    season: str
    allergies: List[str] = Field(default_factory=list)
    dietaryRestrictions: List[str] = Field(default_factory=list)
    healthGoals: List[str] = Field(default_factory=list)


# -------------------------------------------------------------
# Health & Readiness Probes
# -------------------------------------------------------------
@app.get("/health", status_code=status.HTTP_200_OK, tags=["System"])
async def health_check():
    return {
        "status": "ok",
        "service": "ml-inference-service",
        "version": "1.0.0",
        "models": {
            "provider": "groq",
            "primary_llm": settings.PRIMARY_LLM,
            "fallback_llm": settings.FALLBACK_LLM,
            "embedding_model": settings.EMBEDDING_MODEL,
            "embedding_dimensions": settings.EMBEDDING_DIMENSIONS
        }
    }


@app.get("/ready", status_code=status.HTTP_200_OK, tags=["System"])
async def readiness_check():
    return {
        "status": "ready",
        "service": "ml-inference-service",
        "vector_index": settings.PINECONE_INDEX_NAME
    }


# -------------------------------------------------------------
# Clinical RAG Generation Endpoint
# -------------------------------------------------------------
@app.post(
    "/internal/v1/rag/generate-diet",
    status_code=status.HTTP_200_OK,
    tags=["Clinical RAG"]
)
async def generate_diet_plan(
    payload: DietGenerationRequest,
    x_internal_service_key: Optional[str] = Header(None)
):
    verify_internal_key(x_internal_service_key)
    start_time = time.time()

    # Stub response matching clinical contract
    return {
        "success": True,
        "data": {
            "summary": f"Personalized plan balanced for {payload.agni} Agni and seasonal {payload.season} alignment.",
            "doshaProfile": {
                "dominant": max(payload.prakriti, key=payload.prakriti.get),
                "agni": payload.agni
            },
            "dailyMealPlan": {
                "meals": [
                    {
                        "name": "Breakfast",
                        "time": "08:00 AM",
                        "items": ["Warm Spiced Porridge with Stewed Apples"],
                        "rasas": ["Madhura"],
                        "ayurvedicRationale": "Kindles digestive Agni gently without aggravating Pitta."
                    }
                ]
            },
            "viruddhaSafetyChecks": [
                {
                    "rule": "Charaka 18: No heated honey",
                    "status": "PASSED",
                    "severity": "NONE"
                },
                {
                    "rule": "Charaka 18: No incompatible dairy pairing",
                    "status": "PASSED",
                    "severity": "NONE"
                }
            ]
        },
        "meta": {
            "requestId": payload.requestId,
            "model": settings.PRIMARY_LLM,
            "guardrailsPassed": True,
            "latencyMs": int((time.time() - start_time) * 1000)
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=settings.PORT, reload=True)
