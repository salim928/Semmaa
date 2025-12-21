# minimal_enhancer.py - Light-touch enhancement only
"""
Minimal Advisory Enhancer - Preserves Natural Synthesis
"""

import re
from typing import Dict, List
from datetime import datetime

class MinimalEnhancer:
    """
    Light-touch enhancement that preserves natural language
    """
    
    def enhance_response(self, response: str, **kwargs) -> str:
        """
        Minimal enhancement - just safety and sources
        """
        enhanced = response
        
        # Only add safety note if chemicals mentioned
        if any(word in enhanced.lower() for word in ['spray', 'pesticide', 'chemical', 'fertilizer']):
            if "safety" not in enhanced.lower() and "ppe" not in enhanced.lower():
                enhanced += "\n\n⚠️ Remember to follow product labels and wear protective equipment."
        
        # Add sources if provided
        sources = kwargs.get('data_sources', [])
        if sources and "source" not in enhanced.lower():
            enhanced += f"\n\n📚 Data from: {', '.join(sources[:3])}"
        
        # Add timestamp
        enhanced += f"\n🕐 {datetime.now().strftime('%H:%M UTC, %d %b %Y')}"
        
        return enhanced

# Use this instead of the heavy advisory_enhancer
minimal_enhancer = MinimalEnhancer()