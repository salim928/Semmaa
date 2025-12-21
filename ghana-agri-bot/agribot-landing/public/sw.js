// public/sw.js - Service Worker for SemmaAI PWA
const CACHE_NAME = 'semmaai-v1';
const OFFLINE_URL = '/offline';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/farmer',
  '/farmer/chat',
  '/farmer/market',
  '/farmer/community',
  '/farmer/profile',
  '/offline',
  '/logo.jpg',
  '/manifest.json',
];

// API routes that should use network-first strategy
const API_ROUTES = ['/api/', 'supabase.co'];

// Static assets that should use cache-first strategy
const STATIC_EXTENSIONS = ['.js', '.css', '.woff', '.woff2', '.png', '.jpg', '.jpeg', '.svg', '.ico'];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SemmaAI: Caching app shell');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  // API requests - network first, fall back to cache
  if (API_ROUTES.some((route) => url.href.includes(route))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - cache first
  if (STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages - network first with offline fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Default - network first
  event.respondWith(networkFirst(request));
});

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw new Error('No network or cache available');
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network first with offline page fallback
async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // Return offline page
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) return offlineResponse;

    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.message || 'New notification from SemmaAI',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/farmer',
      ...data,
    },
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    tag: data.tag || 'semmaai-notification',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title || 'SemmaAI', options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/farmer';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPendingPosts());
  }
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingPosts() {
  console.log('SemmaAI: Syncing pending posts...');
}

async function syncPendingOrders() {
  console.log('SemmaAI: Syncing pending orders...');
}
