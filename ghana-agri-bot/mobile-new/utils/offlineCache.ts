// utils/offlineCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Cache key prefix
const CACHE_PREFIX = '@semma_cache_';
const PENDING_SYNC_KEY = '@semma_pending_sync';
const CACHE_METADATA_KEY = '@semma_cache_metadata';

// Interface for cached items
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Interface for pending sync items (offline-first)
interface PendingSyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

// Interface for cache metadata (tracking what's cached)
interface CacheMetadata {
  keys: string[];
  lastCleanup: number;
  totalSize: number;
}

// Network status listener
let isOnline = true;
let networkListeners: ((status: boolean) => void)[] = [];

// Initialize network listener
NetInfo.addEventListener((state: NetInfoState) => {
  const wasOnline = isOnline;
  isOnline = state.isConnected ?? false;
  
  if (isOnline && !wasOnline) {
    // Device came back online, trigger sync
    console.log('Device online - triggering sync');
    offlineCache.syncPendingItems();
  }
  
  // Notify all listeners
  networkListeners.forEach(listener => listener(isOnline));
});

export const offlineCache = {
  // Check network status
  isOnline: () => isOnline,

  // Subscribe to network changes
  addNetworkListener: (callback: (isOnline: boolean) => void) => {
    networkListeners.push(callback);
    return () => {
      networkListeners = networkListeners.filter(l => l !== callback);
    };
  },

  // Store data with expiration
  async set<T>(key: string, data: T, ttlMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttlMs,
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(item));
      await updateCacheMetadata(key, 'add');
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  // Retrieve data (returns null if expired or not found)
  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const raw = await AsyncStorage.getItem(cacheKey);
      
      if (!raw) return null;
      
      const item: CacheItem<T> = JSON.parse(raw);
      
      // Check if expired
      if (Date.now() > item.expiresAt) {
        await offlineCache.remove(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Get data even if expired (for offline fallback)
  async getStale<T>(key: string): Promise<{ data: T | null; isStale: boolean }> {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const raw = await AsyncStorage.getItem(cacheKey);
      
      if (!raw) return { data: null, isStale: false };
      
      const item: CacheItem<T> = JSON.parse(raw);
      const isStale = Date.now() > item.expiresAt;
      
      return { data: item.data, isStale };
    } catch (error) {
      console.error('Cache getStale error:', error);
      return { data: null, isStale: false };
    }
  },

  // Remove item from cache
  async remove(key: string): Promise<void> {
    try {
      const cacheKey = CACHE_PREFIX + key;
      await AsyncStorage.removeItem(cacheKey);
      await updateCacheMetadata(key, 'remove');
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  },

  // Clear all cached data
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      await AsyncStorage.removeItem(CACHE_METADATA_KEY);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },

  // Clear expired items
  async cleanup(): Promise<void> {
    try {
      const metadata = await getCacheMetadata();
      const now = Date.now();
      
      for (const key of metadata.keys) {
        const cacheKey = CACHE_PREFIX + key;
        const raw = await AsyncStorage.getItem(cacheKey);
        
        if (raw) {
          const item: CacheItem<unknown> = JSON.parse(raw);
          if (now > item.expiresAt) {
            await AsyncStorage.removeItem(cacheKey);
            await updateCacheMetadata(key, 'remove');
          }
        }
      }
      
      metadata.lastCleanup = now;
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  },

  // =====================================================
  // OFFLINE-FIRST SYNC QUEUE
  // For operations that need to be synced when online
  // =====================================================

  // Add item to pending sync queue
  async addPendingSync(item: Omit<PendingSyncItem, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    try {
      const pendingItems = await getPendingSyncItems();
      const newItem: PendingSyncItem = {
        ...item,
        id: generateId(),
        timestamp: Date.now(),
        retryCount: 0,
      };
      
      pendingItems.push(newItem);
      await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pendingItems));
      
      // Try to sync immediately if online
      if (isOnline) {
        offlineCache.syncPendingItems();
      }
      
      return newItem.id;
    } catch (error) {
      console.error('Add pending sync error:', error);
      throw error;
    }
  },

  // Get all pending sync items
  async getPendingItems(): Promise<PendingSyncItem[]> {
    return getPendingSyncItems();
  },

  // Sync pending items (called when online)
  async syncPendingItems(): Promise<{ synced: number; failed: number }> {
    if (!isOnline) {
      return { synced: 0, failed: 0 };
    }

    let synced = 0;
    let failed = 0;

    try {
      const { supabase } = await import('../config/supabase');
      const pendingItems = await getPendingSyncItems();
      const remainingItems: PendingSyncItem[] = [];

      for (const item of pendingItems) {
        try {
          let success = false;

          switch (item.type) {
            case 'create':
              const { error: createError } = await supabase
                .from(item.table)
                .insert(item.data);
              success = !createError;
              if (createError) console.error('Sync create error:', createError);
              break;

            case 'update':
              const { error: updateError } = await supabase
                .from(item.table)
                .update(item.data)
                .eq('id', item.data.id);
              success = !updateError;
              if (updateError) console.error('Sync update error:', updateError);
              break;

            case 'delete':
              const { error: deleteError } = await supabase
                .from(item.table)
                .delete()
                .eq('id', item.data.id);
              success = !deleteError;
              if (deleteError) console.error('Sync delete error:', deleteError);
              break;
          }

          if (success) {
            synced++;
          } else {
            item.retryCount++;
            if (item.retryCount < 5) {
              remainingItems.push(item);
            }
            failed++;
          }
        } catch (error) {
          console.error('Sync item error:', error);
          item.retryCount++;
          if (item.retryCount < 5) {
            remainingItems.push(item);
          }
          failed++;
        }
      }

      await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(remainingItems));
      
      console.log(`Sync complete: ${synced} synced, ${failed} failed`);
      return { synced, failed };
    } catch (error) {
      console.error('Sync pending items error:', error);
      return { synced, failed };
    }
  },

  // Remove a specific pending sync item
  async removePendingSync(id: string): Promise<void> {
    try {
      const pendingItems = await getPendingSyncItems();
      const filtered = pendingItems.filter(item => item.id !== id);
      await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Remove pending sync error:', error);
    }
  },

  // =====================================================
  // SPECIFIC DATA CACHING METHODS
  // =====================================================

  // Cache market prices
  async cacheMarketPrices(crop: string, data: unknown): Promise<void> {
    await offlineCache.set(`market_prices_${crop}`, data, 6 * 60 * 60 * 1000); // 6 hours
  },

  // Get cached market prices
  async getMarketPrices(crop: string): Promise<unknown | null> {
    const { data, isStale } = await offlineCache.getStale(`market_prices_${crop}`);
    if (!isOnline && data) {
      return data; // Return stale data when offline
    }
    return isStale ? null : data;
  },

  // Cache weather data
  async cacheWeather(location: string, data: unknown): Promise<void> {
    await offlineCache.set(`weather_${location}`, data, 30 * 60 * 1000); // 30 minutes
  },

  // Get cached weather
  async getWeather(location: string): Promise<unknown | null> {
    const { data, isStale } = await offlineCache.getStale(`weather_${location}`);
    if (!isOnline && data) {
      return data;
    }
    return isStale ? null : data;
  },

  // Cache orders
  async cacheOrders(userId: string, type: string, orders: unknown[]): Promise<void> {
    await offlineCache.set(`orders_${userId}_${type}`, orders, 5 * 60 * 1000); // 5 minutes
  },

  // Get cached orders
  async getOrders(userId: string, type: string): Promise<unknown[] | null> {
    const { data, isStale } = await offlineCache.getStale<unknown[]>(`orders_${userId}_${type}`);
    if (!isOnline && data) {
      return data;
    }
    return isStale ? null : data;
  },

  // Cache chat history
  async cacheChatHistory(userId: string, messages: unknown[]): Promise<void> {
    await offlineCache.set(`chat_${userId}`, messages, 24 * 60 * 60 * 1000); // 24 hours
  },

  // Get cached chat history
  async getChatHistory(userId: string): Promise<unknown[] | null> {
    return offlineCache.get<unknown[]>(`chat_${userId}`);
  },

  // Cache products for marketplace
  async cacheProducts(category: string, products: unknown[]): Promise<void> {
    await offlineCache.set(`products_${category}`, products, 15 * 60 * 1000); // 15 minutes
  },

  // Get cached products
  async getProducts(category: string): Promise<unknown[] | null> {
    const { data, isStale } = await offlineCache.getStale<unknown[]>(`products_${category}`);
    if (!isOnline && data) {
      return data;
    }
    return isStale ? null : data;
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function getPendingSyncItems(): Promise<PendingSyncItem[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Get pending sync items error:', error);
    return [];
  }
}

async function getCacheMetadata(): Promise<CacheMetadata> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_METADATA_KEY);
    return raw ? JSON.parse(raw) : { keys: [], lastCleanup: 0, totalSize: 0 };
  } catch (error) {
    return { keys: [], lastCleanup: 0, totalSize: 0 };
  }
}

async function updateCacheMetadata(key: string, action: 'add' | 'remove'): Promise<void> {
  try {
    const metadata = await getCacheMetadata();
    
    if (action === 'add' && !metadata.keys.includes(key)) {
      metadata.keys.push(key);
    } else if (action === 'remove') {
      metadata.keys = metadata.keys.filter(k => k !== key);
    }
    
    await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Update cache metadata error:', error);
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default offlineCache;
