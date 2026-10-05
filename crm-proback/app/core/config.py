# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "RetailMetrics 360 API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    GEMINI_API_KEY: str
    CORS_ORIGINS: str = "http://localhost:5173"

    OTP_EXPIRATION_MINUTES: int = 3
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 465
    SMTP_USE_SSL: bool = True
    EMAIL_USER: str
    EMAIL_PASSWORD: str
    EMAIL_FROM: str

    # AWS Credentials & Rekognition Configuration
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_DEFAULT_REGION: str = "us-east-1"
    AWS_REKOGNITION_COLLECTION_ID: str = "crm-retailmetrics-faces"
    AWS_REKOGNITION_CONFIDENCE_THRESHOLD: float = 80.0
    AWS_REKOGNITION_QUALITY_FILTER: str = "AUTO"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
