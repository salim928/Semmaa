// app/farmer/layout.tsx
'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth, useApp } from '@/context'
import { Loader2, LogOut, Bell, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FEATURES } from '@/config/features'

const NAV_ITEMS = [
  { href: '/farmer', label: 'Home', icon: '🏠', enabled: true },
  { href: '/farmer/chat', label: 'AI Advisor', icon: '🤖', enabled: FEATURES.aiAdvisor },
  { href: '/farmer/market', label: 'Market', icon: '🛒', enabled: FEATURES.marketplace },
  { href: '/farmer/insights', label: 'Insights', icon: '📊', enabled: FEATURES.analytics, comingSoon: !FEATURES.analytics },
].filter(item => item.enabled || item.comingSoon)

const MORE_ITEMS = [
  { href: '/farmer/disease', label: 'Disease Detection', icon: '🔬', enabled: FEATURES.diseaseDetection, comingSoon: !FEATURES.diseaseDetection },
  { href: '/farmer/community', label: 'Community', icon: '👥', enabled: FEATURES.community, comingSoon: !FEATURES.community },
  { href: '/farmer/tools/planting-calendar', label: 'Planting Calendar', icon: '📅', enabled: true },
  { href: '/farmer/notifications', label: 'Notifications', icon: '🔔', enabled: FEATURES.notifications },
  { href: '/farmer/profile', label: 'Profile', icon: '👤', enabled: FEATURES.profile },
].filter(item => item.enabled || item.comingSoon)

export default function FarmerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const { unreadCount } = useApp()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, router])

  const isActive = (href: string) => {
    if (href === '/farmer') return pathname === '/farmer'
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-emerald-700">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Desktop Header */}
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow">
              <Image
                src="/logo.jpg"
                alt="SemmaAI"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-emerald-900">
                SemmaAI
              </span>
              <span className="text-[11px] font-medium text-emerald-600">
                Farmer Dashboard
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-emerald-900">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.comingSoon ? '#' : item.href}
                onClick={(e) => item.comingSoon && e.preventDefault()}
                className={`rounded-full px-3 py-1.5 transition-colors flex items-center gap-1.5 relative ${
                  isActive(item.href)
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.comingSoon
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-emerald-50'
                }`}
                title={item.comingSoon ? 'Coming Soon' : ''}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.comingSoon && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1 py-0.5 rounded">
                    SOON
                  </span>
                )}
              </Link>
            ))}

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`rounded-full px-3 py-1.5 transition-colors flex items-center gap-1.5 hover:bg-emerald-50 ${
                  moreMenuOpen ? 'bg-emerald-50' : ''
                }`}
              >
                <span>⋯</span>
                <span>More</span>
              </button>
              {moreMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setMoreMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-lg ring-1 ring-emerald-100 z-20 py-2">
                    {MORE_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.comingSoon ? '#' : item.href}
                        onClick={(e) => {
                          if (item.comingSoon) e.preventDefault()
                          else setMoreMenuOpen(false)
                        }}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative ${
                          isActive(item.href)
                            ? 'bg-emerald-50 text-emerald-800'
                            : item.comingSoon
                            ? 'text-emerald-400 cursor-not-allowed'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={item.comingSoon ? 'Coming Soon' : ''}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                        {item.comingSoon && (
                          <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                            Soon
                          </span>
                        )}
                        {!item.comingSoon && item.href === '/farmer/notifications' && unreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle variant="icon" />

            {/* Notifications */}
            <Link 
              href="/farmer/notifications"
              className="relative p-2 rounded-full hover:bg-emerald-50 transition-colors"
            >
              <Bell className="w-5 h-5 text-emerald-700" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-emerald-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <span className="text-sm font-medium text-emerald-900 max-w-[100px] truncate">
                  {user?.name || 'User'}
                </span>
              </button>

              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-lg ring-1 ring-emerald-100 z-20 py-2">
                    <div className="px-4 py-2 border-b border-emerald-100">
                      <p className="text-sm font-medium text-emerald-900 truncate">{user?.name}</p>
                      <p className="text-xs text-emerald-600 truncate">{user?.email || user?.phone}</p>
                    </div>
                    <Link
                      href="/farmer/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50"
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-full p-2 hover:bg-emerald-50 transition-colors"
          >
            <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-100 bg-white py-4 px-4">
            {/* User Info */}
            <div className="flex items-center gap-3 px-2 py-3 mb-3 border-b border-emerald-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-900">{user?.name || 'User'}</p>
                <p className="text-xs text-emerald-600">{user?.location || 'Ghana'}</p>
              </div>
            </div>

            <nav className="grid grid-cols-3 gap-2">
              {[...NAV_ITEMS, ...MORE_ITEMS].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    if (!item.enabled) {
                      e.preventDefault();
                      return;
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-colors relative ${
                    !item.enabled 
                      ? 'opacity-50 cursor-not-allowed'
                      : isActive(item.href)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                  {item.comingSoon && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1 py-0.5 rounded">
                      SOON
                    </span>
                  )}
                  {item.href === '/farmer/notifications' && unreadCount > 0 && item.enabled && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 px-2 py-2 z-50">
        <div className="flex justify-around items-center">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => {
                if (!item.enabled) {
                  e.preventDefault();
                }
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors relative ${
                !item.enabled
                  ? 'opacity-50 cursor-not-allowed text-emerald-400'
                  : isActive(item.href)
                    ? 'text-emerald-700'
                    : 'text-emerald-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.comingSoon && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1 rounded">
                  SOON
                </span>
              )}
              {isActive(item.href) && item.enabled && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-16" />
    </div>
  )
}


