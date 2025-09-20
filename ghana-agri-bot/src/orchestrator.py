"""
Multi-Agent Orchestration System for Ghana Agricultural Bot
Purpose: Coordinate multiple data sources for intelligent farming advice
Author: Ghana AgriBOT Team
"""

import asyncio
import logging
from enum import Enum
from typing import Dict, Optional, List, Tuple
from datetime import datetime
import random
import json
import pytz  # Add at the top for timezone-aware timestamps

# Import your existing modules
from src.knowledge_base import KnowledgeBase
from src.llm_handler import LLMHandler
from config.settings import WEATHER_API_KEY
from src.satellite_integration import SatelliteIntegration, format_satellite_report
from src.web_search_agent import WebSearchAgent  # Add this import

logger = logging.getLogger(__name__)

class AgentType(Enum):
    """Types of agents in the system"""
    INTENT = "intent"
    KNOWLEDGE = "knowledge"
    SATELLITE = "satellite"
    WEATHER = "weather"
    FUSION = "fusion"
    WEB_SEARCH = "web_search"  # Add this line

class BaseAgent:
    """Base class for all agents"""
    async def process(self, input_data: Dict) -> Dict:
        raise NotImplementedError
    
    def validate_input(self, input_data: Dict, required_fields: List[str]) -> bool:
        """Validate that required fields exist"""
        return all(field in input_data for field in required_fields)

class IntentClassifierAgent(BaseAgent):
    """Classifies farmer intent from their query"""
    
    async def process(self, input_data: Dict) -> Dict:
        try:
            query = input_data.get('query', '').lower()
            
            # Intent classification rules
            intent_rules = {
                'crop_health': ['yellow', 'brown', 'dying', 'sick', 'disease', 'pest', 'wilt', 'spots'],
                'planting': ['plant', 'when', 'season', 'sow', 'seed', 'spacing'],
                'fertilizer': ['fertilizer', 'npk', 'urea', 'nutrient', 'apply', 'chemical'],
                'harvest': ['harvest', 'ready', 'mature', 'ripe', 'pick'],
                'weather': ['rain', 'weather', 'forecast', 'sun', 'drought'],
                'market': ['price', 'sell', 'buyer', 'market', 'cost'],
                'satellite_check': ['satellite', 'how is my farm', 'check my crop', 'ndvi']
            }
            
            # Detect intent
            intent_type = 'general'
            urgency = 'low'
            confidence = 0.5
            
            for intent, keywords in intent_rules.items():
                matches = sum(1 for keyword in keywords if keyword in query)
                if matches > 0:
                    intent_type = intent
                    confidence = min(0.9, 0.5 + (matches * 0.2))
                    
                    # Set urgency based on certain keywords
                    if any(word in query for word in ['dying', 'urgent', 'emergency', 'sick']):
                        urgency = 'high'
                    elif any(word in query for word in ['yellow', 'brown', 'problem']):
                        urgency = 'medium'
                    break
            
            return {
                'type': intent_type,
                'urgency': urgency,
                'confidence': confidence,
                'original_query': input_data.get('query', '')
            }
            
        except Exception as e:
            logger.error(f"Intent classification error: {e}")
            return {
                'type': 'general',
                'urgency': 'low',
                'confidence': 0.3,
                'error': str(e)
            }

class SatelliteEOAgent(BaseAgent):
    """
    Enhanced Satellite Earth Observation Agent
    Now uses real satellite integration!
    """
    def __init__(self):
        self.satellite = SatelliteIntegration()
        logger.info("Satellite EO Agent initialized with integration module")

    async def process(self, input_data: Dict) -> Dict:
        try:
            location = input_data.get('location', 'Kumasi')
            crop_type = input_data.get('crop_type', 'maize')
            lat, lon = self._get_coordinates(location)
            satellite_data = self.satellite.get_farm_analysis(
                latitude=lat,
                longitude=lon,
                crop_type=crop_type
            )
            logger.debug(f"satellite_data: {satellite_data} (type: {type(satellite_data)})")
            if isinstance(satellite_data, tuple):
                satellite_data = satellite_data[0]
            ndvi = satellite_data.get('ndvi')
            logger.debug(f"ndvi: {ndvi} (type: {type(ndvi)})")
            if isinstance(ndvi, tuple):
                ndvi = ndvi[0]
            if hasattr(ndvi, "value"):
                ndvi_value = ndvi.value
            elif isinstance(ndvi, dict) and 'current' in ndvi:
                ndvi_value = ndvi['current']
            else:
                ndvi_value = ndvi
            satellite_data['formatted_report'] = format_satellite_report(satellite_data)
            if 'ndvi' not in satellite_data or not isinstance(satellite_data['ndvi'], dict):
                satellite_data['ndvi'] = {'current': ndvi_value}
            return satellite_data
        except Exception as e:
            logger.error(f"Satellite agent error: {e}")
            return self._get_fallback_data()

    def _get_coordinates(self, location: str) -> Tuple[float, float]:
        """
        Get coordinates for Ghana locations
        In production, use a proper geocoding service
        """
        
        # Ghana city coordinates
        ghana_coords = {
            'accra': (5.6037, -0.1870),
            'kumasi': (6.6666, -1.6163),
            'tamale': (9.4034, -0.8424),
            'takoradi': (4.8845, -1.7554),
            'cape coast': (5.1315, -1.2795),
            'koforidua': (6.0984, -0.2579),
            'ho': (6.6080, 0.4713),
            'wa': (10.0601, -2.5099),
            'bolgatanga': (10.7856, -0.8514),
            'sunyani': (7.3399, -2.3268),
        }
        
        # Try to find city in location string
        location_lower = location.lower()
        for city, coords in ghana_coords.items():
            if city in location_lower:
                return coords
        
        # Default to Accra if not found
        return ghana_coords['accra']
    
    def _get_fallback_data(self) -> Dict:
        """Enhanced fallback data"""
        return {
            'ndvi': {'current': 0.65, 'trend': 'unknown'},
            'soil_moisture': {'surface': 50},
            'alert': False,
            'confidence': 0.3,
            'error': 'Satellite data temporarily unavailable',
            'formatted_report': 'Satellite monitoring temporarily offline. Please try again later.'
        }

class EnhancedWeatherAgent(BaseAgent):
    """Enhanced weather agent with agricultural focus"""
    
    def __init__(self):
        self.has_api_key = bool(WEATHER_API_KEY)
        
    async def process(self, input_data: Dict) -> Dict:
        try:
            location = input_data.get('location', 'Kumasi')
            
            if self.has_api_key:
                # Use real weather API
                return await self._fetch_real_weather(location)
            else:
                # Use simulated weather
                return self._simulate_weather(location)
                
        except Exception as e:
            logger.error(f"Weather agent error: {e}")
            return self._get_fallback_weather()
    
    def _simulate_weather(self, location: str) -> Dict:
        """Simulate weather data for MVP"""
        # Simulate based on Ghana's typical weather patterns
        import random
        
        # Ghana weather characteristics by month
        month = datetime.now().month
        
        if 3 <= month <= 5:  # Major rainy season
            rain_probability = 70
            rain_amount = random.uniform(10, 30)
        elif 9 <= month <= 11:  # Minor rainy season
            rain_probability = 50
            rain_amount = random.uniform(5, 20)
        else:  # Dry season
            rain_probability = 20
            rain_amount = random.uniform(0, 5)
        
        return {
            'temperature': random.uniform(25, 32),
            'humidity': random.uniform(60, 85),
            'rain_next_7d': rain_amount,
            'rain_probability': rain_probability,
            'wind_speed': random.uniform(5, 15),
            'forecast_summary': self._get_forecast_summary(rain_probability),
            'agricultural_advisory': self._get_agri_advisory(rain_probability, rain_amount),
            'optimal_spray_window': self._get_spray_window(rain_probability),
            'confidence': 0.75
        }
    
    def _get_forecast_summary(self, rain_prob: int) -> str:
        if rain_prob > 60:
            return "Rainy conditions expected"
        elif rain_prob > 30:
            return "Partly cloudy with chance of rain"
        else:
            return "Generally dry conditions"
    
    def _get_agri_advisory(self, rain_prob: int, rain_amount: float) -> str:
        if rain_prob > 70:
            return "Avoid fertilizer application - rain will wash away nutrients"
        elif rain_prob > 40:
            return "Good conditions for planting"
        else:
            return "Consider irrigation if no rain in 3 days"
    
    def _get_spray_window(self, rain_prob: int) -> str:
        if rain_prob < 30:
            return "Next 48 hours optimal for spraying"
        else:
            return "Wait for dry conditions before spraying"
    
    def _get_fallback_weather(self) -> Dict:
        return {
            'temperature': 28,
            'humidity': 70,
            'rain_next_7d': 10,
            'forecast_summary': 'Typical conditions',
            'agricultural_advisory': 'Weather data is currently unavailable.',
            'confidence': 0.3
        }
    
    async def _fetch_real_weather(self, location: str) -> Dict:
        """Fetch real weather data when API key is available"""
        import requests
        
        try:
            url = f"https://api.openweathermap.org/data/2.5/forecast"
            params = {
                'q': f"{location},GH",
                'appid': WEATHER_API_KEY,
                'units': 'metric'
            }
            response = requests.get(url, params=params)
            data = response.json()
            
            # Process real weather data
            # ... implementation ...
            
        except Exception as e:
            logger.error(f"Weather API error: {e}")
            return self._get_fallback_weather()

class KnowledgeRAGAgent(BaseAgent):
    """Enhanced RAG agent using existing knowledge base"""
    
    def __init__(self):
        self.knowledge_base = KnowledgeBase()
        
    async def process(self, input_data: Dict) -> Dict:
        try:
            query = input_data.get('query', '')
            intent = input_data.get('intent', {})
            
            # Add context to improve retrieval
            enhanced_query = self._enhance_query(query, intent)
            
            # Search knowledge base
            results = self.knowledge_base.search(enhanced_query, n_results=3)
            
            
            
            if not results:
                return {
                    'context': 'No specific guidance found. Please consult local extension officer.',
                    'sources': [],
                    'confidence': 0.2
                }
            
            # Format context
            context = self._format_context(results)
            sources = [r.get('metadata', {}).get('source', 'Unknown') for r in results]
            
            return {
                'context': context,
                'sources': sources,
                'confidence': 0.9 if len(results) >= 2 else 0.6,
                'documents_found': len(results)
            }
            
        except Exception as e:
            logger.error(f"Knowledge RAG error: {e}")
            return {
                'context': 'Knowledge base temporarily unavailable',
                'sources': [],
                'confidence': 0.1
            }
    
    def _enhance_query(self, query: str, intent: Dict) -> str:
        """Enhance query with intent context"""
        intent_type = intent.get('type', 'general')
        
        # Add context based on intent
        if intent_type == 'crop_health':
            return f"{query} disease pest symptoms treatment"
        elif intent_type == 'fertilizer':
            return f"{query} NPK application rate timing"
        elif intent_type == 'planting':
            return f"{query} spacing season timing"
        else:
            return query
    
    def _format_context(self, results: List[Dict]) -> str:
        """Format search results into readable context"""
        formatted_parts = []
        seen_texts = set()  # Prevent duplicates

        for i, result in enumerate(results, 1):
            text = result.get('text', '')

            # Skip if we've seen this text before
            if text in seen_texts:
                continue
            seen_texts.add(text)

            # Truncate long texts properly
            if len(text) > 300:
                text = text[:300].rsplit('.', 1)[0] + "."  # Cut at last sentence

            formatted_parts.append(f"{text}")  # Remove source prefix for cleaner output

        return "\n\n".join(formatted_parts) if formatted_parts else ""

class FusionAgent(BaseAgent):
    """
    Intelligently combines outputs from all agents
    This is where the magic happens!
    """
    
    def __init__(self):
        pass

    async def process(self, input_data: Dict) -> Dict:
        try:
            # Extract all agent outputs
            intent = input_data.get('intent', {})
            satellite = input_data.get('satellite', {})
            knowledge = input_data.get('knowledge', {})
            weather = input_data.get('weather', {})
            web_search = input_data.get('web_search', {})

            # Build comprehensive response
            response = await self._build_response(
                intent, satellite, knowledge, weather, web_search
            )
            confidence = self._calculate_confidence(
                satellite.get('confidence', 0.5),
                knowledge.get('confidence', 0.5),
                weather.get('confidence', 0.5)
            )
            # --- Provenance footer ---
            sources = []
            for agent_result in [knowledge, satellite, weather, web_search]:
                if agent_result and agent_result.get('sources'):
                    sources.extend(agent_result['sources'])
            sources = list(set(sources)) if sources else ["Internal/External sources"]

            timestamp = datetime.now(pytz.timezone("Africa/Accra")).isoformat(timespec='seconds')
            provenance_footer = (
                f"\n\n---\n"
                f"**Sources:** {', '.join(sources)}\n"
                f"**Confidence:** {confidence:.2f}\n"
                f"**Timestamp:** {timestamp}"
            )
            response += provenance_footer

            return {
                'response': response,
                'confidence': confidence,
                'data_sources_used': self._list_data_sources(satellite, knowledge, weather, web_search)
            }

        except Exception as e:
            logger.error(f"Fusion agent error: {e}")
            # Fallback to simple response
            return {
                'response': knowledge.get('context', 'Please provide more details about your farming question.'),
                'confidence': 0.3,
                'error': str(e)
            }
    
    async def _build_response(self, intent: Dict, satellite: Dict, knowledge: Dict, weather: Dict, web_search: Dict) -> str:
        """Build confident, actionable response"""
        response_parts = []

        # Prioritize weather if intent is weather-related
        intent_type = intent.get('type', '')
        if intent_type == 'weather' and weather and weather.get('agricultural_advisory'):
            response_parts.append(weather['agricultural_advisory'])

        # Otherwise, start with knowledge context
        elif knowledge and knowledge.get('context'):
            response_parts.append(knowledge['context'])

        # Add satellite insights if relevant
        if satellite and satellite.get('ndvi'):
            ndvi = satellite['ndvi'].get('current', 0.5)
            moisture = satellite.get('soil_moisture', {}).get('surface', 50) if satellite.get('soil_moisture') else 50

            response_parts.append(f"\n**📊 Current Farm Status:**")
            response_parts.append(f"• Crop Health Score: {ndvi:.2f}/1.0 {self._get_health_emoji(ndvi)}")
            response_parts.append(f"• Soil Moisture: {moisture}% {self._get_moisture_status(moisture)}")

            # Direct recommendations
            if ndvi < 0.4:
                response_parts.append(f"\n**🚨 Immediate Actions Required:**")
                response_parts.append(f"1. Apply foliar fertilizer within 24 hours")
                response_parts.append(f"2. Check for pest damage (especially fall armyworm)")
                response_parts.append(f"3. Ensure adequate irrigation if moisture below 40%")

        # Add weather advisory if available and not already added
        if (intent_type != 'weather') and weather and weather.get('agricultural_advisory'):
            response_parts.append(f"\n**🌤️ Weather Advisory:**")
            response_parts.append(weather['agricultural_advisory'])

        # Add web search if available
        if web_search and web_search.get('context'):
            response_parts.append(f"\n**🌐 Web Insights:**")
            response_parts.append(web_search['context'])

        # Always end with confidence, not disclaimers
        response_parts.append(f"\n**Next Steps:** {self._get_next_actions(intent, satellite)}")

        return "\n".join(response_parts)

    def _get_health_emoji(self, ndvi: float) -> str:
        if ndvi >= 0.7: return "🟢 Excellent"
        elif ndvi >= 0.5: return "🟢 Good"
        elif ndvi >= 0.3: return "🟡 Moderate"
        else: return "🔴 Poor"

    def _get_moisture_status(self, moisture: int) -> str:
        if moisture >= 70: return "- Optimal"
        elif moisture >= 50: return "- Adequate"
        elif moisture >= 30: return "- Low, monitor"
        else: return "- Critical, irrigate now"

    def _get_next_actions(self, intent: Dict, satellite: Dict) -> str:
        """Provide clear next actions"""
        ndvi = satellite.get('ndvi', {}).get('current', 0.5)
        
        if ndvi < 0.4:
            return "Inspect field today, apply interventions immediately"
        elif ndvi < 0.6:
            return "Monitor daily, prepare fertilizer for application"
        else:
            return "Continue current practices, check again in 3 days"

    def _list_data_sources(self, satellite, knowledge, weather, web_search):
        sources = []
        if satellite: sources.append('satellite')
        if knowledge: sources.append('knowledge')
        if weather: sources.append('weather')
        if web_search: sources.append('web_search')
        return sources

    def _calculate_confidence(self, satellite_conf, knowledge_conf, weather_conf):
        """Simple average confidence calculation"""
        return round((satellite_conf + knowledge_conf + weather_conf) / 3, 2)

class MultiAgentOrchestrator:
    """
    Main orchestrator that coordinates all agents
    This is the brain of your enhanced system!
    """
    
    def __init__(self):
        logger.info("Initializing Multi-Agent Orchestrator...")
        
        self.agents = {
            AgentType.INTENT: IntentClassifierAgent(),
            AgentType.KNOWLEDGE: KnowledgeRAGAgent(),
            AgentType.SATELLITE: SatelliteEOAgent(),
            AgentType.WEATHER: EnhancedWeatherAgent(),
            AgentType.FUSION: FusionAgent(),
            AgentType.WEB_SEARCH: WebSearchAgent()  # Add this line
        }
        
        self.initialized = True
        logger.info("Multi-Agent Orchestrator ready!")
    
    async def should_use_orchestrator(self, query: str) -> bool:
        """
        Determine if query should use orchestrator or simple LLM
        This prevents breaking your existing system!
        """
        orchestrator_triggers = [
            'satellite', 'ndvi', 'how is my farm', 'check my crop',
            'crop health', 'weather', 'forecast', 'soil moisture',
            'yellow leaves', 'dying', 'pest', 'disease'
        ]
        
        query_lower = query.lower()
        return any(trigger in query_lower for trigger in orchestrator_triggers)
    
    async def process_farmer_query(
        self, 
        query: str, 
        location: Optional[str] = None,
        crop_type: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Main orchestration logic
        Returns a dict with response and metadata
        """
        
        logger.info(f"Processing query with orchestrator: {query[:50]}...")
        
        try:
            # Step 1: Classify intent
            intent = await self.agents[AgentType.INTENT].process({'query': query})
            logger.debug(f"Intent detected: {intent}")
            
            # Step 2: Prepare context for all agents
            context = {
                'query': query,
                'location': location or 'Kumasi',
                'crop_type': crop_type or 'maize',
                'intent': intent,
                'user_id': user_id
            }
            
            # Step 3: Run knowledge base agent first
            logger.info("Running knowledge base agent...")
            knowledge_result = await self.agents[AgentType.KNOWLEDGE].process(context)

            # Step 4: Only run satellite agent if KB is weak or empty
            satellite_result = {"ndvi": {"current": 0.5}, "confidence": 0.0}
            if not knowledge_result or knowledge_result.get('confidence', 0) < 0.5:
                logger.info("Knowledge base result weak, running satellite agent...")
                satellite_result = await self.agents[AgentType.SATELLITE].process(context)

            # Step 5: Only run weather agent if both KB and satellite are weak
            weather_result = {"temperature": 28, "confidence": 0.0}
            if (
                (not knowledge_result or knowledge_result.get('confidence', 0) < 0.5) and
                (not satellite_result or satellite_result.get('confidence', 0) < 0.5)
            ):
                logger.info("KB and satellite results weak, running weather agent...")
                weather_result = await self.agents[AgentType.WEATHER].process(context)

            # Step 6: Only run web search if all above are weak
            web_result = {"context": "", "confidence": 0.0}
            if (
                (not knowledge_result or knowledge_result.get('confidence', 0) < 0.5) and
                (not satellite_result or satellite_result.get('confidence', 0) < 0.5) and
                (not weather_result or weather_result.get('confidence', 0) < 0.5)
            ):
                logger.info("KB, satellite, and weather results weak, running web search agent...")
                web_result = await self.agents[AgentType.WEB_SEARCH].process(context)

                # >>> PLACE THE WEB SEARCH SAVING CODE HERE <<<
                if web_result and web_result.get('context'):
                    trusted_domains = ["csir.org.gh", "mofa.gov.gh", "fao.org", "agra.org"]
                    source_url = web_result.get('source', '')
                    if any(domain in source_url for domain in trusted_domains):
                        with open("data/documents/web_augmented_snippets.txt", "a", encoding="utf-8") as f:
                            f.write(
                                f"Query: {query}\n"
                                f"Source: {source_url}\n"
                                f"Text: {web_result['context']}\n"
                                f"Date: {datetime.now().isoformat()}\n"
                                f"---\n"
                            )
                    else:
                        # Optionally, save for manual review
                        with open("data/documents/web_snippets_for_review.txt", "a", encoding="utf-8") as f:
                            f.write(
                                f"Query: {query}\n"
                                f"Source: {source_url}\n"
                                f"Text: {web_result['context']}\n"
                                f"Date: {datetime.now().isoformat()}\n"
                                f"---\n"
                            )

            # --- LLM prompt construction (optional) ---
            llm_prompt = self.agents[AgentType.KNOWLEDGE].knowledge_base.llm_handler.build_llm_prompt(
                user_query=query,
                context=knowledge_result.get('context'),
                satellite=satellite_result,
                weather=weather_result,
                web_search=web_result
            )

            # Step 7: Fusion - Combine all results
            fusion_input = {
                'intent': intent,
                'knowledge': knowledge_result,
                'satellite': satellite_result,
                'weather': weather_result,
                'web_search': web_result,
                'original_query': query,
                'llm_prompt': llm_prompt
            }
            
            final_result = await self.agents[AgentType.FUSION].process(fusion_input)

            # --- Human-in-the-loop: flag for review if low confidence or high urgency ---
            review_needed = (
                final_result.get('confidence', 1.0) < 0.5 or
                (intent.get('urgency') == 'high')
            )
            if review_needed:
                review_entry = {
                    "query": query,
                    "response": final_result.get('response'),
                    "confidence": final_result.get('confidence'),
                    "urgency": intent.get('urgency'),
                    "user_id": user_id,
                    "timestamp": datetime.now().isoformat()
                }
                with open("data/feedback/interactions_for_review.jsonl", "a", encoding="utf-8") as f:
                    f.write(json.dumps(review_entry) + "\n")
                final_result['human_review_flagged'] = True

            # Step 8: Add metadata for logging
            final_result['metadata'] = {
                'orchestrator_used': True,
                'agents_consulted': ['intent', 'knowledge', 'satellite', 'weather', 'web_search', 'fusion'],
                'processing_time': datetime.now().isoformat(),
                'location': location,
                'crop_type': crop_type
            }
            
            logger.info("Orchestration complete")
            return final_result
            
        except Exception as e:
            logger.error(f"Orchestration error: {e}")
            
            # Fallback response
            return {
                'response': "I'm having trouble processing your request. Please try rephrasing your question or contact support.",
                'confidence': 0.1,
                'error': str(e),
                'metadata': {'orchestrator_used': True, 'error_occurred': True}
            }
def onboard_farmer(user_id, phone_number, consent_given, location=None, crop_type=None):
    if not consent_given:
        return {"error": "Consent required to use this service."}
    farmer_record = {
        "user_id": user_id,
        "phone_number": phone_number[-4:] + "****",  # Mask PII
        "location": location,
        "crop_type": crop_type,
        "consent": True,
        "timestamp": datetime.now().isoformat()
    }
    with open("data/feedback/farmer_onboarding.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(farmer_record) + "\n")
    return {"status": "onboarded"}



