'use client'

// app/farmer/notifications/page.tsx - Notifications center for farmers

import React, { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'

interface Notification {
  id: string
  type: 'order' | 'price' | 'weather' | 'pest' | 'system' | 'chat' | 'reminder'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionType?: string
  actionData?: Record<string, unknown>
  priority: 'low' | 'medium' | 'high' | 'urgent'
  icon?: string
  color?: string
}

const NOTIFICATION_CATEGORIES = [
  { type: 'all', icon: '🔔', label: 'All' },
  { type: 'order', icon: '🛒', label: 'Orders' },
  { type: 'price', icon: '📈', label: 'Prices' },
  { type: 'weather', icon: '🌤️', label: 'Weather' },
  { type: 'pest', icon: '⚠️', label: 'Alerts' },
  { type: 'reminder', icon: '📅', label: 'Reminders' },
]

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'New Order Received!',
    message: 'John Mensah wants to buy 50kg of tomatoes',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    actionType: 'order_detail',
    priority: 'high',
    icon: '🛒',
    color: '#28a745',
  },
  {
    id: '2',
    type: 'price',
    title: 'Price Alert: Maize',
    message: 'Maize prices increased by 15% in Kumasi market',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    actionType: 'market',
    priority: 'medium',
    icon: '📈',
    color: '#ffc107',
  },
  {
    id: '3',
    type: 'weather',
    title: 'Heavy Rain Alert',
    message: 'Heavy rainfall expected tomorrow. Protect your harvest',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    actionType: 'weather',
    priority: 'urgent',
    icon: '🌧️',
    color: '#17a2b8',
  },
  {
    id: '4',
    type: 'pest',
    title: 'Pest Warning',
    message: 'Fall armyworm detected in your area. Take preventive measures',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    actionType: 'advice',
    priority: 'high',
    icon: '🐛',
    color: '#dc3545',
  },
  {
    id: '5',
    type: 'reminder',
    title: 'Fertilizer Application Due',
    message: 'Time to apply second round of fertilizer for your maize',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    actionType: 'task',
    priority: 'medium',
    icon: '📅',
    color: '#6f42c1',
  },
  {
    id: '6',
    type: 'system',
    title: 'Welcome to SemmaAI!',
    message: 'Get started with AI-powered farming advice',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    read: true,
    priority: 'low',
    icon: 'ℹ️',
    color: '#6c757d',
  },
  {
    id: '7',
    type: 'price',
    title: 'Market Update',
    message: 'Cassava prices are stable this week at major markets',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    actionType: 'market',
    priority: 'low',
    icon: '💹',
    color: '#28a745',
  },
  {
    id: '8',
    type: 'weather',
    title: 'Weekly Weather Forecast',
    message: 'Sunny skies expected for the next 5 days. Good for harvesting',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: false,
    actionType: 'weather',
    priority: 'low',
    icon: '☀️',
    color: '#ffc107',
  },
]

const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'urgent': return { label: '🔴 Urgent', class: 'bg-red-500 text-white' }
    case 'high': return { label: '🟠 High', class: 'bg-orange-500 text-white' }
    case 'medium': return { label: '🟡 Medium', class: 'bg-amber-500 text-white' }
    case 'low': return { label: '🟢 Low', class: 'bg-gray-400 text-white' }
    default: return { label: '', class: '' }
  }
}

function getNotificationIcon(type?: string): string {
  switch (type) {
    case 'order': return '🛒'
    case 'price': return '📈'
    case 'weather': return '🌤️'
    case 'pest': return '⚠️'
    case 'reminder': return '📅'
    case 'chat': return '💬'
    default: return 'ℹ️'
  }
}

function getNotificationColor(type?: string): string {
  switch (type) {
    case 'order': return '#28a745'
    case 'price': return '#ffc107'
    case 'weather': return '#17a2b8'
    case 'pest': return '#dc3545'
    case 'reminder': return '#6f42c1'
    case 'chat': return '#007bff'
    default: return '#6c757d'
  }
}

export default function NotificationsPage() {
  const { notifications: dbNotifications, markAsRead: markNotificationRead, notificationsLoading } = useApp()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Map database notifications to local format
    if (dbNotifications.length > 0) {
      const mapped: Notification[] = dbNotifications.map(n => ({
        id: n.id,
        type: (n.type || 'system') as Notification['type'],
        title: n.title,
        message: n.message,
        timestamp: new Date(n.created_at),
        read: n.is_read,
        priority: 'medium' as const,
        icon: getNotificationIcon(n.type),
        color: getNotificationColor(n.type),
      }))
      setNotifications(mapped)
      setLoading(false)
    } else if (!notificationsLoading) {
      // Use mock notifications if no database notifications
      setNotifications(MOCK_NOTIFICATIONS)
      setLoading(false)
    }
  }, [dbNotifications, notificationsLoading])

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    // Update in database
    await markNotificationRead(id)
  }

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    // Mark all in database
    for (const n of notifications.filter(n => !n.read)) {
      await markNotificationRead(n.id)
    }
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    // In a real app, navigate based on actionType
    console.log('Navigate to:', notification.actionType)
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false
    if (categoryFilter !== 'all' && n.type !== categoryFilter) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    const date = notification.timestamp
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    let group = 'Earlier'
    if (date.toDateString() === today.toDateString()) {
      group = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = 'Yesterday'
    } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      group = 'This Week'
    }
    
    if (!acc[group]) acc[group] = []
    acc[group].push(notification)
    return acc
  }, {} as Record<string, Notification[]>)

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 p-5 text-white shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">🔔 Notifications</h1>
            <p className="text-sm text-emerald-100">
              Stay updated with alerts, orders, and farming advice
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === 'unread'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            {filter === 'all' ? 'Show All' : 'Unread Only'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              ✓ Mark all read
            </button>
          )}
        </div>
        <p className="text-sm text-emerald-600">
          {filteredNotifications.length} notifications
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {NOTIFICATION_CATEGORIES.map((cat) => (
          <button
            key={cat.type}
            onClick={() => setCategoryFilter(cat.type)}
            className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              categoryFilter === cat.type
                ? 'bg-emerald-100 text-emerald-800 shadow-sm'
                : 'bg-white text-emerald-700 border border-emerald-100 hover:border-emerald-300'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            {cat.type !== 'all' && (
              <span className="rounded-full bg-emerald-200 px-1.5 text-xs">
                {notifications.filter(n => n.type === cat.type).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-6xl mb-4">🔕</span>
          <p className="text-lg font-medium text-emerald-900">No notifications</p>
          <p className="text-sm text-emerald-600 mt-1">
            {filter === 'unread' 
              ? "You're all caught up!" 
              : "You don't have any notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-3">
                {group}
              </p>
              <div className="space-y-3">
                {groupNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group relative rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                      !notification.read 
                        ? 'border-l-4 border-l-emerald-500 border-emerald-200' 
                        : 'border-emerald-100 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-xl"
                        style={{ backgroundColor: (notification.color || '#10b981') + '20' }}
                      >
                        {notification.icon || '🔔'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`text-sm font-semibold text-emerald-950 ${!notification.read ? 'font-bold' : ''}`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                            )}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-100 transition-all"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <p className="text-sm text-emerald-700 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-500">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                          
                          {notification.priority === 'urgent' && (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityBadge(notification.priority).class}`}>
                              Urgent
                            </span>
                          )}
                          {notification.priority === 'high' && (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                              High Priority
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Link */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <p className="font-semibold text-emerald-800">Notification Settings</p>
              <p className="text-sm text-emerald-600">Manage what alerts you receive</p>
            </div>
          </div>
          <a
            href="/farmer/profile"
            className="rounded-full bg-white border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            Manage →
          </a>
        </div>
      </div>
    </div>
  )
}
