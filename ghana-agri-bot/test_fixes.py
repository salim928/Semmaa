"""
Test the fixes
"""

import sys
from pathlib import Path

project_root = Path(__file__).parent.absolute()
sys.path.insert(0, str(project_root))

def test_fixes():
    """Test the critical fixes"""
    
    print("🧪 Testing Critical Fixes...")
    
    # 1. Test LLM with new model
    print("\n1. 🤖 Testing LLM Handler with new model...")
    try:
        from src.llm_handler import LLMHandler
        llm = LLMHandler()
        
        response, confidence = llm.generate_response("Test maize farming advice")
        print(f"   ✅ LLM working - Response: {response[:100]}...")
        print(f"   ✅ Confidence: {confidence}")
    except Exception as e:
        print(f"   ❌ LLM error: {e}")
    
    # 2. Test Knowledge Base search
    print("\n2. 📚 Testing Knowledge Base search...")
    try:
        from src.knowledge_base import KnowledgeBase
        kb = KnowledgeBase()
        
        # Test search_documents method
        results = kb.search_documents("maize farming Ghana", limit=3)
        print(f"   ✅ Search working - Found {len(results)} results")
        
        if results:
            print(f"   ✅ First result: {results[0]['text'][:100]}...")
        
        # Test contextual knowledge
        context = kb.get_contextual_knowledge(
            query="How to plant maize?",
            location="Greater Accra",
            crops=["maize"]
        )
        print(f"   ✅ Contextual knowledge: {len(context)} characters")
        
    except Exception as e:
        print(f"   ❌ Knowledge Base error: {e}")
    
    # 3. Test Integration
    print("\n3. 🔗 Testing Integration...")
    try:
        # Test full pipeline
        test_query = "How to control fall armyworm on maize in Ghana?"
        
        knowledge_results = kb.search_documents(test_query, limit=2)
        context_data = {
            'location': 'Greater Accra',
            'crops': ['maize'],
            'knowledge_context': kb.get_contextual_knowledge(test_query, 'Greater Accra', ['maize'])
        }
        
        response, confidence = llm.generate_response(test_query, context_data)
        
        print(f"   ✅ Full pipeline working!")
        print(f"   📝 Knowledge results: {len(knowledge_results)}")
        print(f"   📝 Response: {response[:150]}...")
        print(f"   🎯 Confidence: {confidence}")
        
    except Exception as e:
        print(f"   ❌ Integration error: {e}")
    
    print("\n✅ Fix testing complete!")

def test_onboarding_and_query():
    from src.bot import GhanaAgriBot
    bot = GhanaAgriBot()
    # Simulate onboarding
    user_id = 12345
    bot.onboarding.save_profile(user_id, "Accra", ["maize"], "small-scale")
    profile = bot.onboarding.get_user_profile(user_id)
    assert profile['location'] == "Accra"
    # Simulate farming query
    class DummyUpdate:
        effective_user = type('User', (), {'id': user_id, 'first_name': 'Test'})()
        message = type('Msg', (), {'text': "How do I control armyworm?", 'reply_text': print, 'reply_chat_action': lambda x: None})()
    class DummyContext:
        user_data = {}
    import asyncio
    asyncio.run(bot.process_farming_query(DummyUpdate(), DummyContext()))

if __name__ == "__main__":
    test_fixes()
    test_onboarding_and_query()