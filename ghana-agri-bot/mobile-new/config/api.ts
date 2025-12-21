import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { offlineCache } from '../utils/offlineCache';
import { supabase } from './supabase';

// IMPORTANT: Replace this IP with your computer's local IP address
// To find it:
// Windows: Run 'ipconfig' in terminal, look for IPv4 Address
// Mac: Run 'ifconfig' in terminal, look for inet under en0
// Linux: Run 'hostname -I' or 'ip addr show'
const LOCAL_IP = '172.20.10.2'; // <-- REPLACE THIS WITH YOUR IP
const MOBILE_API_KEY = 'dev-mobile-key'; // <-- Optionally mirror MOBILE_API_KEY from backend for pilot/prod

const API_BASE_URL = __DEV__ 
  ? `http://${LOCAL_IP}:8000`  // Your computer's IP for development
  : 'https://api.semmaai.com';  // Production URL

console.log('API URL:', API_BASE_URL);

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': MOBILE_API_KEY,
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      
      if (error.response.status === 401) {
        SecureStore.deleteItemAsync('userToken');
      }
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  ask: '/ask',
  weather: '/weather',
  marketCrops: '/market/crops',
  marketPrices: '/market/prices',
  feedback: '/feedback',
  register: '/auth/register',
  login: '/auth/login',
  profile: '/user/profile',
  updateProfile: '/user/profile/update',
};

export type OrderType = 'purchases' | 'sales';

// API service functions
export interface AskResponse {
  answer: string;
  duration_ms: number;
  kb_hits: number;
}

export interface WeatherResponse {
  loc: string;
  summary: string;
}

export interface MarketCropsResponse {
  crops: string[];
}

export interface MarketPricesRow {
  city: string;
  price: string;
  unit: string;
  date: string;
}

export interface MarketPricesResponse {
  crop: string;
  rows: MarketPricesRow[];
}

export interface FeedbackResponse {
  ok: boolean;
}

export interface DetectDiseaseRequest {
  image: string;
  crop?: string;
  location?: string;
}

export interface DetectDiseaseResponse {
  disease: string;
  confidence: number;
  severity: string;
  crop: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  organicTreatment?: string[];
  estimatedYieldLoss?: string;
  affectedArea?: string;
}

export const apiService = {
  // Orders are now managed via OrderContext with Supabase
  async getOrders(userId: string = '', type: OrderType = 'purchases') {
    // This is now handled by OrderContext - kept for backward compatibility
    return [];
  },

  async askQuestion(question: string, location?: string): Promise<AskResponse> {
    const cacheKey = `chat_${question.substring(0, 50)}_${location || 'Ghana'}`;
    
    try {
      const response = await api.post<AskResponse>(endpoints.ask, {
        question,
        location: location || 'Ghana',
      });
      
      // Cache the response for offline access
      const userId = await SecureStore.getItemAsync('userPhone') || 'anonymous';
      await offlineCache.cacheChatHistory(userId, [{
        id: Date.now().toString(),
        question,
        answer: response.data.answer,
        timestamp: new Date().toISOString(),
      }]);
      
      return response.data;
    } catch (error) {
      // Try to get from cache if network fails
      const online = offlineCache.isOnline();
      if (!online) {
        const cached = await offlineCache.get<AskResponse>(cacheKey);
        if (cached) {
          return { ...cached, answer: cached.answer + '\n\n(Cached response - you are offline)' };
        }
      }
      throw error;
    }
  },

  async getOrder(id: string) {
    // Now handled by OrderContext
    return null;
  },

  async cancelOrder(id: string) {
    // Now handled by OrderContext
    return { success: true };
  },

  async getWeather(location: string = 'Accra'): Promise<WeatherResponse> {
    // Check cache first
    const cached = await offlineCache.getWeather(location) as WeatherResponse | null;
    const online = offlineCache.isOnline();
    
    // If offline and have cached data, return it
    if (!online && cached) {
      return {
        ...cached,
        summary: cached.summary + '\n\n📴 (Cached - you are offline)',
      };
    }
    
    try {
      const response = await api.get<WeatherResponse>(endpoints.weather, {
        params: { loc: location },
      });
      
      // Cache the weather data
      await offlineCache.cacheWeather(location, response.data);
      
      return response.data;
    } catch (error) {
      // Return cached data if available
      if (cached) {
        return {
          ...cached,
          summary: cached.summary + '\n\n⚠️ (Cached - could not refresh)',
        };
      }
      throw error;
    }
  },

  async getMarketCrops(): Promise<MarketCropsResponse> {
    const cacheKey = 'market_crops';
    const online = offlineCache.isOnline();
    
    // Check cache first if offline
    if (!online) {
      const cached = await offlineCache.get<MarketCropsResponse>(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const response = await api.get<MarketCropsResponse>(endpoints.marketCrops);
      
      // Cache the response
      await offlineCache.set(cacheKey, response.data, 24 * 60 * 60 * 1000); // 24 hours
      
      return response.data;
    } catch (error) {
      // Try stale cache
      const { data: stale } = await offlineCache.getStale<MarketCropsResponse>(cacheKey);
      if (stale) return stale;
      throw error;
    }
  },

  async getMarketPrices(crop: string): Promise<MarketPricesResponse> {
    // Check cache first
    const cached = await offlineCache.getMarketPrices(crop) as MarketPricesResponse | null;
    const online = offlineCache.isOnline();
    
    // If offline and have cached data for this crop, return it
    if (!online && cached) {
      return cached;
    }
    
    try {
      const response = await api.get<MarketPricesResponse>(endpoints.marketPrices, {
        params: { crop },
      });
      
      // Cache the market prices
      await offlineCache.cacheMarketPrices(crop, response.data);
      
      return response.data;
    } catch (error) {
      // Return cached data if available for this crop
      if (cached) {
        return cached;
      }
      throw error;
    }
  },

  async submitFeedback(
    rating: number,
    comment?: string,
    location?: string,
    language: string = 'en'
  ): Promise<FeedbackResponse> {
    const online = offlineCache.isOnline();
    
    if (!online) {
      // Queue for later sync
      await offlineCache.addPendingSync({
        type: 'create',
        table: 'feedback',
        data: { rating, comment, location, language },
      });
      return { ok: true }; // Optimistic response
    }
    
    try {
      const response = await api.post<FeedbackResponse>(endpoints.feedback, {
        rating,
        comment,
        location,
        language,
      });
      return response.data;
    } catch (error) {
      // Queue for later if network error
      await offlineCache.addPendingSync({
        type: 'create',
        table: 'feedback',
        data: { rating, comment, location, language },
      });
      return { ok: true }; // Optimistic response
    }
  },

  async detectDisease(payload: DetectDiseaseRequest): Promise<DetectDiseaseResponse> {
    const online = offlineCache.isOnline();
    
    if (!online) {
      throw new Error('Disease detection requires internet connection. Please try again when online.');
    }
    
    try {
      const response = await api.post<DetectDiseaseResponse>('/analyze-image', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Legacy mock functions - now redirect to Supabase auth
  async mockLogin(phone: string) {
    // Redirect to Supabase - kept for backward compatibility
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone.startsWith('+') ? phone : `+233${phone.replace(/^0/, '')}`,
    });
    
    if (error) {
      // Fallback to mock for development
      await SecureStore.setItemAsync('userToken', 'mock_token_' + phone);
      await SecureStore.setItemAsync('userPhone', phone);
      
      return {
        success: true,
        user: {
          phone,
          name: 'Test Farmer',
          location: 'Kumasi',
        },
      };
    }
    
    return {
      success: true,
      user: { phone },
      needsVerification: true,
    };
  },

  async mockGetProfile() {
    // Try to get from Supabase first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        return {
          phone: profile.phone || user.phone,
          name: profile.full_name || 'Farmer',
          location: profile.location || 'Ghana',
          crops: profile.crops || [],
          farmSize: profile.farm_size || '',
          language: profile.preferred_language || 'en',
        };
      }
    }
    
    // Fallback to stored data
    const phone = await SecureStore.getItemAsync('userPhone');
    return {
      phone: phone || '+233241234567',
      name: 'Salim Adams',
      location: 'Kumasi',
      crops: ['Maize', 'Cassava', 'Tomatoes'],
      farmSize: '5 acres',
      language: 'en',
    };
  },
  
  // Sync pending operations when back online
  async syncPendingOperations(): Promise<void> {
    await offlineCache.syncPendingItems();
  },
};