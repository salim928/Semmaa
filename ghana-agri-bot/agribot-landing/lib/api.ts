// lib/api.ts
'use client'

/**
 * Simple API client for the farmer web app.
 * Talks to the existing FastAPI backend used by Telegram + mobile.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const API_KEY = process.env.NEXT_PUBLIC_MOBILE_API_KEY

async function request<T>(
  path: string,
  options: RequestInit & { searchParams?: Record<string, string> } = {},
): Promise<T> {
  const url = new URL(path, API_BASE_URL)

  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([k, v]) =>
      url.searchParams.set(k, v),
    )
  }

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options.headers) {
    for (const [k, v] of Object.entries(options.headers)) {
      baseHeaders[k] = String(v)
    }
  }

  if (API_KEY) {
    baseHeaders['x-api-key'] = API_KEY
  }

  const res = await fetch(url.toString(), {
    ...options,
    headers: baseHeaders,
  })

  if (!res.ok) {
    throw new Error(`API error ${res.status}`)
  }

  return res.json()
}

export interface AskResponse {
  answer: string
  duration_ms: number
  kb_hits: number
}

export interface WeatherResponse {
  loc: string
  summary: string
  temperature?: string
  humidity?: string
  condition?: string
  wind?: string
  forecast?: string
}

export interface MarketCropsResponse {
  crops: string[]
}

export interface MarketPricesRow {
  city: string
  price: string
  unit: string
  date: string
}

export interface MarketPricesResponse {
  crop: string
  rows: MarketPricesRow[]
}

export interface AnalyzeImageRequest {
  image: string
  crop?: string
  location?: string
}

export interface AnalyzeImageResponse {
  disease: string
  confidence: number
  severity: string
  crop: string
  symptoms: string[]
  treatment: string[]
  prevention: string[]
  organicTreatment?: string[]
  estimatedYieldLoss?: string
  affectedArea?: string
}

export interface ImpactSummary {
  [key: string]: string | number
}

export const api = {
  ask(question: string, location?: string) {
    return request<AskResponse>('/ask', {
      method: 'POST',
      body: JSON.stringify({
        question,
        location: location || 'Ghana',
      }),
    })
  },

  weather(loc: string = 'Accra') {
    return request<WeatherResponse>('/weather', {
      method: 'GET',
      searchParams: { loc },
    })
  },

  marketCrops() {
    return request<MarketCropsResponse>('/market/crops', {
      method: 'GET',
    })
  },

  marketPrices(crop: string) {
    return request<MarketPricesResponse>('/market/prices', {
      method: 'GET',
      searchParams: { crop },
    })
  },

  analyzeImage(payload: AnalyzeImageRequest) {
    return request<AnalyzeImageResponse>('/analyze-image', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  impactSummary() {
    return request<ImpactSummary>('/impact/summary', {
      method: 'GET',
    })
  },
}


