"""
Comprehensive project status check
"""

import sys
from pathlib import Path
import importlib.util

# Set up path
project_root = Path(__file__).parent.absolute()
sys.path.insert(0, str(project_root))

def check_project_status():
    """Check all project components"""
    
    print("🔍 COMPREHENSIVE PROJECT STATUS CHECK")
    print("=" * 50)
    
    # 1. Check core imports
    print("\n1. 📦 CORE IMPORTS")
    try:
        from config.settings import TELEGRAM_BOT_TOKEN, GROQ_API_KEY, LLM_MODEL
        print(f"   ✅ Settings loaded - Model: {LLM_MODEL}")
        print(f"   ✅ Bot token: {'***' + TELEGRAM_BOT_TOKEN[-4:] if TELEGRAM_BOT_TOKEN else 'MISSING'}")
        print(f"   ✅ Groq API: {'***' + GROQ_API_KEY[-4:] if GROQ_API_KEY else 'MISSING'}")
    except Exception as e:
        print(f"   ❌ Settings error: {e}")
    
    # 2. Check LLM Handler
    print("\n2. 🤖 LLM HANDLER")
    try:
        from src.llm_handler import LLMHandler
        llm = LLMHandler()
        print("   ✅ LLM Handler initialized")
        
        # Test basic response
        response, confidence = llm.generate_response("Test message")
        print(f"   ✅ LLM response working - Confidence: {confidence}")
    except Exception as e:
        print(f"   ❌ LLM Handler error: {e}")
    
    # 3. Check Knowledge Base
    print("\n3. 📚 KNOWLEDGE BASE")
    try:
        from src.knowledge_base import KnowledgeBase
        kb = KnowledgeBase()
        
        # Check if collection exists and has data
        collection_info = kb.collection.count()
        print(f"   ✅ Knowledge Base loaded - Documents: {collection_info}")
        
        # Test search
        results = kb.search_documents("maize farming", limit=2)
        print(f"   ✅ Search working - Found {len(results)} results")
    except Exception as e:
        print(f"   ❌ Knowledge Base error: {e}")
    
    # 4. Check Orchestrator
    print("\n4. 🎯 ORCHESTRATOR")
    try:
        from src.orchestrator import MultiAgentOrchestrator
        orchestrator = MultiAgentOrchestrator()
        print("   ✅ Orchestrator initialized")
        
        # Check if agents are loaded
        if hasattr(orchestrator, 'agents'):
            print(f"   ✅ Agents loaded: {len(orchestrator.agents) if orchestrator.agents else 0}")
        else:
            print("   ⚠️ No agents attribute found")
    except Exception as e:
        print(f"   ❌ Orchestrator error: {e}")
    
    # 5. Check Bot Components
    print("\n5. 🤖 BOT COMPONENTS")
    try:
        from src.bot import GhanaAgriBot
        
        # Test initialization (don't start)
        print("   ✅ Bot class imported successfully")
        
        # Check required components
        from src.onboarding import UserOnboarding
        from src.feedback_system import FeedbackSystem
        print("   ✅ Support systems available")
    except Exception as e:
        print(f"   ❌ Bot components error: {e}")
    
    # 6. Check Data Directories
    print("\n6. 📁 DATA STRUCTURE")
    required_dirs = [
        'data/documents', 'data/feedback', 'data/logs', 
        'data/onboarding', 'data/processed'
    ]
    
    for dir_path in required_dirs:
        path = Path(dir_path)
        if path.exists():
            files_count = len(list(path.glob('*'))) if path.is_dir() else 0
            print(f"   ✅ {dir_path} - {files_count} files")
        else:
            print(f"   ❌ {dir_path} - MISSING")
            # Create missing directory
            path.mkdir(parents=True, exist_ok=True)
            print(f"   🔧 Created {dir_path}")
    
    # 7. Check Scripts
    print("\n7. 🔧 SCRIPTS STATUS")
    script_files = [
        'scripts/load_documents.py',
        'scripts/farmer_onboarding.py', 
        'scripts/setup_bot.py'
    ]
    
    for script_path in script_files:
        path = Path(script_path)
        if path.exists():
            print(f"   ✅ {script_path}")
        else:
            print(f"   ❌ {script_path} - MISSING")
    
    # 8. Integration Test
    print("\n8. 🧪 INTEGRATION TEST")
    try:
        # Test full pipeline
        from src.llm_handler import LLMHandler
        from src.knowledge_base import KnowledgeBase
        from src.onboarding import UserOnboarding
        
        llm = LLMHandler()
        kb = KnowledgeBase()
        onboarding = UserOnboarding()
        
        # Test query with knowledge
        test_query = "How to plant maize in Ghana?"
        knowledge_results = kb.search_documents(test_query, limit=3)
        
        context = {
            'location': 'Greater Accra',
            'crops': ['maize'],
            'knowledge_context': ' '.join([r['text'][:200] for r in knowledge_results])
        }
        
        response, confidence = llm.generate_response(test_query, context)
        
        print(f"   ✅ Full pipeline test successful")
        print(f"   📝 Response length: {len(response)} chars")
        print(f"   🎯 Confidence: {confidence}")
        
    except Exception as e:
        print(f"   ❌ Integration test failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 PROJECT STATUS SUMMARY")
    print("Check complete! Review any ❌ items above.")

if __name__ == "__main__":
    check_project_status()