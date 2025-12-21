"""
Test with the corrected model
"""

import sys
from pathlib import Path

# Set up path
project_root = Path(__file__).parent.absolute()
sys.path.insert(0, str(project_root))

def test_fixed_model():
    """Test with corrected model"""
    
    print("🔧 Testing with corrected model...")
    
    try:
        from groq import Groq
        from config.settings import GROQ_API_KEY
        
        # Test with the recommended model
        client = Groq(api_key=GROQ_API_KEY)
        print("✅ Groq client created successfully")
        
        # Test actual API call with correct model
        response = client.chat.completions.create(
            model="mixtral-8x7b-32768",  # Correct model
            messages=[
                {"role": "user", "content": "Hello, this is a test for Ghana AgriBot"}
            ],
            max_tokens=50,
            temperature=0.7
        )
        
        print("✅ API call successful!")
        print(f"Response: {response.choices[0].message.content}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_fixed_model()