import pytest
import asyncio
from unittest.mock import Mock, patch
from src.llm_handler import LLMHandler

@pytest.fixture
def llm_handler():
    return LLMHandler()

@pytest.mark.asyncio
async def test_generate_with_rag_basic(llm_handler):
    """Test basic RAG generation without web search."""
    query = "How to plant maize?"
    contexts = [{"text": "Maize planting guide: Sow seeds 2-3 cm deep."}] 
    farmer_context = {"location": "Kumasi", "crops": "maize"}
    
    with patch.object(llm_handler, '_call_api', return_value="Plant maize by sowing seeds 2-3 cm deep in Kumasi."), \
         patch('src.llm_handler.advisory_enhancer.enhance_response', return_value="Plant maize by sowing seeds 2-3 cm deep in Kumasi."):
        response = llm_handler.generate_with_rag(query, contexts, farmer_context)
        assert isinstance(response, str)
        assert len(response) > 10
        assert "maize" in response.lower()

@pytest.mark.asyncio
async def test_generate_with_rag_with_web_search(llm_handler):
    """Test RAG with mock web search."""
    query = "Maize prices in Kumasi"
    contexts = [{"text": "Market data for maize."}]
    farmer_context = {"location": "Kumasi", "crops": "maize"}
    web_search = {"context": "Prices: 2-3 GHS/kg", "sources": [{"title": "MoFA", "snippet": "Market report"}]}
    
    with patch.object(llm_handler, '_call_api', return_value="Advisory response with prices."), \
         patch('src.llm_handler.advisory_enhancer.enhance_response', return_value="Advisory response with prices."):
        response = llm_handler.generate_with_rag(query, contexts, farmer_context, web_search=web_search)
        assert isinstance(response, str)
        assert "prices" in response.lower()

@pytest.mark.asyncio
async def test_verify_with_web_search(llm_handler):
    """Test web search verification."""
    claim = "Maize prices are 2 GHS/kg."
    web_results = {"context": "Prices around 2-3 GHS/kg", "sources": [{"title": "Market Data", "snippet": "Prices around 2-3 GHS/kg"}]}
    query = "maize prices"
    
    verified = llm_handler.verify_with_web_search(claim, web_results, query)
    assert isinstance(verified, str)
    assert "2-3 GHS/kg" in verified or "verification" in verified.lower()

@pytest.mark.asyncio
async def test_error_handling(llm_handler):
    """Test error handling in generation."""
    with patch.object(llm_handler, '_call_api', side_effect=Exception("API Error")):
        response = llm_handler.generate_with_rag("test", [])
        assert isinstance(response, str)
        assert "agricultural assessment" in response.lower()  # Fallback content