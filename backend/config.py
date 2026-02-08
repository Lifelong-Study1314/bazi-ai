"""
Configuration management using Pydantic Settings
Supports environment variables and .env files
"""

from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment"""
    
    # App Configuration
    app_name: str = Field(default="BAZI AI Analysis", alias="APP_NAME")
    version: str = Field(default="1.0.0", alias="VERSION")
    debug: bool = Field(default=False, alias="DEBUG")
    
    # Backend Configuration
    backend_url: str = Field(default="http://localhost:8000", alias="BACKEND_URL")
    frontend_url: str = Field(default="http://localhost:5173", alias="FRONTEND_URL")
    
    # BAZI Configuration
    max_tokens: int = Field(default=8192, alias="MAX_TOKENS")
    api_timeout: int = Field(default=180, alias="API_TIMEOUT")
    
    # AI Provider (deepseek | azure)
    ai_provider: str = Field(default="deepseek", alias="AI_PROVIDER")

    # DeepSeek API Configuration
    deepseek_api_key: str = Field(default="", alias="DEEPSEEK_API_KEY")
    deepseek_base_url: str = "https://api.deepseek.com/v1"
    deepseek_model: str = "deepseek-chat"
    deepseek_temperature: float = 0.7

    # Azure OpenAI Configuration
    azure_api_key: str = Field(default="", alias="AZURE_OPENAI_API_KEY")
    azure_endpoint: str = Field(default="", alias="AZURE_OPENAI_ENDPOINT")
    azure_api_version: str = Field(default="2024-02-01", alias="AZURE_OPENAI_API_VERSION")
    azure_deployment: str = Field(default="", alias="AZURE_OPENAI_DEPLOYMENT")
    
    # Auth & Subscription
    jwt_secret: str = Field(default="bazi-dev-secret-change-in-production", alias="JWT_SECRET")
    auth_provider: str = Field(default="mock", alias="AUTH_PROVIDER")  # "mock" | "supabase"

    # Stripe
    stripe_secret_key: str = Field(default="", alias="STRIPE_SECRET_KEY")
    stripe_webhook_secret: str = Field(default="", alias="STRIPE_WEBHOOK_SECRET")
    stripe_price_id: str = Field(default="", alias="STRIPE_PRICE_ID")

    # Legacy OpenAI config (for backwards compatibility, maps to DeepSeek)
    openai_model: str = Field(default="gpt-4-turbo-preview", alias="OPENAI_MODEL")
    openai_temperature: float = Field(default=0.7, alias="OPENAI_TEMPERATURE")

    # Supabase
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_service_key: str = Field(default="", alias="SUPABASE_SERVICE_KEY")
    
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True,
        populate_by_name=True,
        extra="ignore",  # ← Ignore any unknown env vars
    )


_settings = None


def get_settings():
    """Get application settings (singleton)"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
