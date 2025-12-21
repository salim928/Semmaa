// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../config/supabase';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { offlineCache } from '../utils/offlineCache';

// User interface matching Supabase profile
export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  location?: string;
  crops?: string[];
  language?: string;
  farmSize?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnline: boolean;
  
  // Auth methods
  signUp: (phone: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signIn: (phone: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithOTP: (phone: string) => Promise<{ error: AuthError | null }>;
  verifyOTP: (phone: string, token: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  
  // Profile methods
  updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  
  // Legacy support (for existing code)
  login: (phone: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Try to get existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        // Try to restore from offline cache
        await restoreFromCache();
        return;
      }

      setSession(session);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        // Check for offline cached user
        await restoreFromCache();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await restoreFromCache();
    } finally {
      setIsLoading(false);
    }
  };

  const restoreFromCache = async () => {
    try {
      const cachedUser = await offlineCache.get<User>('user_profile');
      if (cachedUser) {
        setUser(cachedUser);
        console.log('Restored user from cache');
      }
    } catch (error) {
      console.error('Cache restore error:', error);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Try cache on error
        const cachedUser = await offlineCache.get<User>('user_profile');
        if (cachedUser) setUser(cachedUser);
        return;
      }

      const userData: User = {
        id: profile.id,
        phone: profile.phone,
        name: profile.name,
        location: profile.location || undefined,
        crops: profile.crops || undefined,
        language: profile.language || 'en',
        farmSize: profile.farm_size || undefined,
        avatarUrl: profile.avatar_url || undefined,
      };

      setUser(userData);
      
      // Cache the user profile for offline access
      await offlineCache.set('user_profile', userData, 7 * 24 * 60 * 60 * 1000); // 7 days
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  // Sign up with phone and password
  const signUp = async (phone: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Format phone number for Ghana (+233)
      const formattedPhone = formatGhanaPhone(phone);
      
      const { data, error } = await supabase.auth.signUp({
        phone: formattedPhone,
        password,
        options: {
          data: {
            name,
            phone: formattedPhone,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Create profile record
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          phone: formattedPhone,
          name,
          language: 'en',
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with phone and password
  const signIn = async (phone: string, password: string) => {
    try {
      setIsLoading(true);
      
      const formattedPhone = formatGhanaPhone(phone);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with OTP (SMS verification)
  const signInWithOTP = async (phone: string) => {
    try {
      setIsLoading(true);
      
      const formattedPhone = formatGhanaPhone(phone);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      return { error };
    } catch (error) {
      console.error('OTP request error:', error);
      return { error: error as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP code
  const verifyOTP = async (phone: string, token: string) => {
    try {
      setIsLoading(true);
      
      const formattedPhone = formatGhanaPhone(phone);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
      });

      return { error };
    } catch (error) {
      console.error('OTP verify error:', error);
      return { error: error as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      }

      // Clear cached data
      await offlineCache.remove('user_profile');
      await SecureStore.deleteItemAsync('userPhone');
      await SecureStore.deleteItemAsync('userName');
      await SecureStore.deleteItemAsync('userToken');
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user?.id) {
        return { error: new Error('No user logged in') };
      }

      const updates: Record<string, any> = {};
      if (data.name) updates.name = data.name;
      if (data.location !== undefined) updates.location = data.location;
      if (data.crops !== undefined) updates.crops = data.crops;
      if (data.language) updates.language = data.language;
      if (data.farmSize !== undefined) updates.farm_size = data.farmSize;
      if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      // Update local state
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      
      // Update cache
      await offlineCache.set('user_profile', updatedUser, 7 * 24 * 60 * 60 * 1000);

      return { error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error: error as Error };
    }
  };

  // Refresh profile from database
  const refreshProfile = async () => {
    if (session?.user) {
      await fetchUserProfile(session.user.id);
    }
  };

  // Legacy login method for backward compatibility
  const login = async (phone: string, name: string) => {
    // Use password-less login with a default password for legacy support
    const defaultPassword = `semma_${phone}_${Date.now()}`;
    
    // Try to sign in first
    const { error: signInError } = await signIn(phone, defaultPassword);
    
    if (signInError) {
      // If sign in fails, try to sign up
      const { error: signUpError } = await signUp(phone, defaultPassword, name);
      
      if (signUpError) {
        // Fall back to mock login for offline support
        const mockUser: User = {
          id: `mock_${phone}`,
          phone,
          name,
          location: 'Ghana',
        };
        
        setUser(mockUser);
        await offlineCache.set('user_profile', mockUser, 7 * 24 * 60 * 60 * 1000);
        await SecureStore.setItemAsync('userPhone', phone);
        await SecureStore.setItemAsync('userName', name);
      }
    }
  };

  // Legacy logout method
  const logout = signOut;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        isOnline,
        signUp,
        signIn,
        signInWithOTP,
        verifyOTP,
        signOut,
        updateProfile,
        refreshProfile,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to format Ghana phone numbers
function formatGhanaPhone(phone: string): string {
  // Remove spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, '');
  
  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '');
  
  // Add country code if not present
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('233')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+233' + cleaned;
    }
  }
  
  return cleaned;
}

export default AuthContext;