// app/auth/signup/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { User, Phone, MapPin, Navigation, Check, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context'

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, signInWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/farmer')
    }
  }, [isAuthenticated, authLoading, router])

  const getGPSLocation = async () => {
    setGpsLoading(true)
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported')
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })
      
      const { latitude, longitude } = position.coords
      
      // Reverse geocode using Nominatim (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      )
      const data = await response.json()
      
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Ghana'
      setLocation(city)
      
      // Store coordinates for later use
      localStorage.setItem('user_coordinates', JSON.stringify({ lat: latitude, lon: longitude }))
      
    } catch {
      setError('Could not get your location. Please enter it manually.')
    } finally {
      setGpsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!agreed) {
      setError('Please agree to the Data Policy')
      return
    }
    
    setLoading(true)
    try {
      const { error: signUpError } = await signUp(
        email,
        password,
        name,
        phone ? `+233${phone}` : undefined,
        location || undefined
      )
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('This email is already registered. Please log in instead.')
        } else {
          setError(signUpError.message || 'Sign up failed. Please try again.')
        }
        return
      }
      
      // Show success message
      setSuccess(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setError('')
    
    try {
      const { error: googleError } = await signInWithGoogle()
      
      if (googleError) {
        setError('Google sign-up failed. Please try again.')
      }
      // If successful, the page will redirect via OAuth callback
    } catch {
      setError('Google sign-up failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const isFormValid = name.trim() && email.includes('@') && password.length >= 6 && agreed

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="w-full max-w-md flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-lime-600" />
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 text-center">
          <div className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-lime-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Account Created!</h2>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a verification email to <strong>{email}</strong>. Please check your inbox and click the link to verify your account.
          </p>
          <Link
            href="/auth/login"
            className="inline-block w-full py-4 bg-gradient-to-r from-lime-600 to-lime-700 hover:from-lime-700 hover:to-lime-800 text-white font-semibold rounded-xl transition-all duration-300"
          >
            Go to Login
          </Link>
        </div>
      </motion.div>
    )
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
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, Farmer! 👋</h1>
          <p className="text-gray-600">Let&apos;s get you started with SemmaAI</p>
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
        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
          
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
          
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 6 characters)"
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Phone Input (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative flex">
              <div className="flex items-center px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl">
                <span className="text-lg mr-1">🇬🇭</span>
                <span className="text-gray-600 font-medium">+233</span>
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="24 123 4567"
                  maxLength={9}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
          
          {/* Location Input (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your city/town"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={getGPSLocation}
                disabled={gpsLoading}
                className="px-4 bg-gradient-to-r from-lime-600 to-lime-700 hover:from-lime-700 hover:to-lime-800 text-white rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                title="Use GPS to get your location"
              >
                {gpsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Agreement Checkbox */}
          <div className="flex items-start space-x-3">
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                agreed
                  ? 'bg-lime-600 border-lime-600'
                  : 'bg-white border-gray-300 hover:border-lime-500'
              }`}
            >
              {agreed && <Check className="w-4 h-4 text-white" />}
            </button>
            <label className="text-sm text-gray-600 cursor-pointer" onClick={() => setAgreed(!agreed)}>
              I agree to the{' '}
              <Link href="/privacy" className="text-lime-600 hover:underline">
                Data Policy
              </Link>
              {' '}and{' '}
              <Link href="/terms" className="text-lime-600 hover:underline">
                Terms of Service
              </Link>
            </label>
          </div>
          
          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-4 bg-gradient-to-r from-lime-600 to-lime-700 hover:from-lime-700 hover:to-lime-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-4 text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        
        {/* Google Sign Up */}
        <button
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="w-full py-4 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>
        
        {/* Login Link */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-lime-600 hover:text-lime-700 font-semibold transition-colors"
          >
            Log In
          </Link>
        </p>
      </div>
      
      {/* Footer Note */}
      <p className="text-center mt-6 text-sm text-gray-500">
        By signing up, you agree to receive SMS notifications about your crops
      </p>
    </motion.div>
  )
}
