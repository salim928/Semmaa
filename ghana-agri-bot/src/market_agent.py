#market_agent.py
from asyncio.log import logger
import csv
from datetime import datetime
import json
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import httpx

Number = float

@dataclass
class PricePoint:
    city: str
    price: float
    unit: str
    date: str
    source: str

class MarketAgent:
    """
    Aggregates market prices:
    - Optional live JSON endpoint: GH_MARKET_JSON_URL (records: crop, city, price, unit, date)
    - Fallback: local CSV at data/market_prices.csv
    Returns a compact snapshot and advice string.
    """
    def __init__(self, market_csv: Path):"""
Enhanced Market Agent with fallback data and better crop handling
"""

import csv
import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import httpx
import logging

logger = logging.getLogger(__name__)

Number = float

@dataclass
class PricePoint:
    crop: str
    city: str
    price: float
    unit: str
    date: str
    source: str

# GHANA MARKET PRICE DEFAULTS (as fallback when CSV/API unavailable)
DEFAULT_MARKET_PRICES = {
    'cassava': {
        'price_range': (150, 250),
        'unit': 'per 100kg bag',
        'seasonal_trend': 'Prices rise 15-20% before Christmas',
        'markets': ['Volta', 'Eastern', 'Central']
    },
    'plantain': {
        'price_range': (200, 350),
        'unit': 'per bunch',
        'seasonal_trend': 'Higher prices during dry season',
        'markets': ['Ashanti', 'Eastern', 'Western']
    },
    'maize': {
        'price_range': (180, 280),
        'unit': 'per 100kg bag',
        'seasonal_trend': 'Lower after harvest (July-Sept)',
        'markets': ['Techiman', 'Ejura', 'Tamale']
    },
    'tomato': {
        'price_range': (250, 600),
        'unit': 'per crate',
        'seasonal_trend': 'Highly volatile, peaks in dry season',
        'markets': ['Navrongo', 'Techiman', 'Agbogbloshie']
    },
    'yam': {
        'price_range': (300, 500),
        'unit': 'per tuber (medium)',
        'seasonal_trend': 'Lower during harvest (Aug-Nov)',
        'markets': ['Techiman', 'Tamale', 'Ejura']
    },
    'groundnut': {
        'price_range': (350, 450),
        'unit': 'per 100kg bag',
        'seasonal_trend': 'Stable, slight increase before planting',
        'markets': ['Northern', 'Upper East', 'Upper West']
    },
    'rice': {
        'price_range': (280, 380),
        'unit': 'per 50kg bag',
        'seasonal_trend': 'Increases when imports are restricted',
        'markets': ['Volta', 'Northern', 'Ashanti']
    },
    'cocoa': {
        'price_range': (1200, 1500),
        'unit': 'per 64kg bag',
        'seasonal_trend': 'Set by COCOBOD, reviewed annually',
        'markets': ['Western', 'Eastern', 'Ashanti']
    }
}

class MarketAgent:
    """
    Enhanced market agent with comprehensive fallback mechanisms
    """
    def __init__(self, market_csv: Path):
        self.market_csv = market_csv
        self.live_url = os.getenv("GH_MARKET_JSON_URL", "").strip()
        self.timeout = 8.0
        self.default_prices = DEFAULT_MARKET_PRICES
        
    async def get_snapshot(self, crop: str, location: Optional[str] = None) -> Optional[Dict]:
        """Get market snapshot with multiple fallback layers"""
        
        # Normalize crop name
        crop_normalized = self._normalize_crop_name(crop)
        logger.info(f"Market agent: Searching for {crop_normalized} in {location}")
        
        points = []
        
        # Try 1: Live API
        if self.live_url:
            try:
                points = await self._fetch_live_prices(crop_normalized)
                logger.info(f"Live API: Found {len(points)} price points")
            except Exception as e:
                logger.debug(f"Live API unavailable: {e}")
        
        # Try 2: CSV file
        if not points and self.market_csv.exists():
            try:
                points = self._parse_csv_points(self.market_csv, crop_normalized)
                logger.info(f"CSV: Found {len(points)} price points")
            except Exception as e:
                logger.debug(f"CSV parsing error: {e}")
        
        # Try 3: Use default/estimated prices
        if not points:
            return self._generate_estimated_prices(crop_normalized, location)
        
        # Process actual data points
        return self._process_price_points(points, crop_normalized, location)
    
    def _normalize_crop_name(self, crop: str) -> str:
        """Normalize crop names with comprehensive mapping"""
        crop_lower = crop.lower().strip()
        
        # Comprehensive aliases
        aliases = {
            # Vegetables
            'okro': 'okra',
            'okra': 'okra',
            'garden eggs': 'garden eggs',
            'garden egg': 'garden eggs',
            'eggplant': 'garden eggs',
            
            # Grains
            'corn': 'maize',
            'millet': 'millet',
            'sorghum': 'sorghum',
            
            # Tubers
            'cassava': 'cassava',
            'bankye': 'cassava',
            'yam': 'yam',
            'cocoyam': 'cocoyam',
            'sweet potato': 'sweet potato',
            
            # Legumes
            'groundnut': 'groundnut',
            'peanut': 'groundnut',
            'groundnuts': 'groundnut',
            'beans': 'cowpea',
            'cowpea': 'cowpea',
            'soybean': 'soybean',
            'soya': 'soybean',
            
            # Cash crops
            'cocoa': 'cocoa',
            'cacao': 'cocoa',
            'cashew': 'cashew',
            'palm': 'palm oil',
            'oil palm': 'palm oil',
            'shea': 'shea nut',
            
            # Poultry
            'chicken': 'chicken',
            'broiler': 'chicken',
            'layer': 'eggs',
            'eggs': 'eggs'
        }
        
        return aliases.get(crop_lower, crop_lower)
    
    async def _fetch_live_prices(self, crop: str) -> List[PricePoint]:
        """Fetch live prices from API"""
        points = []
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                r = await client.get(self.live_url, params={"crop": crop})
                if r.status_code == 200:
                    data = r.json()
                    points = self._parse_json_points(data, crop)
        except Exception as e:
            logger.error(f"Live fetch error: {e}")
        return points
    
    def _parse_json_points(self, data, crop: str) -> List[PricePoint]:
        """Parse JSON price points"""
        points = []
        try:
            rows = data if isinstance(data, list) else data.get("data", [])
            for r in rows:
                if str(r.get("crop", "")).lower() == crop.lower():
                    city = r.get("city", "Unknown")
                    price = self._extract_number(str(r.get("price", "")))
                    if price:
                        points.append(PricePoint(
                            crop=crop,
                            city=city,
                            price=price,
                            unit=r.get("unit", "per kg"),
                            date=r.get("date", ""),
                            source="live"
                        ))
        except Exception as e:
            logger.error(f"JSON parsing error: {e}")
        return points
    
    def _parse_csv_points(self, path: Path, crop: str) -> List[PricePoint]:
        """Parse CSV with flexible header detection"""
        points = []
        try:
            with path.open("r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                if not reader.fieldnames:
                    return points
                
                # Flexible header mapping
                headers = [h.lower().strip() for h in reader.fieldnames]
                
                # Find relevant columns
                crop_col = next((h for h in headers if 'crop' in h or 'commodity' in h or 'product' in h), None)
                price_col = next((h for h in headers if 'price' in h or 'amount' in h), None)
                city_col = next((h for h in headers if 'city' in h or 'market' in h or 'location' in h), None)
                unit_col = next((h for h in headers if 'unit' in h), None)
                
                if not (crop_col and price_col):
                    return points
                
                for row in reader:
                    crop_val = row.get(crop_col, "").strip().lower()
                    if crop_val == crop.lower():
                        price = self._extract_number(row.get(price_col, ""))
                        if price:
                            points.append(PricePoint(
                                crop=crop,
                                city=row.get(city_col, "Unknown") if city_col else "Unknown",
                                price=price,
                                unit=row.get(unit_col, "per kg") if unit_col else "per kg",
                                date="",
                                source="csv"
                            ))
        except Exception as e:
            logger.error(f"CSV parsing error: {e}")
        return points
    
    def _extract_number(self, text: str) -> Optional[float]:
        """Extract number from text"""
        match = re.search(r"[-+]?\d+(?:,\d{3})*(?:\.\d+)?", text)
        if match:
            try:
                return float(match.group(0).replace(",", ""))
            except:
                pass
        return None
    
    def _generate_estimated_prices(self, crop: str, location: Optional[str] = None) -> Dict:
        """Generate estimated prices using defaults and seasonal adjustments"""
        
        # Check if we have default data for this crop
        if crop in self.default_prices:
            defaults = self.default_prices[crop]
            low, high = defaults['price_range']
            median = (low + high) / 2
            
            # Seasonal adjustment
            from datetime import datetime
            month = datetime.now().month
            
            # Christmas season adjustment (Nov-Dec)
            if month in [11, 12]:
                median *= 1.15  # 15% increase
                high *= 1.20
            # Post-harvest season (varies by crop)
            elif crop == 'maize' and month in [7, 8, 9]:
                median *= 0.85  # 15% decrease
                low *= 0.80
            
            return {
                "crop": crop,
                "city": location or "Ghana markets",
                "unit": defaults['unit'],
                "low": low,
                "high": high,
                "median": median,
                "updated": datetime.now().strftime("%Y-%m-%d"),
                "price_now": median,
                "source": "estimated",
                "advice": f"{defaults['seasonal_trend']}. Current estimate: GHS {median:.0f} {defaults['unit']}",
                "note": "Estimated based on seasonal patterns. Contact local markets for actual prices."
            }
        
        # Generic fallback for unknown crops
        return {
            "crop": crop,
            "city": location or "Ghana",
            "unit": "per unit",
            "low": 0,
            "high": 0,
            "median": 0,
            "updated": "",
            "price_now": 0,
            "source": "no_data",
            "advice": f"Contact local markets for {crop} prices. Visit MoFA office for price bulletins.",
            "note": f"No price data available for {crop}. Check with local traders."
        }
    
    def _process_price_points(self, points: List[PricePoint], crop: str, location: Optional[str]) -> Dict:
        """Process actual price points into snapshot"""
        
        prices = [p.price for p in points if p.price > 0]
        if not prices:
            return self._generate_estimated_prices(crop, location)
        
        prices.sort()
        low = min(prices)
        high = max(prices)
        median = prices[len(prices) // 2]
        
        # Find best matching location
        best_point = None
        if location:
            loc_lower = location.lower()
            for p in points:
                if loc_lower in p.city.lower():
                    best_point = p
                    break
        
        if not best_point:
            best_point = points[0]
        
        # Generate advice based on price level
        advice = self._generate_market_advice(crop, median, high, low)
        
        return {
            "crop": crop,
            "city": best_point.city,
            "unit": best_point.unit,
            "low": low,
            "high": high,
            "median": median,
            "updated": best_point.date or datetime.now().strftime("%Y-%m-%d"),
            "price_now": best_point.price,
            "source": best_point.source,
            "advice": advice
        }
    
    def _generate_market_advice(self, crop: str, median: float, high: float, low: float) -> str:
        """Generate contextual market advice"""
        
        # Price position analysis
        if median > (high * 0.8):
            return f"Prices are favorable. Sell now if quality is good. Current: GHS {median:.0f}"
        elif median < (low * 1.2):
            return f"Prices are low. Consider storage if possible or value addition. Current: GHS {median:.0f}"
        else:
            return f"Moderate prices. Monitor trend for optimal timing. Current: GHS {median:.0f}"

        self.market_csv = market_csv
        self.live_url = os.getenv("GH_MARKET_JSON_URL", "").strip()
        self.timeout = 8.0

    async def get_snapshot(self, crop: str, location: Optional[str] = None) -> Optional[Dict]:
        """Enhanced version that provides alternatives when exact crop not found"""
        
        # Normalize crop name
        crop_normalized = self._normalize_crop_name(crop)
        logger.info(f"Market agent searching for: {crop_normalized} in {location}")
        
        # Try to get data for the specific crop
        points = []
        
        # Try live JSON first
        if self.live_url:
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    r = await client.get(self.live_url, params={"crop": crop_normalized})
                    if r.status_code == 200:
                        data = r.json()
                        points.extend(self._parse_json_points(data, crop_normalized))
            except Exception as e:
                logger.error(f"Live data error: {e}")
        
        # Fallback to CSV
        if not points:
            points.extend(self._parse_csv_points(self.market_csv, crop_normalized))
        
        # If no exact match, try similar crops
        if not points:
            logger.warning(f"No data for {crop_normalized}, trying alternatives")
            alternative_crops = self._get_alternative_crops(crop_normalized)
            
            for alt_crop in alternative_crops:
                points.extend(self._parse_csv_points(self.market_csv, alt_crop))
                if points:
                    logger.info(f"Using alternative crop data: {alt_crop}")
                    # Add note about alternative
                    break
        
        # If still no data, provide general market guidance
        if not points:
            return self._create_fallback_response(crop, location)
        
        # Compute stats (existing logic)
        values = [p.price for p in points if isinstance(p.price, (int, float))]
        if not values:
            return self._create_fallback_response(crop, location)
            
        values_sorted = sorted(values)
        lo, hi = min(values_sorted), max(values_sorted)
        mid = values_sorted[len(values_sorted)//2]
        
        # Prefer a city close to user if provided
        best_city = self._pick_city(points, location)
        latest = self._latest_for_city(points, best_city) if best_city else None
        unit = latest.unit if latest and latest.unit else (points[0].unit or "per kg")
        updated = latest.date if latest else ""
        
        # Generate advice
        advice = self._generate_market_advice(crop_normalized, mid, location)
        
        result = {
            "crop": crop,  # Keep original crop name
            "city": best_city or location or "various markets",
            "unit": unit,
            "low": lo,
            "high": hi,
            "median": mid,
            "updated": updated,
            "price_now": latest.price if latest else mid,
            "source": latest.source if latest else points[0].source,
            "advice": advice,
        }
        
        # Add note if using alternative crop data
        if points and points[0].crop != crop_normalized:
            result["note"] = f"Showing prices for similar crop: {points[0].crop}"
        
        return result
    
    def _normalize_crop_name(self, crop: str) -> str:
        """Normalize crop names to match database"""
        crop_lower = crop.lower().strip()
        
        # Common aliases and spellings
        aliases = {
            'okro': 'okra',
            'okra': 'okra',
            'corn': 'maize',
            'groundnut': 'groundnut',
            'peanut': 'groundnut',
            'cocoyam': 'cocoyam',
            'garden eggs': 'garden eggs',
            'chili': 'pepper',
            'hot pepper': 'pepper',
            'beans': 'cowpea',
            'soya': 'soybean'
        }
        
        return aliases.get(crop_lower, crop_lower)
    
    def _get_alternative_crops(self, crop: str) -> List[str]:
        """Get similar crops when exact match not found"""
        
        # Group similar crops
        crop_groups = {
            'vegetables': ['tomato', 'pepper', 'okra', 'cabbage', 'lettuce', 'carrot'],
            'tubers': ['cassava', 'yam', 'cocoyam', 'sweet potato', 'potato'],
            'grains': ['maize', 'rice', 'millet', 'sorghum', 'wheat'],
            'legumes': ['cowpea', 'groundnut', 'soybean', 'bambara beans'],
            'fruits': ['plantain', 'banana', 'pineapple', 'mango', 'orange', 'pawpaw']
        }
        
        # Find which group the crop belongs to
        for group_name, crops in crop_groups.items():
            if crop in crops:
                # Return other crops in same group
                return [c for c in crops if c != crop]
        
        # Default alternatives if not in any group
        return ['maize', 'tomato', 'cassava']  # Common crops likely to have data
    
    def _create_fallback_response(self, crop: str, location: Optional[str]) -> Dict:
        """Create helpful response even without data"""
        
        # Provide general market guidance
        general_advice = self._get_general_market_advice(crop, location)
        
        return {
            "crop": crop,
            "city": location or "Ghana markets",
            "unit": "per kg",
            "low": 0,
            "high": 0,
            "median": 0,
            "updated": "",
            "price_now": 0,
            "source": "no_data",
            "advice": general_advice,
            "note": f"Current price data not available for {crop}. Contact local markets directly.",
            "suggestions": [
                f"Check with traders at {location or 'your local'} market",
                "Contact MoFA district office for price bulletins",
                "Join local farmer WhatsApp groups for price updates"
            ]
        }
    
    def _generate_market_advice(self, crop: str, median_price: float, location: Optional[str]) -> str:
        """Generate contextual market advice"""
        
        # Seasonal considerations (you can expand this)
        import datetime
        month = datetime.datetime.now().month
        
        # Harvest seasons for common crops in Ghana
        harvest_seasons = {
            'maize': [7, 8, 9],  # July-September
            'cassava': list(range(1, 13)),  # Year-round
            'plantain': list(range(1, 13)),  # Year-round
            'tomato': [6, 7, 8, 11, 12],  # Jun-Aug, Nov-Dec
            'okra': [6, 7, 8, 9],  # Jun-September
            'yam': [8, 9, 10, 11],  # Aug-November
        }
        
        is_harvest = month in harvest_seasons.get(crop, [])
        
        # Price-based advice
        if median_price >= 6.0:
            base_advice = "Prices are high - excellent time to sell."
        elif median_price >= 4.0:
            base_advice = "Good prices - consider selling soon."
        elif median_price >= 2.5:
            base_advice = "Moderate prices - sell if you need cash."
        else:
            base_advice = "Prices are low - hold if possible."
        
        # Add seasonal context
        if is_harvest:
            base_advice += " Note: harvest season typically has more supply."
        
        # Add location-specific advice
        if location and location.lower() in ['techiman', 'agbogbloshie', 'kejetia']:
            base_advice += f" {location} is a major market - compare prices with nearby smaller markets."
        
        return base_advice
    
    def _get_general_market_advice(self, crop: str, location: Optional[str]) -> str:
        """Provide general advice when no price data available"""
        
        location_str = location or "your area"
        
        advice_templates = {
            'okra': f"Okra prices vary by season. Best prices usually during dry season. Check {location_str} market early morning for best deals.",
            'cassava': f"Cassava prices depend on processing level. Processed cassava (gari, kokonte) fetches better prices than fresh tubers.",
            'plantain': f"Plantain prices vary by ripeness and size. Bunches command better prices than fingers. Check multiple buyers in {location_str}.",
            'default': f"For current {crop} prices in {location_str}, contact local traders or check MoFA price bulletins."
        }
        
        return advice_templates.get(crop, advice_templates['default'])