## 🌾 Ghana Agricultural Bot - $0 MVP

AI-powered agricultural advisory system for Ghanaian smallholder farmers using Telegram, Groq (free LLM), and RAG.

### Features

- **🤖 AI-powered farming advice via Telegram and mobile app**
- **🌍 Ghana-specific agricultural knowledge (RAG over curated docs)**
- **💬 Simple WhatsApp-like interface**
- **📊 Automatic metrics + feedback tracking**
- **🔄 Continuous learning from farmer feedback**
- **💰 Completely FREE to run (Groq free tier + open data)**


### Quick Start (15 minutes)

#### Prerequisites

- **Python** 3.8 or higher
- **Node.js** + **npm** (for the Expo mobile app in `mobile-new`)
- **Telegram account** (for the Telegram bot)
- Internet connection

#### Step 1: Clone and backend setup

```bash
# Clone the repository (or download ZIP)
git clone <your-repo-url>
cd ghana-agri-bot

# Install Python dependencies
pip install -r requirements.txt
```

Create a `.env` file in the project root (or export env vars) with at least:

```bash
TELEGRAM_BOT_TOKEN=your-telegram-token
GROQ_API_KEY=your-groq-key
# Optional: secure public/mobile API access
MOBILE_API_KEY=choose-a-strong-key
# Optional: restrict CORS in production (comma-separated origins)
# API_ALLOWED_ORIGINS=https://yourdomain.com,https://other-app.com
```

#### Step 2: Start the API server

The FastAPI backend powers the mobile app and any future web clients.

```bash
uvicorn src.api_app:app --reload --host 0.0.0.0 --port 8000
```

Key endpoints:

- `POST /ask` – main advisory endpoint (used by the mobile chat)
- `GET /weather?loc=Accra` – simple weather summary
- `GET /market/crops` – list of crops with price data
- `GET /market/prices?crop=Maize` – recent market prices
- `POST /feedback` – store thumbs-up/down and comments from farmers

#### Step 3: Run the Telegram bot

```bash
python run.py
```

The bot will start using `TELEGRAM_BOT_TOKEN` from your environment and log to `data/logs/`.


### Mobile app (Expo) – SemmaAI companion

The Expo app in `mobile-new` is a farmer-friendly front-end that talks to the same FastAPI backend.

From `ghana-agri-bot/mobile-new`:

```bash
npm install
npx expo start
```

Then, in `mobile-new/config/api.ts`, set `LOCAL_IP` to your machine’s LAN IP so the app can reach `http://<your-ip>:8000` while the API server is running.

Main flows in the app:

- **Home → AI Advisor**: opens chat screen and calls `POST /ask` with the farmer’s location.
- **Home → Market**: shows prices by calling `/market/crops` and `/market/prices`.
- **Weather on Home**: calls `GET /weather` with the detected town/city.
- **Chat feedback**: thumbs up/down under each answer sends `POST /feedback`.


### Updating the knowledge base (RAG)

Documents live under `data/documents/` and are indexed into Chroma via helper scripts.

- To **add or change documents**:
  - Drop `.txt` or `.json` files into `data/documents/` (see existing files as examples).
  - For structured JSON, use the schema from `data/documents/initial_knowledge.json` (`{"documents": [... ]}`).
- To **(re)build the vector store**:

```bash
python scripts/load_documents.py
```

Additional helpers:

- `scripts/add_ghana_knowledge.py` – builds Ghana-specific, searchable documents.
- `scripts/add_satellite_knowledge.py` – adds satellite/NDVI interpretation content.
- `scripts/optimize_documents.py` – tooling for analyzing and improving KB coverage.

After updating documents and running the loader, restart the bot/API so the new embeddings are loaded.