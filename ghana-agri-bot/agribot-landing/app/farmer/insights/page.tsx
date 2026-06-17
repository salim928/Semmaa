'use client'

// app/farmer/insights/page.tsx – Full-featured insights dashboard mirroring mobile InsightsScreen

import { useEffect, useState } from 'react'
import { api, ImpactSummary, WeatherResponse } from '@/lib/api'

interface WeatherDay {
  day: string
  temp: number
  condition: string
  icon: string
}

interface CropPrice {
  crop: string
  percentage: number
  trend: 'up' | 'down' | 'stable'
  price: number
  change: number
}

interface Alert {
  id: string
  type: 'warning' | 'info' | 'success' | 'danger'
  title: string
  message: string
  icon: string
  color: string
}

const MOCK_FORECAST: WeatherDay[] = [
  { day: 'Mon', temp: 29, condition: 'Sunny', icon: '☀️' },
  { day: 'Tue', temp: 27, condition: 'Cloudy', icon: '⛅' },
  { day: 'Wed', temp: 25, condition: 'Rainy', icon: '🌧️' },
  { day: 'Thu', temp: 30, condition: 'Sunny', icon: '☀️' },
  { day: 'Fri', temp: 28, condition: 'Cloudy', icon: '☁️' },
  { day: 'Sat', temp: 26, condition: 'Rainy', icon: '🌧️' },
  { day: 'Sun', temp: 31, condition: 'Sunny', icon: '☀️' },
]

const MOCK_TOP_CROPS: CropPrice[] = [
  { crop: 'Maize', percentage: 85, trend: 'up', price: 2.8, change: 15.2 },
  { crop: 'Tomatoes', percentage: 72, trend: 'down', price: 5.2, change: -8.5 },
  { crop: 'Cassava', percentage: 65, trend: 'stable', price: 1.5, change: 0.5 },
  { crop: 'Rice', percentage: 58, trend: 'up', price: 4.0, change: 12.0 },
  { crop: 'Plantain', percentage: 45, trend: 'stable', price: 3.5, change: 2.0 },
]

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'danger',
    title: 'Pest Alert',
    message: 'Fall armyworm detected in Northern Region',
    icon: '🐛',
    color: 'from-rose-500 to-rose-600',
  },
  {
    id: '2',
    type: 'info',
    title: 'Weather Update',
    message: 'Heavy rainfall expected next week',
    icon: '🌧️',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: '3',
    type: 'success',
    title: 'Market Opportunity',
    message: 'Tomato prices rising - good time to sell',
    icon: '📈',
    color: 'from-emerald-500 to-emerald-600',
  },
]

const PRICE_CHART_DATA = [
  { month: 'Jan', maize: 45, tomatoes: 30 },
  { month: 'Feb', maize: 65, tomatoes: 45 },
  { month: 'Mar', maize: 58, tomatoes: 40 },
  { month: 'Apr', maize: 80, tomatoes: 65 },
  { month: 'May', maize: 95, tomatoes: 75 },
  { month: 'Jun', maize: 88, tomatoes: 70 },
]

export default function FarmerInsightsPage() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [impact, setImpact] = useState<ImpactSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'weather' | 'market' | 'alerts'>('overview')

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const [w, i] = await Promise.allSettled([
          api.weather('Accra'),
          api.impactSummary(),
        ])

        if (w.status === 'fulfilled') {
          setWeather(w.value)
        }
        if (i.status === 'fulfilled') {
          setImpact(i.value)
        }
      } catch {
        setError('Could not load insights. Is the API and impact endpoint running?')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      default: return '➡️'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-emerald-600'
      case 'down': return 'text-rose-600'
      default: return 'text-amber-600'
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-emerald-950 sm:text-2xl">
          Farm Insights
        </h1>
        <p className="text-sm text-emerald-600 sm:text-base">
          Weather forecasts, market trends, and farming advisories.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto rounded-xl bg-emerald-50 p-1">
        {(['overview', 'weather', 'market', 'alerts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-600 hover:text-emerald-900'
            }`}
          >
            {tab === 'overview' && '📊 '}
            {tab === 'weather' && '🌤️ '}
            {tab === 'market' && '💰 '}
            {tab === 'alerts' && '🔔 '}
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:text-sm">
          {error}
        </p>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Weather overview */}
          <section className="rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 p-4 text-white shadow sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-100">
                  Today&apos;s Weather
                </p>
                <h2 className="mt-1 text-lg font-bold sm:text-xl">
                  {weather?.loc || 'Accra, Ghana'}
                </h2>
                <p className="text-sm text-sky-100">
                  {weather?.summary || '28°C - Partly cloudy with chance of afternoon showers'}
                </p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-4xl">
                🌤️
              </div>
            </div>
            {/* Mini forecast */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {MOCK_FORECAST.slice(0, 5).map((day) => (
                <div key={day.day} className="flex shrink-0 flex-col items-center rounded-xl bg-white/10 px-3 py-2">
                  <span className="text-xs text-sky-100">{day.day}</span>
                  <span className="my-1 text-xl">{day.icon}</span>
                  <span className="text-sm font-semibold">{day.temp}°</span>
                </div>
              ))}
            </div>
          </section>

          {/* Alerts Preview */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">
                Active Alerts
              </h2>
              <button 
                onClick={() => setActiveTab('alerts')}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                View all →
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {MOCK_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-2xl bg-gradient-to-br ${alert.color} p-4 text-white shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{alert.icon}</span>
                    <div>
                      <p className="font-semibold">{alert.title}</p>
                      <p className="mt-1 text-xs text-white/80">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Top Crops */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">
              Top Performing Crops
            </h2>
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
              {MOCK_TOP_CROPS.slice(0, 4).map((crop) => (
                <div key={crop.crop} className="flex items-center gap-3 border-b border-emerald-50 py-3 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-emerald-900">{crop.crop}</p>
                      <span className={`text-sm font-semibold ${getTrendColor(crop.trend)}`}>
                        {getTrendIcon(crop.trend)} {crop.change > 0 ? '+' : ''}{crop.change}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                        style={{ width: `${crop.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Impact summary cards */}
          {impact && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">
                Impact Summary
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {Object.entries(impact).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-emerald-100 bg-white p-3 text-sm shadow-sm sm:p-4"
                  >
                    <p className="text-xs font-medium text-emerald-600">{key}</p>
                    <p className="mt-1 text-base font-bold text-emerald-950">{String(value)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Weather Tab */}
      {activeTab === 'weather' && (
        <>
          <section className="rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 p-5 text-white shadow sm:p-6">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-100">Current Weather</p>
              <h2 className="mt-2 text-4xl font-bold">28°C</h2>
              <p className="mt-1 text-sky-100">{weather?.loc || 'Accra, Ghana'}</p>
              <p className="text-sm">{weather?.summary || 'Partly cloudy'}</p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-xs text-sky-100">Humidity</p>
                <p className="mt-1 text-lg font-bold">75%</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-xs text-sky-100">Wind</p>
                <p className="mt-1 text-lg font-bold">12 km/h</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-xs text-sky-100">Rain</p>
                <p className="mt-1 text-lg font-bold">30%</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">7-Day Forecast</h2>
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
              {MOCK_FORECAST.map((day) => (
                <div key={day.day} className="flex items-center justify-between border-b border-emerald-50 py-3 last:border-0">
                  <span className="w-12 font-medium text-emerald-900">{day.day}</span>
                  <span className="text-2xl">{day.icon}</span>
                  <span className="text-sm text-emerald-600">{day.condition}</span>
                  <span className="font-bold text-emerald-900">{day.temp}°C</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <h3 className="font-semibold text-amber-900">🌱 Farming Tip</h3>
            <p className="mt-1 text-sm text-amber-800">
              With rain expected mid-week, consider delaying fertilizer application until after the rain to prevent nutrient washout.
            </p>
          </section>
        </>
      )}

      {/* Market Tab */}
      {activeTab === 'market' && (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">Price Trends</h2>
            {/* Simple bar chart visualization */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Maize
                </span>
                <span className="flex items-center gap-1 text-xs text-violet-600">
                  <span className="h-2 w-2 rounded-full bg-violet-500" /> Tomatoes
                </span>
              </div>
              <div className="flex items-end gap-2">
                {PRICE_CHART_DATA.map((d) => (
                  <div key={d.month} className="flex-1 text-center">
                    <div className="flex h-32 items-end justify-center gap-1">
                      <div 
                        className="w-3 rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400"
                        style={{ height: `${d.maize}%` }}
                      />
                      <div 
                        className="w-3 rounded-t bg-gradient-to-t from-violet-600 to-violet-400"
                        style={{ height: `${d.tomatoes}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-emerald-500">{d.month}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">Crop Rankings</h2>
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
              {MOCK_TOP_CROPS.map((crop, idx) => (
                <div key={crop.crop} className="flex items-center gap-3 border-b border-emerald-50 py-3 last:border-0">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                    idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-emerald-200 text-emerald-700'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-900">{crop.crop}</p>
                    <p className="text-xs text-emerald-500">GHS {crop.price}/kg</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${getTrendColor(crop.trend)}`}>
                      {getTrendIcon(crop.trend)} {crop.change > 0 ? '+' : ''}{crop.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <section className="space-y-4">
          {MOCK_ALERTS.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl bg-gradient-to-br ${alert.color} p-5 text-white shadow-md`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{alert.icon}</span>
                <div className="flex-1">
                  <p className="text-lg font-bold">{alert.title}</p>
                  <p className="mt-1 text-sm text-white/90">{alert.message}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30">
                      Learn More
                    </button>
                    <button className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
            <p className="text-3xl">🔔</p>
            <p className="mt-2 font-semibold text-emerald-900">Stay Informed</p>
            <p className="mt-1 text-sm text-emerald-600">
              Enable notifications to receive real-time alerts about weather, pests, and market opportunities.
            </p>
            <button className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Enable Notifications
            </button>
          </div>
        </section>
      )}

      {!impact && !loading && activeTab === 'overview' && (
        <p className="text-xs text-emerald-500 sm:text-sm">
          Impact metrics are not available yet. Once you have some usage and
          run the reporting scripts, this section will populate.
        </p>
      )}
    </div>
  )
}


