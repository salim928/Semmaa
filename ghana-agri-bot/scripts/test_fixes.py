"""Test script to verify all fixes are working"""
import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from src.orchestrator import MultiAgentOrchestrator

async def test_responses():
    orchestrator = MultiAgentOrchestrator()
    
    test_cases = [
        {
            'query': "How accurate is satellite for harvest timing?",
            'location': "Kumasi",
            'crop': "maize"
        },
        {
            'query': "My maize leaves are yellow",
            'location': "Tamale",
            'crop': "maize"
        },
        {
            'query': "Check my farm with satellite",
            'location': "Accra",
            'crop': "cassava"
        }
    ]
    
    for test in test_cases:
        print(f"\n{'='*60}")
        print(f"Query: {test['query']}")
        print(f"Location: {test['location']}")
        print('-'*60)
        
        result = await orchestrator.process_farmer_query(
            query=test['query'],
            location=test['location'],
            crop_type=test['crop']
        )
        
        print(result['response'])
        print(f"\nConfidence: {result.get('confidence', 'N/A')}")

if __name__ == "__main__":
    asyncio.run(test_responses())