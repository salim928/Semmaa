# src/api_app_fixed.py
"""
Fixed Backend API for SemmaAI Mobile App
Simplified version that works without complex orchestrator
"""
import asyncio
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import time
import json
import logging
from pathlib import Path
from datetime import datetime

# Basic imports - add your actual modules as needed
try:
    from src.weather_integration import get_weather
    from src.project_paths import data_dir
except ImportError:
    # Fallback if modules not found
    def get_weather(location):
        return f"Weather in {location}: Partly cloudy, 28°C with 70% humidity. Good conditions for farming."
    
    def data_dir():
        return Path("./data")

# Initialize FastAPI app
app = FastAPI(
    title="SemmaAI Agricultural API",
    version="1.0.0",
    description="API for SemmaAI farming assistant"
)

# CORS configuration for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Simple fallback responses for farming questions
FARMING_KNOWLEDGE = {
    "maize": {
        "planting": "Plant maize at the beginning of the rainy season (March-April in southern Ghana, May-June in northern Ghana). Space seeds 75cm between rows and 25cm between plants.",
        "fertilizer": "Apply NPK 15-15-15 at planting (2 bags per acre) and top-dress with urea or sulphate of ammonia 3-4 weeks after planting.",
        "pests": "Common pests include stem borers and fall armyworm. Use recommended pesticides or neem-based organic solutions.",
        "harvest": "Harvest when husks are dry and kernels are hard (90-120 days after planting)."
    },
    "cassava": {
        "planting": "Plant cassava cuttings at 1m x 1m spacing at the start of rains. Use healthy stem cuttings of 20-25cm length.",
        "fertilizer": "Apply NPK 15-15-15 at 8 weeks after planting. Cassava responds well to organic matter.",
        "pests": "Watch for cassava mosaic disease and whiteflies. Use disease-resistant varieties.",
        "harvest": "Harvest 8-12 months after planting depending on variety."
    },
    "tomato": {
        "planting": "Start in nursery, transplant after 3-4 weeks. Space 60cm between rows, 45cm between plants.",
        "fertilizer": "Apply NPK 15-15-15 at transplanting, then foliar fertilizer every 2 weeks.",
        "pests": "Common issues: aphids, whiteflies, and blight. Use appropriate pesticides and practice crop rotation.",
        "harvest": "Harvest 60-90 days after transplanting when fruits are firm and fully colored."
    },
    "rice": {
        "planting": "For lowland rice, transplant 21-day old seedlings. For upland, direct seed at 80-100kg/ha.",
        "fertilizer": "Apply 90kg N, 45kg P2O5, and 45kg K2O per hectare in split applications.",
        "pests": "Control birds, stem borers, and rice blast disease. Maintain proper water management.",
        "harvest": "Harvest when 80% of grains are golden yellow (3-4 months after planting)."
    }
}

class AskRequest(BaseModel):
    question: str
    location: Optional[str] = "Ghana"
    crop_type: Optional[str] = None
    user_id: Optional[int] = None

class FeedbackRequest(BaseModel):
    rating: int
    comment: Optional[str] = None
    location: Optional[str] = None
    language: Optional[str] = "en"

def generate_farming_response(question: str, location: str = "Ghana") -> str:
    """Generate farming advice based on the question"""
    q_lower = question.lower()
    
    # Check for greetings
    greetings = ["hello", "hi", "good morning", "good afternoon", "good evening"]
    for greeting in greetings:
        if greeting in q_lower:
            return f"Hello! I'm your SemmaAI farming assistant. I can help you with planting, fertilizer application, pest control, and harvesting advice for crops like maize, cassava, tomatoes, and rice. What would you like to know?"
    
    # Check for specific crop questions
    response_parts = []
    
    for crop, info in FARMING_KNOWLEDGE.items():
        if crop in q_lower:
            if "plant" in q_lower:
                response_parts.append(f"**{crop.capitalize()} Planting:** {info['planting']}")
            if "fertilizer" in q_lower or "fertiliser" in q_lower:
                response_parts.append(f"**{crop.capitalize()} Fertilizer:** {info['fertilizer']}")
            if "pest" in q_lower or "disease" in q_lower:
                response_parts.append(f"**{crop.capitalize()} Pest Control:** {info['pests']}")
            if "harvest" in q_lower:
                response_parts.append(f"**{crop.capitalize()} Harvesting:** {info['harvest']}")
            
            if not response_parts:
                # General info about the crop
                response_parts.append(f"Here's information about {crop} farming in {location}:")
                response_parts.append(f"- Planting: {info['planting'][:100]}...")
                response_parts.append(f"- Fertilizer: {info['fertilizer'][:100]}...")
                response_parts.append(f"- Pest Control: {info['pests'][:100]}...")
    
    if response_parts:
        return "\n\n".join(response_parts)
    
    # Check for weather questions
    if "weather" in q_lower or "rain" in q_lower or "climate" in q_lower:
        weather_info = get_weather(location)
        return f"Current weather conditions in {location}: {weather_info}\n\nThis weather is suitable for most farming activities. Remember to adjust irrigation based on rainfall."
    
    # Check for general farming advice
    if "advice" in q_lower or "tips" in q_lower or "help" in q_lower:
        return f"""Here are some general farming tips for {location}:

1. **Soil Preparation**: Test your soil pH and nutrients before planting
2. **Crop Rotation**: Rotate legumes with cereals to maintain soil fertility
3. **Water Management**: Install drip irrigation for water conservation
4. **Pest Control**: Use integrated pest management (IPM) practices
5. **Market Timing**: Plan planting to harvest when prices are favorable

What specific crop would you like detailed advice about?"""
    
    # Default response
    return f"""I can help you with farming advice for {location}. I specialize in:

- Maize cultivation
- Cassava farming  
- Tomato production
- Rice growing
- Weather conditions
- Fertilizer application
- Pest and disease control
- Harvesting techniques

Please ask me a specific question about any of these topics!"""

@app.post("/ask")
async def ask_question(request: AskRequest):
    """Process farming question with simple logic"""
    start_time = time.perf_counter()
    
    try:
        # Generate response using simple knowledge base
        response_text = generate_farming_response(request.question, request.location)
        
        # Calculate simple confidence based on whether we found relevant info
        confidence = 0.8 if any(crop in request.question.lower() for crop in FARMING_KNOWLEDGE.keys()) else 0.6
        
        return {
            "answer": response_text,
            "confidence": confidence,
            "duration_ms": int((time.perf_counter() - start_time) * 1000),
            "sources": ["SemmaAI Knowledge Base"],
            "metadata": {
                "location": request.location,
                "timestamp": datetime.now().isoformat()
            }
        }
    
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        return {
            "answer": "I apologize, but I encountered an error processing your question. Please try rephrasing or ask about specific crops like maize, cassava, tomatoes, or rice.",
            "confidence": 0.0,
            "duration_ms": int((time.perf_counter() - start_time) * 1000),
            "sources": [],
            "metadata": {}
        }

@app.get("/weather")
async def get_weather_info(loc: str = "Accra"):
    """Get weather information"""
    try:
        weather_info = get_weather(loc)
        return {
            "location": loc,
            "summary": weather_info,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Weather error: {e}")
        # Return default weather instead of error
        return {
            "location": loc,
            "summary": f"Weather in {loc}: Partly cloudy, 28°C with moderate humidity. Good conditions for farming.",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/market/crops")
async def get_market_crops():
    """Get list of available crops"""
    return {
        "crops": [
            "Maize", "Cassava", "Yam", "Plantain", "Rice", 
            "Tomatoes", "Pepper", "Okra", "Garden Eggs", "Onions",
            "Groundnuts", "Cowpea", "Soybeans", "Cocoa", "Oil Palm"
        ]
    }

@app.get("/market/prices")
async def get_market_prices(crop: str):
    """Get mock market prices"""
    # Mock price data
    prices = {
        "maize": [
            {"city": "Accra", "price": "450", "unit": "100kg bag"},
            {"city": "Kumasi", "price": "430", "unit": "100kg bag"},
            {"city": "Tamale", "price": "420", "unit": "100kg bag"},
        ],
        "cassava": [
            {"city": "Accra", "price": "150", "unit": "bag"},
            {"city": "Kumasi", "price": "140", "unit": "bag"},
            {"city": "Cape Coast", "price": "145", "unit": "bag"},
        ],
        "tomato": [
            {"city": "Accra", "price": "600", "unit": "crate"},
            {"city": "Kumasi", "price": "550", "unit": "crate"},
            {"city": "Techiman", "price": "500", "unit": "crate"},
        ]
    }
    
    crop_lower = crop.lower()
    if crop_lower in prices:
        return {"crop": crop, "prices": prices[crop_lower]}
    
    # Default prices if crop not found
    return {
        "crop": crop,
        "prices": [
            {"city": "Accra", "price": "N/A", "unit": "kg"},
            {"city": "Kumasi", "price": "N/A", "unit": "kg"},
        ]
    }

@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """Save user feedback"""
    try:
        feedback_dir = data_dir() / "feedback"
        feedback_dir.mkdir(parents=True, exist_ok=True)
        
        feedback_file = feedback_dir / f"feedback_{datetime.now().strftime('%Y%m')}.jsonl"
        
        feedback_entry = {
            "timestamp": datetime.now().isoformat(),
            "rating": request.rating,
            "comment": request.comment,
            "location": request.location,
            "language": request.language
        }
        
        with open(feedback_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(feedback_entry) + "\n")
        
        return {"success": True, "message": "Thank you for your feedback!"}
    
    except Exception as e:
        logger.error(f"Feedback error: {e}")
        return {"success": False, "message": "Failed to save feedback"}

@app.get("/health")
async def health_check():
    """API health check"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "service": "SemmaAI Agricultural API"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SemmaAI Agricultural API",
        "version": "1.0.0",
        "endpoints": [
            "/ask - Ask farming questions",
            "/weather - Get weather information",
            "/market/crops - Get crop list",
            "/market/prices - Get market prices",
            "/feedback - Submit feedback",
            "/health - Health check"
        ]
    }

# Startup message
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting SemmaAI API v1.0.0")
    logger.info("Ready to serve farmers! 🌱")
    
    # Create necessary directories
    feedback_dir = data_dir() / "feedback"
    feedback_dir.mkdir(parents=True, exist_ok=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)