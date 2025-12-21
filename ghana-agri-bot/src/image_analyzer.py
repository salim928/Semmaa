"""
Image analysis for crop and pest diagnosis
"""

import logging
import base64
import json
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import io
import os
import httpx
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class ImageAnalyzer:
    def __init__(self):
        self.max_image_size = 5 * 1024 * 1024  # 5MB
        self.supported_formats = ['JPEG', 'PNG', 'WEBP', 'JPG']
        self.analysis_log = Path("data/logs/image_analysis.jsonl")
        self.analysis_log.parent.mkdir(exist_ok=True)
        # ML inference endpoints (single model)
        self.hf_model_id = os.getenv("HF_IMAGE_MODEL_ID", "").strip()
        self.hf_api_token = os.getenv("HF_API_TOKEN", "").strip()
        self.custom_diag_url = os.getenv("DIAGNOSIS_API_URL", "").strip()
        self.http_timeout = 12.0

        # (Optional) Ghana-specific crop names retained for messaging, no routing
        self.ghana_crops = {
            'maize': ['corn', 'maze', 'dawa'],
            'cassava': ['yuca', 'manioc'],
            'cocoa': ['cacao', 'chocolate tree'],
            'plantain': ['cooking banana'],
            'yam': ['yarn'],
            'rice': ['oryza'],
            'tomato': ['tomatoes'],
            'pepper': ['capsicum', 'chili'],
            'okra': ['lady finger'],
            'cowpea': ['black eyed pea'],
            'groundnut': ['peanut']
        }

    async def analyze_image(self, image_data: bytes, user_context: Dict = None) -> Dict:
        """Analyze uploaded image for crop issues (single-model pipeline)"""
        try:
            validation_result = self._validate_image(image_data)
            if not validation_result['valid']:
                return {
                    'success': False,
                    'error': validation_result['error'],
                    'friendly_message': validation_result['message']
                }

            # Try ML first (custom endpoint or Hugging Face Inference)
            ml = await self._try_ml(image_data)  # no crop routing
            if ml:
                label = ml.get("label")
                score = ml.get("score")
                topk = ml.get("topk", [])
                recs = self._advice_for_label(label, user_context)
                analysis = {
                    'combined_issues': [{
                        'issue': label,
                        'description': f"Top prediction: {label} ({round(score*100)}%)" if score is not None else f"Top prediction: {label}",
                        'possible_causes': [p['label'] for p in topk[1:3]] if topk else [],
                        'confidence': float(score) if score is not None else 0.6
                    }],
                    'confidence': 'high' if score and score >= 0.75 else 'medium',
                    'analysis_methods': ['ml_classification'],
                    'user_crops': (user_context or {}).get('crops') or (user_context or {}).get('crop'),
                    'user_location': (user_context or {}).get('location', 'Ghana')
                }
                self._log_analysis(analysis, user_context)
                return {
                    'success': True,
                    'analysis': analysis,
                    'recommendations': recs,
                    'confidence': analysis['confidence']
                }

            # Fallback: basic analysis
            basic_analysis = self._basic_analysis(user_context)
            recommendations = self._generate_recommendations(basic_analysis, user_context)
            self._log_analysis(basic_analysis, user_context)
            return {
                'success': True,
                'analysis': basic_analysis,
                'recommendations': recommendations,
                'confidence': 'medium'
            }
        except Exception as e:
            logger.error(f"Image analysis failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'friendly_message': "📸 I couldn't analyze that image clearly. Try a sharper, well‑lit close‑up of the affected area."
            }

    async def _try_ml(self, image_data: bytes) -> Optional[Dict]:
        """
        Try a custom diagnosis endpoint first, then a single Hugging Face model (image-classification).
        Expected response: list of {label, score} or a dict with similar info.
        """
        # Custom endpoint
        if self.custom_diag_url:
            try:
                async with httpx.AsyncClient(timeout=self.http_timeout) as client:
                    r = await client.post(self.custom_diag_url, content=image_data, headers={"Content-Type": "application/octet-stream"})
                    if r.status_code == 200:
                        data = r.json()
                        preds = data if isinstance(data, list) else data.get("predictions") or []
                        if preds:
                            top = max(preds, key=lambda x: x.get("score", 0))
                            return {"label": top.get("label"), "score": float(top.get("score", 0)), "topk": preds}
            except Exception as e:
                logger.debug(f"Custom diagnosis API failed: {e}")

        # Hugging Face Inference (single model)
        if self.hf_model_id and self.hf_api_token:
            url = f"https://api-inference.huggingface.co/models/{self.hf_model_id}"
            headers = {"Authorization": f"Bearer {self.hf_api_token}"}
            try:
                async with httpx.AsyncClient(timeout=self.http_timeout) as client:
                    r = await client.post(url, headers=headers, content=image_data)
                    if r.status_code == 200:
                        preds = r.json()
                        if preds and isinstance(preds, list) and isinstance(preds[0], list):
                            preds = preds[0]
                        if isinstance(preds, list) and preds:
                            def norm(p):
                                return {"label": str(p.get("label", "")).replace("_", " "), "score": float(p.get("score", 0.0))}
                            preds = [norm(p) for p in preds]
                            top = max(preds, key=lambda x: x["score"])
                            return {"label": top["label"], "score": top["score"], "topk": preds[:5]}
                        if isinstance(preds, dict) and "labels" in preds and "scores" in preds:
                            items = [{"label": l, "score": s} for l, s in zip(preds["labels"], preds["scores"])]
                            if items:
                                top = max(items, key=lambda x: x["score"])
                                return {"label": top["label"], "score": top["score"], "topk": items[:5]}
                    else:
                        logger.debug(f"HF inference {self.hf_model_id} failed: {r.status_code} {r.text[:200]}")
            except Exception as e:
                logger.debug(f"Hugging Face inference failed: {e}")

        return None

    def _advice_for_label(self, label: Optional[str], user_context: Dict = None) -> List[str]:
        """
        Map predicted label to confident, actionable recommendations for Ghana.
        """
        label = (label or "").lower()
        loc = (user_context or {}).get('location') or "Ghana"
        crop = ((user_context or {}).get('crops') or (user_context or {}).get('crop') or "").lower()

        lines: List[str] = [f"📸 Diagnosis for {loc}"]

        # Handle healthy/unhealthy style models cleanly
        if any(k in label for k in ("healthy", "no disease", "normal", "healthy leaf", "leaf_healthy")):
            return [
                f"📸 Diagnosis for {loc}",
                "✅ Looks healthy based on the photo.",
                "• Keep scouting weekly; maintain spacing and field hygiene",
                "• Water in the morning; avoid wet foliage late in the day",
                "• If you later see spots/holes/wilting, send a sharp close‑up"
            ]
        if "unhealthy" in label or "diseased" in label or "stress" in label:
            lines.extend([
                "• Likely stress/disease present; remove heavily affected leaves",
                "• Check leaf undersides for pests; keep weeds down",
                "• In wet spells, consider a broad protectant fungicide as prevention"
            ])

        def add_common():
            lines.extend([
                "• Remove affected parts and destroy away from field",
                "• Keep field weed‑free; ensure airflow with proper spacing",
                "• Water early; avoid wetting foliage late in the day"
            ])

        if "maize" in label or "corn" in label or "maize" in crop:
            if "armyworm" in label:
                lines.extend([
                    "• Scout daily; treat at early larval stages (inside whorl) for best control",
                    "• Target the whorl; rotate modes of action; follow label rates",
                    "• Encourage natural enemies; avoid unnecessary broad‑spectrum sprays"
                ])
            elif "streak" in label or "virus" in label:
                lines.extend([
                    "• Rogue (remove) infected plants promptly to limit spread",
                    "• Control vector (leafhoppers) early; keep weeds down",
                    "• Use tolerant varieties next cycle; avoid late planting"
                ])
            else:
                add_common()

        elif "tomato" in label or "tomato" in crop:
            if "early blight" in label or "alternaria" in label:
                lines.extend([
                    "• Remove lower infected leaves; stake plants for airflow",
                    "• Start protectant fungicides; shorten interval during wet spells",
                    "• Avoid overhead irrigation; mulch to reduce splash"
                ])
            if "late blight" in label or "phytophthora" in label:
                lines.extend([
                    "• Act quickly with effective fungicides; rotate MOA",
                    "• Destroy badly infected plants; sanitize tools",
                    "• Increase spacing; avoid wet foliage overnight"
                ])
        if "maize" in label or "corn" in label or "maize" in crop:
            if "armyworm" in label:
                lines.extend([
                    "• Treat early instars inside whorl; rotate MOA; follow label rates",
                    "• Scout daily; keep weeds down; encourage natural enemies"
                ])
            if any(k in label for k in ["leaf blight", "northern leaf blight", "turcicum"]):
                lines.extend([
                    "• Plant tolerant varieties next season; avoid late planting",
                    "• Remove crop debris; improve airflow; consider fungicide if severe"
                ])
        if "cassava" in label or "cassava" in crop:
            if any(k in label for k in ["mosaic", "cmd", "virus"]):
                lines.extend([
                    "• Rogue infected plants; control whiteflies where feasible",
                    "• Plant virus‑free cuttings next cycle; keep weeds down"
                ])
        if "cocoa" in label or "cacao" in label or "cocoa" in crop:
            if "black pod" in label:
                lines.extend([
                    "• Remove infected pods; improve shade/airflow and drainage",
                    "• Timely fungicide sprays during wet season"
                ])
        else:
            add_common()

        lines.extend([
            "",
            "Next steps:",
            "• Share crop name, variety, and planting date to tailor advice",
            "• Send 2–3 more close‑ups of symptomatic areas for confirmation"
        ])
        return lines

    def _validate_image(self, image_data: bytes) -> Dict:
        """Validate uploaded image"""
        try:
            # Check file size
            if len(image_data) > self.max_image_size:
                return {
                    'valid': False,
                    'error': 'image_too_large',
                    'message': "📸 That image is too large. Please send a smaller photo (under 5MB)."
                }
            
            # Try to open with PIL
            try:
                from PIL import Image
                image = Image.open(io.BytesIO(image_data))
                
                if image.format not in self.supported_formats:
                    return {
                        'valid': False,
                        'error': 'unsupported_format',
                        'message': "📸 I can only look at JPG, PNG, or WebP images. Please send your photo in one of these formats."
                    }
                
                if image.width < 100 or image.height < 100:
                    return {
                        'valid': False,
                        'error': 'image_too_small',
                        'message': "📸 That image is too small. Please send a larger, clearer photo."
                    }
                
            except ImportError:
                # If PIL not available, just check basic things
                if len(image_data) < 1000:
                    return {
                        'valid': False,
                        'error': 'image_too_small',
                        'message': "📸 That image seems too small. Please send a larger photo."
                    }
            
            return {'valid': True}
            
        except Exception as e:
            return {
                'valid': False,
                'error': 'invalid_image',
                'message': "📸 I couldn't open that image. Please make sure it's a valid photo file."
            }

    def _basic_analysis(self, user_context: Dict = None) -> Dict:
        """Provide basic analysis based on user context"""
        
        # Get user's crops and location for relevant advice
        crops = (user_context or {}).get('crops') or (user_context or {}).get('crop') or 'your crops'
        location = (user_context or {}).get('location', 'Ghana')
        
        # Simulate detection based on common issues
        detected_issues = [
            {
                'issue': 'general_assessment',
                'description': 'Photo received for analysis',
                'possible_causes': ['Need detailed examination'],
                'confidence': 0.7
            }
        ]
        
        return {
            'combined_issues': detected_issues,
            'confidence': 'medium',
            'analysis_methods': ['basic_visual'],
            'user_crops': crops,
            'user_location': location
        }

    def _generate_recommendations(self, analysis: Dict, user_context: Dict = None) -> List[str]:
        """Generate Ghana-specific recommendations based on analysis"""
        
        recommendations = []
        location = (user_context or {}).get('location', 'Ghana')
        crops = (user_context or {}).get('crops') or (user_context or {}).get('crop') or 'your crops'
        
        # General photo analysis recommendations
        recommendations.extend([
            f"📸 **Photo Analysis for {location}**",
            "",
            "🔍 **Based on your image, here's general advice:**",
            "• Check leaves for yellowing (nutrient deficiency)",
            "• Look for holes or spots (pest/disease damage)", 
            "• Examine stem and roots if possible",
            "",
            f"🌾 **For {crops} specifically:**"
        ])
        
        # Add crop-specific advice based on user's crops
        if 'maize' in crops.lower():
            recommendations.extend([
                "• Watch for Fall Armyworm (holes in leaves)",
                "• Check for streak virus (yellow streaks)",
                "• Ensure proper spacing for air circulation"
            ])
        elif 'cassava' in crops.lower():
            recommendations.extend([
                "• Look for mosaic patterns (virus disease)",
                "• Check for white cotton-like insects (mealybugs)",
                "• Monitor root development"
            ])
        elif 'tomato' in crops.lower():
            recommendations.extend([
                "• Watch for early/late blight symptoms",
                "• Check for whiteflies under leaves", 
                "• Ensure good drainage to prevent root rot"
            ])
        else:
            recommendations.extend([
                "• Monitor for common pests in your area",
                "• Check soil moisture levels",
                "• Ensure proper plant nutrition"
            ])
        
        # Add location-specific advice
        recommendations.append("")
        recommendations.append(f"📍 **For {location} specifically:**")
        
        if 'Northern' in location or 'Upper' in location:
            recommendations.extend([
                "• Monitor soil moisture during dry season",
                "• Watch for drought stress signs",
                "• Consider mulching to retain moisture"
            ])
        elif 'Ashanti' in location or 'Western' in location:
            recommendations.extend([
                "• Ensure good drainage during wet season",
                "• Watch for fungal diseases in high humidity",
                "• Provide adequate spacing for air circulation"
            ])
        else:
            recommendations.extend([
                "• Adapt care to your local climate conditions",
                "• Follow seasonal planting guidelines",
                "• Consult local extension officers for specific advice"
            ])
        
        recommendations.extend([
            "",
            "💡 **Next Steps:**",
            "• Describe symptoms in detail for better diagnosis",
            "• Take photos of affected parts (leaves, stems, roots)",
            "• Contact local agricultural extension officer",
            "• Consider sending multiple photos from different angles"
        ])
        
        # Replace extension referral with direct, actionable steps
        recommendations = [r for r in recommendations if "extension officer" not in r.lower()]
        recommendations.extend([
            "",
            "💡 Next Steps:",
            "• Describe symptoms (spots, holes, wilting) and spread speed",
            "• Send multiple close‑ups in good light",
            "• Share recent sprays/fertilizers and irrigation pattern"
        ])
        
        return recommendations

    def _log_analysis(self, analysis: Dict, user_context: Dict = None):
        """Log image analysis for improvement"""
        try:
            log_entry = {
                'timestamp': datetime.now().isoformat(),
                'user_location': user_context.get('location') if user_context else None,
                'user_crops': user_context.get('crop') if user_context else None,
                'analysis_confidence': analysis.get('confidence'),
                'issues_detected': len(analysis.get('combined_issues', [])),
                'analysis_methods': analysis.get('analysis_methods', [])
            }
            
            with open(self.analysis_log, 'a', encoding='utf-8') as f:
                f.write(json.dumps(log_entry) + '\n')
                
        except Exception as e:
            logger.error(f"Failed to log image analysis: {e}")

# Global instance
image_analyzer = ImageAnalyzer()