# 🚀 Deployment Guide

## Architecture

- **Frontend**: Vercel (Next.js)
- **Backend**: Railway or Render (FastAPI + Python)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage / AWS S3

---

## 📦 Backend Deployment (Railway - Recommended)

### Option 1: Railway (Easiest)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   cd ghana-agri-bot
   railway init
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set GROQ_API_KEY=your_groq_key
   railway variables set WEATHER_API_KEY=your_weather_key
   railway variables set MOBILE_API_KEY=your_mobile_key
   railway variables set API_ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get Your API URL**
   ```bash
   railway domain
   # Example: https://agribot-production.up.railway.app
   ```

### Option 2: Render

1. **Go to [render.com](https://render.com)**
2. **Create New Web Service**
3. **Connect GitHub repository**
4. **Configure**:
   - Name: `agribot-api`
   - Root Directory: `ghana-agri-bot`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn src.api_app:app --host 0.0.0.0 --port $PORT`

5. **Add Environment Variables**:
   - `GROQ_API_KEY`
   - `WEATHER_API_KEY`
   - `MOBILE_API_KEY`
   - `API_ALLOWED_ORIGINS`
   - `PYTHON_VERSION=3.11.0`

6. **Add Disk** (for ChromaDB):
   - Mount Path: `/app/data`
   - Size: 10GB

---

## 🌐 Frontend Deployment (Vercel)

### 1. Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 2. Deploy
```bash
cd agribot-landing
vercel
```

### 3. Set Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

**Production Variables:**
```
NEXT_PUBLIC_API_BASE_URL=https://your-railway-app.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Redeploy
```bash
vercel --prod
```

---

## 🔧 Environment Variables Checklist

### Backend (Railway/Render)
- ✅ `GROQ_API_KEY` - Your Groq API key
- ✅ `WEATHER_API_KEY` - OpenWeather API key
- ✅ `MOBILE_API_KEY` - Custom API key for mobile auth
- ✅ `API_ALLOWED_ORIGINS` - Frontend URL (e.g., `https://semmaai.vercel.app`)
- ✅ `GOOGLE_APPLICATION_CREDENTIALS_JSON` - Service account JSON (optional)
- ✅ `PYTHON_VERSION` - `3.11.0`

### Frontend (Vercel)
- ✅ `NEXT_PUBLIC_API_BASE_URL` - Backend URL
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

---

## 🧪 Testing Your Deployment

### Test Backend
```bash
# Health check
curl https://your-railway-app.up.railway.app/health

# Weather endpoint
curl https://your-railway-app.up.railway.app/weather?location=Accra

# Market data
curl https://your-railway-app.up.railway.app/market/crops
```

### Test Frontend
1. Visit `https://your-app.vercel.app`
2. Try logging in
3. Navigate to marketplace
4. Test wallet features

---

## 📊 Monitoring

### Railway Dashboard
- View logs: `railway logs`
- Monitor metrics: Check Railway dashboard

### Vercel Analytics
- View in Vercel dashboard
- Check function logs
- Monitor build status

### Supabase Dashboard
- Monitor database queries
- Check auth logs
- View storage usage

---

## 🔄 CI/CD (Automatic Deployments)

### Backend (Railway)
- Push to `main` branch → Auto deploy
- Environment: Production

### Frontend (Vercel)
- Push to `main` → Production deployment
- Pull Requests → Preview deployments

---

## 💰 Cost Estimates

### Railway (Backend)
- **Starter Plan**: $5/month
- Includes: 512MB RAM, 1GB storage
- Scale as needed

### Render (Backend Alternative)
- **Starter Plan**: $7/month
- Includes: 512MB RAM

### Vercel (Frontend)
- **Hobby Plan**: Free
- **Pro Plan**: $20/month (if you need more)

### Supabase
- **Free Plan**: Good for MVP
- **Pro Plan**: $25/month (production)

**Total MVP**: ~$5-12/month

---

## 🐛 Troubleshooting

### CORS Issues
Update backend `API_ALLOWED_ORIGINS`:
```bash
railway variables set API_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://preview.vercel.app
```

### ChromaDB Data Persistence
Ensure disk is mounted at `/app/data` on Railway/Render

### 500 Errors on Backend
Check logs:
```bash
railway logs
```

### Build Failures
- Verify `requirements.txt` is complete
- Check Python version matches (3.11)
- Ensure all dependencies are compatible

---

## 🎯 Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Deploy frontend to Vercel
3. ✅ Set up custom domain (optional)
4. ✅ Enable monitoring/logging
5. ✅ Set up backup strategy for ChromaDB
6. ✅ Configure rate limiting (production)
