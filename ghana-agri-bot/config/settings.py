"""
Configuration settings for Ghana Agricultural Bot
Purpose: Centralize all configuration and environment variables
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DOCUMENTS_DIR = DATA_DIR / "documents"
PROCESSED_DIR = DATA_DIR / "processed"
FEEDBACK_DIR = DATA_DIR / "feedback"

# Create directories if they don't exist
for dir_path in [DOCUMENTS_DIR, PROCESSED_DIR, FEEDBACK_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# API Keys
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")

# Google Sheets Configuration
GOOGLE_SHEETS_KEY_FILE = os.getenv("GOOGLE_SHEETS_KEY_FILE")
SPREADSHEET_NAME = os.getenv("SPREADSHEET_NAME", "Ghana_Farming_Bot_Data")

# Bot Configuration
DEFAULT_LANGUAGE = os.getenv("DEFAULT_LANGUAGE", "en")
RESPONSE_TIMEOUT = int(os.getenv("RESPONSE_TIMEOUT", "30"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "500"))
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.7"))

# Model Configuration
LLM_MODEL = "llama-3.3-70b-versatile"  # Groq's supported model as of Sep 2025
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