// context/AppContext.tsx
'use client'

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabaseHelpers, Order, Product, CommunityPost, Notification } from '@/lib/supabase'
import { api, ApiError, WeatherResponse, MarketPricesRow } from '@/lib/api'

// Backend (FastAPI) is optional for browsing. When it's simply offline,
// log a quiet warning instead of a console error that floods the dev overlay.
function logApiError(label: string, error: unknown) {
  if (error instanceof ApiError && error.offline) {
    console.warn(`${label}: backend offline (${error.message})`)
  } else {
    console.error(label, error)
  }
}

interface AppContextType {
  // Weather
  weather: WeatherResponse | null
  weatherLoading: boolean
  refreshWeather: (location?: string) => Promise<void>
  
  // Market
  crops: string[]
  selectedCrop: string
  marketPrices: MarketPricesRow[]
  marketLoading: boolean
  setSelectedCrop: (crop: string) => void
  refreshMarketData: () => Promise<void>
  
  // Orders
  orders: Order[]
  ordersLoading: boolean
  refreshOrders: () => Promise<void>
  createOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<Order | null>
  
  // Products (Marketplace)
  products: Product[]
  productsLoading: boolean
  refreshProducts: (category?: string) => Promise<void>
  createProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<Product | null>
  
  // Community
  posts: CommunityPost[]
  postsLoading: boolean
  refreshPosts: (category?: string) => Promise<void>
  createPost: (content: string, category: CommunityPost['category'], images?: string[]) => Promise<CommunityPost | null>
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  notificationsLoading: boolean
  refreshNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  
  // Global state
  userLocation: string
  setUserLocation: (location: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  
  // Weather state
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  
  // Market state
  const [crops, setCrops] = useState<string[]>([])
  const [selectedCrop, setSelectedCrop] = useState<string>('')
  const [marketPrices, setMarketPrices] = useState<MarketPricesRow[]>([])
  const [marketLoading, setMarketLoading] = useState(false)
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  
  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  
  // Community state
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  
  // Global state
  const [userLocation, setUserLocation] = useState<string>('Accra')

  // Weather functions
  const refreshWeather = useCallback(async (location?: string) => {
    setWeatherLoading(true)
    try {
      const loc = location || userLocation || 'Accra'
      const data = await api.weather(loc)
      setWeather(data)
    } catch (error) {
      logApiError('Error fetching weather:', error)
    } finally {
      setWeatherLoading(false)
    }
  }, [userLocation])

  // Market functions
  const refreshMarketData = useCallback(async () => {
    setMarketLoading(true)
    try {
      // Fetch available crops
      const cropsData = await api.marketCrops()
      setCrops(cropsData.crops || [])
      
      // If we have a selected crop, fetch its prices
      if (selectedCrop) {
        const pricesData = await api.marketPrices(selectedCrop)
        setMarketPrices(pricesData.rows || [])
      } else if (cropsData.crops && cropsData.crops.length > 0) {
        // Auto-select first crop
        setSelectedCrop(cropsData.crops[0])
        const pricesData = await api.marketPrices(cropsData.crops[0])
        setMarketPrices(pricesData.rows || [])
      }
    } catch (error) {
      logApiError('Error fetching market data:', error)
    } finally {
      setMarketLoading(false)
    }
  }, [selectedCrop])

  // Fetch prices when crop changes
  useEffect(() => {
    if (selectedCrop) {
      const fetchPrices = async () => {
        setMarketLoading(true)
        try {
          const pricesData = await api.marketPrices(selectedCrop)
          setMarketPrices(pricesData.rows || [])
        } catch (error) {
          logApiError('Error fetching prices:', error)
        } finally {
          setMarketLoading(false)
        }
      }
      fetchPrices()
    }
  }, [selectedCrop])

  // Orders functions
  const refreshOrders = useCallback(async () => {
    if (!user?.id) return
    setOrdersLoading(true)
    try {
      const data = await supabaseHelpers.getOrders(user.id)
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }, [user?.id])

  const createOrder = async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> => {
    const result = await supabaseHelpers.createOrder(order)
    if (result) {
      setOrders(prev => [result, ...prev])
    }
    return result
  }

  // Products functions
  const refreshProducts = useCallback(async (category?: string) => {
    setProductsLoading(true)
    try {
      const data = await supabaseHelpers.getProducts(category)
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setProductsLoading(false)
    }
  }, [])

  const createProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> => {
    const result = await supabaseHelpers.createProduct(product)
    if (result) {
      setProducts(prev => [result, ...prev])
    }
    return result
  }

  // Community functions
  const refreshPosts = useCallback(async (category?: string) => {
    setPostsLoading(true)
    try {
      const data = await supabaseHelpers.getCommunityPosts(category)
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setPostsLoading(false)
    }
  }, [])

  const createPost = async (
    content: string, 
    category: CommunityPost['category'],
    images?: string[]
  ): Promise<CommunityPost | null> => {
    if (!user?.id) return null
    
    const result = await supabaseHelpers.createPost({
      user_id: user.id,
      author_name: user.name,
      author_avatar: user.avatarUrl,
      content,
      category,
      images,
    })
    
    if (result) {
      setPosts(prev => [result, ...prev])
    }
    return result
  }

  // Notifications functions
  const refreshNotifications = useCallback(async () => {
    if (!user?.id) return
    setNotificationsLoading(true)
    try {
      const data = await supabaseHelpers.getNotifications(user.id)
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }, [user?.id])

  const markAsRead = async (id: string) => {
    await supabaseHelpers.markNotificationRead(id)
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
  }

  // Initialize data when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Set location from user profile
      if (user.location) {
        setUserLocation(user.location)
      }
      
      // Fetch initial data
      refreshWeather()
      refreshMarketData()
      refreshOrders()
      refreshNotifications()
      refreshProducts()
      refreshPosts()
    }
  }, [isAuthenticated, user, refreshWeather, refreshMarketData, refreshOrders, refreshNotifications, refreshProducts, refreshPosts])

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <AppContext.Provider
      value={{
        weather,
        weatherLoading,
        refreshWeather,
        
        crops,
        selectedCrop,
        marketPrices,
        marketLoading,
        setSelectedCrop,
        refreshMarketData,
        
        orders,
        ordersLoading,
        refreshOrders,
        createOrder,
        
        products,
        productsLoading,
        refreshProducts,
        createProduct,
        
        posts,
        postsLoading,
        refreshPosts,
        createPost,
        
        notifications,
        unreadCount,
        notificationsLoading,
        refreshNotifications,
        markAsRead,
        
        userLocation,
        setUserLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
