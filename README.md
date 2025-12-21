# 🌾 SEMMA-AI: Ghana Agricultural Intelligence Platform

> **Smarter Advice. Bigger Harvests.**  
> AI-powered agricultural platform revolutionizing farming in Ghana with smart insights, digital marketplace, and community features.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features](#features)
- [Quick Start](#quick-start)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

SEMMA-AI is a comprehensive agricultural advisory system designed specifically for Ghanaian smallholder farmers. The platform combines AI-powered advice, real-time market data, satellite imagery analysis, and community features to help farmers maximize their yields and income.

### 🎨 Platform Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend API** | Python, FastAPI | Core AI engine, RAG system, data processing |
| **Web Landing** | Next.js, TypeScript | Marketing site and web presence |
| **Mobile App** | React Native, Expo | Primary farmer interface |
| **Telegram Bot** | Python Telegram Bot | Alternative messaging interface |

### 💡 Key Differentiators

- **🆓 Cost-Effective**: Uses Groq free tier LLM and open data sources
- **🇬🇭 Ghana-Specific**: Curated knowledge base for local farming conditions
- **📱 Multi-Channel**: Telegram, mobile app, and web interface
- **🛰️ Satellite Data**: Integration with weather and crop monitoring
- **📊 Data-Driven**: Market prices, feedback loops, and analytics
- **🌐 Offline-First**: Works with limited connectivity

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SEMMA-AI Platform                        │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Mobile App    │   Telegram Bot  │   Landing Page          │
│  (React Native) │    (Python)     │    (Next.js)            │
│                 │                 │                          │
│  • Farmer UI    │  • Chat Interf. │  • Marketing            │
│  • Image Upload │  • Text Advice  │  • Documentation        │
│  • Market Data  │  • Quick Access │  • Signup               │
└────────┬────────┴────────┬────────┴────────┬────────────────┘
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                  ┌────────▼─────────┐
                  │   FastAPI Core   │
                  │                  │
                  │ • LLM Handler    │
                  │ • RAG Engine     │
                  │ • Image Analysis │
                  │ • Data Collector │
                  └────────┬─────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼─────┐    ┌─────▼──────┐   ┌─────▼──────┐
    │ ChromaDB │    │   Groq API  │   │  External  │
    │ (Vector) │    │   (LLM)     │   │   APIs     │
    └──────────┘    └────────────┘   └────────────┘
                                      • Market Data
                                      • Weather
                                      • Satellite
```

---

## 📁 Project Structure

```
AgriBOT/
├── ghana-agri-bot/                    # Main backend monorepo
│   ├── src/                           # Python source code
│   │   ├── api_app.py                # FastAPI application
│   │   ├── bot.py                    # Telegram bot
│   │   ├── llm_handler.py            # AI/LLM integration
│   │   ├── knowledge_base.py         # RAG implementation
│   │   ├── image_analyzer.py         # Computer vision
│   │   ├── fusion_agent.py           # Multi-modal processing
│   │   └── ...                       # Additional modules
│   │
│   ├── config/                        # Configuration files
│   │   ├── settings.py               # App settings
│   │   └── prompts.py                # AI prompts
│   │
│   ├── data/                          # Data storage
│   │   ├── documents/                # Knowledge base docs
│   │   ├── market_prices.csv         # Market data
│   │   ├── feedback/                 # User feedback
│   │   └── logs/                     # Application logs
│   │
│   ├── scripts/                       # Utility scripts
│   │   ├── setup_bot.py              # Initial setup
│   │   ├── load_documents.py         # Data loading
│   │   └── ...                       # Various utilities
│   │
│   ├── mobile-new/                    # Mobile app (React Native)
│   │   ├── app/                      # Expo Router screens
│   │   ├── components/               # Reusable components
│   │   ├── config/                   # App configuration
│   │   ├── context/                  # React Context
│   │   ├── utils/                    # Helper functions
│   │   └── package.json              # Dependencies
│   │
│   ├── agribot-landing/               # Landing page (Next.js)
│   │   ├── app/                      # Next.js app router
│   │   ├── lib/                      # Utilities
│   │   ├── public/                   # Static assets
│   │   └── package.json              # Dependencies
│   │
│   ├── tests/                         # Test files
│   ├── requirements.txt               # Python dependencies
│   ├── Dockerfile                     # Container definition
│   └── README.md                      # Backend documentation
│
└── README.md                          # This file
```

---

## ✨ Features

### 🤖 AI-Powered Advisory
- **Natural Language Processing**: Understand farmer questions in local context
- **RAG System**: Retrieval-Augmented Generation for accurate, sourced answers
- **Multi-Modal**: Process text, images, and voice inputs
- **Context-Aware**: Remember conversation history

### 📊 Market Intelligence
- **Real-Time Prices**: Ghana Commodity Exchange (GCX) integration
- **Price Trends**: Historical analysis and predictions
- **Location-Based**: Regional market information
- **Crop Recommendations**: Based on market demand

### 🛰️ Satellite Integration
- **Weather Forecasts**: 7-day predictions
- **Crop Monitoring**: NDVI and vegetation indices
- **Pest Alerts**: Early warning systems
- **Soil Analysis**: Satellite-derived insights

### 📱 Mobile Features
- **Offline Support**: Works with limited connectivity
- **Image Recognition**: Crop disease and pest identification
- **Voice Input**: Audio message support
- **Push Notifications**: Timely alerts and reminders
- **Multilingual**: Support for local languages

### 🔄 Continuous Learning
- **Feedback System**: Farmer ratings and comments
- **Usage Analytics**: Track what works best
- **Model Fine-Tuning**: Improve over time
- **Community Knowledge**: Learn from collective experience

---

## 🚀 Quick Start

### Prerequisites

```bash
# System Requirements
- Python 3.8+
- Node.js 18+
- npm or yarn
- Git
```

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd AgriBOT/ghana-agri-bot
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your API keys:
# - TELEGRAM_BOT_TOKEN (from @BotFather)
# - GROQ_API_KEY (from console.groq.com)
# - MOBILE_API_KEY (create your own secure key)

# Load initial knowledge base
python scripts/load_documents.py

# Start the backend API
uvicorn src.api_app:app --reload --port 8000
```

### 3. Mobile App Setup

```bash
cd mobile-new

# Install dependencies
npm install

# Configure API endpoint
# Edit config/api.ts with your local IP

# Start the development server
npm start

# Scan QR code with Expo Go app (iOS/Android)
```

### 4. Web Landing Page Setup

```bash
cd agribot-landing

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev

# Open http://localhost:3000
```

### 5. Telegram Bot (Optional)

```bash
# Start the bot
python src/bot.py

# OR use the UI version
python src/bot_ui.py
```

---

## 💻 Development

### Running Tests

```bash
# Backend tests
pytest tests/

# Mobile tests
cd mobile-new
npm test

# Web tests
cd agribot-landing
npm test
```

### Code Quality

```bash
# Python linting
flake8 src/
black src/

# TypeScript linting
cd mobile-new
npm run lint

cd agribot-landing
npm run lint
```

### Environment Variables

#### Backend (.env)
```bash
# Required
TELEGRAM_BOT_TOKEN=your_token
GROQ_API_KEY=your_key
MOBILE_API_KEY=your_secure_key

# Optional
API_ALLOWED_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost/agribot
REDIS_URL=redis://localhost:6379
```

#### Mobile (config/api.ts)
```typescript
const LOCAL_IP = '192.168.1.x';
const MOBILE_API_KEY = 'match_backend_key';
```

#### Web (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GA_ID=your_analytics_id
```

---

## 🚢 Deployment

### Backend (FastAPI)

**Recommended: Railway, Render, or Fly.io**

```bash
# Using Railway
railway up

# Using Docker
docker build -t agribot-api .
docker run -p 8000:8000 agribot-api
```

### Mobile App

**Deploy to App Stores**

```bash
cd mobile-new

# Build for production
eas build --platform android
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### Web Landing

**Recommended: Vercel or Netlify**

```bash
cd agribot-landing

# Deploy to Vercel
vercel --prod

# Or Netlify
netlify deploy --prod
```

---

## 📖 Documentation

- [Backend API Documentation](ghana-agri-bot/README.md)
- [Mobile App Setup](ghana-agri-bot/mobile-new/README.md)
- [Landing Page Guide](ghana-agri-bot/agribot-landing/README.md)
- [Deployment Guide](ghana-agri-bot/DEPLOYMENT.md)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ for Ghanaian farmers

- **Project Lead**: [Your Name]
- **Backend**: Python, FastAPI, AI/ML
- **Mobile**: React Native, Expo
- **Web**: Next.js, TypeScript

---

## 📞 Support

- **Email**: support@semma-ai.com
- **Telegram**: @SemmaAISupport
- **Website**: https://semma-ai.com

---

## 🙏 Acknowledgments

- Ghana Ministry of Food and Agriculture
- Ghana Commodity Exchange (GCX)
- Groq for free LLM access
- Open data providers and contributors

---

## 🗺️ Roadmap

- [x] Core AI advisory system
- [x] Telegram bot interface
- [x] Mobile app (iOS/Android)
- [x] Web landing page
- [x] Market price integration
- [x] Satellite data integration
- [ ] User authentication system
- [ ] Payment integration for premium features
- [ ] Voice-based interface
- [ ] Community forum
- [ ] Marketplace integration
- [ ] Multi-language support (Twi, Ga, Ewe)
- [ ] SMS fallback for non-smartphone users

---

**Made with 🌾 in Ghana** | **Empowering Farmers Through Technology**
