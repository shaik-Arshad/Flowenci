"""
Application configuration via pydantic-settings.
All values can be overridden by a .env file.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Supabase SDK Config
    supabase_url: str = "https://your-project-ref.supabase.co"
    supabase_key: str = "your-anon-or-service-role-key"

    # JWT
    secret_key: str = "change-me-in-production-use-long-random-string"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # OpenAI
    openai_api_key: str = "sk-placeholder"
    openai_model: str = "gpt-4o-mini"
    openai_whisper_model: str = "whisper-1"

    # App
    frontend_url: str = "http://localhost:5173"
    environment: str = "development"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
