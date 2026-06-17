# Revenue Model & Technical Architecture

## 💰 Revenue Model (Sustainability Plan)

### Phase 1: Free Tier (Months 1-6)
**Goal**: Build trust, gather data, prove value
- All features free for farmers
- Focus on traction and user acquisition
- Revenue: $0 (funded by grants/pre-seed)

### Phase 2: Freemium (Months 6-12)

**Basic (Free)**
- 10 AI questions/month
- Basic weather alerts
- Marketplace browsing
- SMS notifications

**Premium (GHS 5/month or $0.50)**
- Unlimited AI questions
- Voice input/output
- Priority weather alerts (24-48hrs advance)
- Advanced crop calendar
- Post-harvest storage reminders
- WhatsApp support

**Target**: 10% conversion rate (100 paying users from 1000 free)
**MRR Goal**: GHS 500/month ($50)

### Phase 3: Marketplace Commission (Months 6+)

**Model**: 2-5% commission on successful transactions
- Farmer sells GHS 1,000 of maize → Platform takes GHS 20-50
- Buyers pay commission (farmers keep full price)
- Only charge on completed, verified transactions

**Target**: 
- 200 transactions/month @ GHS 500 average
- 3% commission = GHS 3,000/month ($300)

### Phase 4: B2B/Partnership Revenue (Months 9+)

**Agro-Input Dealers**
- Lead generation: GHS 50-100 per qualified buyer
- Sponsored product placements
- Inventory management integration
- Target: GHS 5,000/month from 3-5 partners

**Agricultural Processors/Buyers**
- Direct farmer access
- Quality-assured produce pipeline
- Data insights (crop readiness, volumes)
- Target: GHS 3,000/month from bulk buyers

**Mobile Money Providers (MTN, Vodafone)**
- Transaction fee sharing (when fintech reintegrates)
- User acquisition incentives
- Target: Future revenue stream

### Phase 5: Data & Insights (Year 2+)

**Aggregate, anonymized data for:**
- Government (MOFA) - crop planning
- NGOs - impact measurement
- Researchers - climate adaptation
- Pricing: GHS 10,000-50,000 per data package

### Phase 6: Climate Finance (Year 2+)

**Carbon Credits & Climate Adaptation**
- Verified post-harvest loss reduction
- Sustainable farming practice adoption
- Climate-smart agriculture certification
- Target: $50,000-200,000 annually

### Revenue Projection (12 Months)

| Month | Free Users | Premium | Marketplace | B2B | Total MRR |
|-------|-----------|---------|-------------|-----|-----------|
| 1-3   | 100       | GHS 0   | GHS 0       | GHS 0 | GHS 0   |
| 4-6   | 500       | GHS 0   | GHS 0       | GHS 0 | GHS 0   |
| 7     | 1,000     | GHS 500 | GHS 1,000   | GHS 0 | GHS 1,500 |
| 9     | 2,000     | GHS 1,000 | GHS 2,500 | GHS 2,000 | GHS 5,500 |
| 12    | 5,000     | GHS 2,500 | GHS 5,000 | GHS 5,000 | GHS 12,500 |

**Year 1 Revenue**: ~GHS 50,000 ($5,000)  
**Break-even**: Month 18-24

### Unit Economics (Steady State)

**Cost Per Farmer (Monthly)**
- LLM API (Groq): GHS 0.50
- SMS/WhatsApp: GHS 1.00
- Infrastructure (Supabase): GHS 0.30
- Support (10% need help): GHS 0.50
- **Total CAC**: GHS 2.30 (~$0.23)

**Revenue Per Farmer (Monthly)**
- Premium subscription: GHS 0.50 (10% conversion × GHS 5)
- Marketplace commission: GHS 1.50 (avg)
- **Total ARPU**: GHS 2.00

**Target**: 
- Break even at 5,000 users
- Profitable at 10,000+ users
- LTV:CAC ratio > 3:1

---

## 🏗️ Technical Architecture (Production-Grade)

### System Overview

```
┌───────────────────────────────────────────────────────────┐
│                     Client Layer                          │
├─────────────────┬─────────────────┬───────────────────────┤
│   Mobile App    │   Telegram Bot  │   Landing Page        │
│  (React Native) │    (Python)     │    (Next.js)          │
│                 │                 │                        │
│  • Offline-1st  │  • Webhook      │  • SSG/ISR            │
│  • Service Wkr  │  • Async Jobs   │  • Edge Runtime       │
│  • IndexedDB    │  • Rate Limit   │  • Image Optimization │
└────────┬────────┴────────┬────────┴────────┬──────────────┘
         │                 │                 │
         │    ┌────────────▼─────────────────┐  │
         └────►   API Gateway (FastAPI)   ◄──┘
              │   • Rate Limiting         │
              │   • Auth Middleware       │
              │   • Request Validation    │
              │   • Response Caching      │
              └────────────┬───────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼─────┐    ┌─────▼──────┐   ┌─────▼──────┐
    │   AI     │    │  Business  │   │   Data     │
    │  Layer   │    │   Logic    │   │   Layer    │
    └────┬─────┘    └─────┬──────┘   └─────┬──────┘
         │                │                 │
    ┌────▼─────┐    ┌─────▼──────┐   ┌─────▼──────┐
    │ Groq LLM │    │ ChromaDB   │   │  Supabase  │
    │ (Cache)  │    │ (Vector)   │   │ (Postgres) │
    └──────────┘    └────────────┘   └────────────┘
```

### Technology Stack

#### Backend (Python)
```python
# requirements.txt
fastapi==0.108.0              # Async API framework
uvicorn[standard]==0.25.0     # ASGI server
pydantic==2.5.0               # Data validation
python-multipart==0.0.6       # File uploads

# AI/ML Stack
groq==0.4.0                   # LLM inference
chromadb==0.4.20              # Vector DB
langchain==0.1.0              # LLM orchestration
sentence-transformers==2.2.0  # Embeddings

# Database
supabase==2.3.0               # Postgres client
redis[hiredis]==5.0.1         # Caching
sqlalchemy==2.0.25            # ORM (optional)

# Background Jobs
celery==5.3.4                 # Task queue
redis==5.0.1                  # Broker

# Observability
sentry-sdk[fastapi]==1.39.0   # Error tracking
prometheus-client==0.19.0     # Metrics
python-json-logger==2.0.7     # Structured logs

# Security
python-jose[cryptography]     # JWT
passlib[bcrypt]               # Password hashing
slowapi==0.1.9                # Rate limiting

# Testing
pytest==7.4.0
pytest-asyncio==0.21.0
httpx==0.25.0                 # Async test client
pytest-cov==4.1.0             # Coverage
```

#### Frontend (TypeScript)
```json
{
  "name": "agribot-mobile",
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "zod": "^3.22.0",
    
    "@react-native-async-storage/async-storage": "^1.21.0",
    "expo-router": "~3.4.0",
    "react-native-reanimated": "~3.6.0",
    
    "@sentry/react-native": "^5.15.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.0",
    "typescript": "^5.3.0",
    "prettier": "^3.1.0",
    "eslint": "^8.55.0",
    
    "@testing-library/react-native": "^12.4.0",
    "jest": "^29.7.0"
  }
}
```

### Performance Optimization

#### API Response Caching
```python
# src/middleware/caching.py
import redis
from functools import wraps
import hashlib
import json

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    decode_responses=True,
    socket_connect_timeout=5
)

def cache_response(ttl: int = 3600):
    """Cache API responses in Redis"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function args
            cache_key = f"{func.__name__}:{hashlib.md5(
                json.dumps(kwargs, sort_keys=True).encode()
            ).hexdigest()}"
            
            # Check cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            redis_client.setex(
                cache_key,
                ttl,
                json.dumps(result)
            )
            
            return result
        return wrapper
    return decorator

@app.post("/api/v1/advisory")
@cache_response(ttl=1800)  # 30 min cache
async def get_advisory(query: AdvisoryQuery):
    return await generate_advice(query)
```

#### Mobile Offline Support
```typescript
// hooks/useOfflineQuery.ts
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export function useOfflineQuery<T>(
  key: string[],
  fetcher: () => Promise<T>,
  options = {}
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const netState = await NetInfo.fetch();
      
      if (!netState.isConnected) {
        // Return cached data when offline
        const cached = await AsyncStorage.getItem(key.join(':'));
        if (cached) {
          return JSON.parse(cached) as T;
        }
        throw new Error('No internet and no cached data');
      }
      
      // Fetch fresh data
      const data = await fetcher();
      
      // Cache for offline use
      await AsyncStorage.setItem(
        key.join(':'),
        JSON.stringify(data)
      );
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    ...options,
  });
}

// Usage
const { data: advice } = useOfflineQuery(
  ['commonAdvice'],
  fetchCommonAdvice
);
```

### Error Handling

#### Structured Error Responses
```python
# src/errors.py
from enum import Enum
from pydantic import BaseModel
from fastapi import HTTPException
from fastapi.responses import JSONResponse

class ErrorCode(str, Enum):
    RATE_LIMIT = "RATE_LIMIT_EXCEEDED"
    INVALID_INPUT = "INVALID_INPUT"
    LLM_ERROR = "LLM_SERVICE_ERROR"
    DB_ERROR = "DATABASE_ERROR"
    AUTH_ERROR = "AUTHENTICATION_ERROR"

class APIError(BaseModel):
    code: ErrorCode
    message: str
    details: dict | None = None
    request_id: str

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):
    request_id = request.headers.get(
        'X-Request-ID',
        str(uuid.uuid4())
    )
    
    # Log to Sentry
    sentry_sdk.capture_exception(exc)
    
    # Structured logging
    logger.error(
        "unhandled_exception",
        request_id=request_id,
        path=request.url.path,
        method=request.method,
        error=str(exc),
        exc_info=True
    )
    
    # User-friendly error
    if isinstance(exc, HTTPException):
        status_code = exc.status_code
        message = exc.detail
    else:
        status_code = 500
        message = "An error occurred. Our team has been notified."
    
    error = APIError(
        code=ErrorCode.from_exception(exc),
        message=message,
        request_id=request_id
    )
    
    return JSONResponse(
        status_code=status_code,
        content=error.dict()
    )
```

#### Frontend Error Boundaries
```typescript
// components/ErrorBoundary.tsx
import React from 'react';
import * as Sentry from '@sentry/react-native';
import { View, Text, Button } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: { react: errorInfo },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return (
        <Fallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
```

### Monitoring & Observability

#### Structured Logging
```python
# src/logging_config.py
import structlog
import logging
from pythonjsonlogger import jsonlogger

def setup_logging():
    """Configure structured logging"""
    
    # JSON formatter
    logHandler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        '%(timestamp)s %(level)s %(name)s %(message)s'
    )
    logHandler.setFormatter(formatter)
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

# Usage
logger = structlog.get_logger()

@app.post("/api/v1/advisory")
async def get_advisory(query: AdvisoryQuery, user_id: str):
    logger.info(
        "advisory_request",
        user_id=user_id,
        crop=query.crop,
        has_location=bool(query.location),
        question_length=len(query.question)
    )
    
    start_time = time.time()
    
    try:
        result = await llm_service.generate(query)
        duration_ms = (time.time() - start_time) * 1000
        
        logger.info(
            "advisory_success",
            user_id=user_id,
            confidence=result.confidence,
            duration_ms=duration_ms,
            kb_hits=result.kb_hits
        )
        
        return result
        
    except Exception as e:
        logger.error(
            "advisory_error",
            user_id=user_id,
            error=str(e),
            exc_info=True
        )
        raise
```

#### Prometheus Metrics
```python
# src/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Request metrics
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

# Business metrics
active_users = Gauge(
    'active_users_total',
    'Number of active users'
)

advisory_requests = Counter(
    'advisory_requests_total',
    'Total advisory requests',
    ['crop', 'language']
)

llm_cache_hits = Counter(
    'llm_cache_hits_total',
    'LLM cache hits vs misses',
    ['hit']
)

# Middleware
@app.middleware("http")
async def track_metrics(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    
    request_count.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    request_duration.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    return response
```

### Security Best Practices

#### Rate Limiting
```python
# src/middleware/rate_limit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/hour"]
)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)

@app.post("/api/v1/advisory")
@limiter.limit("20/minute")  # Prevent abuse
async def get_advisory(
    request: Request,
    query: AdvisoryQuery
):
    return await advisory_service.generate(query)
```

#### Input Validation
```python
# src/validators.py
from pydantic import BaseModel, validator, Field
from typing import Literal

class AdvisoryQuery(BaseModel):
    question: str = Field(..., min_length=5, max_length=500)
    crop: Literal[
        'maize', 'cassava', 'cocoa',
        'rice', 'yam', 'plantain'
    ] | None = None
    location: str | None = Field(None, max_length=100)
    language: Literal['en', 'tw', 'ga', 'ee'] = 'en'
    
    @validator('question')
    def sanitize_question(cls, v):
        # Remove potential XSS attempts
        from bleach import clean
        return clean(v, tags=[], strip=True)
    
    @validator('location')
    def validate_location(cls, v):
        if v and not v.replace(' ', '').isalpha():
            raise ValueError('Invalid location format')
        return v
```

### Testing Strategy

#### Backend Testing
```python
# tests/test_advisory.py
import pytest
from httpx import AsyncClient
from app import app

@pytest.mark.asyncio
async def test_advisory_endpoint_success():
    async with AsyncClient(
        app=app,
        base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/advisory",
            json={
                "question": "When should I plant maize?",
                "crop": "maize",
                "location": "Kumasi"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "answer" in data
        assert data["confidence"] > 0.5
        assert response.elapsed.total_seconds() < 2.0

@pytest.mark.asyncio
async def test_advisory_rate_limit():
    """Test rate limiting works"""
    async with AsyncClient(
        app=app,
        base_url="http://test"
    ) as client:
        # Make 21 requests (limit is 20/min)
        for i in range(21):
            response = await client.post(
                "/api/v1/advisory",
                json={"question": f"Test {i}"}
            )
            
            if i < 20:
                assert response.status_code == 200
            else:
                assert response.status_code == 429
```

#### Frontend Testing
```typescript
// __tests__/ChatScreen.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ChatScreen } from '../screens/ChatScreen';

describe('ChatScreen', () => {
  it('sends question and receives response', async () => {
    render(<ChatScreen />);
    
    const input = screen.getByPlaceholderText('Ask about farming...');
    const sendButton = screen.getByText('Send');
    
    fireEvent.changeText(input, 'When to plant maize?');
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/plant maize/i)).toBeVisible();
    }, { timeout: 3000 });
  });
  
  it('handles offline mode', async () => {
    // Mock offline state
    jest.mock('@react-native-community/netinfo', () => ({
      fetch: () => Promise.resolve({ isConnected: false }),
    }));
    
    render(<ChatScreen />);
    
    expect(screen.getByText(/Offline Mode/i)).toBeVisible();
    expect(screen.getByText(/Cached advice available/i)).toBeVisible();
  });
});
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Run tests
        run: |
          pytest --cov=src --cov-report=xml --cov-report=html
          coverage report --fail-under=80
      
      - name: Type checking
        run: mypy src/
      
      - name: Linting
        run: |
          black --check src/
          flake8 src/
      
      - name: Security scan
        run: bandit -r src/ -f json -o bandit-report.json
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        run: |
          curl -fsSL https://railway.app/install.sh | sh
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Performance Targets

| Metric | Target | Alert Threshold | Priority |
|--------|--------|----------------|----------|
| API Response (p50) | < 500ms | > 1s | HIGH |
| API Response (p95) | < 2s | > 3s | HIGH |
| Error Rate | < 0.1% | > 1% | CRITICAL |
| Uptime | > 99.5% | < 99% | CRITICAL |
| Cache Hit Rate | > 70% | < 50% | MEDIUM |
| Mobile App Load | < 3s | > 5s | MEDIUM |
| LLM Response Time | < 1.5s | > 3s | HIGH |

---

This architecture is designed for:
- ✅ **Scalability**: 10,000+ concurrent users
- ✅ **Reliability**: 99.9% uptime
- ✅ **Performance**: < 2s response times
- ✅ **Maintainability**: Clean code, tests, docs
- ✅ **Observability**: Logs, metrics, traces
- ✅ **Cost-Effective**: $100-200/month at 5k users
