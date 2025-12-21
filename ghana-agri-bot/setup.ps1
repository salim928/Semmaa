# SEMMA-AI Quick Setup Script (PowerShell)
# This script helps you set up the entire development environment

Write-Host "🌾 SEMMA-AI Development Environment Setup" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Cyan

# Check Python
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "✓ Python found" -ForegroundColor Green
} else {
    Write-Host "❌ Python is not installed" -ForegroundColor Red
    exit 1
}

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "✓ Node.js found" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    exit 1
}

# Check npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "✓ npm found" -ForegroundColor Green
} else {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

# Check Docker (optional)
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "✓ Docker found" -ForegroundColor Green
    $DOCKER_AVAILABLE = $true
} else {
    Write-Host "⚠ Docker not found (optional)" -ForegroundColor Yellow
    $DOCKER_AVAILABLE = $false
}

Write-Host ""
Write-Host "🔧 Setting up environment files..." -ForegroundColor Cyan

# Backend .env
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created backend .env file" -ForegroundColor Green
    Write-Host "⚠ Please edit .env and add your API keys" -ForegroundColor Yellow
} else {
    Write-Host "⚠ Backend .env already exists" -ForegroundColor Yellow
}

# Mobile .env
if (-not (Test-Path "mobile-new\.env")) {
    Copy-Item "mobile-new\.env.example" "mobile-new\.env"
    Write-Host "✓ Created mobile .env file" -ForegroundColor Green
} else {
    Write-Host "⚠ Mobile .env already exists" -ForegroundColor Yellow
}

# Web .env.local
if (-not (Test-Path "agribot-landing\.env.local")) {
    Copy-Item "agribot-landing\.env.example" "agribot-landing\.env.local"
    Write-Host "✓ Created web .env.local file" -ForegroundColor Green
} else {
    Write-Host "⚠ Web .env.local already exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt
Write-Host "✓ Python dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Installing mobile dependencies..." -ForegroundColor Cyan
Set-Location mobile-new
npm install
Set-Location ..
Write-Host "✓ Mobile dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Installing web dependencies..." -ForegroundColor Cyan
Set-Location agribot-landing
npm install
Set-Location ..
Write-Host "✓ Web dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "📁 Creating required directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "data\documents" | Out-Null
New-Item -ItemType Directory -Force -Path "data\feedback" | Out-Null
New-Item -ItemType Directory -Force -Path "data\logs" | Out-Null
New-Item -ItemType Directory -Force -Path "data\images" | Out-Null
New-Item -ItemType Directory -Force -Path "data\processed" | Out-Null
New-Item -ItemType Directory -Force -Path "data\onboarding" | Out-Null
Write-Host "✓ Directories created" -ForegroundColor Green

Write-Host ""
Write-Host "🗄️ Setting up database..." -ForegroundColor Cyan
if (Test-Path "alembic.ini") {
    Write-Host "⚠ Database migrations ready (run 'alembic upgrade head' when DB is configured)" -ForegroundColor Yellow
} else {
    Write-Host "⚠ Alembic not configured" -ForegroundColor Yellow
}

if ($DOCKER_AVAILABLE) {
    Write-Host ""
    Write-Host "🐳 Docker is available!" -ForegroundColor Cyan
    Write-Host "To start all services with Docker:"
    Write-Host "  docker-compose up -d"
    Write-Host ""
    Write-Host "To start with specific profiles:"
    Write-Host "  docker-compose --profile telegram up -d    # Include Telegram bot"
    Write-Host "  docker-compose --profile web up -d         # Include web landing"
    Write-Host "  docker-compose --profile tools up -d       # Include management tools"
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edit .env files with your API keys:"
Write-Host "   - GROQ_API_KEY (get from https://console.groq.com)"
Write-Host "   - TELEGRAM_BOT_TOKEN (get from @BotFather)"
Write-Host "   - MOBILE_API_KEY (create your own secure key)"
Write-Host ""
Write-Host "2. Start the backend API:"
Write-Host "   uvicorn src.api_app:app --reload --port 8000"
Write-Host ""
Write-Host "3. Start the mobile app:"
Write-Host "   cd mobile-new; npm start"
Write-Host ""
Write-Host "4. Start the web landing (optional):"
Write-Host "   cd agribot-landing; npm run dev"
Write-Host ""
Write-Host "5. Or use Docker to start everything:"
Write-Host "   docker-compose up -d"
Write-Host ""
Write-Host "📚 Documentation:"
Write-Host "   - Backend: README.md"
Write-Host "   - Mobile: mobile-new\README.md"
Write-Host "   - Web: agribot-landing\README.md"
Write-Host "   - Deployment: DEPLOYMENT.md"
Write-Host ""
Write-Host "Happy coding! 🌾" -ForegroundColor Green
