# Helper functions
"""
Utility Functions
Purpose: Helper functions for text processing, location detection, and formatting
"""

import re
import logging
from logging.handlers import RotatingFileHandler
from typing import Optional, List, Dict
from datetime import datetime

from config.settings import GHANA_REGIONS, SUPPORTED_CROPS

logger = logging.getLogger(__name__)

def setup_logging():
    handler = RotatingFileHandler('data/logs/bot.log', maxBytes=1000000, backupCount=5)
    logging.basicConfig(
        level=logging.INFO,
        handlers=[handler],
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

def detect_location(text: str) -> Optional[str]:
    """
    Detect Ghana location/region mentioned in text
    
    Args:
        text: User input text
        
    Returns:
        Detected location or None
    """
    text_lower = text.lower()
    
    # Check for regions
    for region in GHANA_REGIONS:
        if region.lower() in text_lower:
            return region
    
    # Check for major cities
    cities = {
        "accra": "Greater Accra",
        "kumasi": "Ashanti",
        "takoradi": "Western",
        "tamale": "Northern",
        "cape coast": "Central",
        "koforidua": "Eastern",
        "ho": "Volta",
        "sunyani": "Brong Ahafo",
        "wa": "Upper West",
        "bolgatanga": "Upper East"
    }
    
    for city, region in cities.items():
        if city in text_lower:
            return region
    
    return None

def extract_crop_info(text: str) -> List[str]:
    """
    Extract crop types mentioned in text
    
    Args:
        text: User input text
        
    Returns:
        List of detected crops
    """
    text_lower = text.lower()
    detected_crops = []
    
    # Check for supported crops
    for crop in SUPPORTED_CROPS:
        if crop in text_lower:
            detected_crops.append(crop)
    
    # Check for aliases
    if "corn" in text_lower and "maize" not in detected_crops:
        detected_crops.append("maize")
    if "groundnut" in text_lower or "peanut" in text_lower:
        if "groundnut" not in detected_crops:
            detected_crops.append("groundnut")
    
    return detected_crops

def format_response(response: str) -> str:
    """
    Format response with proper markdown for Telegram
    
    Args:
        response: Raw response text
        
    Returns:
        Formatted response with markdown
    """
    # Add bold to important keywords
    important_words = [
        "important", "warning", "caution", "note", 
        "tip", "recommendation", "best practice"
    ]
    
    for word in important_words:
        pattern = re.compile(f'({word}:?)', re.IGNORECASE)
        response = pattern.sub(r'*\1*', response)
    
    # Format measurements and quantities
    response = re.sub(r'(\d+\s*kg/ha)', r'`\1`', response)
    response = re.sub(r'(\d+\s*cm)', r'`\1`', response)
    response = re.sub(r'(\d+\s*m)', r'`\1`', response)
    
    # Add emoji for common agricultural terms
    emoji_map = {
        "maize": "🌽",
        "corn": "🌽",
        "cocoa": "🍫",
        "cassava": "🥔",
        "tomato": "🍅",
        "rice": "🌾",
        "fertilizer": "💊",
        "water": "💧",
        "rain": "🌧️",
        "sun": "☀️",
        "pest": "🐛",
        "disease": "🦠"
    }
    
    for term, emoji in emoji_map.items():
        # Add emoji after the term (case insensitive)
        pattern = re.compile(f'\\b{term}\\b', re.IGNORECASE)
        response = pattern.sub(f'{term} {emoji}', response, count=1)
    
    return response

def parse_feedback_rating(text: str) -> Optional[str]:
    """
    Parse feedback rating from text
    
    Args:
        text: User feedback text
        
    Returns:
        'positive', 'negative', or None
    """
    text_lower = text.lower()
    
    positive_indicators = [
        "good", "great", "excellent", "helpful", 
        "useful", "thanks", "perfect", "correct"
    ]
    
    negative_indicators = [
        "bad", "wrong", "incorrect", "useless", 
        "unhelpful", "poor", "terrible"
    ]
    
    positive_count = sum(1 for word in positive_indicators if word in text_lower)
    negative_count = sum(1 for word in negative_indicators if word in text_lower)
    
    if positive_count > negative_count:
        return "positive"
    elif negative_count > positive_count:
        return "negative"
    else:
        return None

def is_farming_related(text: str) -> bool:
    """
    Check if the text is farming/agriculture related
    
    Args:
        text: User input text
        
    Returns:
        True if farming related, False otherwise
    """
    farming_keywords = [
        "plant", "farm", "crop", "seed", "harvest", "fertilizer",
        "pesticide", "herbicide", "soil", "irrigation", "water",
        "disease", "pest", "yield", "agriculture", "cultivation",
        "growing", "season", "rain", "drought", "mulch", "compost"
    ]
    
    text_lower = text.lower()
    
    # Check for farming keywords
    for keyword in farming_keywords:
        if keyword in text_lower:
            return True
    
    # Check for crop names
    for crop in SUPPORTED_CROPS:
        if crop in text_lower:
            return True
    
    return False

def get_season_advice(location: str = None) -> str:
    """
    Get current season planting advice
    
    Args:
        location: User location
        
    Returns:
        Season-specific advice
    """
    current_month = datetime.now().month
    
    # Ghana planting seasons
    if 3 <= current_month <= 5:
        season = "major planting season (March-May)"
        advice = "Perfect time for planting maize, cassava, and vegetables!"
    elif 9 <= current_month <= 11:
        season = "minor planting season (September-November)"
        advice = "Good for second crop of maize and vegetables."
    elif 6 <= current_month <= 8:
        season = "mid-season (June-August)"
        advice = "Focus on weeding, fertilizer application, and pest control."
    else:
        season = "harvest season (December-February)"
        advice = "Time for harvesting and land preparation."
    
    return f"🗓️ Current {season}\n💡 {advice}"

def clean_text_for_storage(text: str, max_length: int = 500) -> str:
    """
    Clean and truncate text for storage
    
    Args:
        text: Text to clean
        max_length: Maximum length
        
    Returns:
        Cleaned and truncated text
    """
    # Remove multiple spaces and newlines
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters that might break storage
    text = re.sub(r'[^\w\s\-.,!?]', '', text)
    
    # Truncate if necessary
    if len(text) > max_length:
        text = text[:max_length-3] + "..."
    
    return text.strip()

def evaluate_response_simple(response: str, query: str, sources: list) -> dict:
    """Enhanced simple response evaluation"""
    
    # Check if response uses knowledge base
    has_sources = len(sources) > 0
    
    # Check for actionable advice
    action_words = [
        'plant', 'apply', 'use', 'prepare', 'monitor', 'check', 'measure',
        'fertilize', 'water', 'harvest', 'spray', 'mix', 'prune', 'weed'
    ]
    action_count = sum(1 for word in action_words if word in response.lower())
    has_actions = action_count >= 2
    
    # Check length appropriateness
    word_count = len(response.split())
    appropriate_length = 50 <= word_count <= 400
    
    # Check for specific recommendations
    has_specifics = any(indicator in response.lower() for indicator in [
        'recommend', 'suggest', 'should', 'can', 'try', 'consider'
    ])
    
    # Check for local context
    has_local_context = any(term in response.lower() for term in [
        'ghana', 'local', 'region', 'season', 'climate'
    ])
    
    # Calculate overall quality
    quality_score = sum([
        has_sources * 2,
        has_actions * 2, 
        appropriate_length * 1,
        has_specifics * 1,
        has_local_context * 1
    ])
    
    if quality_score >= 6:
        overall_quality = 'excellent'
    elif quality_score >= 4:
        overall_quality = 'good'
    elif quality_score >= 2:
        overall_quality = 'fair'
    else:
        overall_quality = 'needs_improvement'
    
    return {
        'uses_knowledge_base': has_sources,
        'actionable': has_actions,
        'appropriate_length': appropriate_length,
        'has_specifics': has_specifics,
        'has_local_context': has_local_context,
        'source_count': len(sources),
        'action_count': action_count,
        'word_count': word_count,
        'quality_score': quality_score,
        'overall_quality': overall_quality
    }

def format_response(response: str) -> str:
    """Enhanced response formatting"""
    
    # Clean up the response
    formatted = response.strip()
    
    # Add structure to long responses
    if len(formatted.split()) > 100:
        # Try to add bullet points for lists
        lines = formatted.split('\n')
        formatted_lines = []
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('•') and not line.startswith('-'):
                # Check if line looks like a list item
                if any(line.lower().startswith(starter) for starter in [
                    'first', 'second', 'third', 'next', 'then', 'finally',
                    '1.', '2.', '3.', 'step'
                ]):
                    line = f"• {line}"
            formatted_lines.append(line)
        
        formatted = '\n'.join(formatted_lines)
    
    # Ensure proper spacing
    formatted = formatted.replace('\n\n\n', '\n\n')
    
    return formatted

# Add new utility functions for enhanced context
def extract_farm_details(text: str) -> dict:
    """Extract farm details from user input"""
    details = {}
    text_lower = text.lower()
    
    # Extract farm size
    if 'small-scale' in text_lower or 'smallholder' in text_lower:
        details['farm_size'] = 'small-scale'
    elif 'medium-scale' in text_lower or 'commercial' in text_lower:
        details['farm_size'] = 'medium-scale'
    elif 'large-scale' in text_lower or 'plantation' in text_lower:
        details['farm_size'] = 'large-scale'
    
    # Extract experience level
    if 'beginner' in text_lower or 'new' in text_lower:
        details['experience_level'] = 'beginner'
    elif 'advanced' in text_lower or 'expert' in text_lower:
        details['experience_level'] = 'advanced'
    elif 'intermediate' in text_lower:
        details['experience_level'] = 'intermediate'
    
    # Extract challenges
    challenge_keywords = {
        'pest': 'pest_control',
        'water': 'water_management', 
        'soil': 'soil_fertility',
        'market': 'market_access',
        'finance': 'financing',
        'storage': 'post_harvest'
    }
    
    challenges = []
    for keyword, challenge in challenge_keywords.items():
        if keyword in text_lower:
            challenges.append(challenge)
    
    if challenges:
        details['main_challenges'] = challenges
    
    return details

def validate_user_input(input_text: str, input_type: str) -> tuple:
    """Validate user input and provide feedback"""
    
    if input_type == 'location':
        # Validate location input
        if len(input_text.strip()) < 2:
            return False, "Please provide a valid location (city, town, or region in Ghana)"
        
        # Check if it's a reasonable location name
        if any(char.isdigit() for char in input_text):
            return False, "Location should not contain numbers"
        
        return True, input_text.strip().title()
    
    elif input_type == 'crops':
        # Validate crop input
        if len(input_text.strip()) < 2:
            return False, "Please provide at least one crop name"
        
        # Common Ghana crops for validation
        valid_crops = [
            'maize', 'cassava', 'yam', 'plantain', 'cocoa', 'rice', 'millet',
            'sorghum', 'groundnut', 'cowpea', 'soybean', 'tomato', 'pepper',
            'onion', 'okra', 'garden egg', 'cabbage', 'lettuce'
        ]
        
        input_crops = [crop.strip().lower() for crop in input_text.split(',')]
        recognized_crops = [crop for crop in input_crops if any(valid in crop for valid in valid_crops)]
        
        if not recognized_crops:
            return False, f"Please provide common Ghana crops like: {', '.join(valid_crops[:8])}, etc."
        
        return True, ', '.join(recognized_crops)
    
    return True, input_text.strip()