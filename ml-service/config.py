from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PORT: int = 8001
    ENVIRONMENT: str = "development"
    INTERNAL_SERVICE_KEY: str = "dev_internal_secret_key_123"

    # Vector DB
    PINECONE_API_KEY: str = "mock_pinecone_key"
    PINECONE_ENVIRONMENT: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "ayurvedic-foods-v2"

    # Groq LLM Inference
    GROQ_API_KEY: str = "mock_groq_key"

    # Model Configurations
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    EMBEDDING_DIMENSIONS: int = 384
    PRIMARY_LLM: str = "llama-3.3-70b-versatile"
    FALLBACK_LLM: str = "openai/gpt-oss-120b"
    LLM_TEMPERATURE: float = 0.2

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
