"""
Test each component individually to find the proxies error - FIXED VERSION
"""

import os
import sys
import logging
from pathlib import Path

# Set up the Python path correctly
project_root = Path(__file__).parent.absolute()
print(f"Project root: {project_root}")

# Add both the project root AND set the working directory
sys.path.insert(0, str(project_root))
os.chdir(project_root)

# Verify path setup
print(f"Current working directory: {os.getcwd()}")
print(f"Python path includes: {project_root in [Path(p) for p in sys.path]}")

def test_component(name, import_func):
    """Test a single component"""
    try:
        print(f"\n🧪 Testing {name}...")
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
        import config.settings
        return True
    
    if not test_component("Basic imports", test_basic_imports):
        return
    
    # Test 2: LLM Handler
    def test_llm_handler():
        from src.llm_handler import LLMHandler
        handler = LLMHandler()
        return handler
    
    if not test_component("LLM Handler", test_llm_handler):
        return
    
    # Test 3: Knowledge Base
    def test_knowledge_base():
        from src.knowledge_base import KnowledgeBase
        kb = KnowledgeBase()
        return kb
    
    if not test_component("Knowledge Base", test_knowledge_base):
        return
    
    # Test 4: Feedback System
    def test_feedback_system():
        from src.feedback_system import FeedbackSystem
        fs = FeedbackSystem()
        return fs
    
    if not test_component("Feedback System", test_feedback_system):
        return
    
    # Test 5: Weather Integration
    def test_weather():
        try:
            from src.weather_integration import WeatherAdvisor
            weather = WeatherAdvisor()
            return weather
        except ImportError:
            print("    (Module not found - skipping)")
            return True
    
    if not test_component("Weather Integration", test_weather):
        return
    
    # Test 6: Satellite Integration  
    def test_satellite():
        try:
            from src.satellite_integration import SatelliteIntegration
            sat = SatelliteIntegration()
            return sat
        except ImportError:
            print("    (Module not found - skipping)")
            return True
    
    if not test_component("Satellite Integration", test_satellite):
        return
    
    # Test 7: Web Search Agent
    def test_web_search():
        try:
            from src.web_search_agent import WebSearchAgent
            ws = WebSearchAgent()
            return ws
        except ImportError:
            print("    (Module not found - skipping)")
            return True
    
    if not test_component("Web Search Agent", test_web_search):
        return
    
    # Test 8: Orchestrator (this is where we expect the error)
    def test_orchestrator():
        from src.orchestrator import MultiAgentOrchestrator
        orch = MultiAgentOrchestrator()
        return orch
    
    test_component("Orchestrator", test_orchestrator)

if __name__ == "__main__":
    main()