'use client'

// app/farmer/tools/planting-calendar/page.tsx – Web version of the planting calendar

import { useEffect, useState } from 'react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Ghana's agricultural regions
const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Brong Ahafo',
]

const SEASONS: Record<string, { months: string; color: string; description: string }> = {
  'Major Rainy': { 
    months: 'March - July', 
    color: '#3b82f6',
    description: 'Best time for planting most crops'
  },
  'Minor Rainy': { 
    months: 'September - November', 
    color: '#10b981',
    description: 'Secondary planting season'
  },
  'Dry Season': { 
    months: 'December - February', 
    color: '#f59e0b',
    description: 'Ideal for irrigation farming'
  },
}

// Complete crop calendar from mobile app
const CROP_CALENDAR: Record<
  string,
  Record<
    string,
    Record<string, { plant: string; harvest: string; best: boolean }>
  >
> = {
  Maize: {
    'Southern Ghana': {
      'Major Rainy': { plant: 'March-April', harvest: 'July-August', best: true },
      'Minor Rainy': { plant: 'September', harvest: 'December', best: false },
    },
    'Northern Ghana': {
      'Major Rainy': { plant: 'May-June', harvest: 'September-October', best: true },
    },
  },
  Cassava: {
    'All Regions': {
      'Major Rainy': { plant: 'April-May', harvest: '12-18 months later', best: true },
      'Minor Rainy': { plant: 'October', harvest: '12-18 months later', best: false },
    },
  },
  Tomatoes: {
    'Southern Ghana': {
      'Dry Season': { plant: 'November-December', harvest: 'February-March', best: true },
      'Minor Rainy': { plant: 'August-September', harvest: 'November-December', best: false },
    },
  },
  Rice: {
    'Volta Region': {
      'Major Rainy': { plant: 'April-May', harvest: 'August-September', best: true },
    },
    'Northern Ghana': {
      'Major Rainy': { plant: 'June-July', harvest: 'October-November', best: true },
    },
  },
  Plantain: {
    'Forest Zones': {
      'Major Rainy': { plant: 'March-May', harvest: '9-12 months later', best: true },
      'Minor Rainy': { plant: 'September-October', harvest: '9-12 months later', best: false },
    },
  },
  Cocoa: {
    'Western/Ashanti': {
      'Major Rainy': { plant: 'April-June', harvest: 'Oct-Mar (main), May-Aug (light)', best: true },
    },
  },
  Groundnuts: {
    'Northern Ghana': {
      'Major Rainy': { plant: 'June-July', harvest: 'September-October', best: true },
    },
  },
  Yam: {
    'Middle Belt': {
      'Major Rainy': { plant: 'March-April', harvest: 'November-December', best: true },
    },
  },
  Pepper: {
    'All Regions': {
      'Major Rainy': { plant: 'March-April', harvest: 'June-July', best: true },
      'Minor Rainy': { plant: 'September', harvest: 'November-December', best: false },
    },
  },
  Okra: {
    'All Regions': {
      'Major Rainy': { plant: 'April-May', harvest: 'June-July', best: true },
      'Minor Rainy': { plant: 'September-October', harvest: 'November-December', best: false },
    },
  },
  Cowpea: {
    'Northern Ghana': {
      'Major Rainy': { plant: 'June-July', harvest: 'August-September', best: true },
    },
    'Southern Ghana': {
      'Minor Rainy': { plant: 'September', harvest: 'November', best: false },
    },
  },
}

const REGIONS = [
  'Southern Ghana',
  'Northern Ghana',
  'Volta Region',
  'Forest Zones',
  'Middle Belt',
  'Western/Ashanti',
  'All Regions',
]

// Crop icons mapping
const CROP_ICONS: Record<string, string> = {
  Maize: '🌽',
  Cassava: '🥔',
  Tomatoes: '🍅',
  Rice: '🌾',
  Plantain: '🍌',
  Cocoa: '🍫',
  Groundnuts: '🥜',
  Yam: '🍠',
  Pepper: '🌶️',
  Okra: '🥒',
  Cowpea: '🫘',
}

// Regional tips
const REGIONAL_TIPS: Record<string, string> = {
  'Southern Ghana': 'The best planting time for most crops is during the major rainy season. Ensure proper land preparation before the rains begin for optimal yields.',
  'Northern Ghana': 'The single rainy season requires careful timing. Plant immediately when rains stabilize in June for best results.',
  'Volta Region': 'Perfect for rice cultivation due to lowlands and irrigation opportunities. Consider dry season irrigation farming.',
  'Forest Zones': 'Ideal for tree crops like cocoa and plantain. Maintain shade for cocoa plantings.',
  'Middle Belt': 'Transitional zone suitable for yam cultivation. Use traditional mounding techniques.',
  'Western/Ashanti': 'Premium cocoa growing region. Follow recommended spacing and fermentation practices.',
  'All Regions': 'Cassava and other adaptable crops can be grown year-round with proper management.',
}

export default function PlantingCalendarPage() {
  const [selectedRegion, setSelectedRegion] = useState('Southern Ghana')
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState('')
  const [activeTab, setActiveTab] = useState<'calendar' | 'timeline' | 'crops'>('calendar')

  useEffect(() => {
    setCurrentMonth(MONTHS[new Date().getMonth()])
  }, [])

  const currentSeason = (() => {
    const m = new Date().getMonth()
    if (m >= 2 && m <= 6) return 'Major Rainy'
    if (m >= 8 && m <= 10) return 'Minor Rainy'
    return 'Dry Season'
  })()

  const currentMonthIndex = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  // Filter crops for selected region
  const filteredCrops = Object.entries(CROP_CALENDAR).filter(([, data]) => {
    return data[selectedRegion] || data['All Regions'] || 
           (selectedRegion === 'Southern Ghana' && (data['Forest Zones'] || data['Western/Ashanti']))
  })

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 p-5 text-white shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">🗓️ Planting Calendar</h1>
            <p className="text-sm text-emerald-100">
              Ghana Agricultural Seasons - Plan your farming activities
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full animate-pulse" 
                style={{ backgroundColor: SEASONS[currentSeason]?.color }} />
              {currentSeason} Season
            </span>
            <span className="text-xs text-emerald-100">
              📅 {currentMonth} {currentYear}
            </span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-emerald-100 pb-2">
        {[
          { id: 'calendar', label: 'Calendar View', icon: '📅' },
          { id: 'timeline', label: 'Year Timeline', icon: '📊' },
          { id: 'crops', label: 'All Crops', icon: '🌱' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Year Timeline */}
      {activeTab === 'timeline' && (
        <section className="space-y-3">
          <p className="text-sm font-semibold text-emerald-900">
            {currentYear} Planting Timeline
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {SHORT_MONTHS.map((month, index) => {
              const isActive = index === currentMonthIndex
              return (
                <div
                  key={month}
                  className={`flex-shrink-0 rounded-xl border-2 px-4 py-3 text-center transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg'
                      : 'border-emerald-100 bg-white text-emerald-600 hover:border-emerald-300'
                  }`}
                >
                  <p className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-emerald-400'}`}>
                    {index + 1}
                  </p>
                  <p className="font-bold">{month}</p>
                </div>
              )
            })}
          </div>
          
          {/* Season Timeline Bar */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-emerald-700">Season Timeline</p>
            <div className="flex rounded-lg overflow-hidden h-6">
              <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-white" 
                   style={{ backgroundColor: SEASONS['Dry Season'].color, flex: 2 }}>
                Dry
              </div>
              <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-white" 
                   style={{ backgroundColor: SEASONS['Major Rainy'].color, flex: 5 }}>
                Major Rainy
              </div>
              <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-white" 
                   style={{ backgroundColor: SEASONS['Dry Season'].color, flex: 1 }}>
                
              </div>
              <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-white" 
                   style={{ backgroundColor: SEASONS['Minor Rainy'].color, flex: 3 }}>
                Minor Rainy
              </div>
              <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-white" 
                   style={{ backgroundColor: SEASONS['Dry Season'].color, flex: 1 }}>
                
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Crops View */}
      {activeTab === 'crops' && (
        <section className="space-y-4">
          <p className="text-sm font-semibold text-emerald-900">
            All Available Crops ({Object.keys(CROP_CALENDAR).length})
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Object.keys(CROP_CALENDAR).map((crop) => (
              <button
                key={crop}
                onClick={() => {
                  setSelectedCrop(crop)
                  setActiveTab('calendar')
                }}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${
                  selectedCrop === crop
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-emerald-100 bg-white hover:border-emerald-300'
                }`}
              >
                <span className="text-2xl">{CROP_ICONS[crop] || '🌿'}</span>
                <span className="font-semibold text-emerald-900">{crop}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Calendar View */}
      {activeTab === 'calendar' && (
        <>
          {/* Region selector */}
          <section className="space-y-3">
            <p className="text-sm font-semibold text-emerald-900">
              Select your region
            </p>
            <div className="flex flex-wrap gap-2">
              {REGIONS.filter(r => r !== 'All Regions' && r !== 'Western/Ashanti').map((r) => {
                const active = r === selectedRegion
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(r)
                      setSelectedCrop(null)
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                      active
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                        : 'border-emerald-100 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    {r}
                  </button>
                )
              })}
            </div>
            
            {/* All Ghana Regions Dropdown */}
            <details className="group">
              <summary className="cursor-pointer text-xs text-emerald-600 hover:text-emerald-800">
                Show all Ghana regions ▼
              </summary>
              <div className="mt-2 flex flex-wrap gap-2 rounded-lg bg-emerald-50 p-3">
                {GHANA_REGIONS.map((r) => (
                  <span key={r} className="rounded-full bg-white px-2 py-1 text-xs text-emerald-700">
                    {r}
                  </span>
                ))}
              </div>
            </details>
          </section>

          {/* Seasonal guide */}
          <section className="space-y-3">
            <p className="text-sm font-semibold text-emerald-900">
              Seasonal guide
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {Object.entries(SEASONS).map(([name, data]) => {
                const isCurrentSeason = name === currentSeason
                return (
                  <div
                    key={name}
                    className={`relative flex items-center gap-3 rounded-2xl border-2 bg-white p-3 text-sm shadow-sm transition-all ${
                      isCurrentSeason ? 'ring-2 ring-emerald-400 ring-offset-2' : ''
                    }`}
                    style={{ borderColor: data.color }}
                  >
                    {isCurrentSeason && (
                      <span className="absolute -top-2 -right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        NOW
                      </span>
                    )}
                    <span
                      className="h-4 w-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: data.color }}
                    />
                    <div>
                      <p className="font-semibold text-emerald-950">{name}</p>
                      <p className="text-xs text-emerald-600">{data.months}</p>
                      <p className="text-xs text-emerald-500">{data.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Regional Tip */}
          <section className="rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-semibold text-amber-800">Regional Tip - {selectedRegion}</p>
                <p className="text-sm text-amber-700 mt-1">
                  {REGIONAL_TIPS[selectedRegion] || REGIONAL_TIPS['All Regions']}
                </p>
              </div>
            </div>
          </section>

          {/* Weather Advisory */}
          <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌤️</span>
              <div>
                <p className="font-semibold text-blue-800">Weather Advisory</p>
                <p className="text-sm text-blue-700 mt-1">
                  Check local weather forecasts before planting. Climate patterns may vary slightly each year. 
                  Current season: <strong>{currentSeason}</strong> ({SEASONS[currentSeason]?.months})
                </p>
              </div>
            </div>
          </section>

          {/* Crop schedule */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-emerald-900">
                Crop planting schedule ({filteredCrops.length} crops available)
              </p>
              {selectedCrop && (
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="text-xs text-emerald-600 hover:text-emerald-800"
                >
                  Clear filter ✕
                </button>
              )}
            </div>
            <div className="space-y-3">
              {filteredCrops
                .filter(([crop]) => !selectedCrop || crop === selectedCrop)
                .map(([crop, data]) => {
                const regionData =
                  data[selectedRegion] ||
                  data['All Regions'] ||
                  data['Forest Zones'] ||
                  data['Middle Belt'] ||
                  data['Western/Ashanti']
                if (!regionData) return null
                return (
                  <div
                    key={crop}
                    className="group space-y-2 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-emerald-300"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{CROP_ICONS[crop] || '🌿'}</span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                            {Object.keys(data).find(k => data[k] === regionData) || selectedRegion}
                          </p>
                          <p className="text-base font-bold text-emerald-950">
                            {crop}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 group-hover:bg-emerald-100 transition-colors">
                        Field guide →
                      </span>
                    </div>
                    <div className="space-y-2 mt-3">
                      {Object.entries(regionData).map(([season, info]: any) => (
                        <div key={season} className="space-y-1 pl-11">
                          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  SEASONS[season]?.color || '#10b981',
                              }}
                            />
                            <span>{season}</span>
                            {info.best && (
                              <span className="rounded-full bg-amber-400 px-2 py-[1px] text-[10px] font-semibold text-white shadow-sm">
                                ⭐ BEST
                              </span>
                            )}
                          </div>
                          <div className="grid gap-2 text-xs text-emerald-700 sm:grid-cols-2 mt-1">
                            <p className="flex items-center gap-1.5">
                              <span className="text-emerald-500">🌱</span>
                              <span className="font-semibold">Plant:</span>{' '}
                              {info.plant}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <span className="text-amber-500">🧺</span>
                              <span className="font-semibold">Harvest:</span>{' '}
                              {info.harvest}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}

      {/* Quick Actions */}
      <section className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div>
            <p className="font-semibold text-emerald-800">Need more help?</p>
            <p className="text-sm text-emerald-600">Get personalized planting advice from SemmaAI</p>
          </div>
          <div className="flex gap-2">
            <a
              href="/farmer"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Ask SemmaAI 🤖
            </a>
            <a
              href="/farmer/insights"
              className="rounded-full bg-white border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              View Weather 🌤️
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}


