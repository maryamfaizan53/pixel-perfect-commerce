"""Central settings, loaded from environment / .env."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- app ---
    environment: str = "development"
    allowed_origins: str = "http://localhost:8080,http://localhost:5173,https://www.aibazar.pk,https://aibazar.pk"
    admin_api_token: str = ""  # guards /admin/* (set to a long random string)

    # --- Sanity ---
    sanity_project_id: str = ""
    sanity_dataset: str = "production"
    sanity_api_version: str = "2024-10-01"
    sanity_read_token: str = ""       # Viewer token
    sanity_write_token: str = ""      # Editor token (imports only)
    sanity_use_cdn: bool = True

    # --- Supabase ---
    supabase_url: str = ""
    supabase_service_key: str = ""    # service_role — server only
    supabase_jwt_secret: str = ""     # to verify frontend user JWTs

    # --- cache ---
    catalog_cache_ttl: int = 300      # seconds

    # --- payments (Safepay) ---
    safepay_environment: str = "sandbox"
    safepay_api_key: str = ""
    safepay_secret_key: str = ""
    safepay_webhook_secret: str = ""

    # --- notifications ---
    whatsapp_notify_number: str = "+923328222026"
    # Transactional email (Resend). RESEND_API_KEY is injected by the Vercel
    # Marketplace integration; falls back to no-op if unset.
    resend_api_key: str = ""
    order_notification_email: str = "samad.x747@gmail.com"  # store owner — gets an alert per order
    email_from: str = "AI Bazar <onboarding@resend.dev>"    # switch to orders@aibazar.pk once the domain is verified in Resend

    # --- AI chatbot (carried from chatbot/) ---
    gemini_api_key: str = ""
    openai_api_key: str = ""

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def sanity_query_host(self) -> str:
        sub = "apicdn" if self.sanity_use_cdn else "api"
        return f"https://{self.sanity_project_id}.{sub}.sanity.io/v{self.sanity_api_version}"

    @property
    def sanity_mutate_host(self) -> str:
        # mutations must never hit the CDN
        return f"https://{self.sanity_project_id}.api.sanity.io/v{self.sanity_api_version}"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
