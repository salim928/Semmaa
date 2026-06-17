'use client'

// app/farmer/page.tsx – Farmer dashboard (mirrors mobile HomeScreen)

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { FEATURES } from '@/config/features'

export default function FarmerHome() {
  const { user } = useAuth()
  const { weather, weatherLoading, notifications, orders } = useApp()
  const [greeting, setGreeting] = useState('')
  
  // Get user's location from profile or default to Accra
  const location = user?.location || 'Accra'
  
  // Calculate stats from real data
  const unreadNotifications = notifications.filter(n => !n.is_read).length
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'in_transit').length

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  const getWeatherIcon = () => {
    if (!weather?.summary) return '⛅'
    const summary = weather.summary.toLowerCase()
    if (summary.includes('rain')) return '🌧️'
    if (summary.includes('cloud')) return '☁️'
    if (summary.includes('sun') || summary.includes('clear')) return '☀️'
    if (summary.includes('storm')) return '⛈️'
    return '⛅'
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero / Greeting with Weather */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 p-6 text-white shadow-lg sm:p-8">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 h-32 w-32 rounded-full bg-white" />
          <div className="absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-white" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: Greeting and CTAs */}
          <div className="max-w-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-lg font-bold shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'F'}
              </div>
              <div>
                <p className="text-sm text-emerald-100">{greeting} 👋</p>
                <h1 className="text-xl font-bold sm:text-2xl">
                  Welcome, {user?.name || 'Farmer'}!
                </h1>
              </div>
            </div>
            
            <p className="text-sm text-emerald-100 sm:text-base">
              Your SemmaAI advisor is ready. Ask questions, check market prices, and plan your season with
              Ghana-specific guidance.
            </p>
            
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/farmer/chat"
                className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900 shadow-md hover:bg-emerald-50 transition-colors"
              >
                Start AI Chat
                <span className="ml-2 text-lg">💬</span>
              </Link>
              <Link
                href="/farmer/market"
                className="inline-flex items-center rounded-full border border-emerald-100/50 bg-white/10 backdrop-blur px-5 py-2.5 text-sm font-semibold text-emerald-50 hover:bg-white/20 transition-colors"
              >
                View Market
                <span className="ml-2 text-lg">📈</span>
              </Link>
            </div>
          </div>

          {/* Right: Weather Card */}
          <div className="w-full lg:w-auto">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
                  Today&apos;s Weather
                </p>
                <span className="text-xs text-emerald-200 flex items-center gap-1">
                  📍 {location}
                </span>
              </div>
              
              {weatherLoading && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <p className="text-sm text-emerald-100">Loading weather...</p>
                </div>
              )}
              
              {weather && !weatherLoading && (
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{getWeatherIcon()}</div>
                  <div>
                    <p className="text-3xl font-bold">{weather.temperature || '28°C'}</p>
                    <p className="text-sm text-emerald-100">{weather.summary?.split('.')[0] || 'Partly Cloudy'}</p>
                  </div>
                  <div className="ml-auto space-y-1 text-right">
                    <p className="text-xs text-emerald-200 flex items-center gap-1 justify-end">
                      💧 {weather.humidity || '75%'}
                    </p>
                    <p className="text-xs text-emerald-200 flex items-center gap-1 justify-end">
                      💨 {weather.wind || '12km/h'}
                    </p>
                    <Link href="/farmer/insights" className="text-xs text-white hover:underline flex items-center gap-1 justify-end">
                      Details →
                    </Link>
                  </div>
                </div>
              )}
              
              {!weather && !weatherLoading && (
                <p className="text-sm text-amber-200">Weather data unavailable</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid - MVP Focus */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-900">
          Your Tools
        </h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Active Features - Larger, prominent */}
          <QuickActionCard
            href="/farmer/chat"
            title="AI Advisor"
            subtitle="Get instant help"
            icon="💬"
            gradient="from-violet-500 to-violet-600"
            enabled={FEATURES.aiAdvisor}
          />
          <QuickActionCard
            href="/farmer/market"
            title="Marketplace"
            subtitle="Buy & sell"
            icon="🛒"
            gradient="from-rose-500 to-rose-600"
            enabled={FEATURES.marketplace}
          />
          
          {/* Coming Soon Features - Muted */}
          <QuickActionCard
            href="/farmer/disease"
            title="Crop Doctor"
            subtitle="Coming Soon"
            icon="🔬"
            gradient="from-gray-400 to-gray-500"
            enabled={FEATURES.diseaseDetection}
            comingSoon={!FEATURES.diseaseDetection}
          />
        </div>
      </section>

      {/* Today's Overview Stats */}
      <section className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">
            Today&apos;s Overview
          </h2>
          <Link href="/farmer/insights" className="text-xs font-medium text-emerald-600 hover:text-emerald-800">
            View All →
          </Link>
        </div>
        
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon="🌱" 
            iconBg="bg-emerald-100"
            value="92%" 
            label="Crop Health" 
            trend="up"
          />
          <StatCard 
            icon="☀️" 
            iconBg="bg-amber-100"
            value={weather?.summary?.includes('rain') ? 'Rainy' : 'Good'} 
            label="Weather" 
            trend="stable"
          />
          <StatCard 
            icon="📦" 
            iconBg="bg-blue-100"
            value={String(pendingOrders)} 
            label="Pending Orders" 
          />
          <StatCard 
            icon="🔔" 
            iconBg="bg-purple-100"
            value={String(unreadNotifications)} 
            label="Notifications" 
          />
        </div>
      </section>

      {/* Services Grid - Show Coming Soon badges */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-900">
          All Features
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            href="/farmer/chat"
            icon="💬"
            title="AI Advisor"
            description="Ask farming questions anytime"
            enabled={FEATURES.aiAdvisor}
          />
          <ServiceCard
            href="/farmer/market"
            icon="🛒"
            title="Marketplace"
            description="Buy seeds, fertilizer & tools"
            enabled={FEATURES.marketplace}
          />
          <ServiceCard
            href="/farmer/profile"
            icon="👤"
            title="My Profile"
            description="Account & settings"
            enabled={true}
          />
          <ServiceCard
            href="/farmer/notifications"
            icon="🔔"
            title="Notifications"
            description="Alerts & advisories"
            badge={unreadNotifications > 0 ? `${unreadNotifications} unread` : undefined}
            badgeColor="bg-red-100 text-red-700"
            enabled={true}
          />
          <ServiceCard
            href="/farmer/community"
            icon="👥"
            title="Community"
            description="Connect with farmers"
            enabled={FEATURES.community}
            comingSoon={!FEATURES.community}
          />
          <ServiceCard
            href="/farmer/disease"
            icon="🔬"
            title="Disease Detection"
            description="AI-powered crop diagnosis"
            enabled={FEATURES.diseaseDetection}
            comingSoon={!FEATURES.diseaseDetection}
          />
          <ServiceCard
            href="/farmer/insights"
            icon="📊"
            title="Analytics"
            description="Farm insights & reports"
            enabled={FEATURES.analytics}
            comingSoon={!FEATURES.analytics}
          />
          <ServiceCard
            href="/farmer/tools/planting-calendar"
            icon="📅"
            title="Planting Calendar"
            description="Best planting times"
            enabled={FEATURES.weatherAlerts}
            comingSoon={!FEATURES.weatherAlerts}
          />
        </div>
      </section>

      {/* Daily Tip */}
      <section className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl">
            💡
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Daily Tip
            </p>
            <h3 className="mb-1 text-base font-semibold text-amber-900">
              Boost your soil moisture
            </h3>
            <p className="text-sm text-amber-800">
              Apply organic mulch around plants to keep the soil cool, reduce
              evaporation, and protect roots during hot, dry days. This is especially
              important during the dry season in Ghana.
            </p>
          </div>
        </div>
      </section>

      {/* Weather Alert */}
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl">
            🌤️
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              Weather Advisory
            </p>
            <h3 className="mb-1 text-base font-semibold text-blue-900">
              Perfect conditions for field work
            </h3>
            <p className="text-sm text-blue-800">
              The next 3 days show favorable weather for planting and harvesting activities.
              Take advantage of the dry spell before the next rain.
            </p>
            <Link href="/farmer/insights" className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
              View forecast →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function getWeatherIcon(summary?: string) {
  if (!summary) return '⛅'
  const s = summary.toLowerCase()
  if (s.includes('rain')) return '🌧️'
  if (s.includes('cloud')) return '☁️'
  if (s.includes('sun') || s.includes('clear')) return '☀️'
  if (s.includes('storm')) return '⛈️'
  return '⛅'
}

function QuickActionCard(props: {
  href: string
  title: string
  subtitle: string
  icon: string
  gradient: string
  enabled?: boolean
  comingSoon?: boolean
}) {
  const { href, title, subtitle, icon, gradient, enabled = true, comingSoon = false } = props
  
  const handleClick = (e: React.MouseEvent) => {
    if (!enabled || comingSoon) {
      e.preventDefault();
    }
  };
  
  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white shadow-md transition-all ${
        enabled && !comingSoon 
          ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer' 
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      {comingSoon && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-2 py-1 rounded-full z-10">
          SOON
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
            {subtitle}
          </p>
          <p className="text-base font-bold">{title}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-xl transition-transform ${
          enabled && !comingSoon ? 'group-hover:scale-110' : ''
        }`}>
          {icon}
        </div>
      </div>
    </Link>
  )
}

function StatCard(props: { 
  icon: string
  iconBg: string
  value: string
  label: string
  trend?: 'up' | 'down' | 'stable'
}) {
  const { icon, iconBg, value, label, trend } = props
  const trendIcon = trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : ''
  
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-emerald-50 hover:shadow-md transition-shadow">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} text-lg mb-2`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-emerald-950 flex items-center gap-1">
        {value}
        {trendIcon && <span className="text-sm">{trendIcon}</span>}
      </p>
      <p className="text-xs text-emerald-600">{label}</p>
    </div>
  )
}

function ServiceCard(props: {
  href: string
  icon: string
  title: string
  description: string
  badge?: string
  badgeColor?: string
  enabled?: boolean
  comingSoon?: boolean
}) {
  const { href, icon, title, description, badge, badgeColor, enabled = true, comingSoon = false } = props
  
  const handleClick = (e: React.MouseEvent) => {
    if (!enabled || comingSoon) {
      e.preventDefault();
    }
  };
  
  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`group flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition-all ${
        enabled && !comingSoon
          ? 'hover:shadow-md hover:border-emerald-300 cursor-pointer'
          : 'opacity-50 cursor-not-allowed'
      }`}
    >
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl transition-transform ${
        enabled && !comingSoon ? 'group-hover:scale-105' : ''
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-emerald-950">{title}</p>
          {comingSoon && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-yellow-100 text-yellow-700">
              Coming Soon
            </span>
          )}
          {badge && !comingSoon && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColor || 'bg-emerald-100 text-emerald-700'}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-emerald-600 truncate">{description}</p>
      </div>
      <span className={`transition-colors ${
        enabled && !comingSoon ? 'text-emerald-400 group-hover:text-emerald-600' : 'text-gray-300'
      }`}>→</span>
    </Link>
  )
}
