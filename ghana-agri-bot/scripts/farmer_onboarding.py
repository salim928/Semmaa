"""
Farmer Onboarding Script
Purpose: Generate onboarding messages and materials for new farmers
"""

import sys
from pathlib import Path
import json
from datetime import datetime

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

def generate_whatsapp_message():
    """Generate WhatsApp broadcast message"""
    
    message = """
🌾 *Ghana AI Farming Advisor* 🌾

Dear Farmer,

Get instant farming advice on WhatsApp/Telegram!

*What we offer:*
✅ Planting time advice
✅ Fertilizer recommendations  
✅ Pest & disease solutions
✅ Weather-based guidance
✅ Market information

*How to use:*
1️⃣ Add our number: [YOUR_NUMBER]
2️⃣ Send "Hi" to start
3️⃣ Ask any farming question
4️⃣ Get answer in 2 minutes!

*Example questions:*
- When should I plant maize?
- My cocoa has black spots
- Fertilizer for 1 acre cassava

*Languages:* English (Twi coming soon)

*Cost:* FREE during pilot program

Join 20+ farmers already using it!

Share with other farmers 🤝
    """
    
    return message.strip()

def generate_flyer_text():
    """Generate text for physical flyer"""
    
    flyer = """
=====================================
    GHANA AI FARMING ADVISOR
     Free Agricultural Advice
          On Your Phone!
=====================================

GET INSTANT ANSWERS TO:
- When to plant your crops
- How much fertilizer to use  
- How to control pests
- Disease identification
- Weather-based advice

HOW IT WORKS:
1. Message us on Telegram/WhatsApp
2. Ask your question
3. Get expert advice in 2 minutes

CONTACT:
Telegram: @[YOUR_BOT_USERNAME]
WhatsApp: [YOUR_NUMBER]

"The bot helped me save my maize
from armyworm attack!" 
- Farmer in Kumasi

FREE DURING PILOT PROGRAM
Limited spaces available!

Supported by:
[Your Organization]
=====================================
    """
    
    return flyer.strip()

def generate_training_script():
    """Generate script for training sessions"""
    
    script = """
FARMER TRAINING SESSION SCRIPT
==============================

INTRODUCTION (2 minutes)
------------------------
"Good [morning/afternoon] farmers! Today I want to show you 
something that will change how you get farming advice. Instead 
of waiting days or weeks for an extension officer, you can now 
get expert advice in just 2 minutes on your phone!"

DEMONSTRATION (5 minutes)
-------------------------
1. "Let me show you how it works"
   [Open WhatsApp/Telegram on phone]

2. "I'll ask a real question"
   [Type: "When should I plant maize in Kumasi?"]

3. "Look, in less than 2 minutes..."
   [Show response]

4. "The advice is specific to our area and current season"

5. "Let's try another - who has a farming question?"
   [Take question from audience and demonstrate]

BENEFITS (2 minutes)
--------------------
- Available 24/7 - even at night or weekends
- No transport cost to extension office
- Specific to your location
- Remembers your previous questions
- Completely FREE during pilot

HOW TO JOIN (3 minutes)
-----------------------
1. "Who has WhatsApp on their phone?" [Show of hands]

2. "Great! Just save this number: [NUMBER]"
   [Write on board/flipchart]

3. "Send 'Hello' to start"

4. "For Telegram users..."
   [Explain Telegram process]

5. "I'll help anyone who needs assistance after the session"

PRACTICE (5 minutes)
-------------------
"Now let's all try it together!"
- Help farmers send first message
- Ensure everyone gets a response
- Answer any questions

CLOSING (1 minute)
------------------
"Remember, this is YOUR farming assistant. Use it whenever 
you have questions. The more you use it, the better it becomes. 
Please tell other farmers about it!"

Q&A
---
[Answer questions]

FOLLOW-UP
---------
- Create WhatsApp group for users
- Share success stories weekly
- Schedule check-in after 1 week
    """
    
    return script.strip()

def generate_success_story_template():
    """Generate template for documenting success stories"""
    
    template = """
SUCCESS STORY TEMPLATE
=====================

Farmer Name: _________________
Location: ____________________  
Crop: _______________________
Date: _______________________

THE CHALLENGE:
[Describe the problem the farmer faced]
_________________________________________
_________________________________________

THE QUESTION ASKED:
"_______________________________________"

THE ADVICE RECEIVED:
[Summarize the bot's response]
_________________________________________
_________________________________________

THE ACTION TAKEN:
[What the farmer did based on advice]
_________________________________________
_________________________________________

THE RESULT:
[Outcome - yield improvement, money saved, etc.]
_________________________________________
_________________________________________

FARMER'S QUOTE:
"_______________________________________
________________________________________"

VERIFIED BY: _________________
Date: ________________________

[Attach photos if available]
□ Before photo
□ After photo  
□ Farmer photo (with consent)
    """
    
    return template.strip()

def save_materials():
    """Save all materials to files"""
    output_dir = Path("farmer_materials")
    output_dir.mkdir(exist_ok=True)
    
    materials = {
        "whatsapp_message.txt": generate_whatsapp_message(),
        "flyer_text.txt": generate_flyer_text(),
        "training_script.txt": generate_training_script(),
        "success_story_template.txt": generate_success_story_template()
    }
    
    for filename, content in materials.items():
        file_path = output_dir / filename
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"✅ Created: {file_path}")

def onboard_farmer(user_id, phone_number, consent_given, location=None, crop_type=None):
    """
    Store onboarding info for a new farmer.
    """
    if not consent_given:
        return {"error": "Consent required to use this service."}
    farmer_record = {
        "user_id": user_id,
        "phone_number": str(phone_number)[-4:] + "****",  # Mask PII
        "location": location,
        "crop_type": crop_type,
        "consent": True,
        "timestamp": datetime.now().isoformat()
    }
    feedback_dir = Path("data/feedback")
    feedback_dir.mkdir(parents=True, exist_ok=True)
    onboarding_file = feedback_dir / "farmer_onboarding.jsonl"
    with open(onboarding_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(farmer_record) + "\n")
    return {"status": "onboarded"}

def main():
    """Generate all onboarding materials"""
    print("""
    👥 Farmer Onboarding Materials Generator
    ========================================
    Creating materials for farmer recruitment
    """)
    
    # Save all materials
    save_materials()
    
    print("\n" + "=" * 50)
    print("📁 Materials saved in 'farmer_materials' folder")
    print("\n📝 Next steps:")
    print("1. Update [YOUR_NUMBER] and [YOUR_BOT_USERNAME] in files")
    print("2. Translate to local languages if needed")
    print("3. Print flyers at local print shop")
    print("4. Share WhatsApp message in farmer groups")
    print("5. Use training script for demonstrations")
    
    print("\n💡 Tips for farmer recruitment:")
    print("• Start with progressive farmers who use smartphones")
    print("• Demo at farmer association meetings")
    print("• Partner with agro-dealers for distribution")
    print("• Use local radio for announcements")
    print("• Offer certificates for first 20 users")

if __name__ == "__main__":
    main()