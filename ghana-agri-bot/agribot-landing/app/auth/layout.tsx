// app/auth/layout.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background - matching mobile app gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#c8e6c9] via-white to-[#f8f9fa]" />
      </div>
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-lime-200 rounded-full opacity-40 animate-bounce hidden md:block"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-yellow-200 rounded-full opacity-40 animate-bounce hidden md:block" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-green-200 rounded-full opacity-30 animate-pulse hidden md:block"></div>
      <div className="absolute bottom-40 left-20 w-14 h-14 bg-lime-300 rounded-full opacity-30 animate-pulse hidden md:block" style={{ animationDelay: '1s' }}></div>
      
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-4 sm:p-6">
        <Link href="/" className="flex items-center space-x-2 group">
          <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-lime-600 transition-colors" />
          <span className="text-gray-600 group-hover:text-lime-600 transition-colors text-sm sm:text-base">Back</span>
        </Link>
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md">
            <Image
              src="/logo.jpg"
              alt="SemmaAI Logo"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:block">SemmaAI</span>
        </Link>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
