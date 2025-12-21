"""
Compare both working models for agricultural advice
"""

import sys
from pathlib import Path
import time

project_root = Path(__file__).parent.absolute()
sys.path.insert(0, str(project_root))

def compare_models():
    """Compare both available models"""
    
    test_query = "How do I control fall armyworm on maize in Ghana? What are the symptoms and best treatment methods?"
    
    models_to_test = [
        "llama-3.1-8b-instant",
        "gemma2-9b-it"
    ]
    
    print("🆚 COMPARING MODELS FOR AGRICULTURAL ADVICE")
    print("=" * 60)
    print(f"Test Query: {test_query}")
    print("=" * 60)
    
    for model in models_to_test:
        print(f"\n🤖 Testing {model}:")
        print("-" * 40)
        
        try:
            # Temporarily update model
            import config.settings as settings
            original_model = settings.LLM_MODEL
            settings.LLM_MODEL = model
            
            # Test with LLM Handler
            from src.llm_handler import LLMHandler
            llm = LLMHandler()
            
            start_time = time.time()
            response, confidence = llm.generate_response(test_query)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            print(f"⏱️ Response Time: {response_time:.2f} seconds")
            print(f"🎯 Confidence: {confidence}")
            print(f"📝 Response Length: {len(response)} characters")
            print(f"📖 Response Preview:")
            print(f"   {response[:200]}...")
            
            # Restore original model
            settings.LLM_MODEL = original_model
            
        except Exception as e:
            print(f"❌ Error with {model}: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 RECOMMENDATION:")
    print("• llama-3.1-8b-instant: Choose for SPEED (faster farmer responses)")
    print("• gemma2-9b-it: Choose for QUALITY (more detailed agricultural advice)")

if __name__ == "__main__":
    compare_models()