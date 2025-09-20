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

os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('data/logs/bot.log')
    ]
)

logger = logging.getLogger(__name__)

def check_requirements():
    """Check if all required packages are installed"""
    required_packages = [
        'telegram',
        'groq',
        'chromadb',
        'sentence_transformers',
        'dotenv'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"  - {package}")
        print("\n📦 Install missing packages with:")
        print("   pip install -r requirements.txt")
        return False
    
    return True

def check_configuration():
    """Check if bot is properly configured"""
    try:
        from config.settings import validate_config
        validate_config()
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        print("\n🔧 Run setup script:")
        print("   python scripts/setup_bot.py")
        return False

def main():
    """Main function to run the bot"""
    print("""
    🌾 Ghana Agricultural Bot 🌾
    ============================
    AI-Powered Farming Advisor
    """)
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Check configuration
    if not check_configuration():
        sys.exit(1)
    
    try:
        # Import and run bot
        from src.bot import GhanaAgriBot
        
        logger.info("Starting Ghana Agricultural Bot...")
        
        bot = GhanaAgriBot()
        
        print("\n✅ Bot is running!")
        print("📱 Open Telegram and message your bot")
        print("🛑 Press Ctrl+C to stop\n")
        
        bot.run()
        
    except KeyboardInterrupt:
        print("\n\n👋 Bot stopped by user")
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        print(f"\n❌ Error: {e}")
        print("Check logs at: data/logs/bot.log")
        sys.exit(1)

if __name__ == "__main__":
    main()