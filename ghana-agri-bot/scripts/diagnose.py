# Adds project root for imports
import sys, re, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import importlib
print("🔧 SemmaAI Diagnostics\n============================")

def ok(x): return f"✅ {x}"
def warn(x): return f"⚠️ {x}"
def err(x): return f"❌ {x}"

issues = []

# 1) Python
import platform
print(ok(f"Python: {platform.python_version()} ({platform.system()})"))

# 2) Settings
try:
    settings = importlib.import_module("config.settings")
    TELEGRAM_BOT_TOKEN = getattr(settings, "TELEGRAM_BOT_TOKEN", "")
    GROQ_API_KEY = getattr(settings, "GROQ_API_KEY", "")
    LLM_MODEL = getattr(settings, "LLM_MODEL", "gemma2-9b-it")
    print(ok("Loaded config.settings"))
except Exception as e:
    print(err(f"config.settings import failed: {e}"))
    issues.append("settings")
    TELEGRAM_BOT_TOKEN = GROQ_API_KEY = ""
    LLM_MODEL = "gemma2-9b-it"

# 3) Tokens presence
if TELEGRAM_BOT_TOKEN:
    if re.match(r"^\d+:[A-Za-z0-9_-]{30,}$", TELEGRAM_BOT_TOKEN):
        print(ok("Telegram token appears valid"))
    else:
        print(warn("Telegram token format looks unusual"))
else:
    print(warn("TELEGRAM_BOT_TOKEN is missing"))
    issues.append("telegram")

if GROQ_API_KEY:
    print(ok("GROQ_API_KEY is set"))
else:
    print(warn("GROQ_API_KEY is missing"))
    issues.append("groq")

# 4) Chroma and collection
try:
    cc = importlib.import_module("src.chroma_client")
    col = cc.get_collection("ghana_agriculture")
    count = col.count() if hasattr(col, "count") else len(col.get().get("ids", []))
    print(ok(f"Chroma collection ok: ghana_agriculture (docs={count})"))
except Exception as e:
    print(err(f"Chroma collection error: {e}"))
    issues.append("chroma")

# 5) Embeddings
try:
    emb = importlib.import_module("src.embeddings")
    service = emb.EmbeddingService("sentence-transformers/all-MiniLM-L6-v2")
    vec = service.encode_batch(["test maize fertilizer"])[0]
    print(ok(f"Embeddings ok: dim={len(vec)} (cached={Path(service.cache_path).exists()})"))
except Exception as e:
    print(err(f"Embeddings error: {e}"))
    issues.append("embeddings")

# 6) Telegram library version
try:
    import telegram
    ver = getattr(telegram, "__version__", "unknown")
    print(ok(f"python-telegram-bot version: {ver}"))
    if ver.startswith("13.") or ver.startswith("12."):
        print(warn("python-telegram-bot is old; upgrade to >=20 for ApplicationBuilder"))
        issues.append("ptb")
except Exception as e:
    print(err(f"python-telegram-bot import failed: {e}"))
    issues.append("ptb")

# 7) Data files
data_dir = ROOT / "data"
need = [
    data_dir / "market_prices.csv",
    data_dir / "processed" / "chroma_db",
]
for p in need:
    if p.exists():
        print(ok(f"Found {p.relative_to(ROOT)}"))
    else:
        print(warn(f"Missing {p.relative_to(ROOT)}"))
        issues.append("data")

# 8) Bot wiring sanity
try:
    import src.bot as bot_mod
    print(ok("Imported src.bot"))
except Exception as e:
    print(err(f"src.bot import failed: {e}"))
    issues.append("bot")

# Summary
print("\nSummary:")
if issues:
    uniq = sorted(set(issues))
    print(warn(f"Issues detected in: {', '.join(uniq)}"))
    print("Next steps:")
    if "telegram" in uniq: print(" - Set TELEGRAM_BOT_TOKEN in .env")
    if "groq" in uniq: print(" - Set GROQ_API_KEY in .env")
    if "chroma" in uniq: print(" - Rebuild KB: python -m scripts.load_documents")
    if "embeddings" in uniq: print(" - pip install sentence-transformers numpy")
    if "ptb" in uniq: print(" - pip install 'python-telegram-bot>=20'")
    if "bot" in uniq: print(" - Open src/bot.py and fix imports/handlers")
else:
    print(ok("All core checks passed. You can run: python run.py"))