# web_search_agent.py - ENHANCED VERSION WITH GHANA SITES
"""
Enhanced Web Search Agent for Ghana Agricultural Bot
Targets specific Ghana agricultural sites for authoritative information
"""

import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
from ddgs import DDGS

logger = logging.getLogger(__name__)

# COMPREHENSIVE GHANA AGRICULTURAL SITES
GHANA_AGRICULTURAL_SITES = [
    # Government Sites
    "mofa.gov.gh",           # Ministry of Food and Agriculture
    "csir.org.gh",           # Council for Scientific and Industrial Research
    "crig.org.gh",           # Cocoa Research Institute of Ghana
    "srid.mofa.gov.gh",      # Statistics, Research and Information Directorate
    "gsa.gov.gh",            # Ghana Standards Authority
    "gepa.gov.gh",           # Ghana Export Promotion Authority
    "ghs.gov.gh",            # Ghana Health Service (for food safety)
    
    # Research Institutions
    "iita.org",              # International Institute of Tropical Agriculture
    "ifpri.org",             # International Food Policy Research Institute
    "cgiar.org",             # CGIAR Research
    "cabi.org",              # Centre for Agriculture and Bioscience International
    
    # Agricultural Organizations
    "agra.org",              # Alliance for Green Revolution in Africa
    "fao.org",               # Food and Agriculture Organization
    "wfp.org",               # World Food Programme
    "ifad.org",              # International Fund for Agricultural Development
    
    # Ghana-specific Agricultural Sites
    "agricinghana.com",      # Agriculture in Ghana platform
    "gnaff.org",             # Ghana National Association of Farmers and Fishermen
    "esoko.com",             # Market price platform
    "farmerline.co",         # Agricultural information service
    "agricultureinghana.com", # Agricultural news and information
    "agritradergh.com",      # Agricultural trading platform
]

# Crop-specific search terms for Ghana
GHANA_CROP_TERMS = {
    'maize': ['maize', 'corn', 'cultivation', 'production'],
    'cassava': ['cassava', 'processing', 'cultivation', 'gari'],
    'plantain': ['plantain', 'cultivation', 'disease', 'market'],
    'cocoa': ['cocoa', 'cacao', 'black pod', 'COCOBOD'],
    'yam': ['yam', 'cultivation', 'storage', 'export'],
    'tomato': ['tomato', 'greenhouse', 'disease', 'processing'],
    'rice': ['rice', 'irrigation', 'milling', 'local production'],
    'groundnut': ['groundnut', 'peanut', 'aflatoxin', 'processing'],
    'palm': ['oil palm', 'palm oil', 'processing', 'plantation'],
    'cashew': ['cashew', 'processing', 'export', 'value chain']
}

@dataclass
class SearchResult:
    title: str
    url: str
    snippet: str
    relevance_score: float = 0.0

class EnhancedWebSearchAgent:
    """
    Ghana-focused web search agent with agricultural site prioritization
    """
    
    def __init__(self):
        self.ddg = DDGS()
        self.ghana_sites = GHANA_AGRICULTURAL_SITES
        self.max_results = 10
        
    async def process(self, input_data: Dict) -> Dict:
        """
        Process search with Ghana agricultural site prioritization
        """
        query = input_data.get("query", "")
        intent = input_data.get("intent", {})
        location = input_data.get("location", "Ghana")
        crop_type = input_data.get("crop_type", "")
        
        if not query:
            return {"context": "", "confidence": 0.0, "sources": []}
        
        # Create targeted search query based on intent
        search_query = self._create_targeted_search(query, intent, location, crop_type)
        logger.info(f"Enhanced search query: {search_query}")
        
        try:
            # Search with site restrictions for authoritative sources
            all_results = []
            
            # First, search Ghana government and research sites
            priority_sites = ["mofa.gov.gh", "csir.org.gh", "crig.org.gh", "fao.org"]
            for site in priority_sites:
                site_query = f"{search_query} site:{site}"
                try:
                    results = list(self.ddg.text(site_query, max_results=3))
                    all_results.extend(results)
                except Exception as e:
                    logger.debug(f"No results from {site}: {e}")
            
            # Then broader search with Ghana context
            general_query = f"{search_query} Ghana agriculture farming"
            try:
                general_results = list(self.ddg.text(general_query, max_results=self.max_results))
                all_results.extend(general_results)
            except Exception as e:
                logger.error(f"General search error: {e}")
            
            # Process and rank results
            processed_results = self._process_and_rank_results(all_results, query, intent)
            
            if not processed_results:
                # Fallback: broader search
                fallback_query = f"{query} Ghana farming agricultural advice"
                try:
                    fallback_results = list(self.ddg.text(fallback_query, max_results=5))
                    processed_results = self._process_and_rank_results(fallback_results, query, intent)
                except:
                    pass
            
            if not processed_results:
                logger.warning(f"No search results found for: {query}")
                return {"context": "", "confidence": 0.0, "sources": []}
            
            # Format results for fusion
            context, sources = self._format_results(processed_results[:5])
            
            # Calculate confidence based on source quality
            confidence = self._calculate_confidence(processed_results[:5])
            
            logger.info(f"Web search found {len(processed_results)} results, using top 5")
            
            return {
                "context": context,
                "confidence": confidence,
                "sources": sources,
                "raw_results": processed_results[:5]
            }
            
        except Exception as e:
            logger.error(f"EnhancedWebSearchAgent error: {e}")
            return {"context": "", "confidence": 0.0, "sources": []}
    
    def _create_targeted_search(self, query: str, intent: Dict, 
                               location: str, crop_type: str) -> str:
        """
        Create targeted search query based on context
        """
        intent_type = intent.get('type', 'general')
        query_parts = [query]
        
        # Add intent-specific terms
        intent_enhancements = {
            'crop_health': 'disease pest control treatment symptoms management',
            'market': 'price market value GHS trading current',
            'planting': 'planting season spacing cultivation guide',
            'fertilizer': 'NPK fertilizer application rate recommendations',
            'harvest': 'harvest storage post-harvest handling',
            'weather': 'weather forecast rainfall climate advisory',
            'export': 'export certification standards requirements'
        }
        
        if intent_type in intent_enhancements:
            query_parts.append(intent_enhancements[intent_type])
        
        # Add crop-specific terms if detected
        if crop_type and crop_type.lower() in GHANA_CROP_TERMS:
            crop_terms = GHANA_CROP_TERMS[crop_type.lower()]
            query_parts.extend(crop_terms[:2])  # Add top 2 terms
        
        # Add location if specific
        if location and location.lower() != 'ghana':
            query_parts.append(location)
        
        # Always add Ghana context
        query_parts.append("Ghana")
        
        return " ".join(query_parts)
    
    def _process_and_rank_results(self, results: List, 
                                 original_query: str, 
                                 intent: Dict) -> List[SearchResult]:
        """
        Process and rank results by relevance and authority
        """
        processed = []
        seen_urls = set()
        
        for result in results:
            url = result.get("href") or result.get("link") or ""
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            
            title = (result.get("title") or "").strip()
            snippet = (result.get("body") or "").strip()[:500]
            
            if not snippet:
                continue
            
            # Calculate relevance score
            relevance = self._calculate_relevance(
                url, title, snippet, original_query, intent
            )
            
            processed.append(SearchResult(
                title=title,
                url=url,
                snippet=snippet,
                relevance_score=relevance
            ))
        
        # Sort by relevance score
        processed.sort(key=lambda x: x.relevance_score, reverse=True)
        return processed
    
    def _calculate_relevance(self, url: str, title: str, snippet: str,
                           query: str, intent: Dict) -> float:
        """
        Calculate relevance score for search result
        """
        score = 0.0
        
        # Authority bonus for Ghana agricultural sites
        url_lower = url.lower()
        for site in self.ghana_sites:
            if site in url_lower:
                if 'mofa.gov.gh' in url_lower or 'csir.org.gh' in url_lower:
                    score += 3.0  # Highest authority
                elif any(s in url_lower for s in ['fao.org', 'ifpri.org', 'cgiar.org']):
                    score += 2.5  # International agricultural orgs
                else:
                    score += 2.0  # Other agricultural sites
                break
        
        # Content relevance
        combined_text = (title + " " + snippet).lower()
        query_words = query.lower().split()
        
        # Word overlap scoring
        matches = sum(1 for word in query_words if word in combined_text)
        score += matches * 0.3
        
        # Intent-specific relevance
        intent_type = intent.get('type', 'general')
        if intent_type == 'market' and any(w in combined_text for w in ['price', 'ghs', 'market']):
            score += 1.5
        elif intent_type == 'crop_health' and any(w in combined_text for w in ['disease', 'pest', 'treatment']):
            score += 1.5
        
        # Ghana-specific bonus
        if 'ghana' in combined_text:
            score += 1.0
        
        # Recent information bonus
        current_year = str(datetime.now().year)
        last_year = str(datetime.now().year - 1)
        if current_year in combined_text or last_year in combined_text:
            score += 0.5
        
        return score
    
    def _format_results(self, results: List[SearchResult]) -> tuple:
        """
        Format results for fusion agent
        """
        context_parts = []
        sources = []
        
        for i, result in enumerate(results, 1):
            # Create structured context
            context_part = f"[Source {i} - {result.title}]: {result.snippet}"
            context_parts.append(context_part)
            
            # Create source metadata
            sources.append({
                "title": result.title,
                "url": result.url,
                "snippet": result.snippet,
                "relevance": result.relevance_score,
                "timestamp": datetime.now().isoformat()
            })
        
        context = "\n\n".join(context_parts)
        return context, sources
    
    def _calculate_confidence(self, results: List[SearchResult]) -> float:
        """
        Calculate confidence based on source quality
        """
        if not results:
            return 0.0
        
        base_confidence = 0.5
        
        # Boost for authoritative sources
        for result in results[:3]:  # Focus on top 3
            if any(site in result.url.lower() for site in 
                   ['mofa.gov.gh', 'csir.org.gh', 'fao.org']):
                base_confidence += 0.15
            elif result.relevance_score > 4.0:
                base_confidence += 0.1
            elif result.relevance_score > 2.0:
                base_confidence += 0.05
        
        # Cap at reasonable maximum
        return min(base_confidence, 0.9)

# For backward compatibility
WebSearchAgent = EnhancedWebSearchAgent