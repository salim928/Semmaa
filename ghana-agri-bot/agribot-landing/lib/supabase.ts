// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// Replace with your actual project credentials from https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client for browser
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Database types
export interface Profile {
  id: string
  phone?: string
  full_name?: string
  name?: string // alias for full_name
  email?: string
  location?: string
  region?: string
  district?: string
  crops?: string[]
  preferred_language?: string
  language?: string // alias
  farm_size?: string
  avatar_url?: string
  notification_preferences?: Record<string, boolean>
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  type: 'purchase' | 'sale'
  product_id?: string
  product_name: string
  product_image?: string
  quantity: number
  unit: string
  price_per_unit: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'
  buyer_id?: string
  seller_id?: string
  buyer_name?: string
  seller_name?: string
  delivery_address?: string
  payment_method?: 'cash' | 'mobile_money' | 'bank_transfer'
  payment_status: 'pending' | 'paid' | 'refunded'
  notes?: string
  tracking_number?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  seller_id: string
  seller_name?: string
  name: string
  description?: string
  category: string
  price: number
  unit: string
  quantity_available: number
  quantity?: number
  location: string
  images: string[]
  is_organic: boolean
  harvest_date?: string
  status: 'active' | 'sold_out' | 'inactive'
  created_at: string
}

export interface CommunityPost {
  id: string
  user_id: string
  author_name: string
  author_avatar?: string
  content: string
  images?: string[]
  category: 'question' | 'tip' | 'discussion' | 'success_story'
  likes_count: number
  comments_count: number
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'order' | 'weather' | 'market' | 'community' | 'system'
  is_read: boolean
  data?: Record<string, unknown>
  created_at: string
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Get user profile
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
    
    return { error: error ? new Error(error.message) : null }
  },

  // Get user orders
  async getOrders(userId: string, type?: 'purchase' | 'sale'): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching orders:', error)
      return []
    }
    return data || []
  },

  // Create order
  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating order:', error)
      return null
    }
    return data
  },

  // Get marketplace products
  async getProducts(category?: string, location?: string): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (category) {
      query = query.eq('category', category)
    }
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    const { data, error } = await query
    
    if (error) {
      // Table may not exist yet - silently return empty
      return []
    }
    return data || []
  },

  // Create a product listing
  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating product:', error)
      return null
    }
    return data
  },

  // Get community posts
  async getCommunityPosts(category?: string): Promise<CommunityPost[]> {
    let query = supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    
    if (error) {
      // Table may not exist yet - silently return empty
      return []
    }
    return data || []
  },

  // Create community post
  async createPost(post: Omit<CommunityPost, 'id' | 'created_at' | 'likes_count' | 'comments_count'>): Promise<CommunityPost | null> {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({ ...post, likes_count: 0, comments_count: 0 })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating post:', error)
      return null
    }
    return data
  },

  // Get notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      // Table may not exist yet - silently return empty
      return []
    }
    return data || []
  },

  // Mark notification as read
  async markNotificationRead(notificationId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
  },
}
