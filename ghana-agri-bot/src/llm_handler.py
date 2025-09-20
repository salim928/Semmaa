"""
LLM Handler for Groq API Integration
Purpose: Manage all interactions with the Groq LLM for generating farming advice
"""

import logging
from typing import Dict, Tuple, Optional
from groq import Groq
import time

from config.settings import GROQ_API_KEY, LLM_MODEL, MAX_TOKENS, CONFIDENCE_THRESHOLD
from config.prompts import SYSTEM_PROMPT, CROP_SPECIFIC_PROMPTS, CONFIDENCE_RESPONSES

logger = logging.getLogger(__name__)

class LLMHandler:
    def __init__(self):
        """Initialize Groq client with API key"""
        self.client = Groq(api_key=GROQ_API_KEY)
        self.model = LLM_MODEL
        
    def detect_crop_type(self, query: str) -> Optional[str]:
        """
        Detect crop type mentioned in the query
        
        Args:
            query: User's farming question
            
        Returns:
            Detected crop type or None
        """
        query_lower = query.lower()
        
        for crop in CROP_SPECIFIC_PROMPTS.keys():
            if crop in query_lower:
                return crop
                
        # Check for common aliases
        if "corn" in query_lower:
            return "maize"
        elif "groundnut" in query_lower or "peanut" in query_lower:
            return "groundnut"
            
        return None
    
    def calculate_confidence(self, response: str, query: str) -> str:
        """
        Calculate confidence level based on response characteristics
        
        Args:
            response: Generated response
            query: Original query
            
        Returns:
            Confidence level (high/medium/low)
        """
        confidence_indicators = {
            "high": ["specifically", "in ghana", "csir", "mofa", "cocoa board", "research shows"],
            "low": ["generally", "might", "possibly", "suggest consulting", "varies"]
        }
        
        response_lower = response.lower()
        
        high_count = sum(1 for indicator in confidence_indicators["high"] if indicator in response_lower)
        low_count = sum(1 for indicator in confidence_indicators["low"] if indicator in response_lower)
        
        if high_count >= 2:
            return "high"
        elif low_count >= 2:
            return "low"
        else:
            return "medium"
    
    def generate_response(self, query: str, context: Dict = None) -> Tuple[str, str]:
        """
        Generate farming advice using Groq LLM
        
        Args:
            query: User's farming question
            context: Additional context (location, previous queries, etc.)
            
        Returns:
            Tuple of (response, confidence_level)
        """
        try:
            # Detect crop type for specialized prompt
            crop_type = self.detect_crop_type(query)
            
            # Build the prompt
            system_prompt = SYSTEM_PROMPT
            if crop_type and crop_type in CROP_SPECIFIC_PROMPTS:
                system_prompt += f"\n\n{CROP_SPECIFIC_PROMPTS[crop_type]}"
            
            # Add context if available
            if context:
                if context.get("location"):
                    query += f"\nLocation: {context['location']}"
                if context.get("previous_query"):
                    query += f"\nFollow-up to: {context['previous_query']}"
            
            # Call Groq API
            start_time = time.time()
            
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.7,
                max_tokens=MAX_TOKENS,
                top_p=0.9,
            )
            
            response = completion.choices[0].message.content
            response_time = time.time() - start_time
            
            logger.info(f"Generated response in {response_time:.2f}s")
            
            # Calculate confidence
            confidence = self.calculate_confidence(response, query)
            
            # Format final response
            formatted_response = f"{response}\n\n{CONFIDENCE_RESPONSES[confidence]}"
            
            return formatted_response, confidence
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise
    
    def generate_followup_questions(self, query: str, response: str) -> list:
        """
        Generate relevant follow-up questions
        
        Args:
            query: Original query
            response: Generated response
            
        Returns:
            List of follow-up questions
        """
        try:
            prompt = f"""Based on this farming question and answer, suggest 2 brief follow-up questions a farmer might ask:

Question: {query}
Answer: {response[:200]}...

Format as a simple list of 2 questions."""

            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=100,
            )
            
            questions = completion.choices[0].message.content.strip().split('\n')
            # Clean up the questions
            questions = [q.strip('- •123.') for q in questions if q.strip()][:2]
            
            return questions
            
        except Exception as e:
            logger.error(f"Error generating follow-up questions: {e}")
            return []
    
    def build_llm_prompt(self, user_query, context, satellite=None, weather=None, web_search=None):
        """
        Build the LLM prompt with all available information sources
        
        Args:
            user_query: The original question from the user
            context: Contextual information from the knowledge base
            satellite: Satellite data (optional)
            weather: Weather data (optional)
            web_search: Web search results (optional)
            
        Returns:
            Constructed prompt string
        """
        prompt = SYSTEM_PROMPT + "\n\n"
        prompt += f"User question: {user_query}\n\n"
        if context:
            prompt += f"Knowledge base context:\n{context}\n\n"
        if satellite and satellite.get('formatted_report'):
            prompt += f"Satellite analysis:\n{satellite['formatted_report']}\n\n"
        if weather and weather.get('agricultural_advisory'):
            prompt += f"Weather advisory:\n{weather['agricultural_advisory']}\n\n"
        if web_search and web_search.get('context'):
            prompt += f"Web search insights:\n{web_search['context']}\n\n"
        prompt += "Provide your best advice below:"
        return prompt