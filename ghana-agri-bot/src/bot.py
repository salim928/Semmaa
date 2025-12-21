# bot.py - Fixed Version with Better Error Handling
"""
Main Telegram Bot Implementation - Fixed
Purpose: Handle all Telegram interactions, commands, and message routing
"""
import asyncio
import logging
import re
import csv
import json
import time
from typing import List, Dict, Optional
import urllib
import urllib.request
import urllib.parse
from telegram import Update, KeyboardButton, ReplyKeyboardMarkup, ReplyKeyboardRemove, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.constants import ChatAction
from telegram.ext import (
    ApplicationBuilder, CommandHandler, CallbackQueryHandler,
    MessageHandler, ContextTypes, filters
)
from telegram.error import BadRequest

from src.bot_ui import (
    main_menu, back_menu, settings_keyboard, tips_keyboard, language_keyboard,
    crops_keyboard, rating_keyboard, onboarding_keyboard, main_menu_button,
    quick_actions_keyboard, photo_progress_keyboard, feedback_poll_keyboard,
    retry_keyboard, history_keyboard
)
from src.project_paths import data_dir
from src.metrics import log_event, log_consent
from src.weather_integration import get_weather
from src.satellite_integration import ndvi_text_for_coords
from src.market_agent import MarketAgent

logger = logging.getLogger(__name__)

# Import orchestrator with fallback
try:
    from src.orchestrator import MultiAgentOrchestrator
    ORCHESTRATOR_AVAILABLE = True
    logger.info("✅ MultiAgentOrchestrator imported successfully")
except Exception as e:
    logger.error(f"❌ Failed to import MultiAgentOrchestrator: {e}")
    try:
        from src.orchestrator import Orchestrator as MultiAgentOrchestrator
        ORCHESTRATOR_AVAILABLE = True
        logger.info("✅ Fallback Orchestrator imported")
    except Exception as e2:
        logger.error(f"❌ No orchestrator available: {e2}")
        ORCHESTRATOR_AVAILABLE = False
        MultiAgentOrchestrator = None

# Sanitize outgoing text (remove markdown and any Sources: section)
def _sanitize_outgoing(text: str) -> str:
    if text is None:
        return ""
    s = str(text).replace("\r\n", "\n").strip()
    s = re.sub(r'(?is)\n+sources\s*:.*$', '', s)          # drop 'Sources:' block
    s = re.sub(r'```+', '', s)                            # fenced markers
    s = re.sub(r'`([^`]+)`', r'\1', s)                    # inline code
    s = re.sub(r'\*\*([^*]+)\*\*', r'\1', s)              # **bold**
    s = re.sub(r'(?<!\*)\*([^*]+)\*', r'\1', s)           # *italic*
    s = re.sub(r'__([^_]+)__', r'\1', s)                  # __bold__
    s = re.sub(r'_([^_]+)_', r'\1', s)                    # _italic_
    s = s.replace('\\*', '').replace('*', '• ')
    s = re.sub(r'\n{3,}', '\n\n', s).strip()
    return s

# Ghana-focused quick tips (default EN)
TIPS: List[str] = [
    "Mulch around crops to conserve soil moisture and reduce weeds.",
    "Plant at the start of rains for better germination in rainfed fields.",
    "Use certified seeds from trusted suppliers to improve yields.",
    "Top-dress nitrogen after weeding when soils are moist, not before heavy rain.",
    "Rotate cereals with legumes (e.g., maize-soybean) to improve soil fertility.",
    "Scout weekly for Fall Armyworm; control early at small larval stages.",
    "Avoid over-irrigation: water early morning or evening to reduce stress.",
    "Dry grains to safe moisture levels before storage to prevent mould.",
    "Calibrate sprayers to apply the correct rate and minimize waste.",
    "Use compost/manure where possible to build organic matter.",
    "Plant resistant/tolerant varieties suitable for your region.",
    "Keep field records: planting dates, inputs, rainfall, and yields.",
]

LANGUAGE_NAMES = {
    "en": "English",
    "tw": "Twi",
    "ga": "Ga",
    "ee": "Ewe",
}

# Minimal translations for core bot strings
TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "welcome": {
        "en": "🌾 Welcome to SemmaAI, {user.first_name}!\nChoose an option below or ask a farming question.",
        "tw": "🌾 Akwaaba, {user.first_name}! Fa bot no mmoa wo. Bisa asɛmmisa afa ɔkoɔ ɛfie anaa paw akodeɛ ase.",
        "ga": "🌾 Wɔjogbaa, {user.first_name}! Tsɔ ni yaakɛɛ hewalɔ lɛ kɛ bisa shikpon mli hewalɔ.",
        "ee": "🌾 Woezɔ, {user.first_name}! Kpɔe be nàbia ɖe agble mɔmɔ me alo bia wo nuŋɔŋlɔwo.",
    },
    "share_location": {
        "en": "Share your location for localized advice.",
        "tw": "Fa wo bea no to mu na menya atie a ɛfata wo.",
        "ga": "Fa wo hewalɔ gblɔ na mɛmaa amɛkɛ hewalɔ.",
        "ee": "Dzia wo afisia be metsɔ aɖe aɖo go na wò.",
    },
    "help": {
        "en": "Use buttons for Weather, Market, Tips, Profile, and Feedback.\nAsk farming questions in plain language.",
        "tw": "Fa akɔtɔsoɔ no di dwuma: Nsusɔre (Weather), Market, Tips, Profile ne Feedback.\nBisa wo asɛmmisa wɔ kasa pa mu.",
        "ga": "Fa buttons lɛ yɛɛ: Nɔɔni, Makɛt, Tips, Profile kɛ Feedback.\nBisa agble shikpon mli asɛmmɔ.",
        "ee": "Ƒo buttons na: Atmosphere, Market, Tips, Profile kple Feedback.\nBia agble ase nya kple nuŋɔŋlɔ nyuie.",
    },
    "stopped": {
        "en": "🛑 Stopped. Send /start to resume.",
        "tw": "🛑 Esi. Fa /start san hyɛ ase.",
        "ga": "🛑 Eba. Fa /start be san yɛ.",
        "ee": "🛑 Katã. Dɔ /start be nàxɔe ɖo.",
    },
    "menu": {
        "en": "Main menu:",
        "tw": "Titiriw menu:",
        "ga": "Menu gbã:",
        "ee": "Menu titina:",
    },
    "ask_prompt": {
        "en": "💬 Send your farming question.",
        "tw": "💬 Tɔ wo agri asɛmmisa.",
        "ga": "💬 Fa w'agble asɛmmɔ mli.",
        "ee": "💬 Gblɔ wò agble bia.",
    },
}

def t(context: ContextTypes.DEFAULT_TYPE, key: str, **kwargs) -> str:
    lang = (context.user_data.get("language") if context and context.user_data else "en") or "en"
    entry = TRANSLATIONS.get(key, {})
    text = entry.get(lang) or entry.get("en") or key
    try:
        return text.format(**kwargs)
    except Exception:
        return text

def _maybe_small_talk(text: str, lang: str) -> Optional[str]:
    tnorm = (text or "").strip().lower()
    greetings = ("hi", "hello", "hey", "good morning", "good afternoon", "good evening", "akwaaba", "oyo", "woezɔ")
    thanks = ("thanks", "thank you", "medaase", "yedaase", "akpe", "akpe na wo", "oyi waladon")
    how = ("how are you", "how's it going", "how are u", "ɛte sɛn", "wo ho te sɛn", "ɛfɛ?", "ɛfɛ na wo?")
    
    if any(tnorm == g or tnorm.startswith(g + " ") for g in greetings):
        return TRANSLATIONS["welcome"].get(lang, "👋 Hi! I'm here to help with Ghana farming advice.")
    if any(k in tnorm for k in how):
        return "I'm doing well, thanks! How can I support your farming today?"
    if any(k in tnorm for k in thanks):
        return "You're welcome! What farming question can I help you with?"
    if tnorm in ("ok", "okay", "fine", "cool", "great", "yoo", "eeh"):
        return "👌 What crop or question would you like help with?"
    return None

APP_VERSION = "2025-09-24"

class GhanaAgriBot:
    def __init__(self, token: str):
        logger.info("🤖 Initializing SemmaAI...")
        self.app = ApplicationBuilder().token(token).build()

        # Initialize orchestrator with error handling
        try:
            if ORCHESTRATOR_AVAILABLE:
                self.orchestrator = MultiAgentOrchestrator()
                logger.info("✅ Orchestrator initialized successfully")
            else:
                self.orchestrator = None
                logger.warning("❌ No orchestrator available - using fallback")
        except Exception as e:
            logger.error(f"❌ Orchestrator initialization failed: {e}")
            self.orchestrator = None

        # Initialize other components
        try:
            self.market_csv = data_dir() / "market_prices.csv"
            self.market_agent = MarketAgent(self.market_csv)
            logger.info("✅ Market agent initialized")
        except Exception as e:
            logger.error(f"❌ Market agent failed: {e}")
            self.market_agent = None

        # Rate limiting storage
        self.user_rates = {}

        # Add handlers with explicit logging
        logger.info("📝 Setting up message handlers...")
        
        # Commands
        self.app.add_handler(CommandHandler("start", self.start))
        self.app.add_handler(CommandHandler("help", self.help))
        self.app.add_handler(CommandHandler("stop", self.stop))
        self.app.add_handler(CommandHandler("profile", self.profile))
        
        # Text messages - this is critical!
        self.app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.on_text))
        logger.info("✅ Text message handler added")
        
        # Other handlers
        self.app.add_handler(MessageHandler(filters.LOCATION, self.on_location))
        self.app.add_handler(CallbackQueryHandler(self.on_button))
        
        # Error handler
        self.app.add_error_handler(self._on_error)
        
        logger.info("✅ All handlers registered")

    def run(self) -> None:
        logger.info("🚀 Starting Telegram bot polling...")
        self.app.run_polling(drop_pending_updates=True)

    # ---------- Error Handler ----------
    async def _on_error(self, update: Optional[Update], context: ContextTypes.DEFAULT_TYPE):
        logger.error("❌ Unhandled bot error", exc_info=context.error)
        try:
            if update and update.effective_message:
                await update.effective_message.reply_text(
                    "⚠️ Technical error occurred. Please try again or contact support.", 
                    reply_markup=main_menu_button()
                )
        except Exception as send_error:
            logger.error(f"Failed to send error message: {send_error}")

    async def _send_typing(self, message_or_query_message):
        try:
            chat_id = message_or_query_message.chat.id
            await self.app.bot.send_chat_action(chat_id=chat_id, action=ChatAction.TYPING)
        except Exception as e:
            logger.debug(f"Typing indicator failed: {e}")

    # ---------- Rate Limiting ----------
    async def _check_rate_limit(self, user_id: int) -> bool:
        """Rate limiting: max 5 requests per minute"""
        now = time.time()
        user_data = self.user_rates.get(user_id, [])
        user_data = [t for t in user_data if now - t < 60]
        if len(user_data) >= 5:
            logger.warning(f"Rate limit exceeded for user {user_id}")
            return False
        user_data.append(now)
        self.user_rates[user_id] = user_data
        return True

    # ---------- Core Answer Method ----------
    async def _answer_question(self, update: Update, context: ContextTypes.DEFAULT_TYPE, question: str):
        """Process and answer a farming question"""
        user_id = update.effective_user.id
        username = update.effective_user.username or "unknown"
        
        logger.info(f"📝 Processing question from user {user_id} (@{username}): {question[:100]}...")
        
        try:
            await self._send_typing(update.message)
            
            # Rate limiting check
            if not await self._check_rate_limit(user_id):
                await update.message.reply_text("⏰ Too many requests. Please wait a minute.", reply_markup=main_menu_button())
                return
            
            # Get user context
            location = context.user_data.get('location', 'Ghana')
            crop_type = context.user_data.get('crops', 'maize')
            
            logger.info(f"🌍 User context - Location: {location}, Crop: {crop_type}")
            
            # Try orchestrator first
            if self.orchestrator:
                logger.info("🤖 Using orchestrator to process query...")
                try:
                    result = await self.orchestrator.process_farmer_query(
                        query=question,
                        location=location,
                        crop_type=crop_type,
                        user_id=str(user_id)
                    )
                    
                    response_text = result.get('response', 'No response generated.')
                    confidence = result.get('confidence', 0.5)
                    
                    logger.info(f"✅ Orchestrator responded - Confidence: {confidence:.2f}")
                    logger.info(f"📤 Response preview: {response_text[:100]}...")
                    
                    response_text = _sanitize_outgoing(response_text)
                    await update.message.reply_text(response_text)
                    await update.message.reply_text("How was this response?", reply_markup=feedback_poll_keyboard())
                    
                    # Fixed logging - use actual confidence value
                    try:
                        log_event(
                            "question_answered",
                            user_id,
                            username,
                            context.user_data.get("language", "en"),
                            location,
                            json.dumps({"question": question[:100], "confidence": confidence, "method": "orchestrator"})
                        )
                    except Exception as log_error:
                        logger.warning(f"Logging failed: {log_error}")
                    
                    return
                    
                except Exception as orch_error:
                    logger.error(f"❌ Orchestrator failed: {orch_error}")
                    # Continue to fallback
            
            # Fallback to simple LLM
            logger.info("🔄 Using fallback LLM handler...")
            try:
                from src.llm_handler import LLMHandler
                llm = LLMHandler()
                
                simple_response = llm.generate_with_rag(
                    query=question,
                    contexts=[{"text": f"Farming advice for {crop_type} in {location}, Ghana."}],
                    farmer_context={"location": location, "crops": crop_type}
                )
                
                logger.info(f"✅ Fallback LLM responded: {simple_response[:100]}...")
                
                await update.message.reply_text(_sanitize_outgoing(simple_response))
                await update.message.reply_text("How was this response?", reply_markup=feedback_poll_keyboard())
                
                # Log fallback usage
                try:
                    log_event(
                        "question_answered",
                        user_id,
                        username,
                        context.user_data.get("language", "en"),
                        location,
                        json.dumps({"question": question[:100], "confidence": 0.6, "method": "fallback"})
                    )
                except Exception as log_error:
                    logger.warning(f"Fallback logging failed: {log_error}")
                
                return
                
            except Exception as fallback_error:
                logger.error(f"❌ Fallback LLM also failed: {fallback_error}")
        
        except Exception as e:
            logger.error(f"❌ Complete answer failure: {e}")
            
        # Final fallback - simple response
        await update.message.reply_text(
            f"I understand you're asking about {question[:50]}{'...' if len(question) > 50 else ''}. "
            f"I'm having technical difficulties right now. Please try again in a moment, or contact "
            f"your local agricultural extension office for immediate help.",
            reply_markup=retry_keyboard()
        )

    # ---------- Command Handlers ----------
    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        logger.info(f"👋 User {user.id} (@{user.username}) started bot")
        
        context.user_data.setdefault("language", "en")
        
        try:
            log_event("user_start", user.id, user.username, context.user_data["language"], 
                     context.user_data.get("location"), json.dumps({"app_version": APP_VERSION}))
        except Exception as e:
            logger.warning(f"Start logging failed: {e}")
        
        await update.message.reply_text(
            t(context, "welcome", name=(user.first_name or "farmer")),
            reply_markup=main_menu()
        )

    async def help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.message.reply_text(
            "❓ Help\n• Use the menu buttons or ask farming questions directly\n• Share location for better advice\n• Try: 'maize fertilizer in Kumasi'",
            reply_markup=main_menu_button()
        )

    async def stop(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.message.reply_text(
            t(context, "stopped"),
            reply_markup=main_menu()
        )

    async def profile(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        ud = context.user_data
        text = (
            "👤 Your Profile\n"
            f"📍 Location: {ud.get('location', 'Not set')}\n"
            f"🌾 Crops: {ud.get('crops', 'Not set')}\n"
            f"🌐 Language: {ud.get('language', 'en')}\n"
        )
        await update.message.reply_text(text, reply_markup=main_menu_button())

    # ---------- Message Handlers ----------
    async def on_location(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        try:
            loc = update.message.location
            if loc:
                lat, lon = float(loc.latitude), float(loc.longitude)
                context.user_data["coords"] = {"lat": lat, "lon": lon}
                context.user_data["location"] = f"{lat:.4f},{lon:.4f}"
                
                await update.message.reply_text(
                    f"📍 Location received: {lat:.4f},{lon:.4f}",
                    reply_markup=main_menu_button()
                )
        except Exception as e:
            logger.error(f"Location error: {e}")
            await update.message.reply_text("📍 Location received.", reply_markup=main_menu_button())

    async def on_button(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        query = update.callback_query
        data = (query.data or "").strip().lower()
        
        logger.info(f"🔘 Button pressed: {data}")
        
        try:
            await query.answer()
        except Exception:
            pass

        try:
            if data == "menu":
                await query.edit_message_text("Main menu:", reply_markup=main_menu())
            elif data == "ask":
                context.user_data["awaiting_question"] = True
                await query.edit_message_text(t(context, "ask_prompt"))
            elif data == "weather":
                await query.edit_message_text("🌦️ Weather feature coming soon...")
            else:
                await query.edit_message_text("Feature coming soon...", reply_markup=main_menu())
                
        except Exception as e:
            logger.error(f"Button handler error: {e}")
            await query.edit_message_text("Error occurred.", reply_markup=main_menu())

    async def on_text(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """CRITICAL: Main text message handler"""
        user_message = (update.message.text or "").strip()
        user = update.effective_user
        
        # LOG EVERY MESSAGE RECEIVED
        logger.info(f"💬 TEXT MESSAGE from user {user.id} (@{user.username}): '{user_message}'")
        
        if not user_message:
            logger.warning("❌ Empty message received")
            return
        
        # Store in conversation history
        history = context.user_data.get('history', [])
        history.append(user_message[:100])
        if len(history) > 10:
            history = history[-10:]
        context.user_data['history'] = history
        
        try:
            # 1. Check for small talk first
            lang = context.user_data.get("language", "en")
            small_talk_response = _maybe_small_talk(user_message, lang)
            if small_talk_response:
                logger.info(f"🗣️ Responding to small talk: {small_talk_response[:50]}...")
                await update.message.reply_text(small_talk_response)
                await update.message.reply_text("Main menu:", reply_markup=main_menu_button())
                return

            # 2. Check if awaiting question from Ask button
            if context.user_data.get("awaiting_question", False):
                logger.info("❓ Processing awaited question...")
                context.user_data["awaiting_question"] = False
                await self._answer_question(update, context, user_message)
                return

            # 3. Check for simple location input
            if (len(user_message) < 32 and 
                not any(c in user_message for c in "?!@#$%^&*0123456789") and 
                user_message.lower() not in ("yes", "no", "agree")):
                
                logger.info(f"🌍 Treating as location: {user_message}")
                context.user_data["location"] = user_message.title()
                await update.message.reply_text(f"📍 Location set to: {user_message.title()}")
                await update.message.reply_text("Main menu:", reply_markup=main_menu_button())
                return

            # 4. Default: Treat as farming question
            logger.info("🌾 Treating as farming question...")
            await self._answer_question(update, context, user_message)

        except Exception as e:
            logger.error(f"❌ Critical error in on_text: {e}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            
            try:
                await update.message.reply_text(
                    "⚠️ I'm having trouble processing your message. Please try again.",
                    reply_markup=main_menu_button()
                )
            except Exception as send_error:
                logger.error(f"Failed to send error response: {send_error}")


# Test function to verify imports
def test_imports():
    """Test that all required modules can be imported"""
    try:
        from src.llm_handler import LLMHandler
        print("✅ LLMHandler import OK")
    except Exception as e:
        print(f"❌ LLMHandler import failed: {e}")
    
    try:
        if ORCHESTRATOR_AVAILABLE:
            print("✅ Orchestrator available")
        else:
            print("❌ Orchestrator not available")
    except Exception as e:
        print(f"❌ Orchestrator check failed: {e}")

if __name__ == "__main__":
    test_imports()