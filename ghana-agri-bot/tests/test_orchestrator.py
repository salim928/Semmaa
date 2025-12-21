import asyncio
from src.orchestrator import MultiAgentOrchestrator

async def test_orchestrator():
    orch = MultiAgentOrchestrator()
    
    # Test basic query
    result = await orch.process_farmer_query("How to plant maize?", "Kumasi", "maize", "test_user")
    print("Basic Query Result:", result.get("response", "No response"))
    
    # Test market query
    result2 = await orch.process_farmer_query("Okro prices in Kumasi", "Kumasi", "okro", "test_user")
    print("Market Query Result:", result2.get("response", "No response"))

if __name__ == "__main__":
    asyncio.run(test_orchestrator())