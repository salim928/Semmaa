# 🚀 Deployment Guide - SEMMA-AI Platform

This guide covers deploying all three components of the SEMMA-AI platform to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
- [Mobile App Deployment](#mobile-app-deployment)
- [Web Landing Deployment](#web-landing-deployment)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🔑 Prerequisites

### Accounts Needed

- [ ] GitHub account (for code hosting)
- [ ] Railway/Render/Fly.io account (for backend)
- [ ] Expo account (for mobile app)
- [ ] Vercel/Netlify account (for web)
- [ ] Domain name (optional but recommended)
- [ ] Groq API key (free tier available)
- [ ] Telegram Bot Token (from @BotFather)

### Tools Required

```bash
# Install required CLI tools
npm install -g vercel netlify-cli
npm install -g eas-cli
pip install railway
```

---

## 🔧 Backend Deployment

### Option 1: Railway (Recommended)

Railway offers easy deployment with automatic SSL, PostgreSQL, and Redis.

#### Step 1: Prepare the backend

```bash
cd ghana-agri-bot

# Create railway.json for configuration
cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn src.api_app:app --host 0.0.0.0 --port \$PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
```

#### Step 2: Deploy

```bash
# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL (optional but recommended)
railway add --database postgres

# Add Redis (optional, for caching)
railway add --database redis

# Set environment variables
railway variables set GROQ_API_KEY=your_groq_key
railway variables set TELEGRAM_BOT_TOKEN=your_telegram_token
railway variables set MOBILE_API_KEY=your_secure_key
railway variables set API_ALLOWED_ORIGINS=https://yourdomain.com

# Deploy
railway up
```

#### Step 3: Get your deployment URL

```bash
railway domain
# Note this URL - you'll need it for mobile and web
```

### Option 2: Render

```bash
# Create render.yaml
cat > render.yaml << EOF
services:
  - type: web
    name: agribot-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn src.api_app:app --host 0.0.0.0 --port \$PORT
    envVars:
      - key: GROQ_API_KEY
        sync: false
      - key: TELEGRAM_BOT_TOKEN
        sync: false
      - key: MOBILE_API_KEY
        sync: false
      - key: PYTHON_VERSION
        value: 3.11.0
EOF
```

Then deploy via Render dashboard or CLI.

### Option 3: Docker Deployment

```bash
# Build image
docker build -t agribot-api .

# Run locally to test
docker run -p 8000:8000 \
  -e GROQ_API_KEY=your_key \
  -e TELEGRAM_BOT_TOKEN=your_token \
  -e MOBILE_API_KEY=your_key \
  agribot-api

# Push to Docker Hub
docker tag agribot-api yourusername/agribot-api
docker push yourusername/agribot-api

# Deploy to any cloud provider that supports Docker
```

### Database Setup (Production)

If using PostgreSQL in production:

```bash
# Install Alembic for migrations
pip install alembic psycopg2-binary

# Initialize Alembic
alembic init alembic

# Create first migration
alembic revision --autogenerate -m "Initial schema"

# Run migrations
alembic upgrade head
```

---

## 📱 Mobile App Deployment

### Step 1: Configure EAS (Expo Application Services)

```bash
cd mobile-new

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure
```

### Step 2: Update app.json

```json
{
  "expo": {
    "name": "SEMMA-AI",
    "slug": "semma-ai",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "semmaai",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2E7D32"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.semmaai.app",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2E7D32"
      },
      "package": "com.semmaai.app",
      "versionCode": 1
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### Step 3: Update API Configuration

Edit `config/api.ts`:

```typescript
const getApiUrl = (): string => {
  if (__DEV__) {
    return `http://${LOCAL_IP}:8000`;
  }
  // Production URL from Railway/Render
  return 'https://your-backend-url.railway.app';
};

export const MOBILE_API_KEY = process.env.EXPO_PUBLIC_MOBILE_API_KEY || 'your-production-key';
```

### Step 4: Build for Stores

```bash
# Build for Android
eas build --platform android --profile production

# Build for iOS (requires Apple Developer account)
eas build --platform ios --profile production

# Build for both
eas build --platform all --profile production
```

### Step 5: Submit to App Stores

```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

### Alternative: Over-The-Air (OTA) Updates

For quick updates without app store review:

```bash
# Publish update
eas update --branch production --message "Bug fixes and improvements"
```

---

## 🌐 Web Landing Deployment

### Option 1: Vercel (Recommended for Next.js)

```bash
cd agribot-landing

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

Or use Vercel's GitHub integration:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select `agribot-landing` folder
4. Configure environment variables
5. Deploy automatically on every push

### Option 2: Netlify

```bash
cd agribot-landing

# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

### Option 3: Static Export (for any host)

```bash
# Update next.config.ts for static export
# Then build
npm run build

# Deploy the 'out' folder to any static host
# (AWS S3, Cloudflare Pages, GitHub Pages, etc.)
```

---

## 🔐 Environment Configuration

### Backend Environment Variables

Create `.env` file (or set in hosting dashboard):

```bash
# Required
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
MOBILE_API_KEY=your-secure-random-key-here

# Optional - Database
DATABASE_URL=postgresql://user:pass@host:5432/agribot
REDIS_URL=redis://host:6379

# Optional - Security
API_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
JWT_SECRET_KEY=your-jwt-secret

# Optional - External APIs
GOOGLE_CLOUD_PROJECT=your-project-id
OPENWEATHER_API_KEY=your-key
```

### Mobile Environment Variables

Create `.env.production`:

```bash
EXPO_PUBLIC_API_URL=https://your-backend.railway.app
EXPO_PUBLIC_MOBILE_API_KEY=match-backend-key
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Web Environment Variables

Create `.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## 📊 Monitoring & Maintenance

### Application Monitoring

#### Backend Monitoring

```bash
# Install monitoring libraries
pip install sentry-sdk loguru prometheus-client

# Add to src/api_app.py
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")
```

#### Mobile Monitoring

```bash
cd mobile-new
npm install @sentry/react-native
npx @sentry/wizard -i reactNative
```

#### Web Monitoring

```bash
cd agribot-landing
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Health Checks

Add health check endpoint to backend (`src/api_app.py`):

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }
```

### Logging

Use centralized logging:

- **Backend**: Loguru + CloudWatch/Datadog
- **Mobile**: Sentry
- **Web**: Vercel Analytics + Sentry

### Backups

```bash
# Database backups (automated)
# Railway/Render handle this automatically

# Manual backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Upload to S3 or Google Cloud Storage
aws s3 cp backup_*.sql s3://your-bucket/backups/
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Already configured)

Push to `main` branch triggers:
- ✅ Linting and testing
- ✅ Backend deployment (Railway)
- ✅ Web deployment (Vercel)
- ✅ Mobile build preview (Expo)

### Manual Deployment Commands

```bash
# Deploy backend
cd ghana-agri-bot
railway up

# Deploy web
cd agribot-landing
vercel --prod

# Deploy mobile update
cd mobile-new
eas update --branch production
```

---

## 🐛 Troubleshooting

### Backend not responding
- Check logs: `railway logs`
- Verify environment variables
- Check database connection
- Verify API keys are valid

### Mobile app can't connect
- Verify API_URL in config/api.ts
- Check CORS settings on backend
- Verify MOBILE_API_KEY matches
- Check device internet connection

### Web page not loading
- Check build logs in Vercel
- Verify environment variables
- Check domain DNS settings
- Clear browser cache

---

## 📞 Support

For deployment issues:
- Email: devops@semma-ai.com
- Slack: #deployment channel
- Documentation: [Full Docs](https://docs.semma-ai.com)

---

## ✅ Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates active
- [ ] Domain names configured
- [ ] Monitoring tools setup
- [ ] Backup strategy in place
- [ ] Health checks responding
- [ ] CORS configured correctly
- [ ] API keys secured (not in code)
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Rate limiting enabled
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team notified of URLs

---

**Ready to Deploy?** Follow the steps above and your SEMMA-AI platform will be live! 🚀
