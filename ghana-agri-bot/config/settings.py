#config/settings.py
"""
Configuration settings for Ghana Agricultural Bot
Purpose: Centralize all configuration and environment variables
"""

import os
from dataclasses import dataclass
from pathlib import Path
from typing import List

# Optional .env support
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")
except Exception:
    pass


def _env(name: str, default: str = "") -> str:
    v = os.getenv(name)
    return v if v is not None else default


def _env_list(name: str, default_csv: str) -> List[str]:
    val = os.getenv(name, default_csv)
    return [s.strip() for s in val.split(",") if s.strip()]


@dataclass(frozen=True)
class _Settings:
    TELEGRAM_BOT_TOKEN: str = _env("TELEGRAM_BOT_TOKEN", "")
    GROQ_API_KEY: str = _env("GROQ_API_KEY", "")
    # LLM defaults
    LLM_MODEL: str = _env("LLM_MODEL", "gemma2-9b-it")
    MAX_TOKENS: int = int(_env("MAX_TOKENS", "1500"))
    CONFIDENCE_THRESHOLD: float = float(_env("CONFIDENCE_THRESHOLD", "0.5"))
    # Weather (optional; OpenWeatherMap style key). Leave blank to use Open-Meteo fallback.
    WEATHER_API_KEY: str = _env("WEATHER_API_KEY", "")
    WEATHER_UNITS: str = _env("WEATHER_UNITS", "metric")
    GHANA_TRUSTED_DOMAINS: List[str] = None  # type: ignore[assignment]
    SEARCH_MAX_RESULTS: int = int(_env("SEARCH_MAX_RESULTS", "8"))

    def __post_init__(self):
        object.__setattr__(self, "GHANA_TRUSTED_DOMAINS", _env_list(
            "GHANA_TRUSTED_DOMAINS",
            "mofa.gov.gh,csir.org.gh,fao.org,agra.org,agricultureinghana.com,agritradergh.com,ifad.org"
        ))


# Export both an object and module-level aliases for compatibility
SETTINGS = _Settings()

TELEGRAM_BOT_TOKEN: str = SETTINGS.TELEGRAM_BOT_TOKEN
GROQ_API_KEY: str = SETTINGS.GROQ_API_KEY
LLM_MODEL: str = SETTINGS.LLM_MODEL
MAX_TOKENS: int = SETTINGS.MAX_TOKENS
CONFIDENCE_THRESHOLD: float = SETTINGS.CONFIDENCE_THRESHOLD
WEATHER_API_KEY: str = SETTINGS.WEATHER_API_KEY
WEATHER_UNITS: str = SETTINGS.WEATHER_UNITS
GHANA_TRUSTED_DOMAINS: List[str] = SETTINGS.GHANA_TRUSTED_DOMAINS
SEARCH_MAX_RESULTS: int = SETTINGS.SEARCH_MAX_RESULTS

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DOCUMENTS_DIR = DATA_DIR / "documents"
PROCESSED_DIR = DATA_DIR / "processed"
FEEDBACK_DIR = DATA_DIR / "feedback"

# Create directories if they don't exist
for dir_path in [DOCUMENTS_DIR, PROCESSED_DIR, FEEDBACK_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Google Sheets Configuration
GOOGLE_SHEETS_KEY_FILE = os.getenv("GOOGLE_SHEETS_KEY_FILE")
SPREADSHEET_NAME = os.getenv("SPREADSHEET_NAME", "Ghana_Farming_Bot_Data")

# Bot Configuration
DEFAULT_LANGUAGE = os.getenv("DEFAULT_LANGUAGE", "en")
RESPONSE_TIMEOUT = int(os.getenv("RESPONSE_TIMEOUT", "30"))
MIN_RESPONSE_LENGTH = 100  # Minimum expected response length

# Response quality settings
ENABLE_RESPONSE_VALIDATION = True

# Model Configuration
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # Lightweight, CPU-friendly

# ChromaDB Configuration
CHROMA_PERSIST_DIR = str(PROCESSED_DIR / "chroma_db")
COLLECTION_NAME = "ghana_agriculture"

# Supported crops and regions
SUPPORTED_CROPS = [
    "maize", "corn", "cocoa", "cassava", "yam", "plantain", 
    "rice", "groundnut", "peanut", "tomato", "pepper", "okra"
]

GHANA_REGIONS = [
    "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
    "Volta", "Northern", "Upper East", "Upper West", "Brong Ahafo"
]

# Validate critical configurations
def validate_config():
    """Validate that all critical configurations are set"""
    errors = []
    
    if not TELEGRAM_BOT_TOKEN:
        errors.append("TELEGRAM_BOT_TOKEN is not set")
    
    if not GROQ_API_KEY:
        errors.append("GROQ_API_KEY is not set")
    
    if errors:
        raise ValueError(f"Configuration errors: {', '.join(errors)}")

# Run validation on import
validate_config()