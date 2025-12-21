#!/bin/bash

# SEMMA-AI Quick Setup Script
# This script helps you set up the entire development environment

set -e  # Exit on error

echo "🌾 SEMMA-AI Development Environment Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found${NC}"

# Check Docker (optional)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker found${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠ Docker not found (optional)${NC}"
    DOCKER_AVAILABLE=false
fi

echo ""
echo "🔧 Setting up environment files..."

# Backend .env
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created backend .env file${NC}"
    echo -e "${YELLOW}⚠ Please edit .env and add your API keys${NC}"
else
    echo -e "${YELLOW}⚠ Backend .env already exists${NC}"
fi

# Mobile .env
if [ ! -f "mobile-new/.env" ]; then
    cp mobile-new/.env.example mobile-new/.env
    echo -e "${GREEN}✓ Created mobile .env file${NC}"
else
    echo -e "${YELLOW}⚠ Mobile .env already exists${NC}"
fi

# Web .env.local
if [ ! -f "agribot-landing/.env.local" ]; then
    cp agribot-landing/.env.example agribot-landing/.env.local
    echo -e "${GREEN}✓ Created web .env.local file${NC}"
else
    echo -e "${YELLOW}⚠ Web .env.local already exists${NC}"
fi

echo ""
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

echo ""
echo "📦 Installing mobile dependencies..."
cd mobile-new
npm install
cd ..
echo -e "${GREEN}✓ Mobile dependencies installed${NC}"

echo ""
echo "📦 Installing web dependencies..."
cd agribot-landing
npm install
cd ..
echo -e "${GREEN}✓ Web dependencies installed${NC}"

echo ""
echo "📁 Creating required directories..."
mkdir -p data/documents
mkdir -p data/feedback
mkdir -p data/logs
mkdir -p data/images
mkdir -p data/processed
mkdir -p data/onboarding
echo -e "${GREEN}✓ Directories created${NC}"

echo ""
echo "🗄️ Setting up database..."
if [ -f "alembic.ini" ]; then
    echo "Running database migrations..."
    # Uncomment when you have a database configured
    # alembic upgrade head
    echo -e "${YELLOW}⚠ Database migrations ready (run 'alembic upgrade head' when DB is configured)${NC}"
else
    echo -e "${YELLOW}⚠ Alembic not configured${NC}"
fi

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo ""
    echo "🐳 Docker is available!"
    echo "To start all services with Docker:"
    echo "  docker-compose up -d"
    echo ""
    echo "To start with specific profiles:"
    echo "  docker-compose --profile telegram up -d    # Include Telegram bot"
    echo "  docker-compose --profile web up -d         # Include web landing"
    echo "  docker-compose --profile tools up -d       # Include management tools"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Edit .env files with your API keys:"
echo "   - GROQ_API_KEY (get from https://console.groq.com)"
echo "   - TELEGRAM_BOT_TOKEN (get from @BotFather)"
echo "   - MOBILE_API_KEY (create your own secure key)"
echo ""
echo "2. Start the backend API:"
echo "   uvicorn src.api_app:app --reload --port 8000"
echo ""
echo "3. Start the mobile app:"
echo "   cd mobile-new && npm start"
echo ""
echo "4. Start the web landing (optional):"
echo "   cd agribot-landing && npm run dev"
echo ""
echo "5. Or use Docker to start everything:"
echo "   docker-compose up -d"
echo ""
echo "📚 Documentation:"
echo "   - Backend: README.md"
echo "   - Mobile: mobile-new/README.md"
echo "   - Web: agribot-landing/README.md"
echo "   - Deployment: DEPLOYMENT.md"
echo ""
echo "Happy coding! 🌾"
