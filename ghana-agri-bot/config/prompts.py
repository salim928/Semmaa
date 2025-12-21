"""
System prompts for the Ghana Agricultural Advisory Bot
Purpose: Maintain consistent, high-quality agricultural advice prompts
"""

SYSTEM_PROMPT = """You are an agricultural information assistant for Ghanaian farmers.

- If the user sends a greeting, thanks, confirmation, or other small talk, respond in a friendly, conversational way.
- Only provide agricultural advice or data-driven responses when the user's query is about farming, crops, weather, markets, or related topics.
- Do not force every response to be advisory; be chatty and natural when appropriate.
- If the user says something like "ok", "thanks", "hello", "how are you", "cool", "great", "yes", "no", "bye", etc., reply in a conversational, human-like manner.
- For all other queries, use evidence-based guidance, cite sources when possible, and follow professional advisory guidelines.

Provide evidence-based guidance using available data and research. Use neutral language and cite sources when possible. Do not claim personal expertise or guarantee outcomes. If recommending treatments, emphasize safety and consultation with local experts.

Guidelines:
1. Base recommendations on agricultural science and local data.
2. Use probabilistic language for outcomes.
3. Include safety warnings for any chemical recommendations.
4. Cite data sources and timestamps when available.
5. For plant diseases, note if photo confirmation is needed.
6. Provide actionable steps without guarantees."""

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

GREETING_MESSAGE = """🌾 Welcome to Ghana SemmaAI, {name}!

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

# Enhanced system prompt with dynamic context
ENHANCED_SYSTEM_PROMPT = """
You are SemmaAI, an expert agricultural assistant specifically designed for Ghanaian farmers.

- If the user sends a greeting, thanks, confirmation, or other small talk, respond in a friendly, conversational way.
- Only provide agricultural advice or data-driven responses when the user's query is about farming, crops, weather, markets, or related topics.
- Do not force every response to be advisory; be chatty and natural when appropriate.
- If the user says something like "ok", "thanks", "hello", "how are you", "cool", "great", "yes", "no", "bye", etc., reply in a conversational, human-like manner.
- For all other queries, use evidence-based guidance, cite sources when possible, and follow professional advisory guidelines.

CURRENT CONTEXT:
- Location: {location} (Region: {region})
- Current Season: {season}
- Month: {current_month}
- Rainfall Status: {rainfall_status}
- Temperature Range: {temperature_range}
- Farmer Experience Level: {experience_level}
- Primary Crops: {primary_crops}
- Farm Size: {farm_size}
- Preferred Language: {language}

REGIONAL EXPERTISE:
- Climate zone: {climate_zone}
- Soil type: {dominant_soil_type}
- Local market access: {market_access}
- Common challenges: {regional_challenges}

COMMUNICATION GUIDELINES:
- Use simple, practical language appropriate for {experience_level} farmers
- Provide actionable advice considering {farm_size} farm constraints
- Reference local varieties and techniques for {region}
- Consider seasonal timing for {current_month}
- Include cost-effective solutions for small-scale farmers
- Mention local markets and cooperatives when relevant

ALWAYS CONSIDER:
- Resource limitations of Ghanaian smallholder farmers
- Local weather patterns and climate variability
- Traditional farming practices that work well
- Available agricultural inputs and their costs
- Food security and nutrition aspects
"""

# Context-aware response templates
CONTEXTUALIZED_PROMPTS = {
    'crop_planning': """
    Based on the farmer's context in {region}, {season} season:
    
    Query: {query}
    
    Consider:
    1. What crops are suitable for {current_month} in {climate_zone}?
    2. How does {rainfall_status} affect planting decisions?
    3. What varieties perform well in {dominant_soil_type} soil?
    4. What are the market opportunities for a {farm_size} farm?
    
    Provide specific, actionable advice for this farmer's situation.
    """,
    
    'pest_disease': """
    For pest/disease management in {region} during {season}:
    
    Issue: {query}
    
    Analyze:
    1. Is this pest/disease common in {climate_zone} during {current_month}?
    2. What organic/affordable treatments work in Ghana?
    3. How can this be prevented given {rainfall_status} conditions?
    4. What local resources or plants can help?
    
    Focus on practical, cost-effective solutions.
    """,
    
    'soil_fertility': """
    For soil management advice in {region}:
    
    Question: {query}
    
    Consider:
    1. How does {dominant_soil_type} soil respond to different amendments?
    2. What organic materials are locally available?
    3. How does {rainfall_status} affect nutrient management?
    4. What can a {farm_size} farmer realistically implement?
    
    Provide soil-specific recommendations.
    """,
    
    'market_advice': """
    For market information in {region}:
    
    Query: {query}
    
    Analyze:
    1. What are current market trends for {primary_crops}?
    2. What storage/processing options exist for {farm_size} farms?
    3. How does {season} timing affect prices?
    4. What value-addition opportunities are available locally?
    
    Include practical marketing strategies.
    """
}

# Seasonal context definitions
SEASONAL_CONTEXTS = {
    'dry_season': {
        'months': ['November', 'December', 'January', 'February', 'March'],
        'focus': ['irrigation', 'dry_season_crops', 'soil_preparation', 'marketing'],
        'challenges': ['water_scarcity', 'bush_fires', 'harmattan_winds']
    },
    'rainy_season': {
        'months': ['April', 'May', 'June', 'July', 'August', 'September', 'October'],
        'focus': ['planting', 'weeding', 'pest_management', 'drainage'],
        'challenges': ['flooding', 'fungal_diseases', 'soil_erosion', 'pest_outbreaks']
    }
}

# Regional expertise
REGIONAL_CONTEXTS = {
    'northern_ghana': {
        'climate': 'Sudan_savannah',
        'main_crops': ['millet', 'sorghum', 'maize', 'groundnuts', 'cowpea'],
        'soil_types': ['sandy_loam', 'clay'],
        'challenges': ['drought', 'soil_fertility', 'market_access'],
        'opportunities': ['irrigation', 'livestock_integration']
    },
    'middle_belt': {
        'climate': 'Guinea_savannah',
        'main_crops': ['maize', 'yam', 'cassava', 'rice', 'cowpea'],
        'soil_types': ['loam', 'clay_loam'],
        'challenges': ['irregular_rainfall', 'pest_pressure'],
        'opportunities': ['mixed_farming', 'agro_forestry']
    },
    'southern_ghana': {
        'climate': 'Forest_transition',
        'main_crops': ['cocoa', 'plantain', 'cassava', 'maize', 'vegetables'],
        'soil_types': ['forest_oxisols', 'alluvial'],
        'challenges': ['deforestation', 'soil_acidity', 'black_pod_disease'],
        'opportunities': ['high_value_crops', 'urban_markets']
    }
}

"""
Enhanced prompts with document awareness and contextual responses
"""

# Document-aware system prompt
DOCUMENT_ENHANCED_PROMPT = """
You are SemmaAI, an expert agricultural assistant for Ghanaian farmers.

KNOWLEDGE BASE CONTEXT:
{document_context}

FARMER CONTEXT:
- Location: {location}
- Season: {season} 
- Current Month: {current_month}
- Crops: {crops}
- Experience Level: {experience_level}
- Farm Size: {farm_size}

SEASONAL CONTEXT FOR {season}:
- Focus Areas: {seasonal_focus}
- Common Challenges: {seasonal_challenges}
- Recommended Activities: {seasonal_activities}

GUIDELINES:
- Always reference the provided knowledge base context first
- Cite specific document sections when relevant (use 📚 emoji)
- Adapt general advice to the farmer's specific location and season
- Provide step-by-step actionable guidance
- Include timing considerations for {season} season in {current_month}
- Consider resource constraints of {farm_size} farms
- Use simple, practical language appropriate for {experience_level} farmers

Query: {query}

Provide helpful, actionable advice with proper citations:
"""

# Context-aware response templates with document integration
ENHANCED_CONTEXTUALIZED_PROMPTS = {
    'crop_planning': """
    Based on the knowledge base and farmer's context in {location} during {season}:
    
    RELEVANT DOCUMENTS:
    {document_context}
    
    Query: {query}
    
    Analysis Framework:
    1. What do our crop guides recommend for {current_month} in {location}?
    2. How does {season} season affect planting decisions for {crops}?
    3. What varieties are recommended in our guides for this region?
    4. What market timing considerations apply for {farm_size} farms?
    
    Provide specific, document-backed advice with citations.
    """,
    
    'pest_disease': """
    For pest/disease management using our knowledge base:
    
    RELEVANT PEST MANAGEMENT GUIDES:
    {document_context}
    
    Issue: {query}
    
    Diagnostic Approach:
    1. What does our pest guide say about this issue in {season}?
    2. What organic/affordable treatments are documented for Ghana?
    3. What prevention strategies are recommended for {location}?
    4. What local resources are mentioned in our guides?
    
    Provide evidence-based recommendations with source citations.
    """,
    
    'soil_fertility': """
    For soil management using our fertility guides:
    
    RELEVANT SOIL GUIDES:
    {document_context}
    
    Question: {query}
    
    Soil Analysis:
    1. What do our soil guides recommend for this situation?
    2. What organic amendments are documented as locally available?
    3. How do our guides address {season} soil management?
    4. What practices are suitable for {farm_size} operations?
    
    Provide guide-based soil recommendations with citations.
    """,
    
    'market_advice': """
    For market information using our seasonal calendar and guides:
    
    RELEVANT MARKET/SEASONAL INFO:
    {document_context}
    
    Query: {query}
    
    Market Analysis:
    1. What does our seasonal calendar say about {current_month} marketing?
    2. What storage/processing options are documented for {crops}?
    3. What timing recommendations exist for {season}?
    4. What value-addition opportunities are mentioned for {farm_size} farms?
    
    Provide calendar-based marketing strategies with citations.
    """
}

# Document citation template
CITATION_TEMPLATE = """
📚 **Source: {document_name} - {section}**
{relevant_content}

💡 **For your situation ({location}, {season}, {crops}):**
{adapted_advice}
"""

# Enhanced seasonal contexts with activities
ENHANCED_SEASONAL_CONTEXTS = {
    'dry_season': {
        'months': ['November', 'December', 'January', 'February', 'March'],
        'focus': ['irrigation planning', 'dry season crops', 'soil preparation', 'marketing harvest'],
        'challenges': ['water scarcity', 'bush fires', 'harmattan winds', 'soil hardening'],
        'activities': ['land clearing', 'compost preparation', 'equipment maintenance', 'market research']
    },
    'rainy_season': {
        'months': ['April', 'May', 'June', 'July', 'August', 'September', 'October'],
        'focus': ['planting operations', 'weeding schedules', 'pest monitoring', 'drainage systems'],
        'challenges': ['excessive rainfall', 'fungal diseases', 'soil erosion', 'pest outbreaks'],
        'activities': ['seed planting', 'fertilizer application', 'pest control', 'harvest planning']
    }
}

# Regional expertise with document references
ENHANCED_REGIONAL_CONTEXTS = {
    'northern_ghana': {
        'climate': 'Sudan_savannah',
        'main_crops': ['millet', 'sorghum', 'maize', 'groundnuts', 'cowpea', 'rice'],
        'soil_types': ['sandy_loam', 'clay', 'lateritic'],
        'challenges': ['drought stress', 'soil fertility decline', 'market access', 'post-harvest losses'],
        'opportunities': ['irrigation development', 'livestock integration', 'value addition'],
        'document_focus': ['drought_resistant_varieties', 'water_management', 'soil_conservation']
    },
    'middle_belt': {
        'climate': 'Guinea_savannah',
        'main_crops': ['maize', 'yam', 'cassava', 'rice', 'cowpea', 'soybeans'],
        'soil_types': ['loam', 'clay_loam', 'sandy_clay'],
        'challenges': ['irregular rainfall', 'pest pressure', 'soil degradation'],
        'opportunities': ['mixed farming systems', 'agro-forestry', 'mechanization'],
        'document_focus': ['integrated_farming', 'pest_management', 'soil_improvement']
    },
    'southern_ghana': {
        'climate': 'Forest_transition',
        'main_crops': ['cocoa', 'plantain', 'cassava', 'maize', 'vegetables', 'oil_palm'],
        'soil_types': ['forest_oxisols', 'alluvial', 'volcanic'],
        'challenges': ['deforestation', 'soil acidity', 'black_pod_disease', 'climate_change'],
        'opportunities': ['high_value_crops', 'urban_markets', 'processing'],
        'document_focus': ['cocoa_management', 'soil_acidity', 'high_value_crops']
    }
}

# Response quality indicators
QUALITY_INDICATORS = {
    'excellent': "🌟 **High Quality Response** - Uses multiple knowledge sources with specific recommendations",
    'good': "✅ **Good Response** - References knowledge base with practical advice", 
    'fair': "⚠️ **Basic Response** - Limited knowledge base integration",
    'poor': "❌ **Needs Improvement** - Please provide more specific details for better assistance"
}

# Follow-up question templates
FOLLOWUP_TEMPLATES = {
    'crop_planning': [
        "What's your target planting area for this crop?",
        "Do you have access to improved seeds or fertilizers?",
        "What was your experience with this crop last season?"
    ],
    'pest_disease': [
        "Can you describe the symptoms in more detail?",
        "When did you first notice this problem?",
        "Have you tried any treatments already?"
    ],
    'soil_fertility': [
        "Have you done a soil test recently?",
        "What organic materials do you have access to?",
        "How is your farm's drainage situation?"
    ],
    'market_advice': [
        "What quantity are you planning to sell?",
        "Do you have storage facilities?",
        "Are you part of any farmer cooperatives?"
    ]
}

PROMPTS = {
    'en': {
        'welcome': "🌾 Welcome to Ghana SemmaAI, {name}!",
        'privacy': "🔒 Your information is used only to provide personalized farming advice and is never shared with third parties.",
        'language_set': "Language set to English!",
        'choose_language': "Please select your preferred language:",
    },
    'twi': {
        'welcome': "🌾 Akwaaba Ghana SemmaAI, {name}!",
        'privacy': "🔒 Wo nsɛm no yɛ de bɛboa wo nkutoo, yɛn de mma obiara.",
        'language_set': "Kasafua no ayɛ Twi!",
        'choose_language': "Paw kasa a wopɛ:",
    }
}

def get_prompt(key, lang='en', **kwargs):
    return PROMPTS.get(lang, PROMPTS['en'])[key].format(**kwargs)

# Neutral system prompt - updated to comply with safety rules
NEUTRAL_SYSTEM_PROMPT = """You are an agricultural information assistant for Ghanaian farmers.

Provide evidence-based guidance using available data and research. Use neutral language and cite sources when possible. Do not claim personal expertise or guarantee outcomes. If recommending treatments, emphasize safety and consultation with local experts.

Guidelines:
1. Base recommendations on agricultural science and local data.
2. Use probabilistic language for outcomes.
3. Include safety warnings for any chemical recommendations.
4. Cite data sources and timestamps when available.
5. For plant diseases, note if photo confirmation is needed.
6. Provide actionable steps without guarantees."""

# Confidence-building response templates
ADVISORY_RESPONSE_TEMPLATES = {
    'diagnosis': """
📋 **AGRICULTURAL ASSESSMENT**
Based on your description and available data for conditions in {location}:

**Primary Issue:** {diagnosis}
**Severity Level:** {severity}/10
**Immediate Action Required:** {action_required}

This assessment is based on:
• Current {season} season conditions
• Typical patterns in {region} region
• {crop} growth stage analysis
• Local soil and climate factors
""",
    
    'treatment': """
💊 **RECOMMENDED TREATMENT PLAN**

**Immediate Actions (Within 24 hours):**
1. {immediate_action_1}
   - Dosage/Rate: {specific_rate_1}
   - Application method: {method_1}
   - Expected result: {result_1}

2. {immediate_action_2}
   - Timing: {timing_2}
   - Coverage: {coverage_2}

**Follow-up Actions (Days 2-7):**
{followup_actions}

**Monitoring Indicators:**
• Day 3: {indicator_1}
• Day 7: {indicator_2}
• Day 14: {indicator_3}

**Potential Effectiveness:** {effectiveness}% based on available data
""",
    
    'fertilizer_prescription': """
🌱 **FERTILIZER RECOMMENDATION**

**Your Specific Requirements:**
• Crop: {crop}
• Land size: {land_size}
• Soil condition: {soil_condition}
• Target yield: {target_yield}

**RECOMMENDED FERTILIZER PROGRAM:**

**Basal Application (At Planting):**
• Product: NPK 15-15-15
• Rate: {basal_rate} bags per acre
• Total needed: {total_basal} bags
• Application: {basal_method}

**First Top-dressing (Week 3-4):**
• Product: Urea (46% N)
• Rate: {topdress_rate_1} bags per acre
• Total needed: {total_topdress_1} bags
• Application: {topdress_method_1}
• Timing: Apply when plants show 4-6 leaves

**Second Top-dressing (Week 6-8):**
• Product: Urea (46% N)
• Rate: {topdress_rate_2} bags per acre
• Total needed: {total_topdress_2} bags
• Application: {topdress_method_2}
• Timing: Apply at flowering stage

**Expected Yield Increase:** {yield_increase}%
**Total Fertilizer Cost:** GHS {total_cost}
**ROI Potential:** {roi}x return on investment

**Application Guidelines:**
• Use calibrated equipment for accurate rates
• Apply in the morning or evening to avoid volatilization
• Irrigate immediately after application if possible
• Monitor soil pH and adjust if below 5.5
""",
    
    'pest_management': """
🐛 **PEST MANAGEMENT GUIDANCE**

**Identified Pest:** {pest_name}
**Current Population Level:** {population_level}
**Economic Threshold:** {threshold}

**RECOMMENDED CONTROL STRATEGY:**

**Immediate Control (Today):**
• Product: {product_1}
• Rate: {rate_1} per acre
• Application: {application_1}
• Safety: {safety_notes_1}

**Monitoring Schedule:**
• Daily for first 3 days
• Every 2 days for next week
• Weekly thereafter

**Preventive Measures:**
• Crop rotation with {rotation_crop}
• Intercropping with {intercrop}
• Regular field scouting

**Potential Effectiveness:** {effectiveness}% based on available data
""",
    
    'irrigation_advice': """
💧 **IRRIGATION GUIDANCE**

**Your Field Conditions:**
• Soil type: {soil_type}
• Crop stage: {crop_stage}
• Weather forecast: {weather_forecast}

**OPTIMAL IRRIGATION SCHEDULE:**

**Current Phase:** {current_phase}
• Frequency: {frequency}
• Amount per application: {amount} mm
• Best time: {best_time}

**Weekly Schedule:**
• Monday: {monday_schedule}
• Wednesday: {wednesday_schedule}
• Friday: {friday_schedule}

**Water Conservation Tips:**
• Use drip irrigation for efficiency
• Mulch to reduce evaporation
• Monitor soil moisture regularly

**Expected Water Savings:** {water_savings}%
""",
    
    'general_advice': """
📊 **AGRICULTURAL GUIDANCE**

**Your Situation Analysis:**
• Location: {location}
• Crop: {crop}
• Season: {season}
• Challenge: {challenge}

**RECOMMENDED ACTIONS:**

{advice_content}

**Implementation Timeline:**
• Week 1: {week1_actions}
• Week 2: {week2_actions}
• Week 3-4: {week3_4_actions}

**Expected Outcomes:**
• Short-term: {short_term}
• Medium-term: {medium_term}
• Long-term: {long_term}

**Potential Effectiveness:** {effectiveness}% based on available data
"""
}

# Regional and seasonal context helpers
REGIONAL_ADVISORY_CONTEXTS = {
    'Northern': {
        'soil_focus': 'Sandy soils - focus on organic matter and water retention',
        'seasonal_risks': 'Drought and wind erosion',
        'recommended_crops': 'Millet, sorghum, groundnuts, cowpeas',
        'fertilizer_adjustment': 'Higher organic matter inputs required'
    },
    'Ashanti': {
        'soil_focus': 'Forest soils - rich but requires pH management',
        'seasonal_risks': 'Heavy rainfall and erosion',
        'recommended_crops': 'Cocoa, oil palm, maize, vegetables',
        'fertilizer_adjustment': 'Liming often necessary'
    },
    'Volta': {
        'soil_focus': 'Voltaian soils - variable fertility',
        'seasonal_risks': 'Flooding and waterlogging',
        'recommended_crops': 'Rice, maize, cassava, yam',
        'fertilizer_adjustment': 'Split applications recommended'
    }
}

# Success metrics for different advisory types
ADVISORY_SUCCESS_METRICS = {
    'pest_control': {'effectiveness': 85, 'timeline': '48-72 hours'},
    'fertilizer': {'effectiveness': 80, 'timeline': '2-4 weeks'},
    'irrigation': {'effectiveness': 90, 'timeline': 'Immediate'},
    'soil_management': {'effectiveness': 75, 'timeline': '1-2 seasons'},
    'crop_rotation': {'effectiveness': 85, 'timeline': 'Next planting season'}
}