// context/AuthContext.tsx
'use client'

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { supabase, Profile, supabaseHelpers } from '@/lib/supabase'
import { Session, AuthError } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

// User interface
export interface User {
  id: string
  phone: string
  name: string
  email?: string
  location?: string
  crops?: string[]
  language?: string
  farmSize?: string
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Auth methods
  signUp: (email: string, password: string, name: string, phone?: string, location?: string) => Promise<{ error: AuthError | Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  
  // Profile methods
  updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Convert Supabase profile to User
const profileToUser = (profile: Profile): User => ({
  id: profile.id,
  phone: profile.phone || '',
  name: profile.full_name || profile.name || '',
  email: profile.email,
  location: profile.location || undefined,
  crops: profile.crops || undefined,
  language: profile.preferred_language || profile.language || 'en',
  farmSize: profile.farm_size || undefined,
  avatarUrl: profile.avatar_url || undefined,
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (userId: string) => {
    const profile = await supabaseHelpers.getProfile(userId)
    if (profile) {
      setUser(profileToUser(profile))
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        
        // Get existing session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          return
        }

        setSession(session)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        setSession(session)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }
        
        // Handle specific events
        if (event === 'SIGNED_OUT') {
          router.push('/')
        } else if (event === 'SIGNED_IN') {
          router.push('/farmer')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUserProfile, router])

  // Sign up with email/password
  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    phone?: string,
    location?: string
  ): Promise<{ error: AuthError | Error | null }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            location,
          },
        },
      })

      if (error) return { error }

      // The profile row is created automatically by the handle_new_user()
      // trigger on auth.users (see supabase/fix-signup-trigger.sql), using
      // the name/phone/location passed in options.data above. We deliberately
      // do NOT insert it here — that races the trigger (duplicate key) and
      // fails RLS when email confirmation is on (no session yet at signup).

      return { error: null }
    } catch (e) {
      return { error: e as Error }
    }
  }

  // Sign in with email/password
  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  // Sign in with Google
  const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    router.push('/')
  }

  // Reset password
  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }

  // Update profile
  const updateProfile = async (data: Partial<User>): Promise<{ error: Error | null }> => {
    if (!user?.id) return { error: new Error('Not authenticated') }

    const updates: Partial<Profile> = {}
    if (data.name) updates.name = data.name
    if (data.phone) updates.phone = data.phone
    if (data.email) updates.email = data.email
    if (data.location) updates.location = data.location
    if (data.crops) updates.crops = data.crops
    if (data.language) updates.language = data.language
    if (data.farmSize) updates.farm_size = data.farmSize
    if (data.avatarUrl) updates.avatar_url = data.avatarUrl

    const { error } = await supabaseHelpers.updateProfile(user.id, updates)
    
    if (!error) {
      setUser(prev => prev ? { ...prev, ...data } : null)
    }
    
    return { error }
  }

  // Refresh profile
  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchUserProfile(session.user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!session && !!user,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
