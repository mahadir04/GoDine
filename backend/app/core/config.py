from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GoDine"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "supersecretkeygeodine2026forlocaldevelopmentpurposesonly"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days

    # Google OAuth Configuration (Loaded from .env)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # Database
    # Default to local sqlite for zero-config run
    DATABASE_URL: str = "sqlite:///./geodine.db"

    # Services Fallback
    MOCK_MILVUS: bool = True
    MOCK_REDIS: bool = True
    MOCK_NLP: bool = True

    # Vector DB
    MILVUS_HOST: str = "localhost"
    MILVUS_PORT: int = 19530

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
