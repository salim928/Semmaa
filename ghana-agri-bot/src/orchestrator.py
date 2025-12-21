# orchestrator.py - COMPLETE WORKING VERSION
"""
Multi-Agent Orchestration System for Ghana Agricultural Bot
Purpose: Intelligently coordinate agents based on query needs
"""

from __future__ import annotations
from typing import Any, Dict, List, Optional, Tuple
import logging
import asyncio
from enum import Enum
from datetime import datetime
import json

# Core services
from src.knowledge_base import KnowledgeBase
from src.llm_handler import LLMHandler

# Optional agents
try:
    from src.satellite_integration import SatelliteIntegration
    SATELLITE_AVAILABLE = True
except Exception:
    SATELLITE_AVAILABLE = False

try:
    from src.weather_integration import WeatherAdvisor
    WEATHER_AVAILABLE = True
except Exception:
    WEATHER_AVAILABLE = False

try:
    from src.web_search_agent import WebSearchAgent
    WEB_SEARCH_AVAILABLE = True
except Exception:
    WEB_SEARCH_AVAILABLE = False

try:
    from src.market_agent import MarketAgent
    from pathlib import Path
    MARKET_AVAILABLE = True
except Exception:
    MARKET_AVAILABLE = False

logger = logging.getLogger(__name__)

def format_satellite_report(data: Dict) -> str:
    """Safe formatter for satellite data."""
    try:
        ndvi = data.get("ndvi", {})
        ndvi_val = ndvi.get("current") if isinstance(ndvi, dict) else ndvi
        moisture = (data.get("soil_moisture") or {}).get("surface")
        parts = []
        if ndvi_val is not None and isinstance(ndvi_val, (int, float)):
            parts.append(f"NDVI: {float(ndvi_val):.3f}")
        if moisture is not None:
            parts.append(f"Soil moisture: {int(moisture)}%")
        if data.get("alert"):
            parts.append("Alert: potential stress detected")
        return " | ".join(parts) if parts else "Satellite summary unavailable."
    except Exception:
        return "Satellite summary unavailable."

class AgentType(Enum):
    """Types of agents in the system"""
    INTENT = "intent"
    KNOWLEDGE = "knowledge"
    SATELLITE = "satellite"
    WEATHER = "weather"
    FUSION = "fusion"
    WEB_SEARCH = "web_search"
    MARKET = "market"

class BaseAgent:
    """Base class for all agents"""
    async def process(self, input_data: Dict) -> Dict:
        raise NotImplementedError
    
    def validate_input(self, input_data: Dict, required_fields: List[str]) -> bool:
        """Validate that required fields exist"""
        return all(field in input_data for field in required_fields)

class IntentClassifierAgent(BaseAgent):
    """Enhanced intent classifier with better accuracy"""
    
    async def process(self, input_data: Dict) -> Dict:
        try:
            query = input_data.get('query', '').lower()
            
            # Enhanced intent classification with priority scoring
            intent_rules = {
                'market': {
                    'keywords': ['price', 'sell', 'buyer', 'market', 'cost', 'ghs', 'cedis',
                                'selling', 'worth', 'how much', 'farm-gate', 'trending',
                                'rise', 'fall', 'expensive', 'cheap', 'transport cost'],
                    'priority': 10  # Highest priority
                },
                'crop_health': {
                    'keywords': ['yellow', 'brown', 'dying', 'sick', 'disease', 'pest', 
                                'wilt', 'spots', 'leaves', 'rot', 'blight', 'attack',
                                'coughing', 'thin-shelled', 'eggs', 'chickens'],
                    'priority': 9
                },
                'weather': {
                    'keywords': ['rain', 'weather', 'forecast', 'sun', 'drought', 
                                'temperature', 'climate', 'wet', 'dry'],
                    'priority': 8
                },
                'planting': {
                    'keywords': ['plant', 'when', 'season', 'sow', 'seed', 'spacing',
                                'germination', 'grow', 'cultivate'],
                    'priority': 7
                },
                'fertilizer': {
                    'keywords': ['fertilizer', 'npk', 'urea', 'nutrient', 'apply',
                                'chemical', 'organic', 'manure'],
                    'priority': 7
                },
                'harvest': {
                    'keywords': ['harvest', 'ready', 'mature', 'ripe', 'pick',
                                'store', 'storage', 'spoilage'],
                    'priority': 6
                },
                'export': {
                    'keywords': ['export', 'certification', 'europe', 'international',
                                'organic', 'standards'],
                    'priority': 5
                },
                'satellite_check': {
                    'keywords': ['satellite', 'monitor', 'check my farm', 'ndvi'],
                    'priority': 4
                }
            }
            
            # Score each intent with priority weighting
            intent_scores = {}
            for intent_type, config in intent_rules.items():
                matches = sum(2 if keyword in query else 0 
                            for keyword in config['keywords'])
                if matches > 0:
                    # Weight by priority
                    intent_scores[intent_type] = matches * config['priority']
            
            # Select highest scoring intent
            if intent_scores:
                intent_type = max(intent_scores, key=intent_scores.get)
                # Calculate confidence based on score
                max_score = intent_scores[intent_type]
                confidence = min(0.9, 0.4 + (max_score / 100))
            else:
                intent_type = 'general'
                confidence = 0.3
            
            # Determine urgency
            urgency = 'low'
            urgent_words = ['dying', 'urgent', 'emergency', 'immediately', 'coughing', 'sick']
            medium_words = ['yellow', 'brown', 'problem', 'issue', 'thin-shelled']
            
            if any(word in query for word in urgent_words):
                urgency = 'high'
            elif any(word in query for word in medium_words):
                urgency = 'medium'
            
            # Check if current data is needed
            needs_current = any(word in query for word in 
                              ['current', 'today', 'now', 'latest', 'this week', 
                               'this month', 'forecast', 'trending'])
            
            logger.info(f"Intent classification: {intent_type} (score: {intent_scores.get(intent_type, 0)})")
            
            return {
                'type': intent_type,
                'urgency': urgency,
                'confidence': confidence,
                'needs_current_data': needs_current,
                'original_query': input_data.get('query', ''),
                'intent_scores': intent_scores
            }
            
        except Exception as e:
            logger.error(f"Intent classification error: {e}")
            return {'type': 'general', 'urgency': 'low', 'confidence': 0.3}

class KnowledgeRAGAgent(BaseAgent):
    """Enhanced RAG agent with better retrieval"""
    
    def __init__(self, knowledge_base: KnowledgeBase):
        self.knowledge_base = knowledge_base
        
    async def process(self, input_data: Dict) -> Dict:
        try:
            query = input_data.get('query', '')
            intent = input_data.get('intent', {})
            
            # Enhance query based on intent
            enhanced_query = self._enhance_query(query, intent)
            
            # Search knowledge base with multiple strategies
            results = []
            
            # Primary search
            primary_results = self.knowledge_base.search(enhanced_query, n_results=5)
            results.extend(primary_results)
            
            # Intent-specific searches
            if intent.get('type') == 'crop_health':
                disease_query = f"{query} disease pest treatment control symptoms Ghana"
                disease_results = self.knowledge_base.search(disease_query, n_results=3)
                results.extend(disease_results)
            
            if intent.get('type') == 'market':
                market_query = f"{query} Ghana price market value GHS trading"
                market_results = self.knowledge_base.search(market_query, n_results=3)
                results.extend(market_results)
            
            # Deduplicate
            seen_texts = set()
            unique_results = []
            for result in results:
                text = result.get('text', '')
                if text and text not in seen_texts:
                    seen_texts.add(text)
                    unique_results.append(result)
            
            if not unique_results:
                return {
                    'context': "",
                    'sources': [],
                    'confidence': 0.1,
                    'documents_found': 0,
                    'raw_results': []
                }
            
            # Evaluate result quality
            confidence = self._evaluate_results(unique_results, query, intent)
            
            # Format context
            context = self._format_context(unique_results)
            sources = list(set(r.get('metadata', {}).get('source', 'Knowledge Base') 
                             for r in unique_results[:3]))
            
            logger.info(f"Knowledge base: {len(unique_results)} docs, confidence: {confidence:.2f}")
            
            return {
                'context': context,
                'sources': sources,
                'confidence': confidence,
                'documents_found': len(unique_results),
                'raw_results': unique_results
            }
            
        except Exception as e:
            logger.error(f"Knowledge RAG error: {e}")
            return {'context': '', 'sources': [], 'confidence': 0.1, 'documents_found': 0}
    
    def _enhance_query(self, query: str, intent: Dict) -> str:
        """Enhance query with intent-specific terms"""
        intent_type = intent.get('type', 'general')
        
        enhancements = {
            'crop_health': 'disease pest symptoms treatment control management',
            'fertilizer': 'NPK application rate timing soil nutrients',
            'planting': 'spacing season timing germination cultivation',
            'harvest': 'maturity signs timing storage post-harvest',
            'weather': 'rainfall temperature climate season forecast',
            'market': 'price value GHS market trading buyers sellers'
        }
        
        enhanced = f"{query} Ghana agriculture farming"
        if intent_type in enhancements:
            enhanced += f" {enhancements[intent_type]}"
        
        return enhanced
    
    def _evaluate_results(self, results: List[Dict], query: str, intent: Dict) -> float:
        """Evaluate if results are sufficient for the query"""
        if not results:
            return 0.1
        
        # Base confidence from result count
        base = 0.3 if len(results) >= 1 else 0.1
        base += 0.2 if len(results) >= 3 else 0
        base += 0.1 if len(results) >= 5 else 0
        
        # Check content relevance
        query_words = set(query.lower().split())
        intent_type = intent.get('type', 'general')
        
        relevance_score = 0
        for result in results[:3]:
            text = result.get('text', '').lower()
            # Word overlap
            text_words = set(text.split())
            overlap = len(query_words & text_words) / max(len(query_words), 1)
            relevance_score += overlap * 0.15
            
            # Intent-specific content boost
            if intent_type == 'crop_health' and any(w in text for w in ['disease', 'pest', 'treatment']):
                relevance_score += 0.1
            elif intent_type == 'market' and any(w in text for w in ['price', 'market', 'ghs']):
                relevance_score += 0.1
        
        return min(base + relevance_score, 0.9)
    
    def _format_context(self, results: List[Dict]) -> str:
        """Format results into context"""
        parts = []
        seen = set()
        
        for result in results[:3]:
            text = result.get('text', '').strip()
            if text and text not in seen:
                seen.add(text)
                source = result.get('metadata', {}).get('source', 'Knowledge Base')
                # Truncate long texts
                if len(text) > 400:
                    text = text[:400] + "..."
                parts.append(f"[{source}]: {text}")
        
        return "\n\n".join(parts)

class SatelliteEOAgent(BaseAgent):
    """Satellite monitoring agent"""
    
    def __init__(self):
        self.satellite = SatelliteIntegration()
        
    async def process(self, input_data: Dict) -> Dict:
        try:
            query = input_data.get('query', '').lower()
            
            # Only process if explicitly requested
            if not any(kw in query for kw in ['satellite', 'monitor', 'ndvi', 'check my farm']):
                return {}
            
            location = input_data.get('location', 'Kumasi')
            crop_type = input_data.get('crop_type', 'maize')
            lat, lon = self._get_coordinates(location)
            
            data = self.satellite.get_farm_analysis(lat, lon, crop_type)
            
            if isinstance(data, tuple):
                data = data[0]
            
            if data and data.get('ndvi'):
                ndvi = data.get('ndvi')
                if isinstance(ndvi, dict):
                    ndvi_val = ndvi.get('current')
                else:
                    ndvi_val = ndvi
                    
                if isinstance(ndvi_val, (int, float)) and 0.1 <= ndvi_val <= 1.0:
                    return {
                        'ndvi': {'current': ndvi_val},
                        'soil_moisture': data.get('soil_moisture'),
                        'formatted_report': format_satellite_report(data),
                        'confidence': 0.8
                    }
            
            return {}
            
        except Exception as e:
            logger.error(f"Satellite agent error: {e}")
            return {}
    
    def _get_coordinates(self, location: str) -> Tuple[float, float]:
        from src.weather_integration import CITY_TO_COORDS
        return CITY_TO_COORDS.get(location.lower(), CITY_TO_COORDS['accra'])

class WeatherAgent(BaseAgent):
    """Weather agent - only called for weather queries"""
    
    def __init__(self):
        self.advisor = WeatherAdvisor()
        
    async def process(self, input_data: Dict) -> Dict:
        try:
            query = input_data.get('query', '').lower()
            
            # Only process if weather is relevant
            weather_keywords = ['rain', 'weather', 'forecast', 'temperature', 'drought', 'wet', 'dry', 'climate']
            if not any(kw in query for kw in weather_keywords):
                return {}
            
            location = input_data.get('location', 'Kumasi')
            weather = self.advisor.get_weather_advice(location)
            
            if weather and weather.get('current'):
                return weather
            
            return {}
            
        except Exception as e:
            logger.error(f"Weather agent error: {e}")
            return {}

class QueryAnalyzer:
    """Analyzes what agents are needed based on query"""
    
    @staticmethod
    def determine_needed_agents(query: str, intent: Dict, kb_result: Dict) -> Dict:
        """Determine which agents to call"""
        query_lower = query.lower()
        intent_type = intent.get('type', 'general')
        kb_confidence = kb_result.get('confidence', 0)
        needs_current = intent.get('needs_current_data', False)
        
        needed = {
            'weather': False,
            'market': False,
            'satellite': False,
            'web_search': True  # Always verify with web
        }
        
        # Market agent - be aggressive
        market_keywords = ['price', 'market', 'sell', 'buyer', 'cost', 'ghs', 'cedis', 
                          'selling', 'worth', 'how much', 'transport cost', 'trending']
        if any(kw in query_lower for kw in market_keywords) or intent_type == 'market':
            needed['market'] = True
            logger.info("Market agent needed - keywords detected")
        
        # Weather - only if actually mentioned
        weather_keywords = ['rain', 'weather', 'forecast', 'temperature', 'drought', 'season']
        if any(kw in query_lower for kw in weather_keywords) or intent_type == 'weather':
            needed['weather'] = True
            
        # Satellite - only if explicitly requested
        if 'satellite' in query_lower or 'monitor' in query_lower:
            needed['satellite'] = True
        
        # Force agents for low confidence KB
        if kb_confidence < 0.7:
            if intent_type == 'market':
                needed['market'] = True
            elif intent_type == 'weather':
                needed['weather'] = True
        
        logger.info(f"Agents needed: {needed} (KB confidence: {kb_confidence:.2f})")
        return needed

class MultiAgentOrchestrator:
    """Main orchestrator that coordinates all agents"""
    
    def __init__(self):
        logger.info("Initializing Multi-Agent Orchestrator...")
        self.knowledge_base = KnowledgeBase()
        self.llm = LLMHandler()
        self.query_analyzer = QueryAnalyzer()
        
        # Initialize agents
        self.agents: Dict[AgentType, BaseAgent] = {}
        
        self.agents[AgentType.INTENT] = IntentClassifierAgent()
        self.agents[AgentType.KNOWLEDGE] = KnowledgeRAGAgent(self.knowledge_base)
        
        if WEATHER_AVAILABLE:
            self.agents[AgentType.WEATHER] = WeatherAgent()
            logger.info("✅ Weather agent available")
            
        if SATELLITE_AVAILABLE:
            self.agents[AgentType.SATELLITE] = SatelliteEOAgent()
            logger.info("✅ Satellite agent available")
            
        if WEB_SEARCH_AVAILABLE:
            self.agents[AgentType.WEB_SEARCH] = WebSearchAgent()
            logger.info("✅ Web search agent available")
            
        if MARKET_AVAILABLE:
            try:
                self.market_agent = MarketAgent(Path("data/market_prices.csv"))
                logger.info("✅ Market agent available")
            except:
                self.market_agent = None
        else:
            self.market_agent = None
            
        self.initialized = True
        logger.info("✅ Multi-Agent Orchestrator ready!")
    
    def _detect_crop_from_query(self, query: str) -> Optional[str]:
        """Detect crop mentioned in query - EXPANDED LIST"""
        query_lower = query.lower()
        
        # Comprehensive crop list for Ghana
        crops = {
            # Cereals
            'maize': ['maize', 'corn'],
            'rice': ['rice'],
            'millet': ['millet'],
            'sorghum': ['sorghum'],
            
            # Root and Tubers
            'cassava': ['cassava', 'bankye'],
            'yam': ['yam'],
            'cocoyam': ['cocoyam', 'taro'],
            'sweet potato': ['sweet potato'],
            'potato': ['potato', 'potatoes'],
            
            # Vegetables
            'tomato': ['tomato', 'tomatoes'],
            'okro': ['okro', 'okra'],
            'pepper': ['pepper', 'chili', 'chilli'],
            'garden eggs': ['garden eggs', 'garden egg', 'eggplant'],
            'onion': ['onion', 'onions'],
            'cabbage': ['cabbage'],
            'carrot': ['carrot', 'carrots'],
            'lettuce': ['lettuce'],
            'cucumber': ['cucumber'],
            
            # Fruits
            'plantain': ['plantain'],
            'banana': ['banana'],
            'pineapple': ['pineapple'],
            'mango': ['mango', 'mangoes'],
            'orange': ['orange', 'oranges'],
            'pawpaw': ['pawpaw', 'papaya'],
            'watermelon': ['watermelon'],
            'avocado': ['avocado'],
            'coconut': ['coconut'],
            
            # Cash Crops
            'cocoa': ['cocoa', 'cacao'],
            'cashew': ['cashew'],
            'coffee': ['coffee'],
            'palm': ['palm', 'palm oil', 'oil palm'],
            'rubber': ['rubber'],
            'shea': ['shea', 'shea nut'],
            'cotton': ['cotton'],
            
            # Legumes
            'groundnut': ['groundnut', 'peanut', 'groundnuts'],
            'cowpea': ['cowpea', 'beans', 'black-eyed peas'],
            'soybean': ['soybean', 'soya', 'soybeans'],
            'bambara': ['bambara', 'bambara beans'],
            
            # Poultry/Livestock (for completeness)
            'chicken': ['chicken', 'chickens', 'broiler', 'layer', 'poultry'],
            'eggs': ['eggs', 'egg']
        }
        
        for crop_name, keywords in crops.items():
            if any(kw in query_lower for kw in keywords):
                logger.info(f"Detected crop: {crop_name}")
                return crop_name
        
        return None
    
    def _extract_market_location(self, query: str) -> Optional[str]:
        """Extract market location from query"""
        query_lower = query.lower()
        
        # Common market locations in Ghana
        locations = [
            'accra', 'kumasi', 'tamale', 'takoradi', 'techiman',
            'cape coast', 'sunyani', 'koforidua', 'ho', 'bolgatanga',
            'wa', 'tema', 'ashaiman', 'agbogbloshie', 'makola',
            'kejetia', 'central market', 'volta region', 'eastern region',
            'ashanti', 'northern region', 'upper east', 'upper west',
            'bono east', 'western region', 'central region'
        ]
        
        for location in locations:
            if location in query_lower:
                logger.info(f"Detected market location: {location}")
                return location.title()
        
        return None
    
    async def process_farmer_query(
        self,
        query: str,
        location: Optional[str] = None,
        crop_type: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict:
        """Process query with intelligent agent selection"""
        logger.info("=== PROCESSING QUERY ===")
        logger.info(f"Query: {query[:100]}...")
        
        try:
            context = {
                'query': query,
                'location': location or 'Kumasi',
                'crop_type': crop_type or 'maize',
                'user_id': user_id,
                'original_query': query
            }
            
            # Step 1: Classify intent
            intent = await self.agents[AgentType.INTENT].process(context)
            context['intent'] = intent
            logger.info(f"Intent: {intent['type']} (urgency: {intent['urgency']})")
            
            # Step 2: Check knowledge base
            kb_result = await self.agents[AgentType.KNOWLEDGE].process(context)
            logger.info(f"Knowledge base: {kb_result['documents_found']} docs, "
                       f"confidence: {kb_result['confidence']:.2f}")
            
            # Step 3: Determine what additional agents are needed
            needed_agents = self.query_analyzer.determine_needed_agents(
                query, intent, kb_result
            )
            
            # Step 4: Selectively call only needed agents
            agent_results = {
                'intent': intent,
                'knowledge': kb_result
            }
            
            agents_used = ['knowledge_base']
            
            # Weather - only if needed and not for market queries
            if needed_agents['weather'] and AgentType.WEATHER in self.agents and intent['type'] != 'market':
                logger.info("📍 Calling weather agent")
                weather_result = await self.agents[AgentType.WEATHER].process(context)
                if weather_result and weather_result.get('current'):
                    agent_results['weather'] = weather_result
                    agents_used.append('weather')
            
            # Market agent - with proper crop detection
            if needed_agents['market'] and self.market_agent:
                logger.info("📍 Calling market agent")
                try:
                    # Detect crop from query
                    detected_crop = self._detect_crop_from_query(query)
                    if not detected_crop:
                        detected_crop = crop_type or 'maize'
                    
                    # Extract market location
                    market_location = self._extract_market_location(query) or location
                    
                    logger.info(f"Market query for: {detected_crop} in {market_location}")
                    
                    market_result = await self.market_agent.get_snapshot(
                        detected_crop,
                        market_location
                    )
                    
                    if market_result:
                        agent_results['market'] = market_result
                        agents_used.append('market')
                        logger.info(f"✅ Market data: {market_result.get('crop')} - GHS {market_result.get('price_now')}")
                    else:
                        logger.warning(f"No market data for {detected_crop}")
                        
                except Exception as e:
                    logger.error(f"Market agent error: {e}")
            
            # Satellite - only if explicitly requested
            if needed_agents['satellite'] and AgentType.SATELLITE in self.agents:
                logger.info("📍 Calling satellite agent")
                sat_result = await self.agents[AgentType.SATELLITE].process(context)
                if sat_result and sat_result.get('ndvi'):
                    agent_results['satellite'] = sat_result
                    agents_used.append('satellite')
            
            # Web search - always for verification
            if needed_agents['web_search'] and AgentType.WEB_SEARCH in self.agents:
                logger.info("📍 Running web verification")
                web_result = await self.agents[AgentType.WEB_SEARCH].process(context)
                if web_result and web_result.get('context'):
                    agent_results['web_search'] = web_result
                    agents_used.append('web_search')
            
            # Step 5: Use focused fusion
            kb_sufficient = kb_result['confidence'] >= 0.75
            
            # Override for specific query types
            if intent['type'] in ['market', 'weather'] or needed_agents['market']:
                kb_sufficient = False
            
            from src.fusion_agent import FocusedFusionAgent
            fusion = FocusedFusionAgent()
            
            fusion_input = {
                'original_query': query,
                'location': location,
                'crop_type': crop_type,
                'agents_used': agents_used,
                'kb_sufficient': kb_sufficient,
                **agent_results
            }
            
            logger.info(f"=== FUSION ===")
            logger.info(f"Agents used: {agents_used}")
            logger.info(f"KB sufficient: {kb_sufficient}")
            
            final_result = await fusion.process(fusion_input)
            
            # Add metadata
            final_result['metadata'] = {
                'orchestrator': 'intelligent_selective',
                'timestamp': datetime.now().isoformat(),
                'location': location,
                'crop_type': crop_type,
                'agents_used': agents_used,
                'kb_confidence': kb_result['confidence']
            }
            
            logger.info(f"✅ Query processed - Agents used: {len(agents_used)}")
            return final_result
            
        except Exception as e:
            logger.error(f"Orchestration error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return {
                'response': f"I'm having technical difficulties processing your question about {query[:50]}... Please try again in a moment.",
                'confidence': 0.1,
                'error': str(e),
                'synthesis_method': 'error_fallback'
            }