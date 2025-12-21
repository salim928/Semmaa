"""
Streamlined user onboarding system for Ghana AgriBOT
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import ContextTypes
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class UserOnboarding:
    def __init__(self):
        """Initialize onboarding system"""
        self.onboarding_dir = Path("data/onboarding")
        self.onboarding_dir.mkdir(exist_ok=True)
        
        # Ghana regions and common locations
        self.ghana_regions = {
            'Greater Accra': ['Accra', 'Tema', 'Kasoa', 'Madina', 'Legon'],
            'Ashanti': ['Kumasi', 'Obuasi', 'Konongo', 'Mampong', 'Ejisu'],
            'Western': ['Takoradi', 'Tarkwa', 'Axim', 'Half Assini', 'Elubo'],
            'Central': ['Cape Coast', 'Elmina', 'Winneba', 'Kasoa', 'Swedru'],
            'Eastern': ['Koforidua', 'Akosombo', 'Nkawkaw', 'Akim Oda', 'Suhum'],
            'Northern': ['Tamale', 'Yendi', 'Savelugu', 'Gushegu', 'Karaga'],
            'Upper East': ['Bolgatanga', 'Navrongo', 'Bawku', 'Zebilla', 'Paga'],
            'Upper West': ['Wa', 'Lawra', 'Jirapa', 'Tumu', 'Nandom'],
            'Volta': ['Ho', 'Hohoe', 'Keta', 'Aflao', 'Kpando'],
            'Bono': ['Sunyani', 'Berekum', 'Dormaa Ahenkro', 'Wenchi', 'Techiman'],
            'Bono East': ['Techiman', 'Atebubu', 'Nkoranza', 'Kintampo', 'Yeji'],
            'Ahafo': ['Goaso', 'Bechem', 'Hwidiem', 'Kukuom', 'Mim'],
            'Western North': ['Sefwi Wiawso', 'Bibiani', 'Bodi', 'Juaboso', 'Akontombra'],
            'Savannah': ['Damongo', 'Bole', 'Salaga', 'Buipe', 'Daboya'],
            'North East': ['Nalerigu', 'Gambaga', 'Walewale', 'Chereponi', 'Yunyoo'],
            'Oti': ['Dambai', 'Nkwanta', 'Kadjebi', 'Jasikan', 'Kpassa']
        }
        
        # Common Ghana crops
        self.ghana_crops = {
            'Staples': ['Maize', 'Rice', 'Cassava', 'Yam', 'Plantain', 'Cocoyam'],
            'Legumes': ['Cowpea', 'Groundnut', 'Soybean', 'Bambara Beans'],
            'Cash Crops': ['Cocoa', 'Oil Palm', 'Coconut', 'Rubber', 'Cashew'],
            'Vegetables': ['Tomato', 'Pepper', 'Onion', 'Okra', 'Garden Egg', 'Cabbage'],
            'Fruits': ['Mango', 'Orange', 'Pineapple', 'Banana', 'Pawpaw', 'Avocado']
        }

    async def start_onboarding(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
        """Start the onboarding process"""
        user = update.effective_user
        
        welcome_message = f"""
🌾 **Welcome to SemmaAI, {user.first_name}!**

I'm your personal agricultural assistant, here to help you with:
• 🌱 Crop planning and planting advice
• 🐛 Pest and disease management
• 🌧️ Weather-based farming decisions
• 💰 Market timing and pricing
• 🌱 Soil fertility recommendations

Let's set up your profile so I can give you personalized advice!

**Step 1 of 4: What's your location?**
Please choose your region first:
        """
        
        # Create region selection keyboard
        keyboard = []
        regions = list(self.ghana_regions.keys())
        
        # Create rows of 2 regions each
        for i in range(0, len(regions), 2):
            row = [InlineKeyboardButton(regions[i], callback_data=f"region_{regions[i]}")]
            if i + 1 < len(regions):
                row.append(InlineKeyboardButton(regions[i + 1], callback_data=f"region_{regions[i + 1]}"))
            keyboard.append(row)
        
        # Add skip option
        keyboard.append([InlineKeyboardButton("📍 Enter Custom Location", callback_data="custom_location")])
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(welcome_message, parse_mode='Markdown', reply_markup=reply_markup)
        
        await update.message.reply_text(
            "🔒 *Your information is used only to provide personalized farming advice and is never shared with third parties.*",
            parse_mode='Markdown'
        )
        
        # Initialize onboarding state
        context.user_data['onboarding'] = {
            'step': 'location',
            'user_id': user.id,
            'username': user.username or user.first_name,
            'started': datetime.now().isoformat()
        }
        
        return 'ONBOARDING_LOCATION'

    async def handle_region_selection(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
        """Handle region selection"""
        query = update.callback_query
        await query.answer()
        
        if query.data == "custom_location":
            await query.edit_message_text(
                "📍 **Enter Your Location**\n\n"
                "Please type your town, city, or area name:\n"
                "Example: `Kumasi` or `Tamale` or `Cape Coast`",
                parse_mode='Markdown'
            )
            context.user_data['onboarding']['waiting_for'] = 'custom_location'
            return 'ONBOARDING_CUSTOM_LOCATION'
        
        # Extract region from callback data
        region = query.data.replace("region_", "")
        context.user_data['onboarding']['region'] = region
        
        # Show cities in that region
        cities = self.ghana_regions.get(region, [])
        
        keyboard = []
        for i in range(0, len(cities), 2):
            row = [InlineKeyboardButton(cities[i], callback_data=f"city_{cities[i]}")]
            if i + 1 < len(cities):
                row.append(InlineKeyboardButton(cities[i + 1], callback_data=f"city_{cities[i + 1]}"))
            keyboard.append(row)
        
        keyboard.append([InlineKeyboardButton("📝 Enter Different City", callback_data="custom_city")])
        keyboard.append([InlineKeyboardButton("◀️ Back to Regions", callback_data="back_to_regions")])
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            f"🏘️ **Select your city/town in {region}:**",
            parse_mode='Markdown',
            reply_markup=reply_markup
        )
        
        return 'ONBOARDING_CITY'

    async def handle_city_selection(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
        """Handle city selection"""
        query = update.callback_query
        await query.answer()
        
        if query.data == "custom_city":
            await query.edit_message_text(
                "📍 **Enter Your City/Town**\n\n"
                "Please type your specific location:",
                parse_mode='Markdown'
            )
            context.user_data['onboarding']['waiting_for'] = 'custom_city'
            return 'ONBOARDING_CUSTOM_CITY'
        elif query.data == "back_to_regions":
            return await self.start_onboarding(update, context)
        
        # Extract city from callback data
        city = query.data.replace("city_", "")
        context.user_data['onboarding']['location'] = city
        
        return await self.ask_farming_experience(update, context)

    async def handle_custom_location(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
        """Handle custom location input"""
        location = update.message.text.strip().title()
        context.user_data['onboarding']['location'] = location
        context.user_data['onboarding']['region'] = 'Custom'
        
        await update.message.reply_text(
            f"📍 Great! I've set your location as **{location}**",
            parse_mode='Markdown'
        )
        
        return await self.ask_farming_experience(update, context)

    async def ask_farming_experience(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
        """Ask about farming experience"""
        
        experience_keyboard = [
            [InlineKeyboardButton("🌱 New to Farming (0-1 years)", callback_data="exp_beginner")],
            [InlineKeyboardButton("👨‍🌾 Some Experience (2-5 years)", callback_data="exp_intermediate")],
            [InlineKeyboardButton("🎓 Experienced Farmer (6+ years)", callback_data="exp_advanced")],
            [InlineKeyboardButton("🏛️ Agricultural Professional", callback_data="exp_professional")]
        ]
        
        reply_markup = InlineKeyboardMarkup(experience_keyboard)
        
        message = """
**Step 2 of 4: What's your farming experience?**

This helps me provide advice at the right level for you:
        """
        
        if hasattr(update, 'callback_query') and update.callback_query:
            await update.callback_query.edit_message_text(message, parse_mode='Markdown', reply_markup=reply_markup)
        else:
            await update.message.reply_text(message, parse_mode='Markdown', reply_markup=reply_markup)
        
        return 'ONBOARDING_EXPERIENCE'

    async def handle_experience_selection(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
        """Handle experience level selection"""
        query = update.callback_query
        await query.answer()
        
        experience_map = {
            'exp_beginner': 'beginner',
            'exp_intermediate': 'intermediate', 
            'exp_advanced': 'advanced',
            'exp_professional': 'professional'
        }
        
        experience = experience_map.get(query.data, 'intermediate')
        context.user_data['onboarding']['experience'] = experience
        
        return await self.ask_farm_details(update, context)

    async def ask_farm_details(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
        """Ask about farm details"""
        
        farm_size_keyboard = [
            [InlineKeyboardButton("🏡 Small Scale (< 2 acres)", callback_data="size_small")],
            [InlineKeyboardButton("🚜 Medium Scale (2-10 acres)", callback_data="size_medium")],
            [InlineKeyboardButton("🏭 Large Scale (10+ acres)", callback_data="size_large")],
            [InlineKeyboardButton("🌱 Container/Home Garden", callback_data="size_container")]
        ]
        
        reply_markup = InlineKeyboardMarkup(farm_size_keyboard)
        
        message = """
**Step 3 of 4: What's your farm size?**

This helps me recommend appropriate techniques and resources:
        """
        
        await update.callback_query.edit_message_text(message, parse_mode='Markdown', reply_markup=reply_markup)
        
        return 'ONBOARDING_FARM_SIZE'

    async def handle_farm_size_selection(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
        """Handle farm size selection"""
        query = update.callback_query
        await query.answer()
        
        size_map = {
            'size_small': 'small-scale',
            'size_medium': 'medium-scale',
            'size_large': 'large-scale',
            'size_container': 'container'
        }
        
        farm_size = size_map.get(query.data, 'small-scale')
        context.user_data['onboarding']['farm_size'] = farm_size
        
        return await self.ask_crops_interest(update, context)

    async def ask_crops_interest(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
        """Ask about crops of interest"""
        
        message = """
**Step 4 of 4: What crops are you interested in?**

Select the categories that interest you most (you can choose multiple):
        """
        
        # Create crop category keyboard
        keyboard = []
        for category in self.ghana_crops.keys():
            keyboard.append([InlineKeyboardButton(f"🌾 {category}", callback_data=f"crop_cat_{category}")])
        
        keyboard.append([InlineKeyboardButton("✅ I'm Done Selecting", callback_data="crops_done")])
        keyboard.append([InlineKeyboardButton("🌱 All Crops Interest Me", callback_data="crops_all")])
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.callback_query.edit_message_text(message, parse_mode='Markdown', reply_markup=reply_markup)
        
        # Initialize crop selections
        if 'crop_interests' not in context.user_data['onboarding']:
            context.user_data['onboarding']['crop_interests'] = []
        
        return 'ONBOARDING_CROPS'

    async def handle_crop_selection(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
        """Handle crop category selection"""
        query = update.callback_query
        await query.answer()
        
        if query.data == "crops_done":
            return await self.complete_onboarding(update, context)
        elif query.data == "crops_all":
            context.user_data['onboarding']['crop_interests'] = list(self.ghana_crops.keys())
            return await self.complete_onboarding(update, context)
        
        # Handle category selection
        category = query.data.replace("crop_cat_", "")
        crop_interests = context.user_data['onboarding']['crop_interests']
        
        if category in crop_interests:
            crop_interests.remove(category)
            action = "removed from"
        else:
            crop_interests.append(category)
            action = "added to"
        
        # Update the message to show selections
        selected_crops = ", ".join(crop_interests) if crop_interests else "None selected"
        
        message = f"""
**Step 4 of 4: What crops are you interested in?**

**Currently selected:** {selected_crops}

Select categories to add/remove:
        """
        
        # Recreate keyboard with updated selections
        keyboard = []
        for cat in self.ghana_crops.keys():
            emoji = "✅" if cat in crop_interests else "🌾"
            keyboard.append([InlineKeyboardButton(f"{emoji} {cat}", callback_data=f"crop_cat_{cat}")])
        
        keyboard.append([InlineKeyboardButton("✅ I'm Done Selecting", callback_data="crops_done")])
        keyboard.append([InlineKeyboardButton("🌱 All Crops Interest Me", callback_data="crops_all")])
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(message, parse_mode='Markdown', reply_markup=reply_markup)
        
        # Show feedback
        await query.answer(f"✅ {category} {action} your interests!")
        
        return 'ONBOARDING_CROPS'

    async def complete_onboarding(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
        """Complete the onboarding process"""
        query = update.callback_query
        await query.answer()
        
        onboarding_data = context.user_data['onboarding']
        
        # Get selected crops
        crop_interests = onboarding_data.get('crop_interests', [])
        if not crop_interests:
            crop_interests = ['Staples']  # Default to staples
        
        # Create user profile
        user_profile = {
            'user_id': onboarding_data['user_id'],
            'username': onboarding_data['username'],
            'location': onboarding_data.get('location', 'Ghana'),
            'region': onboarding_data.get('region', 'Unknown'),
            'experience': onboarding_data.get('experience', 'intermediate'),
            'farm_size': onboarding_data.get('farm_size', 'small-scale'),
            'crop_interests': crop_interests,
            'onboarding_completed': datetime.now().isoformat(),
            'profile_version': '1.0'
        }
        
        # Save user profile
        self.save_user_profile(user_profile)
        
        # Generate personalized summary
        location = user_profile['location']
        experience = user_profile['experience']
        farm_size = user_profile['farm_size']
        crops = ", ".join(crop_interests)
        
        completion_message = f"""
🎉 **Welcome to Ghana AgriBOT!**

**Your profile is now set up:**
📍 **Location:** {location}
👨‍🌾 **Experience:** {experience.title()}
🚜 **Farm Size:** {farm_size.replace('-', ' ').title()}
🌾 **Crop Interests:** {crops}

**You're all set!** Here's what you can do now:

🌱 **Ask farming questions** - Just type your question
🌦️ **Get weather updates** - Type `/weather`
📊 **View your metrics** - Type `/metrics`
📍 **Update location** - Type `/location`
❓ **Need help** - Type `/help`

**Example questions to try:**
• "When should I plant maize in {location}?"
• "How do I control pests on my tomatoes?"
• "What fertilizer is best for cassava?"

Ready to help you grow! 🌾
        """
        
        # Create quick action keyboard
        quick_actions = [
            [InlineKeyboardButton("🌦️ Check Weather", callback_data="quick_weather")],
            [InlineKeyboardButton("🌱 Planting Advice", callback_data="quick_planting")],
            [InlineKeyboardButton("🐛 Pest Control", callback_data="quick_pest")],
            [InlineKeyboardButton("❓ Help & Tips", callback_data="quick_help")]
        ]
        
        reply_markup = InlineKeyboardMarkup(quick_actions)
        
        await query.edit_message_text(completion_message, parse_mode='Markdown', reply_markup=reply_markup)
        
        # Clear onboarding state
        context.user_data.pop('onboarding', None)
        
        # Log successful onboarding
        logger.info(f"User {user_profile['user_id']} completed onboarding: {location}, {experience}, {farm_size}")
        
        return 'ONBOARDING_COMPLETE'

    def save_user_profile(self, user_id: int, user_profile: dict) -> bool:
        """Save user profile to storage"""
        try:
            # Save profile to JSON file
            profile_file = self.onboarding_dir / f"user_{user_id}.json"
            with open(profile_file, 'w', encoding='utf-8') as f:
                json.dump(user_profile, f, indent=2, default=str, ensure_ascii=False)
            
            logger.info(f"Saved profile for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving user profile: {e}")
            return False
    
    def get_user_profile(self, user_id: int) -> Optional[dict]:
        """Get user profile from storage"""
        try:
            profile_file = self.onboarding_dir / f"user_{user_id}.json"
            if profile_file.exists():
                with open(profile_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return {}
        except Exception as e:
            logger.error(f"Error loading user profile: {e}")
            return {}
    
    def is_onboarded(self, user_id: int) -> bool:
        """Check if user has completed onboarding"""
        profile = self.get_user_profile(user_id)
        return profile.get('completed', False)
    
    def clear_user_profile(self, user_id: int) -> bool:
        """Clear user profile"""
        try:
            profile_file = self.onboarding_dir / f"user_{user_id}.json"
            if profile_file.exists():
                profile_file.unlink()
            return True
        except Exception as e:
            logger.error(f"Error clearing user profile: {e}")
            return False

    def set_user_language(self, user_id, lang):
        profile = self.get_user_profile(user_id)
        if profile:
            profile['language'] = lang
            self.save_profile(user_id, profile.get('location'), profile.get('crops'), profile.get('farm_size'), lang=lang)

    def get_user_language(self, user_id):
        profile = self.get_user_profile(user_id)
        return profile.get('language', 'en') if profile else 'en'

    async def handle_quick_actions(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle quick action buttons after onboarding"""
        query = update.callback_query
        await query.answer()
        
        user_profile = self.get_user_profile(query.from_user.id)
        location = user_profile.get('location', 'Ghana')
        
        responses = {
            'quick_weather': f"🌦️ Here's the weather for {location}:\n\n_Type `/weather` for detailed weather information._",
            'quick_planting': f"🌱 **Planting Advice for {location}**\n\nWhat crop are you planning to plant? Just ask me:\n• 'When to plant maize?'\n• 'Best time for tomatoes?'\n• 'Cassava planting season?'",
            'quick_pest': "🐛 **Pest Control Help**\n\nDescribe the pest problem:\n• 'Insects eating my maize leaves'\n• 'White flies on tomatoes'\n• 'Caterpillars on cabbage'",
            'quick_help': "❓ **How to Use Ghana AgriBOT**\n\n**Commands:**\n`/weather` - Weather info\n`/help` - Show all commands\n`/location` - Update location\n\n**Just ask questions like:**\n• 'How to grow cassava?'\n• 'Best fertilizer for maize?'\n• 'When to harvest yam?'"
        }
        
        response = responses.get(query.data, "How can I help you today?")
        
        await query.edit_message_text(response, parse_mode='Markdown')