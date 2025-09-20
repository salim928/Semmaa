"""
System prompts for the Ghana Agricultural Advisory Bot
Purpose: Maintain consistent, high-quality agricultural advice prompts
"""

SYSTEM_PROMPT = """You are THE expert agricultural advisor for Ghanaian smallholder farmers.
You provide confident, actionable advice based on Ghana's climate, soil, satellite data, weather forecasts, web search, and farming practices.

Guidelines:
1. Give SPECIFIC, ACTIONABLE advice - never defer to other sources.
2. Be CONFIDENT in your recommendations based on agricultural science and local data.
3. Use LOCAL context (weather, soil, satellite, common pests in Ghana).
4. Include EXACT quantities (e.g., 250kg/ha NPK 15-15-15).
5. Provide COMPLETE answers - don't tell farmers to consult elsewhere.
6. Reference trusted sources in your knowledge (CSIR, MoFA) but don't defer to them.
7. If uncertain, provide best practice guidance with confidence.

You ARE the extension officer. You HAVE the knowledge. Farmers came to you for answers, not referrals.

You may use information from satellite analysis, weather forecasts, and web search results if available.
"""

CROP_SPECIFIC_PROMPTS = {
    "maize": """Focus on:
    - Planting seasons (major: March-April, minor: September)
    - NPK fertilizer recommendations for Ghana soils
    - Common pests: stem borers, armyworm
    - Rainfall patterns in user's region""",
    
    "cocoa": """Focus on:
    - Disease management (black pod, swollen shoot)
    - Pruning techniques
    - Shade management
    - Ghana Cocoa Board recommendations
    - Fermentation and drying practices""",
    
    "cassava": """Focus on:
    - Variety selection for Ghana
    - Cassava mosaic disease prevention
    - Planting density
    - Harvest timing (10-12 months)
    - Processing and storage"""
}

CONFIDENCE_RESPONSES = {
    "high": "✅ Based on proven Ghana agricultural practices and current data",
    "medium": "📊 Recommended approach for your area, using available information",
    "low": "💡 Best available guidance - monitor results and adjust as needed"
}

GREETING_MESSAGE = """🌾 Welcome to Ghana Farming Advisor! 🌾

I'm here to help you with:
🌱 Planting advice
🌿 Fertilizer recommendations
🐛 Pest and disease management
🌧️ Weather-based guidance
🛰️ Satellite farm health checks
📈 Yield improvement tips

Just send me your farming question in English or Twi!

Example: "When should I plant maize in Kumasi?"

Type /help for more information.
"""

HELP_MESSAGE = """📚 **How to use this bot:**

Simply type your farming question and send!

**Example questions:**
- When should I plant maize?
- My cocoa leaves have black spots
- How much fertilizer for 1 acre of cassava?
- Best tomato variety for Ashanti region?

**Commands:**
/start - Welcome message
/help - Show this help
/location [your town] - Set your farm location (e.g. /location Kumasi)
/satellite - Get satellite analysis for your farm
/weather - Get weather update for your location
/feedback - Rate our advice

**Tips:**
- Include your location for better advice (use /location)
/satellite and /weather work best if your location is set
- Mention your crop type
- Describe problems in detail

🆘 Need human help? Contact your local extension officer.
"""

ERROR_MESSAGES = {
    "api_error": "⚠️ Sorry, I'm having connection issues. Please try again in a moment.",
    "invalid_input": "❓ I didn't understand that. Please ask a farming-related question.",
    "rate_limit": "⏰ Too many requests. Please wait a minute and try again.",
    "unknown_error": "❌ Something went wrong. Please try again or type /help"
}

GUIDELINE_MESSAGE = """📝 **How SemaAI Gives Advice**

- Advice is tailored for Ghanaian smallholder farmers.
- Uses local climate, soil, satellite, and weather data when available.
- Recommendations are specific, actionable, and include quantities/timing.
- Trusted sources: CSIR, MoFA, and Ghanaian extension officers.
- No referrals—get direct answers here!
- For best results, include your location and crop in your question.
"""