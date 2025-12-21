"""
Test each component individually to find the proxies error
"""

import logging
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_component(name, import_func):
    """Test a single component"""
    try:
        print(f"🧪 Testing {name}...")
        result = import_func()
        print(f"✅ {name} - OK")
        return True
    except Exception as e:
        print(f"❌ {name} - FAILED: {e}")
        if "proxies" in str(e):
            print(f"    🎯 FOUND THE PROXIES ERROR IN {name}!")
        return False

def main():
    """Test components one by one"""
    
    print("🔍 Testing components individually to find proxies error...\n")
    
    # Test 1: Basic imports
    def test_basic_imports():
        from config.settings import TELEGRAM_BOT_TOKEN
        return True
    
    test_component("Basic imports", test_basic_imports)
    
    # Test 2: LLM Handler
    def test_llm_handler():
        from src.llm_handler import LLMHandler
        handler = LLMHandler()
        return handler
    
    test_component("LLM Handler", test_llm_handler)
    
    # Test 3: Knowledge Base
    def test_knowledge_base():
        from src.knowledge_base import KnowledgeBase
        kb = KnowledgeBase()
        return kb
    
    test_component("Knowledge Base", test_knowledge_base)
    
    # Test 4: Feedback System
    def test_feedback_system():
        from src.feedback_system import FeedbackSystem
        fs = FeedbackSystem()
        return fs
    
    test_component("Feedback System", test_feedback_system)
    
    # Test 5: Satellite Integration
    def test_satellite():
        from src.satellite_integration import SatelliteIntegration
        sat = SatelliteIntegration()
        return sat
    
    test_component("Satellite Integration", test_satellite)
    
    # Test 6: Web Search Agent
    def test_web_search():
        from src.web_search_agent import WebSearchAgent
        ws = WebSearchAgent()
        return ws
    
    test_component("Web Search Agent", test_web_search)
    
    # Test 7: Weather Integration
    def test_weather():
        from src.weather_integration import WeatherAdvisor
        weather = WeatherAdvisor()
        return weather
    
    test_component("Weather Integration", test_weather)
    
    # Test 8: Orchestrator (this is where we expect the error)
    def test_orchestrator():
        from src.orchestrator import MultiAgentOrchestrator
        orch = MultiAgentOrchestrator()
        return orch
    
    test_component("Orchestrator", test_orchestrator)

if __name__ == "__main__":
    main()