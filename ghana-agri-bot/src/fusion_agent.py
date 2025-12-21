# fusion_agent.py - PROFESSIONAL DATA-DRIVEN VERSION
"""
Professional Fusion Agent for Ghana Agricultural Bot
Creates confident, data-driven advisory responses without casual language
"""

import logging
import re
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class FocusedFusionAgent:
    """
    Creates professional, data-driven agricultural advisory responses
    """
    
    def __init__(self):
        from src.llm_handler import LLMHandler
        self.llm = LLMHandler()
    
    async def process(self, input_data: Dict) -> Dict:
        """
        Process with professional, data-driven synthesis
        """
        try:
            # Extract core information
            query = input_data.get('original_query', '')
            location = input_data.get('location', 'Ghana')
            crop_type = input_data.get('crop_type', '')
            agents_used = input_data.get('agents_used', [])
            kb_sufficient = input_data.get('kb_sufficient', False)
            
            # Extract agent results
            intent = input_data.get('intent', {})
            knowledge = input_data.get('knowledge', {})
            weather = input_data.get('weather', {})
            market = input_data.get('market', {})
            satellite = input_data.get('satellite', {})
            web_search = input_data.get('web_search', {})
            
            logger.info(f"=== PROFESSIONAL FUSION ===")
            logger.info(f"Query: {query[:100]}")
            logger.info(f"Intent: {intent.get('type', 'general')}")
            logger.info(f"Agents used: {agents_used}")
            
            # Detect actual crop from query
            actual_crop = self._detect_crop(query, crop_type)
            
            # Check data availability
            has_market_data = 'market' in agents_used and market and market.get('price_now')
            has_weather_data = 'weather' in agents_used and weather and weather.get('current')
            has_satellite_data = 'satellite' in agents_used and satellite and satellite.get('ndvi')
            
            # Choose appropriate response strategy
            intent_type = intent.get('type', 'general')
            
            if intent_type == 'market' or 'price' in query.lower():
                response = await self._create_market_advisory(
                    query, location, actual_crop, market, knowledge, web_search, has_market_data
                )
                method = 'market_advisory'
                
            elif intent_type == 'crop_health':
                response = await self._create_health_advisory(
                    query, location, actual_crop, knowledge, web_search
                )
                method = 'health_advisory'
                
            elif intent_type == 'weather':
                response = await self._create_weather_advisory(
                    query, location, weather, knowledge, web_search, has_weather_data
                )
                method = 'weather_advisory'
                
            elif intent_type in ['planting', 'fertilizer', 'harvest']:
                response = await self._create_cultivation_advisory(
                    query, location, actual_crop, knowledge, web_search, weather
                )
                method = 'cultivation_advisory'
                
            elif intent_type == 'export':
                response = await self._create_export_advisory(
                    query, location, actual_crop, knowledge, web_search
                )
                method = 'export_advisory'
                
            else:
                response = await self._create_general_advisory(
                    query, location, actual_crop, knowledge, web_search,
                    weather, market, satellite, agents_used
                )
                method = 'general_advisory'
            
            # Calculate realistic confidence
            confidence = self._calculate_confidence(
                kb_sufficient, agents_used, has_market_data,
                has_weather_data, has_satellite_data,
                knowledge, web_search
            )
            
            # Extract sources
            sources = self._extract_sources(
                agents_used, knowledge, web_search, market
            )
            
            return {
                'response': response,
                'confidence': confidence,
                'data_sources': sources,
                'synthesis_method': method,
                'agents_used': agents_used
            }
            
        except Exception as e:
            logger.error(f"Fusion error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return self._error_response(query)
    
    async def _create_market_advisory(
        self, query: str, location: str, crop: str,
        market: Dict, knowledge: Dict, web_search: Dict,
        has_data: bool
    ) -> str:
        """Create professional market advisory"""
        
        if has_data:
            # We have actual market data
            prompt = f"""
Agricultural Market Advisory Request: "{query}"
Location: {location}
Crop: {crop}

CURRENT MARKET DATA:
Crop: {market.get('crop', crop)}
Market Location: {market.get('city', location)}
Current Price: GHS {market.get('price_now', 0)} {market.get('unit', 'per kg')}
Price Range: GHS {market.get('low', 0)}-{market.get('high', 0)}
Median Price: GHS {market.get('median', 0)}
Market Trend: {market.get('advice', '')}
Last Updated: {market.get('updated', 'Recently')}

KNOWLEDGE BASE:
{knowledge.get('context', '')[:300] if knowledge.get('context') else 'Limited historical data'}

WEB VERIFICATION:
{web_search.get('context', '')[:400] if web_search.get('context') else 'No additional market intelligence'}

INSTRUCTIONS:
Create a professional agricultural market advisory that:
1. States the current price data clearly and confidently
2. Provides context on whether prices are favorable
3. Recommends specific action (sell now, hold, or wait)
4. Mentions seasonal trends if relevant
5. Suggests negotiation strategies for better prices
6. Uses professional language (no casual greetings like "Ei" or "Hmm")
7. Provides actionable market intelligence

Professional Market Advisory:"""
        
        else:
            # No specific market data available
            prompt = f"""
Agricultural Market Information Request: "{query}"
Location: {location}
Crop: {crop}

Note: Real-time price data not available in database.

AGRICULTURAL KNOWLEDGE:
{knowledge.get('context', '')[:400] if knowledge.get('context') else 'General market principles'}

MARKET INTELLIGENCE FROM WEB:
{web_search.get('context', '')[:500] if web_search.get('context') else 'Limited current market information'}

INSTRUCTIONS:
Create a professional response that:
1. Acknowledges the specific market query
2. Provides any available price indicators or trends from the data
3. Recommends practical steps to obtain current prices
4. Suggests optimal market timing based on seasonal patterns
5. Provides market access strategies
6. Maintains professional, advisory tone
7. Includes specific contacts or resources where possible

Professional Advisory Response:"""
        
        response = self.llm.generate_synthesized_response(prompt)
        return self._ensure_professional_tone(response)
    
    async def _create_health_advisory(
        self, query: str, location: str, crop: str,
        knowledge: Dict, web_search: Dict
    ) -> str:
        """Create professional crop health advisory"""
        
        # Extract symptoms mentioned
        symptoms = self._extract_symptoms(query)
        
        prompt = f"""
Agricultural Health Diagnostic Request: "{query}"
Crop: {crop}
Location: {location}
Observed Symptoms: {', '.join(symptoms) if symptoms else 'As described'}

DIAGNOSTIC KNOWLEDGE BASE:
{knowledge.get('context', '')[:500] if knowledge.get('context') else 'Limited diagnostic information'}

RESEARCH VERIFICATION:
{web_search.get('context', '')[:500] if web_search.get('context') else 'No additional diagnostic data'}

INSTRUCTIONS:
Create a professional agricultural health advisory that:
1. Provides likely diagnosis based on symptoms
2. Lists specific treatment options with application rates
3. Recommends integrated pest/disease management approach
4. Includes preventive measures
5. Specifies timing for interventions
6. Mentions safety precautions for any chemicals
7. Uses technical but accessible language
8. Avoids casual language - be professional and authoritative
9. Suggests when to seek expert verification

Professional Diagnostic Advisory:"""
        
        response = self.llm.generate_synthesized_response(prompt)
        return self._ensure_professional_tone(response)
    
    async def _create_weather_advisory(
        self, query: str, location: str,
        weather: Dict, knowledge: Dict, web_search: Dict,
        has_data: bool
    ) -> str:
        """Create professional weather-based agricultural advisory"""
        
        if has_data:
            prompt = f"""
Agricultural Weather Advisory Request: "{query}"
Location: {weather.get('location', location)}

CURRENT WEATHER DATA:
{weather.get('current', 'No current conditions')}

WEATHER RECOMMENDATIONS:
{chr(10).join('- ' + advice for advice in weather.get('advice', [])[:5])}

AGRICULTURAL CONTEXT:
{knowledge.get('context', '')[:300] if knowledge.get('context') else ''}

INSTRUCTIONS:
Create a professional weather advisory that:
1. Interprets weather data for agricultural operations
2. Provides specific recommendations for field activities
3. Advises on optimal timing for operations
4. Includes risk mitigation strategies
5. Suggests contingency plans
6. Maintains professional advisory tone
7. Provides actionable guidance

Professional Weather Advisory:"""
        else:
            prompt = f"""
Weather Information Request: "{query}"
Location: {location}

AVAILABLE INFORMATION:
{knowledge.get('context', '')[:400] if knowledge.get('context') else 'General seasonal patterns'}
{web_search.get('context', '')[:400] if web_search.get('context') else ''}

Create a professional response about typical weather patterns and agricultural implications for the location and season.

Professional Advisory:"""
        
        response = self.llm.generate_synthesized_response(prompt)
        return self._ensure_professional_tone(response)
    
    async def _create_cultivation_advisory(
        self, query: str, location: str, crop: str,
        knowledge: Dict, web_search: Dict, weather: Dict
    ) -> str:
        """Create professional cultivation advisory"""
        
        prompt = f"""
Agricultural Cultivation Advisory Request: "{query}"
Crop: {crop}
Location: {location}

TECHNICAL KNOWLEDGE:
{knowledge.get('context', '')[:500] if knowledge.get('context') else 'General cultivation practices'}

CURRENT RESEARCH:
{web_search.get('context', '')[:400] if web_search.get('context') else ''}

WEATHER CONDITIONS:
{weather.get('current', 'Typical seasonal conditions') if weather else 'Standard conditions'}

INSTRUCTIONS:
Create a professional cultivation advisory that:
1. Provides specific technical guidance for the query
2. Includes exact measurements (spacing, depth, rates)
3. Specifies timing based on local conditions
4. Recommends best practices from research
5. Addresses soil preparation requirements
6. Includes input specifications
7. Suggests monitoring protocols
8. Maintains professional, technical tone
9. Provides clear action steps

Professional Cultivation Advisory:"""
        
        response = self.llm.generate_synthesized_response(prompt)
        return self._ensure_professional_tone(response)
    
    async def _create_export_advisory(
        self, query: str, location: str, crop: str,
        knowledge: Dict, web_search: Dict
    ) -> str:
        """Create professional export advisory"""
        
        prompt = f"""
Agricultural Export Advisory Request: "{query}"
Product: {crop}
Origin: {location}

EXPORT KNOWLEDGE:
{knowledge.get('context', '')[:400] if knowledge.get('context') else 'General export requirements'}

CURRENT REGULATIONS:
{web_search.get('context', '')[:500] if web_search.get('context') else 'Standard export procedures'}

INSTRUCTIONS:
Create a professional export advisory that:
1. Lists specific certification requirements
2. Details documentation needed
3. Provides step-by-step export process
4. Names relevant authorities and contacts
5. Specifies quality standards
6. Includes packaging requirements
7. Mentions phytosanitary regulations
8. Provides cost estimates where possible
9. Maintains professional, authoritative tone

Professional Export Advisory:"""
        
        response = self.llm.generate_synthesized_response(prompt)
        return self._ensure_professional_tone(response)
    
    async def _create_general_advisory(
        self, query: str, location: str, crop: str,
        knowledge: Dict, web_search: Dict, weather: Dict,
        market: Dict, satellite: Dict, agents_used: List[str]
    ) -> str:
        """Create general professional advisory"""
        
        # Build comprehensive data context
        data_context = []
        
        if knowledge.get('context'):
            data_context.append(f"TECHNICAL KNOWLEDGE:\n{knowledge['context'][:400]}")
        
        if 'weather' in agents_used and weather.get('current'):
            data_context.append(f"WEATHER CONDITIONS:\n{weather['current']}")
        
        if 'market' in agents_used and market:
            if market.get('price_now'):
                data_context.append(f"MARKET DATA:\n{market.get('crop')}: GHS {market['price_now']} {market.get('unit', '')}")
        
        if 'satellite' in agents_used and satellite.get('formatted_report'):
            data_context.append(f"FIELD MONITORING:\n{satellite['formatted_report']}")
        
        if web_search.get('context'):
            data_context.append(f"CURRENT RESEARCH:\n{web_search['context'][:400]}")
        
        prompt = f"""
Agricultural Advisory Request: "{query}"
Location: {location}
Crop: {crop}

{chr(10).join(data_context)}

INSTRUCTIONS:
Create a professional agricultural advisory that:
1. Directly addresses the specific question
2. Synthesizes all available data into coherent guidance
3. Provides specific, actionable recommendations
4. Uses professional, technical language
5. Avoids casual greetings or filler words
6. Includes measurements and specifications where relevant
7. Maintains authoritative advisory tone
8. Concludes with clear next steps

Professional Agricultural Advisory:"""
        
        response = self.llm.generate_synthesized_response(prompt)
        return self._ensure_professional_tone(response)
    
    def _ensure_professional_tone(self, response: str) -> str:
        """Remove casual language and ensure professional tone"""
        
        # Remove casual greetings and interjections
        casual_patterns = [
            r'^(Ei|Hmm|Ah|Oh|Hey|Hi|Hello|Greetings)[,!.]?\s*',
            r'^(Well,|So,|Okay,|Alright,)\s*',
            r"^(It looks like|It seems|I think|I believe)\s*",
            r"^(Unfortunately,?|Sadly,?)\s*"
        ]
        
        for pattern in casual_patterns:
            response = re.sub(pattern, '', response, flags=re.IGNORECASE | re.MULTILINE)
        
        # Remove overly conversational phrases
        response = re.sub(r"you're|you've|you'll|you'd", 
                          lambda m: {
                              "you're": "you are",
                              "you've": "you have",
                              "you'll": "you will",
                              "you'd": "you would"
                          }[m.group()], response, flags=re.IGNORECASE)
        
        # Ensure first letter is capitalized
        response = response.strip()
        if response and response[0].islower():
            response = response[0].upper() + response[1:]
        
        # Remove template headers if they appear
        template_patterns = [
            r'Professional.*?Advisory:?\s*',
            r'Advisory.*?Response:?\s*',
        ]
        for pattern in template_patterns:
            response = re.sub(pattern, '', response, flags=re.IGNORECASE)
        
        return response.strip()
    
    def _detect_crop(self, query: str, default_crop: str) -> str:
        """Comprehensive crop detection"""
        query_lower = query.lower()
        
        # Expanded crop list for Ghana
        crops = {
            'maize': ['maize', 'corn'],
            'rice': ['rice'],
            'cassava': ['cassava', 'bankye'],
            'yam': ['yam'],
            'plantain': ['plantain'],
            'cocoa': ['cocoa', 'cacao'],
            'tomato': ['tomato', 'tomatoes'],
            'pepper': ['pepper', 'chili', 'chilli'],
            'okro': ['okro', 'okra'],
            'garden eggs': ['garden eggs', 'eggplant'],
            'groundnut': ['groundnut', 'peanut'],
            'cowpea': ['cowpea', 'beans'],
            'soybean': ['soybean', 'soya'],
            'millet': ['millet'],
            'sorghum': ['sorghum'],
            'cashew': ['cashew'],
            'mango': ['mango', 'mangoes'],
            'pineapple': ['pineapple'],
            'palm': ['palm', 'oil palm'],
            'coconut': ['coconut'],
            'shea': ['shea', 'shea nut'],
            'chicken': ['chicken', 'broiler', 'layer', 'poultry'],
            'eggs': ['eggs', 'egg']
        }
        
        for crop_name, keywords in crops.items():
            if any(kw in query_lower for kw in keywords):
                return crop_name
        
        return default_crop or 'crops'
    
    def _extract_symptoms(self, query: str) -> List[str]:
        """Extract symptoms from query"""
        symptoms = []
        query_lower = query.lower()
        
        symptom_patterns = {
            'yellowing': ['yellow', 'yellowing'],
            'browning': ['brown', 'browning'],
            'spots': ['spots', 'spotted', 'patches'],
            'wilting': ['wilt', 'wilting', 'wilted', 'drooping'],
            'holes': ['holes', 'eaten', 'chewed'],
            'rot': ['rot', 'rotting', 'decay'],
            'slow growth': ['slow', 'stunted', 'poor growth'],
            'dying': ['dying', 'dead', 'death'],
            'coughing': ['coughing', 'cough'],
            'thin shells': ['thin-shelled', 'soft shells']
        }
        
        for symptom, patterns in symptom_patterns.items():
            if any(p in query_lower for p in patterns):
                symptoms.append(symptom)
        
        return symptoms
    
    def _calculate_confidence(
        self, kb_sufficient: bool, agents_used: List[str],
        has_market: bool, has_weather: bool, has_satellite: bool,
        knowledge: Dict, web_search: Dict
    ) -> float:
        """Calculate realistic confidence"""
        
        # Base confidence from knowledge base
        base = knowledge.get('confidence', 0.3)
        
        if kb_sufficient:
            base += 0.15
        
        # Boost for specific data availability
        if has_market:
            base += 0.2
        if has_weather:
            base += 0.1
        if has_satellite:
            base += 0.1
        
        # Web search contribution
        if 'web_search' in agents_used and web_search.get('confidence', 0) > 0.5:
            base += 0.15
        
        # Multiple source bonus
        if len(agents_used) >= 3:
            base += 0.1
        
        return min(base, 0.9)  # Cap at 90%
    
    def _extract_sources(
        self, agents_used: List[str],
        knowledge: Dict, web_search: Dict, market: Dict
    ) -> List[str]:
        """Extract data sources"""
        sources = []
        
        if knowledge.get('sources'):
            sources.extend(knowledge['sources'][:2])
        
        if 'web_search' in agents_used and web_search.get('sources'):
            web_sources = web_search['sources']
            # Add specific authoritative sources
            for source in web_sources[:2]:
                if isinstance(source, dict):
                    sources.append(source.get('title', 'Web'))
                else:
                    sources.append('Web Research')
        
        if 'market' in agents_used and market:
            sources.append(f"Market Data ({market.get('source', 'Local')})")
        
        if 'weather' in agents_used:
            sources.append("Ghana Meteorological Data")
        
        return sources if sources else ['Agricultural Knowledge Base']
    
    def _error_response(self, query: str) -> Dict:
        """Professional error response"""
        return {
            'response': (
                f"Technical difficulties encountered while processing your agricultural query. "
                f"Please contact your local agricultural extension officer or try again shortly. "
                f"For immediate assistance, call the MoFA helpline."
            ),
            'confidence': 0.2,
            'data_sources': [],
            'synthesis_method': 'error_fallback',
            'agents_used': []
        }