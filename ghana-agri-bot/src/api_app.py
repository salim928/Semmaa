# src/api_app.py
from fastapi import FastAPI, Depends, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.orchestrator import MultiAgentOrchestrator
from src.weather_integration import get_weather
from src.project_paths import data_dir
import csv, json, time, logging, os

app = FastAPI(title="AgriBOT API", version="1.0")
logger = logging.getLogger(__name__)

# CORS for Expo dev
# CORS configuration (dev-friendly by default, can be locked down via env)
allowed_origins_raw = os.getenv("API_ALLOWED_ORIGINS", "*")
if allowed_origins_raw.strip() == "*" or allowed_origins_raw.strip() == "":
    allowed_origins = ["*"]
else:
    allowed_origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = MultiAgentOrchestrator()
kb = getattr(orchestrator, "knowledge_base", None)
MOBILE_API_KEY = os.getenv("MOBILE_API_KEY", "").strip()

try:
    # Optional impact reporting helper
    from scripts.generate_impact_report import generate_impact_report
except Exception:  # pragma: no cover - optional
    generate_impact_report = None

class AskReq(BaseModel):
    """Request body for /ask endpoint"""
    question: str
    location: str | None = None


class AskResp(BaseModel):
    """Standard response for /ask endpoint"""
    answer: str
    duration_ms: int
    kb_hits: int


class ImageAnalysisReq(BaseModel):
    """Request body for image disease analysis"""
    image: str  # base64-encoded image
    crop: str | None = None
    location: str | None = None


class ImageAnalysisResp(BaseModel):
    disease: str
    confidence: float
    severity: str
    crop: str
    symptoms: list[str]
    treatment: list[str]
    prevention: list[str]
    organicTreatment: list[str] | None = None
    estimatedYieldLoss: str | None = None
    affectedArea: str | None = None

SMALL_TALK_RESPONSES = {
    "hello": "Hello! How can I help you today?",
    "hi": "Hi there! How can I assist you?",
    "how are you": "I'm just a bot, but I'm here to help you!",
    "thank you": "You're welcome!",
    "thanks": "Glad to help!",
    "good morning": "Good morning! How can I help you today?",
    "good afternoon": "Good afternoon! How can I help you today?",
    "good evening": "Good evening! How can I help you today?",
    # Add more as needed
}

def detect_small_talk(query: str):
    q = query.lower().strip()
    for key in SMALL_TALK_RESPONSES:
        if key in q:
            return SMALL_TALK_RESPONSES[key]
    return None


async def verify_api_key(x_api_key: str | None = Header(default=None)) -> None:
    """
    Lightweight API key check for mobile/third-party clients.
    If MOBILE_API_KEY is unset, the check is disabled (useful for local dev).
    """
    if not MOBILE_API_KEY:
        return
    if not x_api_key or x_api_key != MOBILE_API_KEY:
        # Deliberately generic message
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "AgriBOT API",
        "version": "1.0",
        "status": "online",
        "endpoints": {
            "health": "/health",
            "ask": "/ask",
            "weather": "/weather",
            "market": "/market/crops",
            "analyze": "/analyze-image"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "agribot-api",
        "timestamp": time.time()
    }

@app.post("/ask", response_model=AskResp, dependencies=[Depends(verify_api_key)])
async def ask(req: AskReq, request: Request) -> AskResp:
    t0 = time.perf_counter()
    client_host = request.client.host if request.client else "unknown"
    logger.info("API /ask called", extra={"question": req.question[:120], "location": req.location, "client": client_host})

    # 1) Small talk fast-path (no LLM/orchestrator needed)
    small_talk = detect_small_talk(req.question)
    if small_talk:
        duration_ms = int((time.perf_counter() - t0) * 1000)
        logger.info("Small talk detected, returning canned response")
        return AskResp(answer=small_talk, duration_ms=duration_ms, kb_hits=0)

    # 2) Try knowledge base lookup (for telemetry only)
    hits = []
    if kb:
        try:
            hits = kb.search(req.question, n_results=5)
        except Exception as e:
            logger.warning("KB search failed", extra={"error": str(e)})
            hits = []

    # 3) Route through orchestrator with best-available method
    ans: str | None = None
    orchestrated: dict | None = None
    confidence: float | None = None
    try:
        user_ctx = {"location": req.location}

        if hasattr(orchestrator, "process_farmer_query"):
            # New orchestrator interface returns a rich dict; we extract the main response text
            maybe = orchestrator.process_farmer_query(
                query=req.question,
                location=req.location,
            )
            result = await maybe if hasattr(maybe, "__await__") else maybe
            if isinstance(result, dict):
                orchestrated = result
                confidence = result.get("confidence")
                ans = result.get("response") or result.get("answer")
            elif isinstance(result, str):
                ans = result
        elif hasattr(orchestrator, "answer"):
            maybe = orchestrator.answer(question=req.question, user_ctx=user_ctx)
            ans = await maybe if hasattr(maybe, "__await__") else maybe
        elif hasattr(orchestrator, "handle_query"):
            maybe = orchestrator.handle_query(req.question, user_ctx)
            ans = await maybe if hasattr(maybe, "__await__") else maybe
    except Exception as e:
        logger.error("Error in orchestrator while handling /ask", exc_info=e)

    if not ans:
        ans = "Sorry, I couldn't process your question right now. Please try again."

    duration_ms = int((time.perf_counter() - t0) * 1000)

    # 4) Log interaction for pilot metrics
    try:
        rec = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "channel": "mobile_api",
            "query": req.question,
            "location": req.location,
            "response_time": duration_ms / 1000.0,
            "kb_hits": len(hits),
            "confidence": confidence,
        }
        out = data_dir() / "feedback" / f"interactions_{time.strftime('%Y%m')}.jsonl"
        out.parent.mkdir(parents=True, exist_ok=True)
        with out.open("a", encoding="utf-8") as f:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    except Exception as e:
        logger.warning("Failed to log interaction", extra={"error": str(e)})
    logger.info(
        "API /ask completed",
        extra={
            "duration_ms": duration_ms,
            "kb_hits": len(hits),
            "client": client_host,
        },
    )
    return AskResp(answer=ans, duration_ms=duration_ms, kb_hits=len(hits))


@app.post("/analyze-image", response_model=ImageAnalysisResp, dependencies=[Depends(verify_api_key)])
async def analyze_image(req: ImageAnalysisReq) -> ImageAnalysisResp:
    """
    Simple image disease analysis endpoint.
    For now this mirrors the mock used in the mobile app so that the flow is fully wired.
    """
    crop = (req.crop or "").strip() or "Tomato"
    crop_lower = crop.lower()

    # Basic heuristic to choose a template
    if "tomato" in crop_lower:
        return ImageAnalysisResp(
            disease="Tomato Late Blight",
            confidence=0.89,
            severity="high",
            crop="Tomato",
            symptoms=[
                "Dark brown spots on leaves",
                "White mold on underside of leaves",
                "Stem lesions",
                "Fruit rot with firm, dark areas",
            ],
            treatment=[
                "Apply copper-based fungicide immediately",
                "Remove and destroy infected plants",
                "Improve air circulation",
                "Avoid overhead irrigation",
            ],
            prevention=[
                "Use resistant varieties",
                "Proper spacing between plants",
                "Mulch to prevent soil splash",
                "Rotate crops yearly",
                "Monitor weather conditions",
            ],
            organicTreatment=[
                "Neem oil spray (2-3 times weekly)",
                "Baking soda solution (1 tbsp per gallon)",
                "Compost tea application",
            ],
            estimatedYieldLoss="30-50% if untreated",
            affectedArea="Approximately 25% of plant",
        )

    # Generic fallback
    return ImageAnalysisResp(
        disease="Possible leaf disease",
        confidence=0.7,
        severity="medium",
        crop=crop,
        symptoms=[
            "Spots or discoloration on leaves",
            "Some yellowing or wilting",
        ],
        treatment=[
            "Remove heavily affected leaves",
            "Avoid watering late in the day",
            "Use appropriate fungicide if available locally",
        ],
        prevention=[
            "Rotate crops each season",
            "Avoid planting the same crop repeatedly on the same land",
            "Ensure good spacing for airflow",
        ],
        organicTreatment=[
            "Neem-based spray according to label directions",
        ],
        estimatedYieldLoss="Up to 20% if not managed",
        affectedArea="Early signs on part of the plant",
    )

@app.get("/weather")
def weather(loc: str = "Accra"):
    try:
        return {"loc": loc, "summary": get_weather(loc)}
    except Exception:
        raise HTTPException(status_code=503, detail="Weather unavailable")

@app.get("/market/crops")
def market_crops():
    path = data_dir() / "market_prices.csv"
    try:
        with path.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            crops = sorted({(row.get("crop") or row.get("Crop") or row.get("commodity") or "").strip()
                            for row in reader if (row.get("crop") or row.get("Crop") or row.get("commodity"))})
        return {"crops": [c for c in crops if c]}
    except FileNotFoundError:
        return {"crops": []}

@app.get("/market/prices")
def market_prices(crop: str):
    path = data_dir() / "market_prices.csv"
    out = []
    try:
        with path.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for r in reader:
                name = (r.get("crop") or r.get("Crop") or r.get("commodity") or "").strip()
                if name.lower() != crop.lower():
                    continue
                city = (r.get("city") or r.get("City") or r.get("market") or "").strip()
                price = (r.get("price") or r.get("Price") or r.get("avg_price") or "").strip()
                unit = (r.get("unit") or r.get("Unit") or "").strip()
                date = (r.get("date") or r.get("Date") or r.get("updated") or "").strip()
                out.append({"city": city, "price": price, "unit": unit, "date": date})
    except FileNotFoundError:
        pass
    return {"crop": crop, "rows": out}

class FeedbackReq(BaseModel):
    rating: int
    comment: str | None = None
    location: str | None = None
    language: str | None = "en"

@app.post("/feedback")
def feedback(req: FeedbackReq):
    rec = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "rating": req.rating,
        "comment": req.comment,
        "location": req.location,
        "language": req.language,
    }
    out = data_dir() / "feedback" / f"feedback_{time.strftime('%Y%m')}.jsonl"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    return {"ok": True}


@app.get("/impact/summary", dependencies=[Depends(verify_api_key)])
def impact_summary():
    """Expose a simple impact summary for dashboards / grant reporting."""
    if not generate_impact_report:
        raise HTTPException(status_code=503, detail="Impact reporting unavailable")
    try:
        return generate_impact_report()
    except Exception as e:  # pragma: no cover - defensive
        logger.error("Impact summary failed", exc_info=e)
        raise HTTPException(status_code=500, detail="Failed to generate impact summary")