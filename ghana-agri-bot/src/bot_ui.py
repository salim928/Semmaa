from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from math import ceil
from typing import List

def main_menu():
    rows = [
        [InlineKeyboardButton("🌦 Weather", callback_data="weather"),
         InlineKeyboardButton("📈 Market", callback_data="market")],
        [InlineKeyboardButton("📚 Tips", callback_data="tips:0"),
         InlineKeyboardButton("💬 Ask", callback_data="ask")],
        [InlineKeyboardButton("👤 Profile", callback_data="profile"),
         InlineKeyboardButton("⚙️ Settings", callback_data="settings")],
        [InlineKeyboardButton("🌐 Language", callback_data="lang"),
         InlineKeyboardButton("📍 Location", callback_data="location")],
        [InlineKeyboardButton("❓ Help", callback_data="help"),
         InlineKeyboardButton("🚀 Onboarding", callback_data="onboarding")],
        [InlineKeyboardButton("📝 Feedback", callback_data="feedback")],
    ]
    # Insert diagnose button if not present
    btn = InlineKeyboardButton("📸 Diagnose", callback_data="diagnose")
    # Safe insert
    labels = {b.text for row in rows for b in row}
    if "📸 Diagnose" not in labels:
        # put diagnose into its own row at end
        rows.append([btn])
    return InlineKeyboardMarkup(rows)

def back_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("⬅️ Back", callback_data="menu")]
    ])

def settings_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🌐 Language", callback_data="settings:language"),
         InlineKeyboardButton("🔒 Privacy/Consent", callback_data="settings:privacy")],
        [InlineKeyboardButton("👤 Profile settings", callback_data="settings:profile"),
         InlineKeyboardButton("📍 Location", callback_data="location")],
        [InlineKeyboardButton("❓ Help", callback_data="help"),
         InlineKeyboardButton("⬅️ Back", callback_data="menu")],
    ])

def tips_keyboard(page: int, total_pages: int) -> InlineKeyboardMarkup:
    prev_p = max(0, page - 1)
    next_p = min(total_pages - 1, page + 1)
    buttons = []
    # Prev / Next
    nav = []
    nav.append(InlineKeyboardButton("« Prev" if page > 0 else "« Prev", callback_data=f"tips:{prev_p}"))
    nav.append(InlineKeyboardButton(f"{page+1}/{total_pages}", callback_data="tips"))
    nav.append(InlineKeyboardButton("Next »" if page < total_pages-1 else "Next »", callback_data=f"tips:{next_p}"))
    buttons.append(nav)
    # Back line
    buttons.append([InlineKeyboardButton("⬅️ Back", callback_data="menu")])
    return InlineKeyboardMarkup(buttons)

def language_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("English", callback_data="lang:en"),
         InlineKeyboardButton("Twi", callback_data="lang:tw")],
        [InlineKeyboardButton("Ga", callback_data="lang:ga"),
         InlineKeyboardButton("Ewe", callback_data="lang:ee")],
        [InlineKeyboardButton("⬅️ Back", callback_data="menu")],
    ])

def rating_keyboard() -> InlineKeyboardMarkup:
    # Five-star style, return to menu/back after rating
    row = [
        InlineKeyboardButton("⭐️⭐️⭐️⭐️⭐️", callback_data="fb:5"),
        InlineKeyboardButton("⭐️⭐️⭐️⭐️", callback_data="fb:4"),
        InlineKeyboardButton("⭐️⭐️⭐️", callback_data="fb:3"),
        InlineKeyboardButton("⭐️⭐️", callback_data="fb:2"),
        InlineKeyboardButton("⭐️", callback_data="fb:1"),
    ]
    return InlineKeyboardMarkup([row, [InlineKeyboardButton("⬅️ Back", callback_data="menu")]])

def crops_keyboard(crops: List[str], page: int = 0, per_page: int = 8) -> InlineKeyboardMarkup:
    # Paginate crops list
    total = len(crops)
    pages = max(1, ceil(total / per_page))
    page = max(0, min(page, pages - 1))
    start = page * per_page
    end = start + per_page
    chunk = crops[start:end]

    rows: List[List[InlineKeyboardButton]] = []
    for crop in chunk:
        # callback uses market:crop:{c}
        rows.append([InlineKeyboardButton(crop, callback_data=f"market:crop:{crop}")])

    # Navigation row
    nav = []
    if page > 0:
        nav.append(InlineKeyboardButton("« Prev", callback_data=f"market:page:{page-1}"))
    nav.append(InlineKeyboardButton(f"{page+1}/{pages}", callback_data="market"))
    if page < pages - 1:
        nav.append(InlineKeyboardButton("Next »", callback_data=f"market:page:{page+1}"))
    rows.append(nav)

    # Back
    rows.append([InlineKeyboardButton("⬅️ Back", callback_data="menu")])
    return InlineKeyboardMarkup(rows)

def onboarding_keyboard(step: int, last_step: int = 4) -> InlineKeyboardMarkup:
    # Normalize step between 1..last_step
    step = max(1, min(step, last_step))
    buttons = []
    prev_step = max(1, step - 1)
    next_step = step + 1 if step < last_step else None

    nav = []
    nav.append(InlineKeyboardButton("⬅️ Prev", callback_data=f"onb:prev:{step}"))
    nav.append(InlineKeyboardButton(f"Step {step}/{last_step}", callback_data="onboarding"))
    if next_step:
        nav.append(InlineKeyboardButton("Next ➡️", callback_data=f"onb:next:{step}"))
    else:
        nav.append(InlineKeyboardButton("Finish ✅", callback_data="onb:done"))
    buttons.append(nav)

    buttons.append([InlineKeyboardButton("⬅️ Back", callback_data="menu")])
    return InlineKeyboardMarkup(buttons)

def main_menu_button():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("Main menu", callback_data="menu")]
    ])

# New keyboards for enhancements
def quick_actions_keyboard() -> InlineKeyboardMarkup:
    """Quick actions for common queries"""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🌦 Weather Update", callback_data="quick:weather")],
        [InlineKeyboardButton("📸 Diagnose Pest", callback_data="quick:diagnose")],
        [InlineKeyboardButton("📈 Market Prices", callback_data="quick:market")],
        [InlineKeyboardButton("⬅️ Back", callback_data="menu")]
    ])

def photo_progress_keyboard() -> InlineKeyboardMarkup:
    """Progress indicator for photo analysis"""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("⏳ Analyzing...", callback_data="progress")],
        [InlineKeyboardButton("❌ Cancel", callback_data="cancel")]
    ])

def feedback_poll_keyboard() -> InlineKeyboardMarkup:
    """Quick feedback poll after responses"""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("👍 Helpful", callback_data="poll:helpful")],
        [InlineKeyboardButton("👎 Not Helpful", callback_data="poll:not_helpful")],
        [InlineKeyboardButton("💬 Comment", callback_data="poll:comment")]
    ])

def retry_keyboard() -> InlineKeyboardMarkup:
    """Retry options for errors"""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔄 Try Again", callback_data="retry")],
        [InlineKeyboardButton("📞 Contact Support", callback_data="support")],
        [InlineKeyboardButton("⬅️ Back", callback_data="menu")]
    ])

def history_keyboard(history_list: List[str]) -> InlineKeyboardMarkup:
    """Display past conversations"""
    rows = []
    for i, item in enumerate(history_list[:5]):  # Limit to 5
        rows.append([InlineKeyboardButton(f"Q: {item[:30]}...", callback_data=f"history:{i}")])
    rows.append([InlineKeyboardButton("⬅️ Back", callback_data="menu")])
    return InlineKeyboardMarkup(rows)