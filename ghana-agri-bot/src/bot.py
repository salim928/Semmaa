# Main Telegram bot logic
"""
Main Telegram Bot Implementation
Purpose: Handle all Telegram interactions, commands, and message routing
"""

import logging
import time
import json
from datetime import datetime
from typing import Optional, Dict
from pathlib import Path
from src.orchestrator import MultiAgentOrchestrator

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, MessageHandler, 
    filters, ContextTypes, CallbackQueryHandler
)

from config.settings import TELEGRAM_BOT_TOKEN, RESPONSE_TIMEOUT
from config.prompts import GREETING_MESSAGE, GUIDELINE_MESSAGE, HELP_MESSAGE, ERROR_MESSAGES
from src.llm_handler import LLMHandler
from src.knowledge_base import KnowledgeBase
from src.data_collector import DataCollector
from src.utils import detect_location, extract_crop_info, format_response
from scripts.farmer_onboarding import onboard_farmer

logger = logging.getLogger(__name__)

class GhanaAgriBot:
    def __init__(self):
        """Initialize the bot with all components"""
        self.llm_handler = LLMHandler()
        self.knowledge_base = KnowledgeBase()
        self.data_collector = DataCollector()
        
        try:
            self.orchestrator = MultiAgentOrchestrator()
            self.orchestrator_available = True
            logger.info("Multi-agent orchestrator initialized")
        except Exception as e:
            logger.warning(f"Orchestrator not available: {e}")
            self.orchestrator_available = False
        
        # Store user contexts for follow-up questions
        self.user_contexts = {}
        self.pending_consent = set()  # Track users awaiting consent
        
        # Initialize the bot application
        self.application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Set up all command and message handlers"""
        # Command handlers
        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CommandHandler("feedback", self.feedback_command))
        self.application.add_handler(CommandHandler("weather", self.weather_command))
        self.application.add_handler(CommandHandler("metrics", self.metrics_command))
        self.application.add_handler(CommandHandler("satellite", self.satellite_command))
        self.application.add_handler(CommandHandler("stop", self.stop_command))
        self.application.add_handler(CommandHandler("location", self.location_command))
        self.application.add_handler(CommandHandler("guideline", self.guideline_command))

        # Message handler for farming questions
        self.application.add_handler(MessageHandler(
            filters.TEXT & ~filters.COMMAND, self.handle_message))

        # Callback handler for inline buttons
        self.application.add_handler(CallbackQueryHandler(self.handle_callback))

        # Error handler
        self.application.add_error_handler(self.error_handler)
    
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        user = update.effective_user

        # Check if already onboarded
        if self._is_user_onboarded(user.id):
            await update.message.reply_text("✅ You are already onboarded. Welcome back!")
            return

        # Prompt for consent (simple version)
        consent_message = (
            "📋 *Consent Required*\n\n"
            "To use this service, you must agree to our data policy. "
            "We store your Telegram ID (masked), location, and crop info to improve advice. "
            "Your data is never shared without permission.\n\n"
            "Please reply with 'I AGREE' to continue."
        )
        await update.message.reply_text(consent_message, parse_mode='Markdown')
        self.pending_consent.add(user.id)

    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command"""
        await update.message.reply_text(
            HELP_MESSAGE,
            parse_mode=None
        )
    
    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle farming questions from users"""
        user = update.effective_user
        message_text = update.message.text

        # Check for pending consent
        if user.id in self.pending_consent:
            text = message_text.strip().upper()
            if text == "I AGREE":
                onboarding_result = onboard_farmer(
                    user_id=user.id,
                    phone_number=str(user.id),
                    consent_given=True,
                    location=None,
                    crop_type=None
                )
                self.pending_consent.remove(user.id)
                if "error" in onboarding_result:
                    await update.message.reply_text(
                        onboarding_result["error"],
                        parse_mode=None
                    )
                    return

                # Log new user
                self.data_collector.update_user_profile(
                    user_id=user.id,
                    username=user.username or user.first_name
                )

                await update.message.reply_text(
                    "✅ Thank you for consenting! You are now onboarded.\n"
                    "Type /help to see what I can do.",
                    parse_mode=None
                )

                logger.info(f"New user onboarded: {user.id} - {user.username}")
                return
            else:
                await update.message.reply_text("Please reply with 'I AGREE' to continue.")
                return

        # Show typing indicator
        await context.bot.send_chat_action(
            chat_id=update.effective_chat.id, 
            action="typing"
        )

        try:
            start_time = time.time()

            # NEW: Check if we should use orchestrator
            use_orchestrator = (
                self.orchestrator_available and 
                await self.orchestrator.should_use_orchestrator(message_text)
            )

            if use_orchestrator:
                # Use multi-agent orchestrator for complex queries
                logger.info(f"Using orchestrator for: {message_text[:50]}...")

                # Get user context
                user_location = self.user_contexts.get(user.id, {}).get('location', 'Kumasi')
                user_crop = self.user_contexts.get(user.id, {}).get('crop', 'maize')

                # Process with orchestrator
                result = await self.orchestrator.process_farmer_query(
                    query=message_text,
                    location=user_location,
                    crop_type=user_crop,
                    user_id=str(user.id)
                )

                response = result['response']
                confidence = result.get('confidence', 'unknown')

                # Log orchestrator usage
                logger.info(f"Orchestrator response confidence: {confidence}")

            else:
                # Use simple LLM for basic queries
                logger.info(f"Using simple LLM for: {message_text[:50]}...")

                # Get user context if exists
                user_context = self.user_contexts.get(user.id, {})

                # Extract location from message if mentioned
                location = detect_location(message_text)
                if location:
                    user_context['location'] = location

                # Get relevant context from knowledge base
                kb_context = self.knowledge_base.get_context_for_query(message_text)

                # Build full context for LLM
                full_context = {
                    "location": user_context.get("location"),
                    "previous_query": user_context.get("last_query"),
                    "knowledge_base": kb_context
                }

                # Generate response using LLM
                response, confidence = self.llm_handler.generate_response(
                    query=message_text,
                    context=full_context
                )

            response_time = time.time() - start_time

            # Format response with markdown
            formatted_response = format_response(response)

            # Send response with feedback buttons
            keyboard = InlineKeyboardMarkup([
                [
                    InlineKeyboardButton("👍", callback_data=f"feedback_pos_{user.id}"),
                    InlineKeyboardButton("👎", callback_data=f"feedback_neg_{user.id}")
                ],
                [
                    InlineKeyboardButton("📍 Add Location", callback_data=f"location_{user.id}"),
                    InlineKeyboardButton("🌾 My Crops", callback_data=f"crops_{user.id}")
                ]
            ])

            await update.message.reply_text(
                formatted_response,
                parse_mode=None,
                reply_markup=keyboard
            )

            # Generate and send follow-up questions
            followup_questions = self.llm_handler.generate_followup_questions(
                message_text, response
            )

            if followup_questions:
                followup_text = "❓ *You might also want to know:*\n"
                for i, question in enumerate(followup_questions, 1):
                    followup_text += f"{i}. {question}\n"

                await update.message.reply_text(
                    followup_text,
                    parse_mode=None
                )

            # Update user context
            self.user_contexts[user.id] = {
                "last_query": message_text,
                "last_response": response,
                "location": self.user_contexts.get(user.id, {}).get("location"),
                "timestamp": datetime.now()
            }

            # Log interaction
            self.data_collector.log_interaction(
                user_id=user.id,
                username=user.username or user.first_name,
                query=message_text,
                response=response,
                confidence=confidence,
                response_time=response_time
            )

            logger.info(f"Responded to user {user.id} in {response_time:.2f}s")

        except Exception as e:
            logger.error(f"Error handling message: {e}")
            await update.message.reply_text(
                ERROR_MESSAGES.get("api_error", "Sorry, something went wrong."),
                parse_mode=None
            )
    
    async def handle_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle inline button callbacks"""
        query = update.callback_query
        await query.answer()
        
        callback_data = query.data
        
        if callback_data.startswith("feedback_"):
            await self._handle_feedback(query, callback_data)
        elif callback_data.startswith("location_"):
            await self._handle_location(query, callback_data)
        elif callback_data.startswith("crops_"):
            await self._handle_crops(query, callback_data)
    
    async def _handle_feedback(self, query, callback_data):
        """Handle feedback buttons"""
        parts = callback_data.split("_")
        feedback_type = parts[1]  # pos or neg
        user_id = int(parts[2])
        
        user_context = self.user_contexts.get(user_id, {})
        
        # Log feedback
        self.data_collector.log_feedback(
            user_id=user_id,
            query=user_context.get("last_query", ""),
            response=user_context.get("last_response", ""),
            rating="positive" if feedback_type == "pos" else "negative"
        )
        
        # Update knowledge base for positive feedback
        if feedback_type == "pos":
            self.knowledge_base.update_from_feedback(
                query=user_context.get("last_query", ""),
                response=user_context.get("last_response", ""),
                feedback="positive"
            )
            await query.edit_message_text(
                query.message.text + "\n\n✅ Thanks for your positive feedback!",
                parse_mode=None
            )
        else:
            await query.edit_message_text(
                query.message.text + "\n\n📝 Thanks for your feedback. We'll improve our responses!",
                parse_mode=None
            )
    
    async def _handle_location(self, query, callback_data):
        """Handle location button"""
        await query.message.reply_text(
            "📍 *Please share your location:*\n\n"
            "Type your region (e.g., 'Ashanti', 'Greater Accra') "
            "or nearest city (e.g., 'Kumasi', 'Tamale')",
            parse_mode=None
        )
    
    async def _handle_crops(self, query, callback_data):
        """Handle crops button"""
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("🌽 Maize", callback_data="crop_maize"),
                InlineKeyboardButton("🍫 Cocoa", callback_data="crop_cocoa")
            ],
            [
                InlineKeyboardButton("🥔 Cassava", callback_data="crop_cassava"),
                InlineKeyboardButton("🍅 Tomato", callback_data="crop_tomato")
            ],
            [
                InlineKeyboardButton("🌾 Rice", callback_data="crop_rice"),
                InlineKeyboardButton("🥜 Groundnut", callback_data="crop_groundnut")
            ]
        ])
        
        await query.message.reply_text(
            "🌾 *Select your main crops:*",
            parse_mode=None,
            reply_markup=keyboard
        )
    
    async def feedback_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /feedback command"""
        await update.message.reply_text(
            "📝 *How to provide feedback:*\n\n"
            "After each response, use the 👍 or 👎 buttons.\n\n"
            "For detailed feedback, message us:\n"
            "`Please improve the advice about [topic]`\n\n"
            "Your feedback helps us improve!",
            parse_mode=None
        )
    
    async def weather_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /weather command - show actual weather"""
        user = update.effective_user
        location = self.user_contexts.get(user.id, {}).get('location', 'Kumasi')
        
        # Use orchestrator for weather
        if self.orchestrator_available:
            result = await self.orchestrator.process_farmer_query(
                query=f"What is the weather forecast for farming in {location}?",
                location=location,
                user_id=str(user.id)
            )
            response = result['response']
        else:
            # Fallback weather info
            response = f"""🌤️ **Weather for {location}**
        
Temperature: 28°C
Humidity: 75%
Forecast: Partly cloudy with chance of rain
Rain expected: In 3 days

**Farming Advisory:**
- Good conditions for planting
- Apply fertilizer before the rain
- Monitor for fungal diseases due to humidity"""
        
        await update.message.reply_text(response, parse_mode='Markdown')
    
    async def metrics_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /metrics command - show bot statistics"""
        metrics = self.data_collector.get_metrics_summary()
        
        metrics_text = f"""📊 *Bot Statistics*

👥 Total Users: {metrics['total_users']}
💬 Total Queries: {metrics['total_queries']}
⚡ Avg Response Time: {metrics['avg_response_time']}s
👍 Positive Feedback: {metrics['positive_feedback_rate']}%

Thank you for using Ghana Farming Advisor!"""
        
        await update.message.reply_text(metrics_text, parse_mode=None)
    
    async def error_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle errors"""
        logger.error(f"Update {update} caused error: {context.error}")
        
        if update and update.effective_message:
            await update.effective_message.reply_text(
                ERROR_MESSAGES.get("unknown_error"),
                parse_mode=None
            )
    
    async def satellite_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /satellite command - show farm analysis"""
        user = update.effective_user
        user_id = user.id

        await context.bot.send_chat_action(
            chat_id=update.effective_chat.id,
            action="typing"
        )

        user_location = self.user_contexts.get(user_id, {}).get('location')
        user_crop = self.user_contexts.get(user_id, {}).get('crop', 'maize')

        if not user_location:
            # Set pending command
            if user_id not in self.user_contexts:
                self.user_contexts[user_id] = {}
            self.user_contexts[user_id]['pending_command'] = "satellite"
            await update.message.reply_text(
                "📍 Please set your location first!\n\nSend: /location Kumasi\nOr just tell me: 'I farm in Kumasi'"
            )
            return

        # Force orchestrator for satellite command
        if self.orchestrator_available:
            result = await self.orchestrator.process_farmer_query(
                query=f"Check my {user_crop} farm health using satellite",
                location=user_location,
                crop_type=user_crop,
                user_id=str(user.id)
            )

            response = f"🛰️ **Satellite Farm Analysis**\n\n{result['response']}"
        else:
            response = "Satellite analysis not available. Please try again later."

        await update.message.reply_text(response, parse_mode='Markdown')
        
        # Clear pending command if it was set
        self.user_contexts[user_id].pop('pending_command', None)
        
    async def stop_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /stop command - ends conversation"""
        user = update.effective_user
        
        # Clear user context
        if user.id in self.user_contexts:
            del self.user_contexts[user.id]
        
        await update.message.reply_text(
            "👋 Thank you for using Ghana Agricultural Bot!\n\n"
            "Your session has been ended.\n"
            "Type /start to begin again anytime.\n\n"
            "🌾 Happy farming!"
        )
        
        logger.info(f"User {user.id} ended their session")
    
    async def location_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /location command"""
        user = update.effective_user
        user_id = user.id

        # Check if location provided
        if context.args:
            location = ' '.join(context.args)

            # Save location
            if user.id not in self.user_contexts:
                self.user_contexts[user.id] = {}

            self.user_contexts[user.id]['location'] = location

            await update.message.reply_text(
                f"✅ Location set to: **{location}**\n\n"
                f"Now you can:\n"
                f"• Use /satellite to check your farm\n"
                f"• Use /weather for local forecast\n"
                f"• Ask any farming question!",
                parse_mode='Markdown'
            )

            # Check for pending command
            pending = self.user_contexts[user_id].pop('pending_command', None)
            if pending == "satellite":
                await self.satellite_command(update, context)

        else:
            await update.message.reply_text(
                "Please specify your location:\n"
                "/location Kumasi\n"
                "/location Tamale\n"
                "/location Accra"
            )
    
    async def guideline_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /guideline command"""
        await update.message.reply_text(GUIDELINE_MESSAGE, parse_mode='Markdown')
    
    def run(self):
        """Run the bot"""
        logger.info("Starting Ghana Agricultural Bot...")
        self.application.run_polling(allowed_updates=Update.ALL_TYPES)
    
    def _is_user_onboarded(self, user_id):
        onboarding_file = Path("data/feedback/farmer_onboarding.jsonl")
        if not onboarding_file.exists():
            return False
        with onboarding_file.open("r", encoding="utf-8") as f:
            for line in f:
                try:
                    record = json.loads(line)
                    if record.get("user_id") == user_id:
                        return True
                except Exception:
                    continue
        return False