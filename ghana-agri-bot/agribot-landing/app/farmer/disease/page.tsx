'use client'

// app/farmer/disease/page.tsx – Full-featured disease detection mirroring mobile screen

import { useState } from 'react'
import { api, AnalyzeImageResponse } from '@/lib/api'

interface DetectionHistory {
  id: string
  disease: string
  crop: string
  severity: string
  confidence: number
  date: string
  imageUrl?: string
}

const CROP_OPTIONS = [
  'Maize',
  'Tomato',
  'Cassava',
  'Rice',
  'Plantain',
  'Cocoa',
  'Pepper',
  'Groundnut',
  'Yam',
  'Cowpea',
]

const MOCK_HISTORY: DetectionHistory[] = [
  {
    id: '1',
    disease: 'Late Blight',
    crop: 'Tomato',
    severity: 'high',
    confidence: 0.92,
    date: '2025-01-18',
  },
  {
    id: '2',
    disease: 'Fall Armyworm',
    crop: 'Maize',
    severity: 'medium',
    confidence: 0.85,
    date: '2025-01-15',
  },
  {
    id: '3',
    disease: 'Mosaic Virus',
    crop: 'Cassava',
    severity: 'low',
    confidence: 0.78,
    date: '2025-01-10',
  },
]

export default function DiseaseDetectionPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeImageResponse | null>(null)
  const [selectedCrop, setSelectedCrop] = useState('Tomato')
  const [history, setHistory] = useState<DetectionHistory[]>(MOCK_HISTORY)
  const [activeTab, setActiveTab] = useState<'detect' | 'history' | 'guide'>('detect')

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setError(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const base64 = await fileToBase64(file)
      const res = await api.analyzeImage({
        image: base64,
        crop: selectedCrop,
      })
      setResult(res)
      
      // Add to history
      const newHistoryItem: DetectionHistory = {
        id: Date.now().toString(),
        disease: res.disease,
        crop: res.crop,
        severity: res.severity,
        confidence: res.confidence,
        date: new Date().toISOString().split('T')[0],
        imageUrl: preview || undefined,
      }
      setHistory(prev => [newHistoryItem, ...prev])
    } catch (e) {
      setError('Could not analyze the image. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearSelection = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'high': return 'bg-rose-50 text-rose-700 border-rose-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return '✅'
      case 'medium': return '⚠️'
      case 'high': return '🚨'
      default: return '❓'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-emerald-950 sm:text-2xl">
          🔬 Crop Disease Detection
        </h1>
        <p className="text-sm text-emerald-600">
          AI-powered disease identification and treatment recommendations
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 rounded-xl bg-emerald-50 p-1">
        {(['detect', 'history', 'guide'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-600 hover:text-emerald-900'
            }`}
          >
            {tab === 'detect' && '📷 '}
            {tab === 'history' && '📋 '}
            {tab === 'guide' && '📖 '}
            {tab}
          </button>
        ))}
      </div>

      {/* Detect Tab */}
      {activeTab === 'detect' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Left: Image selection */}
          <section className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
            {/* Crop Selection */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Select Crop Type
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {CROP_OPTIONS.map((crop) => (
                  <button
                    key={crop}
                    onClick={() => setSelectedCrop(crop)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      selectedCrop === crop
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            {!preview ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-6 text-center text-sm text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50">
                  <span className="mb-2 text-3xl">📷</span>
                  <span className="font-medium">Take Photo</span>
                  <span className="mt-1 text-xs text-emerald-500">Use your camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-6 text-center text-sm text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50">
                  <span className="mb-2 text-3xl">🖼️</span>
                  <span className="font-medium">Choose Photo</span>
                  <span className="mt-1 text-xs text-emerald-500">From your device</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </label>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-emerald-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Selected crop"
                  className="h-64 w-full object-cover"
                />
                <button
                  onClick={clearSelection}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={analyze}
              disabled={!file || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Analyzing...
                </>
              ) : (
                <>🔬 Analyze Image</>
              )}
            </button>

            {error && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 sm:text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Tips */}
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-800">📸 Photo Tips:</p>
              <ul className="mt-1 space-y-1 text-xs text-emerald-700">
                <li>• Take close-up photos of affected leaves</li>
                <li>• Ensure good lighting for best results</li>
                <li>• Include both healthy and affected areas</li>
              </ul>
            </div>
          </section>

          {/* Right: Result */}
          <section className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
            {!result ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <span className="text-5xl">🌿</span>
                <p className="mt-3 font-medium text-emerald-900">Ready to Analyze</p>
                <p className="mt-1 text-sm text-emerald-500">
                  Upload a photo of the affected crop to get AI-powered diagnosis
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Disease Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                      Detected Disease
                    </p>
                    <h2 className="text-xl font-bold text-emerald-950">
                      {result.disease}
                    </h2>
                    <p className="text-sm text-emerald-600">Crop: {result.crop}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getSeverityColor(result.severity)}`}>
                    {getSeverityIcon(result.severity)} {result.severity.toUpperCase()}
                  </span>
                </div>

                {/* Confidence & Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-50 p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-700">
                      {(result.confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-emerald-600">Confidence</p>
                  </div>
                  {result.estimatedYieldLoss && (
                    <div className="rounded-xl bg-rose-50 p-3 text-center">
                      <p className="text-2xl font-bold text-rose-700">
                        {result.estimatedYieldLoss}
                      </p>
                      <p className="text-xs text-rose-600">Est. Yield Loss</p>
                    </div>
                  )}
                </div>

                <ResultSection title="🔍 Symptoms Identified" items={result.symptoms} />
                <ResultSection title="💊 Immediate Treatment" items={result.treatment} numbered />
                <ResultSection title="🛡️ Prevention Tips" items={result.prevention} />
                {result.organicTreatment && (
                  <ResultSection title="🌿 Organic Alternatives" items={result.organicTreatment} />
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 rounded-xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-200">
                    💾 Save Result
                  </button>
                  <button className="flex-1 rounded-xl bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200">
                    🤖 Ask AI More
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-emerald-900">Detection History</p>
            <span className="text-xs text-emerald-500">{history.length} detections</span>
          </div>
          
          {history.length === 0 ? (
            <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center">
              <span className="text-4xl">📋</span>
              <p className="mt-3 font-medium text-emerald-900">No detections yet</p>
              <p className="mt-1 text-sm text-emerald-500">
                Your disease detection history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                    🌿
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-emerald-950">{item.disease}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getSeverityColor(item.severity)}`}>
                        {item.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-500">
                      {item.crop} • {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">
                      {(item.confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-emerald-500">confidence</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Guide Tab */}
      {activeTab === 'guide' && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-emerald-900">📖 Disease Detection Guide</h3>
            <p className="mt-2 text-sm text-emerald-600">
              Learn how to use the disease detection feature effectively and understand common crop diseases in Ghana.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: 'Maize Diseases', icon: '🌽', diseases: ['Fall Armyworm', 'Maize Streak Virus', 'Gray Leaf Spot'] },
              { title: 'Tomato Diseases', icon: '🍅', diseases: ['Late Blight', 'Early Blight', 'Bacterial Wilt'] },
              { title: 'Cassava Diseases', icon: '🥔', diseases: ['Mosaic Disease', 'Brown Streak', 'Bacterial Blight'] },
              { title: 'Rice Diseases', icon: '🌾', diseases: ['Rice Blast', 'Brown Spot', 'Sheath Blight'] },
            ].map((category) => (
              <div key={category.title} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <h4 className="font-semibold text-emerald-900">{category.title}</h4>
                </div>
                <ul className="mt-3 space-y-1">
                  {category.diseases.map((disease) => (
                    <li key={disease} className="flex items-center gap-2 text-sm text-emerald-700">
                      <span className="text-emerald-500">•</span> {disease}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <h4 className="font-semibold text-amber-900">💡 Pro Tips</h4>
            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              <li>• Regular scouting helps catch diseases early</li>
              <li>• Take photos at first sign of symptoms</li>
              <li>• Compare healthy vs affected plants</li>
              <li>• Consult local extension officers for severe cases</li>
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}

function ResultSection(props: {
  title: string
  items: string[]
  numbered?: boolean
}) {
  const { title, items, numbered } = props
  if (!items || items.length === 0) return null
  return (
    <div className="space-y-2 rounded-xl bg-emerald-50/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
        {title}
      </p>
      <ul className="space-y-1 text-xs text-emerald-700 sm:text-sm">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[2px] font-medium text-emerald-500">
              {numbered ? `${i + 1}.` : '•'}
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Unsupported file result'))
        return
      }
      const base64 = result.split(',')[1] || result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}


