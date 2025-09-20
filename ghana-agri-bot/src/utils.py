# Helper functions
"""
Utility Functions
Purpose: Helper functions for text processing, location detection, and formatting
"""

import re
import logging
from typing import Optional, List, Dict
from datetime import datetime

from config.settings import GHANA_REGIONS, SUPPORTED_CROPS

logger = logging.getLogger(__name__)

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