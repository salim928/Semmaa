'use client'

import Link from 'next/link'
import { WifiOff, RefreshCw, Home } from 'lucide-react'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Offline Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
              <WifiOff className="w-12 h-12 text-amber-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">!</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          It looks like you&apos;ve lost your internet connection. 
          Some features may not be available until you&apos;re back online.
        </p>

        {/* What's Available */}
        <div className="bg-green-50 rounded-xl p-4 mb-8 text-left">
          <h3 className="font-semibold text-green-800 mb-2">
            What you can still do:
          </h3>
          <ul className="space-y-2 text-sm text-green-700">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              View cached pages you&apos;ve visited before
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Read previously loaded content
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Draft posts (they&apos;ll sync when you&apos;re back online)
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          
          <Link
            href="/farmer"
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            💡 Tip: Enable mobile data or connect to a WiFi network to continue using all features.
          </p>
        </div>
      </div>
    </div>
  )
}
