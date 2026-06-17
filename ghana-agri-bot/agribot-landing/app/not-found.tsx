// app/not-found.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 px-6">
      <div className="max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Oops! The page you&apos;re looking for seems to have wandered off like a lost goat in the farm.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 border-2 border-emerald-600 text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          <div className="mt-12">
            <p className="text-gray-600 mb-4">Looking for something specific?</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/about" className="text-emerald-600 hover:underline">About</Link>
              <span className="text-gray-400">•</span>
              <Link href="/features" className="text-emerald-600 hover:underline">Features</Link>
              <span className="text-gray-400">•</span>
              <Link href="/pricing" className="text-emerald-600 hover:underline">Pricing</Link>
              <span className="text-gray-400">•</span>
              <Link href="/blog" className="text-emerald-600 hover:underline">Blog</Link>
              <span className="text-gray-400">•</span>
              <Link href="/support" className="text-emerald-600 hover:underline">Support</Link>
            </div>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-yellow-200 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  )
}
