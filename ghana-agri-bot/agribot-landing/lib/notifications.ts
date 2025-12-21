// lib/notifications.ts - Push notification utilities

export interface NotificationPayload {
  title: string
  message: string
  url?: string
  tag?: string
  icon?: string
  actions?: Array<{ action: string; title: string }>
}

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

// Get current notification permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isPushSupported()) return 'unsupported'
  
  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return 'denied'
  }
}

// Subscribe to push notifications
export async function subscribeToPush(vapidPublicKey?: string): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      console.log('Already subscribed to push notifications')
      return subscription
    }

    // Create new subscription
    const subscribeOptions: PushSubscriptionOptionsInit = {
      userVisibleOnly: true,
    }

    // Add VAPID key if provided
    if (vapidPublicKey) {
      subscribeOptions.applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)
    }

    subscription = await registration.pushManager.subscribe(subscribeOptions)
    console.log('Subscribed to push notifications:', subscription.endpoint)
    
    return subscription
  } catch (error) {
    console.error('Error subscribing to push:', error)
    return null
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      console.log('Unsubscribed from push notifications')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error unsubscribing from push:', error)
    return false
  }
}

// Get current push subscription
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null

  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch (error) {
    console.error('Error getting push subscription:', error)
    return null
  }
}

// Show a local notification (not push)
export async function showLocalNotification(payload: NotificationPayload): Promise<boolean> {
  if (!isPushSupported()) return false
  
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    await registration.showNotification(payload.title, {
      body: payload.message,
      icon: payload.icon || '/logo.jpg',
      badge: '/logo.jpg',
      tag: payload.tag || 'semmaai-notification',
      data: { url: payload.url || '/farmer' },
    })
    
    return true
  } catch (error) {
    console.error('Error showing notification:', error)
    return false
  }
}

// Convert VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray.buffer
}

// Save subscription to backend
export async function saveSubscriptionToServer(
  subscription: PushSubscription,
  userId: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId,
      }),
    })
    
    return response.ok
  } catch (error) {
    console.error('Error saving subscription to server:', error)
    return false
  }
}

// Notification types for the app
export const NOTIFICATION_TYPES = {
  NEW_MESSAGE: 'new_message',
  PRICE_ALERT: 'price_alert',
  ORDER_UPDATE: 'order_update',
  COMMUNITY_POST: 'community_post',
  WEATHER_ALERT: 'weather_alert',
  DISEASE_DETECTION: 'disease_detection',
} as const

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]
