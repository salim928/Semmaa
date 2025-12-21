# llm_handler.py - PROFESSIONAL ADVISORY VERSION
"""
Professional LLM Handler for Ghana Agricultural Bot
Purpose: Generate authoritative, data-driven agricultural advisory responses
"""

import logging
import asyncio
from typing import Dict, Optional, List
from groq import Groq
import re
from datetime import datetime

from config.settings import GROQ_API_KEY, LLM_MODEL, MAX_TOKENS

logger = logging.getLogger(__name__)

# Professional Agricultural Advisory System Prompt
PROFESSIONAL_SYSTEM_PROMPT = """You are Ghana SemmaAI, a professional agricultural advisory system providing authoritative, data-driven guidance to farmers.

CRITICAL INSTRUCTIONS:
1. If the user's message is a greeting, thanks, confirmation, or other small talk (e.g., "hi", "hello", "thanks", "ok", "how are you", "bye", "yes", "no", "cool", "great"), respond in a friendly, conversational way. Do NOT provide agricultural advice unless the user asks for it.
2. For all other queries about farming, crops, weather, markets, or related topics, provide authoritative, data-driven agricultural guidance.
3. NEVER use casual greetings like "Ei", "Hmm", "Ah", "Oh", "Well", "So" in professional/advisory responses.
4. NEVER say "Unfortunately, I don't have..." - instead provide the best available guidance.
5. ALWAYS start advisory responses with direct, professional statements.
6. Use technical agricultural terminology appropriately.
7. Provide specific measurements, rates, and timings.
8. Base all advice on provided data and agricultural science.
9. Be confident and authoritative where data supports it.
10. Include safety guidelines for any chemical recommendations.

RESPONSE STYLE:
- Friendly and conversational for small talk, greetings, confirmations, and casual chat.
- Professional and authoritative for agricultural queries.
- Data-driven and specific for advice.
- Action-oriented and practical.
- Technically accurate.
- Accessible to farmers.

You have access to:
- Ghana Ministry of Food and Agriculture (MoFA) guidelines
- CSIR research data
- FAO best practices
- Current market intelligence
- Weather and satellite monitoring data
"""

class LLMHandler:
    def __init__(self):
        if not GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not set")
        self.client = Groq(api_key=GROQ_API_KEY)
        self.model_name = LLM_MODEL or "gemma2-9b-it"
        logger.info(f"Professional Agricultural Advisory System initialized with model: {self.model_name}")

    def generate_synthesized_response(self, prompt: str) -> str:
        """Generate complete response without truncation"""
        try:
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": PROFESSIONAL_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1500,  # Ensure full responses
                stop=None,  # Don't stop early
            )
            
            response = completion.choices[0].message.content.strip()
            
            # Check if response was truncated
            if response.endswith(("...", "•", "-", ":")):
                logger.warning("Response may be truncated, requesting continuation")
                # Could implement continuation logic here if needed
            
            return self._ensure_professional_language(response)
        
        except Exception as e:
            logger.error(f"LLM generation error: {e}")
            return self._generate_professional_fallback()
    
    def generate_with_rag(
        self, 
        query: str, 
        contexts: List[Dict], 
        farmer_context: Optional[Dict] = None,
        max_ctx: int = 5,
        web_search: Optional[Dict] = None,
        data_sources: Optional[List] = None,
        image_available: bool = False
    ) -> str:
        """
        Generate professional advisory with RAG and web verification
        """
        try:
            # Process contexts
            ctx_items = []
            sources = data_sources or []
            
            for ctx in contexts[:max_ctx]:
                if isinstance(ctx, dict):
                    text = ctx.get('text', '')
                    source = ctx.get('metadata', {}).get('source', '')
                    if text:
                        ctx_items.append(text)
                    if source and source not in sources:
                        sources.append(source)
                elif isinstance(ctx, str):
                    ctx_items.append(ctx)
            
            # Build knowledge context
            knowledge = self._build_professional_knowledge(ctx_items)
            
            # Extract farmer context
            location = farmer_context.get('location', 'Ghana') if farmer_context else 'Ghana'
            crop = farmer_context.get('crops', '') if farmer_context else ''
            intent_type = farmer_context.get('intent_type', 'general') if farmer_context else 'general'
            
            # Create professional advisory prompt
            advisory_prompt = f"""
AGRICULTURAL ADVISORY REQUEST
Location: {location}
Crop: {crop}
Query Type: {intent_type}
Farmer's Question: {query}

AGRICULTURAL KNOWLEDGE BASE:
{knowledge}

INSTRUCTIONS:
Provide professional agricultural advisory that:
1. Directly addresses the farmer's question with authority
2. Uses specific data and measurements from the knowledge base
3. Recommends concrete actions with timings and rates
4. Maintains professional tone without casual language
5. Includes safety guidelines for any treatments
6. Bases advice on established agricultural science

Professional Agricultural Advisory:"""
            
            # Generate response
            response = self._call_professional_api(advisory_prompt)
            
            # Verify with web search if available
            if web_search and web_search.get('context'):
                response = self._integrate_web_verification(response, web_search)
            
            # Add source attribution
            if sources:
                response = self._add_source_attribution(response, sources)
            
            # Ensure response quality
            if not response or len(response) < 50:
                response = self._generate_professional_fallback()
            
            return response
            
        except Exception as e:
            logger.error(f"RAG generation error: {e}")
            return self._generate_professional_fallback()
    
    def _call_professional_api(self, prompt: str) -> str:
        """Make API call with professional system prompt"""
        try:
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": PROFESSIONAL_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=min(1200, MAX_TOKENS or 1200),
            )
            
            response = completion.choices[0].message.content.strip()
            return self._ensure_professional_language(response)
            
        except Exception as e:
            logger.error(f"API call error: {e}")
            return self._generate_professional_fallback()
    
    def _ensure_professional_language(self, response: str) -> str:
        """Ensure response maintains professional agricultural advisory tone"""
        
        # Remove casual greetings and interjections
        casual_patterns = [
            r'^(Ei|Hmm|Ah|Oh|Hey|Hi|Hello|Greetings|Well|So|Okay|Alright)[,!.]?\s*',
            r'^(Unfortunately|Sadly|I\'m sorry|Sorry)[,.]?\s*',
            r'^(It (seems|looks like|appears)|I (think|believe))\s*',
        ]
        
        for pattern in casual_patterns:
            response = re.sub(pattern, '', response, flags=re.IGNORECASE)
        
        # Replace weak language with confident alternatives
        confidence_replacements = {
            r'\bmight\b': 'may',
            r'\bcould be\b': 'is likely',
            r'\bperhaps\b': 'potentially',
            r'\bmaybe\b': 'potentially',
            r'\bI don\'t have\b': 'Available data indicates',
            r'\bI cannot\b': 'Current information suggests',
            r'\btry to\b': '',
            r'\byou should try\b': 'Apply',
            r'\byou might want to\b': 'Consider',
            r'\bit\'s possible\b': 'Analysis indicates',
        }
        
        for weak, strong in confidence_replacements.items():
            response = re.sub(weak, strong, response, flags=re.IGNORECASE)
        
        # Ensure professional structure
        response = response.strip()
        
        # Capitalize first letter if needed
        if response and response[0].islower():
            response = response[0].upper() + response[1:]
        
        # Remove any remaining template markers
        response = re.sub(r'Professional.*?Advisory:?\s*', '', response, flags=re.IGNORECASE)
        response = re.sub(r'Advisory.*?Response:?\s*', '', response, flags=re.IGNORECASE)
        
        return response
    
    def _build_professional_knowledge(self, contexts: List[str]) -> str:
        """Build professional knowledge summary from contexts"""
        if not contexts:
            return "Standard agricultural best practices apply."
        
        knowledge_points = []
        for i, ctx in enumerate(contexts, 1):
            if ctx:
                # Clean and truncate context
                snippet = ctx.replace("\n", " ").strip()[:400]
                knowledge_points.append(f"Technical Reference {i}: {snippet}")
        
        return "\n".join(knowledge_points) if knowledge_points else "Standard agricultural guidelines apply."
    
    def _integrate_web_verification(self, response: str, web_search: Dict) -> str:
        """Integrate web search verification into response"""
        
        web_context = web_search.get('context', '')
        if not web_context:
            return response
        
        # Extract key facts from web search
        facts = []
        
        # Look for prices
        price_matches = re.findall(r'GHS?\s*[\d,]+(?:\.\d+)?', web_context)
        if price_matches:
            facts.append(f"Current market indicators: {', '.join(price_matches[:2])}")
        
        # Look for percentages or statistics
        stat_matches = re.findall(r'\d+(?:\.\d+)?%', web_context)
        if stat_matches:
            facts.append(f"Relevant statistics: {', '.join(stat_matches[:2])}")
        
        # If facts found, integrate them
        if facts:
            verification = "\n\nVerified Information: " + ". ".join(facts)
            response += verification
        
        return response
    
    def _add_source_attribution(self, response: str, sources: List[str]) -> str:
        """Add professional source attribution"""
        
        if not sources:
            return response
        
        # Filter for authoritative sources
        authoritative = []
        for source in sources[:3]:
            if any(auth in str(source).lower() for auth in ['mofa', 'csir', 'fao', 'research']):
                authoritative.append(source)
        
        if authoritative:
            attribution = f"\n\nData Sources: {', '.join(authoritative)}"
            response += attribution
        
        return response
    
    def _generate_professional_fallback(self) -> str:
        """Generate professional fallback response"""
        return (
            "Based on established agricultural practices in Ghana, the following guidelines apply:\n\n"
            "1. Consult your local agricultural extension officer for location-specific recommendations\n"
            "2. Follow integrated pest and disease management principles\n"
            "3. Apply inputs according to manufacturer specifications and safety guidelines\n"
            "4. Monitor field conditions regularly for optimal intervention timing\n\n"
            "For immediate technical assistance, contact your district MoFA office or call the agricultural helpline."
        )
    
    def validate_response(self, response: str, min_length: int = 50) -> bool:
        """Validate response quality"""
        if not response or len(response) < min_length:
            return False
        
        # Check for error indicators
        error_phrases = [
            "sorry, i couldn't",
            "error occurred",
            "try again",
            "unavailable",
            "i don't have",
            "unfortunately"
        ]
        
        response_lower = response.lower()
        for phrase in error_phrases:
            if phrase in response_lower:
                return False
        
        return True
    
    async def generate_response_with_context(
        self,
        prompt: str,
        farmer_context: Optional[Dict] = None,
        image_available: bool = False,
        data_sources: Optional[List[str]] = None
    ) -> str:
        """
        Async wrapper for professional advisory generation
        """
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.generate_with_rag(
                    query=prompt,
                    contexts=[],
                    farmer_context=farmer_context or {},
                    image_available=image_available,
                    data_sources=data_sources or []
                )
            )
            return response
        except Exception as e:
            logger.error(f"Async generation error: {e}")
            return self._generate_professional_fallback()