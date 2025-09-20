"""
Test script for Multi-Agent Orchestrator
Run this to verify everything works!
"""

import asyncio
import sys
from pathlib import Path

# Add parent to path
sys.path.append(str(Path(__file__).parent.parent))

from src.orchestrator import MultiAgentOrchestrator

async def test_orchestrator():
    """Test the orchestrator with various queries"""
    
    print("🧪 Testing Multi-Agent Orchestrator")
    print("=" * 50)
    
    orchestrator = MultiAgentOrchestrator()
    
    test_queries = [
        {
            'query': "My maize leaves are turning yellow",
            'location': "Kumasi",
            'crop': "maize"
        },
        {
            'query': "Check my farm with satellite",
            'location': "Tamale",
            'crop': "rice"
        },
        {
            'query': "When should I plant cassava?",
            'location': "Accra",
            'crop': "cassava"
        },
        {
            'query': "How is my cocoa farm doing?",
            'location': "Takoradi",
            'crop': "cocoa"
        }
    ]
    
    for test in test_queries:
        print(f"\n📝 Query: {test['query']}")
        print(f"📍 Location: {test['location']}")
        print(f"🌱 Crop: {test['crop']}")
        print("-" * 30)
        
        result = await orchestrator.process_farmer_query(
            query=test['query'],
            location=test['location'],
            crop_type=test['crop']
        )
        
        print(f"✅ Response:\n{result['response']}")
        print(f"📊 Confidence: {result.get('confidence', 'N/A')}")
        print(f"🔧 Sources: {result.get('data_sources_used', [])}")
        print("=" * 50)

if __name__ == "__main__":
    asyncio.run(test_orchestrator())