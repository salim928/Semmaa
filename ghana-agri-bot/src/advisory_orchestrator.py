#advisory_orchestrator.py
"""
Simplified Advisory Orchestrator - Preserves Dynamic Responses
Purpose: Light integration that doesn't override the natural synthesis
"""

import logging
from typing import Dict, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

class AdvisoryOrchestrator:
    """Minimal orchestrator that preserves dynamic responses"""
    
    def __init__(self, base_orchestrator):
        self.orchestrator = base_orchestrator
        
    def add_minimal_safety_check(self, response: str) -> str:
        """Add minimal safety check without changing the response structure"""
        
        if not isinstance(response, str):
            return response

        # Only add safety note if treatments are mentioned and it's not already there
        treatment_keywords = ['spray', 'chemical', 'pesticide', 'fertilizer', 'fungicide', 'apply']
        response_lower = response.lower()
        has_treatment = any(keyword in response_lower for keyword in treatment_keywords)
        has_safety_note = 'safety note' in response_lower or 'consult' in response_lower or 'extension officer' in response_lower
        
        if has_treatment and not has_safety_note:
            # Find a good place to insert safety note
            if '⚠️' in response:
                # Already has warning sections, don't duplicate
                return response
            else:
                # Add at the end
                response = response.rstrip() + "\n\n⚠️ SAFETY NOTE: Follow product label instructions, wear appropriate PPE, and consult your local extension officer before application."
        
        return response

def integrate_advisory_system(orchestrator_instance):
    """
    MINIMAL integration - preserves dynamic responses while ensuring basic safety.
    Idempotent: safe to call multiple times.
    """
    # Guard against double-integration
    if getattr(orchestrator_instance, "_advisory_integrated", False):
        logger.info("Advisory system already integrated - skipping")
        return orchestrator_instance

    # Store original process method (bound coroutine)
    original_process = getattr(orchestrator_instance, "process_farmer_query", None)
    if original_process is None:
        logger.warning("Orchestrator instance has no 'process_farmer_query' method. Skipping integration.")
        return orchestrator_instance

    # Create minimal advisory wrapper
    advisory = AdvisoryOrchestrator(orchestrator_instance)

    async def minimally_enhanced_process(query: str, location: Optional[str] = None,
                                        crop_type: Optional[str] = None,
                                        user_id: Optional[str] = None) -> Dict:
        """Minimal enhancement - preserves dynamic responses"""
        # Call original process (preserve behaviour and signature)
        try:
            result = await original_process(query, location, crop_type, user_id)
        except TypeError:
            # fallback if original_process expects different signature
            result = await original_process(query, location, crop_type, user_id)

        # Only add minimal safety check - DO NOT override the response structure
        if isinstance(result, dict):
            resp = result.get('response')
            if isinstance(resp, str):
                try:
                    result['response'] = advisory.add_minimal_safety_check(resp)
                except Exception as e:
                    logger.error(f"Error applying minimal safety check: {e}")

            # Add minimal metadata (non-destructive)
            result.setdefault('enhanced', True)
            result.setdefault('enhancement_type', 'minimal_safety_only')
        else:
            # If result is unexpected (not a dict), wrap it predictably
            try:
                text = str(result)
                text = advisory.add_minimal_safety_check(text)
                result = {
                    'response': text,
                    'confidence': 0.2,
                    'enhanced': True,
                    'enhancement_type': 'minimal_safety_only'
                }
            except Exception as e:
                logger.error(f"Advisory wrapper error while normalizing result: {e}")
                result = {
                    'response': "An error occurred while enhancing the response.",
                    'confidence': 0.1,
                    'enhanced': True,
                    'enhancement_type': 'minimal_safety_only',
                    'error': str(e)
                }

        logger.info("Minimal advisory enhancement applied - preserved dynamic response")
        return result

    # Replace with minimally enhanced version
    orchestrator_instance.process_farmer_query = minimally_enhanced_process

    # Mark as integrated so we don't double wrap
    setattr(orchestrator_instance, "_advisory_integrated", True)

    logger.info("✅ Minimal advisory system integrated - dynamic responses preserved")
    return orchestrator_instance
