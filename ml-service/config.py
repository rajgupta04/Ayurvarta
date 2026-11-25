from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PORT: int = 8001
    ENVIRONMENT: str = "development"
    INTERNAL_SERVICE_KEY: str = "dev_internal_secret_key_123"

    # Vector DB
    PINECONE_API_KEY: str = "mock_pinecone_key"
    PINECONE_ENVIRONMENT: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "ayurvedic-foods-v2"

    # LLMs
    GEMINI_API_KEY: str = "mock_gemini_key"
    GROQ_API_KEY: str = "mock_groq_key"

    # Configurations
    EMBEDDING_MODEL: str = "gemini-embedding-001"
    PRIMARY_LLM: str = "gemini-2.5-pro"
    FALLBACK_LLM: str = "groq-llama-3.3-70b-versatile"
    LLM_TEMPERATURE: float = 0.2

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
