# src/web_search_agent.py
import requests
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class WebSearchAgent:
    """
    Search for Ghana-specific and global agricultural practices
    Uses free APIs - no keys needed!
    """
    
    def __init__(self):
        # Use DuckDuckGo (no API key needed!)
        self.search_url = "https://api.duckduckgo.com/"
        
    async def process(self, input_data: Dict) -> Dict:
        query = input_data.get('query', '')
        intent = input_data.get('intent', {})
        
        # Enhance query for Ghana context
        enhanced_query = f"{query} Ghana agriculture smallholder"
        
        try:
            # Search for Ghana-specific info
            ghana_results = self.search_web(enhanced_query)
            
            # Search for global best practices
            global_query = f"{query} best practices tropical agriculture"
            global_results = self.search_web(global_query)
            
            # Search for research papers
            research_query = f"{query} Africa research CGIAR"
            research_results = self.search_web(research_query)
            
            return {
                'ghana_context': self._extract_relevant(ghana_results),
                'global_practices': self._extract_relevant(global_results),
                'research': self._extract_relevant(research_results),
                'sources_found': len(ghana_results) + len(global_results),
                'confidence': 0.8
            }
            
        except Exception as e:
            logger.error(f"Web search error: {e}")
            return {'ghana_context': '', 'global_practices': '', 'confidence': 0.3}
    
    def search_web(self, query: str) -> List[Dict]:
        """Search using DuckDuckGo Instant Answer API (free)"""
        try:
            params = {
                'q': query,
                'format': 'json',
                'no_html': 1,
                'skip_disambig': 1
            }
            
            response = requests.get(self.search_url, params=params, timeout=5)
            data = response.json()
            
            results = []
            
            # Extract relevant information
            if data.get('Abstract'):
                results.append({
                    'text': data['Abstract'],
                    'source': data.get('AbstractSource', 'Web')
                })
            
            if data.get('Answer'):
                results.append({
                    'text': data['Answer'],
                    'source': 'Instant Answer'
                })
            
            # Get related topics
            for topic in data.get('RelatedTopics', [])[:3]:
                if isinstance(topic, dict) and 'Text' in topic:
                    results.append({
                        'text': topic['Text'],
                        'source': 'Related Information'
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            return []
    
    def _extract_relevant(self, results: List[Dict]) -> str:
        """Extract relevant information from search results"""
        if not results:
            return ""
        
        relevant_parts = []
        for result in results[:2]:  # Top 2 results
            text = result.get('text', '')
            if text and len(text) > 50:
                relevant_parts.append(text[:200])
        
        return " ".join(relevant_parts)

