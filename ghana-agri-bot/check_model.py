"""
Check the model configuration
"""

import sys
from pathlib import Path

# Set up path
project_root = Path(__file__).parent.absolute()
sys.path.insert(0, str(project_root))

def check_model_config():
    """Check model configuration"""
    
    print("🔍 Checking model configuration...")
    
    try:
        from config.settings import LLM_MODEL, GROQ_API_KEY
        print(f"✅ Current model: {LLM_MODEL}")
        print(f"✅ API key exists: {'Yes' if GROQ_API_KEY else 'No'}")
        
        # Test with valid Groq models
        valid_models = [
            "mixtral-8x7b-32768",
            "llama2-70b-4096", 
            "gemma-7b-it",
            "llama3-8b-8192",
            "llama3-70b-8192"
        ]
        
        print(f"\n📋 Valid Groq models:")
        for model in valid_models:
            print(f"   • {model}")
            
        if LLM_MODEL not in valid_models:
            print(f"\n⚠️ WARNING: '{LLM_MODEL}' might not be a valid Groq model!")
            print(f"🔧 Recommended model: mixtral-8x7b-32768")
            
    except Exception as e:
        print(f"❌ Error checking model config: {e}")

if __name__ == "__main__":
    check_model_config()