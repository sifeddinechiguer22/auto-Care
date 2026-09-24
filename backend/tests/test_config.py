import os

from app.config import Settings


def test_settings_default_database_uses_mysql(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    settings = Settings()
    assert settings.database_url.startswith("mysql")
