"""
Advisory Response Enhancer for Ghana Agricultural Bot
Purpose: Transform raw LLM text into authoritative agricultural advisory
         with safety, neutrality, and structured presentation.
"""

import re
from typing import Dict, List, Optional
from datetime import datetime
import logging
import random

logger = logging.getLogger(__name__)


class AdvisoryEnhancer:
    """Enhances bot responses to be neutral, safe, and evidence-based"""

    def __init__(self):
        self.confidence_markers = {
            "high": "✅ HIGH CONFIDENCE (Based on validated data)",
            "medium": "📊 MODERATE CONFIDENCE (General guidelines)",
            "low": "💡 LOW CONFIDENCE (Limited data – consult expert)",
        }

        self.neutral_phrases = [
            "Based on agronomy guidelines",
            "Model suggests",
            "Research indicates",
            "Agricultural best practices recommend",
            "Data shows",
            "Studies suggest",
        ]

    # ------------------------------------------------------------------
    def enhance_response(
        self,
        response: str,
        farmer_context: Optional[Dict] = None,
        web_search: Optional[Dict] = None,
        **kwargs,
    ) -> str:
        """
        Transform model output into safe, neutral advisory.

        Pass useful kwargs:
          query_type  – 'market_price', 'crop_health', 'general', etc.
          crop        – crop name (string)
          location    – location name (string)
          confidence  – float 0-1
          data_sources – list of strings
          image_available – bool
        """
        confidence = kwargs.get("confidence", 0.8)
        query_type = kwargs.get("query_type", "general")
        crop = kwargs.get("crop")
        location = kwargs.get("location")
        data_sources = kwargs.get("data_sources", [])
        image_available = kwargs.get("image_available", False)

        # 1. Remove informal / weak language
        enhanced = self._remove_weak_language(response)

        # 2. Add neutral markers
        enhanced = self._add_neutral_markers(enhanced, confidence)

        # 3. Always structure as professional advisory
        enhanced = self._structure_advisory(enhanced, query_type, image_available)

        # 4. Add probabilistic confidence
        enhanced = self._add_probabilistic_confidence(enhanced, confidence)

        # 5. Ensure specificity & safety
        enhanced = self._ensure_specificity_and_safety(
            enhanced, crop=crop, location=location
        )

        # 6. Add sources
        enhanced = self._add_source_line(enhanced, data_sources)

        # 7. Clear call-to-action
        enhanced = self._add_clear_cta(enhanced, query_type)

        # 8. Web verification if available
        if web_search:
            enhanced += f"\n\n🌐 **Web Verification:** {web_search.get('context', '')}"

        return enhanced

    # ------------------------------------------------------------------
    def _remove_weak_language(self, text: str) -> str:
        """Strip informal greetings and tentative words"""

        # Remove friendly greetings / chatter
        text = re.sub(
            r"^(hi|hello|hey|ei|greetings)[^.!?]*[.!?]\s*",
            "",
            text.strip(),
            flags=re.IGNORECASE,
        )

        weak_to_neutral = {
            r"\bmight\b": "may",
            r"\bcould\b": "can",
            r"\bperhaps\b": "potentially",
            r"\bmaybe\b": "possibly",
            r"\bseems\b": "appears",
            r"\bappears\b": "indicates",
            r"\btry\b": "consider",
            r"\bconsider\b": "evaluate",
            r"\bsuggest\b": "recommend",
            r"\brecommend\b": "suggest",
            r"\bshould\b": "consider",
            r"\byou must\b": "you can",
            r"\bit is essential to\b": "it is advisable to",
            r"\bfollow my prescription\b": "follow agricultural guidelines",
            r"\bfollow these expert guidelines\b": "consult extension services",
        }

        for weak, neutral in weak_to_neutral.items():
            text = re.sub(weak, neutral, text, flags=re.IGNORECASE)

        # Remove deferrals
        deferrals = [
            r"consult with.*?[.]",
            r"speak to.*?[.]",
            r"contact.*?[.]",
            r"check with.*?[.]",
            r"refer to.*?[.]",
            r"visit your local.*?[.]",
        ]
        for pattern in deferrals:
            text = re.sub(pattern, "", text, flags=re.IGNORECASE)

        return text.strip()

    # ------------------------------------------------------------------
    def _add_neutral_markers(self, text: str, confidence: float) -> str:
        """Add neutral, evidence-based markers to the response"""
        confidence_level = (
            "high" if confidence > 0.7 else "medium" if confidence > 0.4 else "low"
        )
        marker = self.confidence_markers[confidence_level]

        # Header marker
        if not text.strip().startswith(("✅", "📊", "💡")):
            text = f"**{marker}**\n\n{text}"

        # Neutral phrase injection
        if not any(phrase.lower() in text.lower() for phrase in self.neutral_phrases):
            neutral = random.choice(self.neutral_phrases)
            sentences = re.split(r"(?<=[.!?])\s+", text, maxsplit=1)
            if len(sentences) > 1:
                text = f"{sentences[0]} {neutral}, {sentences[1]}"

        return text

    # ------------------------------------------------------------------
    def _structure_advisory(self, text: str, query_type: str, image_available: bool) -> str:
        """Always structure response as neutral agricultural guidance"""
        if text.strip().startswith("📋"):
            return text  # already structured

        lines = text.split("\n")
        structured = ["📋 **AGRICULTURAL ASSESSMENT**", ""]

        # simple heuristic for key info
        problem, solution, steps = "", "", []
        for line in lines:
            if any(w in line.lower() for w in ["problem", "issue", "disease", "pest"]):
                problem = line
            elif any(w in line.lower() for w in ["apply", "spray", "use", "fertilizer"]):
                solution = line
            elif re.match(r"^\d+\.", line.strip()) or line.strip().startswith("-"):
                steps.append(line)

        if problem:
            if query_type in ["crop_health", "pest_disease", "diagnosis"] and not image_available:
                structured.append(f"**Potential Issue (Photo Recommended):** {problem}")
            else:
                structured.append(f"**Identified Issue:** {problem}")
            structured.append("")

        structured.append("💊 **RECOMMENDED ACTIONS**")
        structured.append(solution if solution else "Consider the following options:")
        structured.append("")

        if steps:
            structured.append("📝 **IMPLEMENTATION STEPS**")
            structured.extend(steps)
            structured.append("")

        # Fallback: if nothing extracted, keep original
        if len(structured) <= 4:
            structured.append(text)

        return "\n".join(structured)

    # ------------------------------------------------------------------
    def _add_probabilistic_confidence(self, text: str, confidence: float) -> str:
        if "Confidence Level" in text:
            return text
        percent = int(confidence * 100)
        return text + f"\n\n📊 **Confidence Level:** {percent}% (Based on available data)"

    # ------------------------------------------------------------------
    def _ensure_specificity_and_safety(
        self, text: str, crop: Optional[str] = None, location: Optional[str] = None
    ) -> str:
        vague_patterns = {
            r"\bsome\b": "2–3",
            r"\ba little\b": "100–150 ml",
            r"\ba few\b": "3–4",
            r"\bseveral\b": "5–7",
            r"\bmany\b": "10–15",
            r"\badequate\b": "200 kg/acre",
            r"\bsufficient\b": "recommended rate of 250 kg/ha",
        }
        for pattern, repl in vague_patterns.items():
            text = re.sub(pattern, repl, text, flags=re.IGNORECASE)

        if crop and crop.lower() not in text.lower():
            text = text.replace("your crop", f"your {crop}")

        if location and location.lower() not in text.lower():
            text += f"\n\n📍 Location context: {location}"

        if any(w in text.lower() for w in ["spray", "chemical", "pesticide", "fertilizer"]):
            safety = (
                "\n\n⚠️ **SAFETY NOTE:** Follow product label instructions, wear PPE, "
                "and consult your local extension officer before application."
            )
            if safety not in text:
                text += safety

        return text

    # ------------------------------------------------------------------
    def _add_source_line(self, text: str, data_sources: List[str]) -> str:
        if data_sources:
            src = ", ".join(data_sources)
            stamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
            return f"{text}\n\n📚 **Sources:** {src} (Data as of {stamp})"
        return f"{text}\n\n📚 **Sources:** no-live-data"

    # ------------------------------------------------------------------
    def _add_clear_cta(self, text: str, query_type: str) -> str:
        if "NEXT STEP" in text:
            return text

        if query_type in ["crop_health", "pest_disease", "diagnosis"]:
            cta = (
                "\n\n🔍 **NEXT STEP:** Share a photo of the affected crop for accurate diagnosis "
                "or contact your local extension officer."
            )
        elif query_type == "market_price":
            cta = (
                "\n\n💹 **NEXT STEP:** Verify current market prices with nearby traders "
                "or local MOFA price bulletins."
            )
        else:
            cta = (
                "\n\n🔍 **NEXT STEP:** For tailored guidance, provide more details or consult your local extension officer."
            )

        return text + cta


# Singleton instance
advisory_enhancer = AdvisoryEnhancer()
