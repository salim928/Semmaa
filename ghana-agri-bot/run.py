#run.py
# Main entry point
#!/usr/bin/env python3
"""
Main Entry Point for Ghana Agricultural Bot
Purpose: Start the bot with proper logging and error handling
"""

import logging
import sys
import os
from pathlib import Path

from src.logging_setup import setup_logging
from src.project_paths import data_dir
from src.bot import GhanaAgriBot
from config.settings import TELEGRAM_BOT_TOKEN  # use alias, avoids SETTINGS import error

logger = logging.getLogger(__name__)

def main():
    setup_logging(data_dir() / "logs", level=logging.INFO)
    print(
        "\n    🌾 Ghana Agricultural Bot 🌾\n"
        "    ============================\n"
        "    AI-Powered Farming Advisor\n"
    )
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN is missing. Set it in .env or environment.")
        print("❌ Error: TELEGRAM_BOT_TOKEN is not set. Add it to .env")
        return
    logger.info("Starting Ghana Agricultural Bot...")
    bot = GhanaAgriBot(token=TELEGRAM_BOT_TOKEN)
    bot.run()

if __name__ == "__main__":
    main()