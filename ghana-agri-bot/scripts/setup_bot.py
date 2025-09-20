# One-time bot setup
"""
Bot Setup Script
Purpose: One-time setup for Telegram bot and initial configuration
"""

import os
import sys
import json
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from config.settings import BASE_DIR, DATA_DIR

def create_directory_structure():
    """Create necessary directories"""
    directories = [
        DATA_DIR / "documents",
        DATA_DIR / "processed",
        DATA_DIR / "feedback",
        DATA_DIR / "logs"
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created directory: {directory}")

def create_env_file():
    """Create .env file from template"""
    env_template = BASE_DIR / ".env.example"
    env_file = BASE_DIR / ".env"
    
    if env_file.exists():
        print("⚠️  .env file already exists")
        return
    
    if env_template.exists():
        with open(env_template, 'r') as template:
            content = template.read()
        
        print("\n📝 Let's set up your environment variables:")
        
        # Get Telegram Bot Token
        bot_token = input("Enter your Telegram Bot Token (from @BotFather): ").strip()
        content = content.replace("YOUR_BOT_TOKEN_HERE", bot_token)
        
        # Get Groq API Key
        print("\n🔑 Get your free Groq API key from: https://console.groq.com")
        groq_key = input("Enter your Groq API Key: ").strip()
        content = content.replace("YOUR_GROQ_API_KEY_HERE", groq_key)
        
        # Weather API (optional)
        weather_choice = input("\n🌤️  Do you have an OpenWeatherMap API key? (y/n): ").lower()
        if weather_choice == 'y':
            weather_key = input("Enter your OpenWeatherMap API Key: ").strip()
            content = content.replace("YOUR_OPENWEATHER_KEY_HERE", weather_key)
        
        # Google Sheets (optional)
        sheets_choice = input("\n📊 Do you want to set up Google Sheets? (y/n): ").lower()
        if sheets_choice == 'y':
            sheets_path = input("Enter path to Google service account JSON: ").strip()
            content = content.replace("path/to/your/google-credentials.json", sheets_path)
        
        # Write .env file
        with open(env_file, 'w') as f:
            f.write(content)
        
        print("\n✅ .env file created successfully!")
    else:
        print("❌ .env.example not found!")

async def test_bot_token():
    """Test if bot token is valid"""
    try:
        from telegram import Bot
        from config.settings import TELEGRAM_BOT_TOKEN
        import asyncio

        bot = Bot(TELEGRAM_BOT_TOKEN)
        bot_info = await bot.get_me()
        print(f"\n✅ Bot connected successfully!")
        print(f"Bot name: @{bot_info.username}")
        print(f"Bot ID: {bot_info.id}")
        return True
    except Exception as e:
        print(f"\n❌ Failed to connect bot: {e}")
        return False

def test_groq_api():
    """Test Groq API connection"""
    try:
        from groq import Groq
        from config.settings import GROQ_API_KEY
        
        client = Groq(api_key=GROQ_API_KEY)
        
        # Test with a simple query
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": "Say hello"}
            ],
            max_tokens=10
        )
        
        print("\n✅ Groq API connected successfully!")
        return True
    except Exception as e:
        print(f"\n❌ Failed to connect Groq API: {e}")
        print("Make sure you have a valid API key from https://console.groq.com")
        return False

def setup_initial_knowledge():
    """Create initial knowledge base files"""
    knowledge_file = DATA_DIR / "documents" / "initial_knowledge.json"
    
    initial_knowledge = {
        "documents": [
            {
                "id": "doc_1",
                "title": "Maize Planting Guide",
                "content": "Maize planting in Ghana: Major season is March-April...",
                "tags": ["maize", "planting", "seasons"]
            },
            {
                "id": "doc_2",
                "title": "Cocoa Disease Management",
                "content": "Black pod disease control: Use copper fungicides...",
                "tags": ["cocoa", "disease", "fungicide"]
            }
        ]
    }
    
    with open(knowledge_file, 'w') as f:
        json.dump(initial_knowledge, f, indent=2)
    
    print(f"✓ Created initial knowledge base at {knowledge_file}")

def main():
    """Run setup process"""
    print("🌾 Ghana Agricultural Bot Setup 🌾")
    print("=" * 40)
    
    # Step 1: Create directories
    print("\n📁 Setting up directory structure...")
    create_directory_structure()
    
    # Step 2: Create .env file
    print("\n🔧 Setting up environment variables...")
    create_env_file()
    
    # Step 3: Test connections
    print("\n🧪 Testing connections...")
    import asyncio
    bot_ok = asyncio.run(test_bot_token())
    groq_ok = test_groq_api()
    
    # Step 4: Setup initial knowledge
    print("\n📚 Setting up initial knowledge base...")
    setup_initial_knowledge()
    
    # Final status
    print("\n" + "=" * 40)
    if bot_ok and groq_ok:
        print("✅ Setup completed successfully!")
        print("\n🚀 To start the bot, run:")
        print("   python run.py")
    else:
        print("⚠️  Setup completed with warnings")
        print("Please check your API keys and try again")

if __name__ == "__main__":
    main()