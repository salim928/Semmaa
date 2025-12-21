"""
Check what Groq models are actually working right now
"""

import sys
from pathlib import Path

project_root = Path(__file__).parent.absolute()
sys.path.insert(0, str(project_root))

def check_current_groq_models():
    """Check what Groq models are currently available"""
    
    print("🔍 Checking CURRENT Groq Models (September 2025)...")
    print("=" * 60)
    
    try:
        from groq import Groq
        from config.settings import GROQ_API_KEY
        
        client = Groq(api_key=GROQ_API_KEY)
        
        # Current models to test (updated for late 2024/2025)
        models_to_test = [
            # Latest LLaMA models
            "llama-3.2-90b-text-preview",
            "llama-3.2-11b-text-preview", 
            "llama-3.2-3b-preview",
            "llama-3.2-1b-preview",
            
            # Stable LLaMA models
            "llama3-groq-70b-8192-tool-use-preview",
            "llama3-groq-8b-8192-tool-use-preview",
            "llama-3.1-8b-instant",
            "llama3-70b-8192",
            "llama3-8b-8192",
            
            # Mixtral models
            "mixtral-8x7b-32768",
            
            # Gemma models
            "gemma2-9b-it",
            "gemma-7b-it",
        ]
        
        working_models = []
        
        for model in models_to_test:
            try:
                print(f"Testing {model:<35} ... ", end="")
                
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": "Hi"}],
                    max_tokens=5,
                    timeout=10
                )
                
                print("✅ WORKS")
                working_models.append(model)
                
            except Exception as e:
                error_msg = str(e)
                if "decommissioned" in error_msg:
                    print("❌ DECOMMISSIONED")
                elif "not found" in error_msg:
                    print("❌ NOT FOUND")
                elif "rate limit" in error_msg:
                    print("⚠️ RATE LIMITED (might work)")
                    working_models.append(model)  # Add it anyway
                else:
                    print(f"❌ ERROR: {error_msg[:30]}...")
        
        print("\n" + "=" * 60)
        print(f"✅ WORKING MODELS ({len(working_models)}):")
        
        if working_models:
            for i, model in enumerate(working_models, 1):
                print(f"   {i}. {model}")
            
            # Recommend the best one
            recommended = working_models[0]
            print(f"\n🎯 RECOMMENDED: {recommended}")
            
            return recommended
        else:
            print("❌ NO WORKING MODELS FOUND!")
            print("\nTrying to get model list from Groq API...")
            
            # Try to get models list from API
            try:
                models = client.models.list()
                print("Available models from API:")
                for model in models.data:
                    print(f"   • {model.id}")
            except Exception as e:
                print(f"Could not get models list: {e}")
            
            return None
            
    except Exception as e:
        print(f"❌ Error checking models: {e}")
        return None

if __name__ == "__main__":
    recommended_model = check_current_groq_models()
    
    if recommended_model:
        print(f"\n🔧 TO FIX: Update your config/settings.py:")
        print(f'LLM_MODEL = "{recommended_model}"')
    else:
        print("\n⚠️ You may need to check Groq Console for current models")
        print("https://console.groq.com/docs/models")