#satellite_integration.py
"""
Weather Integration for Farming Advice
"""
import json
import urllib.parse
import urllib.request
from typing import Tuple, Dict, List

from config.settings import WEATHER_API_KEY, WEATHER_UNITS

CITY_TO_COORDS = {
    "accra": (5.6037, -0.1870),
    "kumasi": (6.6666, -1.6163),
    "tamale": (9.4075, -0.8533),
    "takoradi": (4.9040, -1.7590),
    "cape coast": (5.1053, -1.2466),
    "sunnyani": (7.3399, -2.3268),
    "koforidua": (6.0941, -0.2591),
    "ho": (6.6000, 0.4667),
    "bolgatanga": (10.7900, -0.8500),
    "wa": (10.0607, -2.5019),
}

def _parse_location(location: str) -> Tuple[float, float]:
    if not location:
        return CITY_TO_COORDS["accra"]
    loc = location.strip()
    if "," in loc:
        try:
            a, b = [p.strip() for p in loc.split(",", 1)]
            return float(a), float(b)
        except Exception:
            pass
    return CITY_TO_COORDS.get(loc.lower(), CITY_TO_COORDS["accra"])

def _http_get(url: str, timeout: int = 15) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "SemmaAI/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = resp.read()
        return json.loads(data.decode("utf-8", errors="ignore"))

def get_weather(location: str) -> str:
    lat, lon = _parse_location(location)
    try:
        base = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": f"{lat:.4f}",
            "longitude": f"{lon:.4f}",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
            "current_weather": "true",
            "timezone": "auto",
        }
        url = f"{base}?{urllib.parse.urlencode(params)}"
        data = _http_get(url)
        cur = data.get("current_weather") or {}
        daily = (data.get("daily") or {})
        tmax = (daily.get("temperature_2m_max") or [None])[0]
        tmin = (daily.get("temperature_2m_min") or [None])[0]
        rain = (daily.get("precipitation_sum") or [0])[0]
        parts = []
        if "temperature" in cur:
            parts.append(f"Now: {cur['temperature']}°C, wind {cur.get('windspeed','?')} km/h")
        if tmax is not None and tmin is not None:
            parts.append(f"Today: {tmin}–{tmax}°C")
        parts.append(f"Rain (today): {rain} mm")
        return "\n".join(parts)
    except Exception:
        return "Weather data currently unavailable."

class WeatherAdvisor:
    def get_weather_advice(self, location: str) -> Dict:
        summary = get_weather(location)
        advice: List[str] = []
        low = summary.lower()
        if "unavailable" in low:
            return {"current": summary, "advice": ["Monitor local conditions."], "location": location}
        if "rain" in low or "mm" in low:
            advice.append("Expect rainfall: avoid nitrogen top-dressing just before heavy rain.")
            advice.append("Plan weeding/field operations for dry windows.")
        if "wind" in low:
            advice.append("Strong winds possible: stake tomatoes/peppers and secure seedbeds.")
        if "°c" in low:
            advice.append("Irrigate early morning or evening to reduce heat stress.")
        if not advice:
            advice.append("Conditions look normal. Continue routine field scouting and irrigation as needed.")
        return {"current": summary, "advice": advice, "location": location}