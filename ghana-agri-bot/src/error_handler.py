"""
User-friendly error handling for Ghana AgriBOT
"""

import logging
from typing import Dict, Any
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

class GhanaAgriBotErrorHandler:
    def __init__(self):
        self.error_log_file = Path("data/logs/error_log.jsonl")
        self.error_log_file.parent.mkdir(exist_ok=True)
        
        # User-friendly error messages in context
        self.friendly_messages = {
            # Network/API errors
            "connection_error": {
                "en": "🌐 I'm having trouble connecting right now. Please check your internet and try again in a moment.",
                "context": "Network connectivity issues"
            },
            "timeout_error": {
                "en": "⏱️ That's taking longer than usual. Let me try to help you with a quicker response.",
                "context": "Request timeout"
            },
            "api_limit_error": {
                "en": "📊 I'm getting lots of questions right now! Please wait a moment and try again.",
                "context": "API rate limiting"
            },
            
            # Knowledge base errors
            "knowledge_not_found": {
                "en": "🤔 I don't have specific information about that topic yet. Let me search for general farming advice or try asking in a different way.",
                "context": "No relevant documents found"
            },
            "document_processing_error": {
                "en": "📚 I'm having trouble accessing my farming guides right now. Let me give you what I know from experience.",
                "context": "Document retrieval failed"
            },
            
            # Weather service errors
            "weather_unavailable": {
                "en": "🌤️ Weather information isn't available right now. For general seasonal advice, I can still help with your farming questions!",
                "context": "Weather service down"
            },
            "location_not_found": {
                "en": "📍 I couldn't find weather for that location. Try using a nearby major city like 'Kumasi' or 'Accra', or ask me for general farming advice.",
                "context": "Invalid location for weather"
            },
            
            # Image processing errors
            "image_processing_failed": {
                "en": "📸 I couldn't analyze that image clearly. Try taking a clearer photo in good lighting, or describe the problem and I'll help you identify it.",
                "context": "Image analysis failed"
            },
            "image_too_large": {
                "en": "📸 That image is too large. Please send a smaller photo (under 5MB) or describe what you're seeing.",
                "context": "Image file too large"
            },
            "image_format_unsupported": {
                "en": "📸 I can only look at JPG, PNG, or WebP images. Please send your photo in one of these formats.",
                "context": "Unsupported image format"
            },
            
            # LLM/Processing errors
            "processing_error": {
                "en": "🤖 I'm having trouble understanding that. Could you rephrase your question? For example: 'How to plant maize?' or 'My tomatoes have yellow leaves'",
                "context": "LLM processing failed"
            },
            "content_filter_error": {
                "en": "⚠️ I can only help with farming questions. Please ask about crops, livestock, soil, weather, or agricultural practices.",
                "context": "Non-agricultural content detected"
            },
            
            # Data/Storage errors
            "profile_error": {
                "en": "👤 I couldn't access your profile. Please type /start to set up your farming profile again.",
                "context": "User profile access failed"
            },
            "feedback_error": {
                "en": "📝 I couldn't save your feedback right now, but I heard you! Your input helps me improve.",
                "context": "Feedback storage failed"
            },
            
            # General fallback
            "general_error": {
                "en": "🌾 Something went wrong, but I'm still here to help! Please try asking your farming question again.",
                "context": "Unknown error"
            }
        }

    def get_friendly_message(self, error_type: str, user_context: Dict = None) -> str:
        """Get user-friendly error message"""
        base_message = self.friendly_messages.get(error_type, self.friendly_messages["general_error"])
        
        # Add contextual suggestions based on user profile
        suggestions = self._get_contextual_suggestions(error_type, user_context)
        
        message = base_message["en"]
        if suggestions:
            message += f"\n\n💡 **Try asking:**\n{suggestions}"
            
        return message

    def _get_contextual_suggestions(self, error_type: str, user_context: Dict = None) -> str:
        """Get contextual suggestions based on user profile"""
        if not user_context:
            return ""
            
        location = user_context.get('location', 'Ghana')
        crops = user_context.get('crop', 'your crops')
        
        suggestions = {
            "knowledge_not_found": [
                f"• 'Best time to plant {crops} in {location}?'",
                f"• 'How to improve soil for {crops}?'",
                f"• 'Common pests affecting {crops}?'"
            ],
            "processing_error": [
                f"• 'Weather forecast for {location}'",
                f"• 'How to grow {crops}?'",
                f"• 'Fertilizer recommendations for {crops}'"
            ],
            "image_processing_failed": [
                "• 'My maize leaves are turning yellow'",
                "• 'Small insects eating my tomato plants'",
                "• 'White powder on my crop leaves'"
            ]
        }
        
        relevant_suggestions = suggestions.get(error_type, [])
        if relevant_suggestions:
            return "\n".join(relevant_suggestions[:3])
        return ""

    def log_error(self, error_type: str, error_details: str, user_id: int = None, context: Dict = None):
        """Log error for analysis"""
        try:
            import json
            
            error_record = {
                "timestamp": datetime.now().isoformat(),
                "error_type": error_type,
                "error_details": error_details,
                "user_id": user_id,
                "context": context,
                "friendly_message_shown": self.friendly_messages.get(error_type, {}).get("context", "Unknown")
            }
            
            with open(self.error_log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(error_record) + "\n")
                
        except Exception as e:
            logger.error(f"Failed to log error: {e}")

    def handle_exception(self, exception: Exception, user_context: Dict = None, user_id: int = None) -> str:
        """Handle any exception and return friendly message"""
        
        # Map common exceptions to friendly error types
        error_type_mapping = {
            "ConnectionError": "connection_error",
            "TimeoutError": "timeout_error", 
            "timeout": "timeout_error",
            "HTTPError": "connection_error",
            "FileNotFoundError": "knowledge_not_found",
            "JSONDecodeError": "processing_error",
            "ValueError": "processing_error",
            "KeyError": "processing_error"
        }
        
        exception_name = type(exception).__name__
        error_str = str(exception).lower()
        
        # Determine error type from exception
        error_type = "general_error"
        
        if exception_name in error_type_mapping:
            error_type = error_type_mapping[exception_name]
        elif "rate limit" in error_str or "quota" in error_str:
            error_type = "api_limit_error"
        elif "timeout" in error_str:
            error_type = "timeout_error"
        elif "connection" in error_str:
            error_type = "connection_error"
        elif "not found" in error_str:
            error_type = "knowledge_not_found"
        
        # Log the error
        self.log_error(error_type, str(exception), user_id, user_context)
        
        # Return friendly message
        return self.get_friendly_message(error_type, user_context)

# Global instance
error_handler = GhanaAgriBotErrorHandler()