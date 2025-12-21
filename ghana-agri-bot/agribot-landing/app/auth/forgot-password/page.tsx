// app/auth/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    setLoading(true)
    try {
      const { error: resetError } = await resetPassword(email)
      
      if (resetError) {
        setError(resetError.message || 'Failed to send reset email. Please try again.')
        return
      }
      
      setSent(true)
    } catch {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Card */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/logo.jpg"
              alt="SemmaAI"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {sent ? (
          // Success State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-lime-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h1>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a password reset link to{' '}
              <span className="font-semibold text-gray-900">{email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSent(false)
                  setEmail('')
                }}
                className="w-full py-4 bg-gradient-to-r from-lime-600 to-lime-700 hover:from-lime-700 hover:to-lime-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
              >
                Try Different Email
              </button>
              
              <Link
                href="/auth/login"
                className="w-full py-4 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-300 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Login
              </Link>
            </div>
          </motion.div>
        ) : (
          // Form State
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-600">
                No worries! Enter your email and we&apos;ll send you reset instructions.
              </p>
            </div>
            
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-4 bg-gradient-to-r from-lime-600 to-lime-700 hover:from-lime-700 hover:to-lime-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
            
            {/* Back to Login */}
            <Link
              href="/auth/login"
              className="flex items-center justify-center mt-6 text-gray-600 hover:text-lime-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </>
        )}
      </div>
      
      {/* Help Text */}
      <p className="text-center mt-6 text-sm text-gray-500">
        Need help?{' '}
        <Link href="/support" className="text-lime-600 hover:underline">
          Contact Support
        </Link>
      </p>
    </motion.div>
  )
}
