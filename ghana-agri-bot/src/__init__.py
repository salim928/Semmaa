from typing import List, Dict, Optional  # Add this line

def enhance_response(self, response: str, confidence: float = 0.8, 
                    query_type: str = 'general', crop: str = None,
                    location: str = None, image_available: bool = False,
                    data_sources: List[str] = None, web_search: Dict = None,
                    query: str = None, farmer_context: Dict = None) -> str:
    # ... existing code ...
    
    # Step 4: Verify with web search if available
    if web_search:
        response = self._verify_with_web_search(response, web_search, query, farmer_context)
    
    # ... rest of the method ...