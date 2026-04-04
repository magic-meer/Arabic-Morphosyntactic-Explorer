"""Configuration management using Pydantic Settings."""

from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # API settings
    api_host: str = Field(default="0.0.0.0", description="API server host")
    api_port: int = Field(default=8000, description="API server port")
    log_level: str = Field(default="INFO", description="Logging level")

    # Gemini settings
    gemini_api_key: str = Field(..., description="Gemini API key")

    # ChromaDB settings
    chroma_db_path: Path = Field(
        default=Path("./chroma_data"),
        description="Path for ChromaDB data storage",
    )

    # Corpus path
    corpus_path: Path = Field(
        default=Path("../dataset/extracted/quranic-corpus-morphology-0.4.txt"),
        description="Path to Quranic corpus file",
    )


settings = Settings()
