# enhanced_llm_handler.py - Natural Synthesis Updates
"""
LLM Handler Updates for Natural, Dynamic Response Generation
Add these methods to your existing LLMHandler class
"""

from asyncio.log import logger
import re
from typing import Dict

MAX_TOKENS = 1000  # Default maximum tokens for LLM responses


def generate_synthesized_response(self, prompt: str) -> str:
    """
    Generate naturally synthesized response without templates
    """
    system_prompt = """You are Ghana AgriBOT, an agricultural advisor who provides natural, conversational responses based on real data.

IMPORTANT: 
- Use the specific data provided to answer questions naturally
- Do NOT use fixed templates or rigid structures
- Speak conversationally as if talking to a farmer
- Include specific numbers, dates, and facts from the data
- Connect information from different sources when relevant
- Be confident where data supports it, acknowledge gaps where it doesn't"""
    
    try:
        completion = self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,  # Balanced for creativity and consistency
            max_tokens=min(1000, MAX_TOKENS or 1000),
        )
        
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Synthesis generation error: {e}")
        return "I'm having trouble processing the available data. Please try again."

def verify_and_enhance_with_data(self, base_response: str, data_context: Dict) -> str:
    """
    Enhance response with specific data points
    """
    enhanced = base_response
    
    # Insert actual prices if available
    if 'market' in data_context:
        market = data_context['market']
        price_placeholder = re.search(r'price[s]?\s+(?:are|is)', enhanced, re.I)
        if price_placeholder and market.get('current_price'):
            price_text = f"prices are GHS {market['current_price']} {market.get('unit', 'per kg')} in {market.get('city', 'local markets')}"
            enhanced = re.sub(r'price[s]?\s+(?:are|is)[^.]*', price_text, enhanced, count=1, flags=re.I)
    
    # Insert actual weather data
    if 'weather' in data_context:
        weather = data_context['weather']
        if 'rainfall_mm' in weather:
            rain_placeholder = re.search(r'rain[fall]*\s+(?:of|expected|forecast)', enhanced, re.I)
            if rain_placeholder:
                rain_text = f"rainfall of {weather['rainfall_mm']}mm"
                enhanced = re.sub(r'rain[fall]*\s+(?:of|expected|forecast)[^.]*', rain_text, enhanced, count=1, flags=re.I)
    
    return enhanced