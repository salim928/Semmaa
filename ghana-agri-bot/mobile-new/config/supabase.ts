// config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'expo-modules-core';

// =====================================================
// SUPABASE CONFIGURATION
// Replace these with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api
// =====================================================
const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Check if we're running on web
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

// Custom storage adapter for React Native using SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isWeb) {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isWeb) {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (isWeb) {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

// Create Supabase client with custom storage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string;
          name: string;
          location: string | null;
          crops: string[] | null;
          language: string;
          farm_size: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          name: string;
          location?: string | null;
          crops?: string[] | null;
          language?: string;
          farm_size?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          phone?: string;
          name?: string;
          location?: string | null;
          crops?: string[] | null;
          language?: string;
          farm_size?: string | null;
          avatar_url?: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          type: 'purchase' | 'sale';
          product_id: string | null;
          product_name: string;
          product_image: string | null;
          quantity: number;
          unit: string;
          price_per_unit: number;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
          buyer_id: string | null;
          seller_id: string | null;
          buyer_name: string | null;
          seller_name: string | null;
          delivery_address: string | null;
          payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | null;
          payment_status: 'pending' | 'paid' | 'refunded';
          notes: string | null;
          tracking_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'purchase' | 'sale';
          product_id?: string | null;
          product_name: string;
          product_image?: string | null;
          quantity: number;
          unit: string;
          price_per_unit: number;
          total_amount: number;
          status?: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
          buyer_id?: string | null;
          seller_id?: string | null;
          buyer_name?: string | null;
          seller_name?: string | null;
          delivery_address?: string | null;
          payment_method?: 'cash' | 'mobile_money' | 'bank_transfer' | null;
          payment_status?: 'pending' | 'paid' | 'refunded';
          notes?: string | null;
          tracking_number?: string | null;
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'refunded';
          notes?: string | null;
          tracking_number?: string | null;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          name: string;
          description: string | null;
          category: string;
          price: number;
          unit: string;
          quantity_available: number;
          images: string[] | null;
          location: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          name: string;
          description?: string | null;
          category: string;
          price: number;
          unit: string;
          quantity_available: number;
          images?: string[] | null;
          location?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          category?: string;
          price?: number;
          unit?: string;
          quantity_available?: number;
          images?: string[] | null;
          location?: string | null;
          is_active?: boolean;
        };
      };
    };
  };
}

// SQL to create the database tables in Supabase:
/*
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location TEXT,
  crops TEXT[],
  language TEXT DEFAULT 'en',
  farm_size TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'sale')),
  product_id UUID,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL NOT NULL,
  total_amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
  buyer_id UUID,
  seller_id UUID,
  buyer_name TEXT,
  seller_name TEXT,
  delivery_address TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'mobile_money', 'bank_transfer')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes TEXT,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  quantity_available DECIMAL NOT NULL,
  images TEXT[],
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category ON public.products(category);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Products policies  
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can insert own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own products" ON public.products
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own products" ON public.products
  FOR DELETE USING (auth.uid() = seller_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'Farmer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
*/

export default supabase;
