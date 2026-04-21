from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Astro Kovesh API"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    frontend_url: str = "http://localhost:5173"

    cors_origins: str = "http://localhost:5173"

    request_timeout_seconds: int = 8
    default_timezone: str = "UTC"

    geocoder_user_agent: str = "astro-kovesh/0.1"
    geocoder_calls_per_minute: int = 30
    geocoder_min_seconds_between_calls: int = 1

    ip_rate_limit_per_minute: int = 60

    @property
    def cors_origins_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
