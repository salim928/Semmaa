'use client'

// app/farmer/profile/page.tsx – Web profile/settings mirroring mobile ProfileScreen

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useRouter } from 'next/navigation'
import { 
  isPushSupported, 
  getNotificationPermission, 
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush
} from '@/lib/notifications'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'tw', name: 'Twi', flag: '🇬🇭' },
  { code: 'ga', name: 'Ga', flag: '🇬🇭' },
  { code: 'ee', name: 'Ewe', flag: '🇬🇭' },
  { code: 'dag', name: 'Dagbani', flag: '🇬🇭' },
]

const CROP_OPTIONS = [
  'Maize', 'Cassava', 'Tomatoes', 'Rice', 'Plantain',
  'Yam', 'Cocoa', 'Groundnut', 'Pepper', 'Okra',
  'Cowpea', 'Millet', 'Sorghum', 'Oil Palm', 'Cashew'
]

export default function FarmerProfilePage() {
  const { user, signOut, updateProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [language, setLanguage] = useState('en')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [selectedCrops, setSelectedCrops] = useState<string[]>([])
  const [isEditingCrops, setIsEditingCrops] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  
  // Edit form states
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editFarmSize, setEditFarmSize] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Load profile data
  useEffect(() => {
    if (user) {
      setSelectedCrops(user.crops || ['Maize', 'Cassava', 'Tomatoes'])
      setLanguage(user.language || 'en')
      setEditName(user.name || '')
      setEditPhone(user.phone || '')
      setEditLocation(user.location || '')
      setEditFarmSize(user.farmSize || '')
    }
  }, [user])

  // Check push notification support and status
  useEffect(() => {
    const checkPush = async () => {
      if (isPushSupported()) {
        setPushSupported(true)
        const permission = getNotificationPermission()
        setPushEnabled(permission === 'granted')
      }
    }
    checkPush()
  }, [])

  // Handle push notification toggle
  const handlePushToggle = async () => {
    if (!pushSupported) return

    if (pushEnabled) {
      // Unsubscribe
      await unsubscribeFromPush()
      setPushEnabled(false)
    } else {
      // Request permission and subscribe
      const permission = await requestNotificationPermission()
      if (permission === 'granted') {
        await subscribeToPush()
        setPushEnabled(true)
      }
    }
  }

  const stats = [
    { label: 'Farm Size', value: user?.farmSize || '5 acres', icon: '📐', color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Active Crops', value: String(selectedCrops.length), icon: '🌱', color: 'bg-amber-100 text-amber-700' },
    { label: 'Experience', value: '5 years', icon: '⏱️', color: 'bg-purple-100 text-purple-700' },
    { label: 'Rating', value: '4.8 ⭐', icon: '🏆', color: 'bg-yellow-100 text-yellow-700' },
  ]

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) 
        ? prev.filter(c => c !== crop)
        : [...prev, crop]
    )
  }

  const handleSaveCrops = async () => {
    setIsSaving(true)
    try {
      await updateProfile({ crops: selectedCrops })
      setIsEditingCrops(false)
    } catch (error) {
      console.error('Failed to save crops:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    setShowLogoutModal(false)
    await signOut()
    router.push('/')
  }

  // Handle edit profile save
  const handleEditSave = async () => {
    setIsUpdating(true)
    try {
      await updateProfile({
        name: editName,
        phone: editPhone,
        location: editLocation,
        farmSize: editFarmSize,
      })
      setShowEditModal(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle language change
  const handleLanguageChange = async (langCode: string) => {
    setLanguage(langCode)
    try {
      await updateProfile({ language: langCode })
    } catch (error) {
      console.error('Failed to update language:', error)
    }
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return user?.email?.charAt(0)?.toUpperCase() || 'F'
  }

  // Menu items with click handlers
  const handleMenuClick = (href: string) => {
    if (href === '#edit') {
      setShowEditModal(true)
    } else if (href === '#privacy') {
      setShowPrivacyModal(true)
    } else if (href === '#help') {
      setShowHelpModal(true)
    } else if (href === '#terms') {
      setShowTermsModal(true)
    } else {
      router.push(href)
    }
  }

  const MENU_ITEMS = [
    { icon: '👤', label: 'Edit Profile', href: '#edit', color: 'text-emerald-600' },
    { icon: '🔔', label: 'Notifications', href: '/farmer/notifications', color: 'text-blue-600' },
    { icon: '🔒', label: 'Privacy & Security', href: '#privacy', color: 'text-purple-600' },
    { icon: '📊', label: 'Farm Analytics', href: '/farmer/insights', color: 'text-amber-600' },
    { icon: '❓', label: 'Help & Support', href: '#help', color: 'text-cyan-600' },
    { icon: '📜', label: 'Terms of Service', href: '#terms', color: 'text-gray-600' },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 h-32 w-32 rounded-full bg-white" />
        </div>
        
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-3xl font-bold text-white shadow-lg">
                {getInitials()}
              </div>
              <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-600 shadow-md hover:bg-emerald-50 transition-colors">
                📷
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl font-bold sm:text-2xl">{user?.name || 'Farmer'}</h1>
              <p className="text-sm text-emerald-100">
                {user?.phone || user?.email || 'No contact info'}
              </p>
              <p className="text-xs text-emerald-200 mt-1">
                📍 {user?.location || 'Ghana'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              {LANGUAGES.find((l) => l.code === language)?.flag} {LANGUAGES.find((l) => l.code === language)?.name}
            </span>
            <span className="rounded-full bg-amber-400/20 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              ⭐ Verified Farmer
            </span>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} text-lg mb-2`}>
              {stat.icon}
            </div>
            <p className="text-lg font-bold text-emerald-950">{stat.value}</p>
            <p className="text-xs text-emerald-600">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* My Crops */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">
            My Crops
          </h2>
          <button
            onClick={() => isEditingCrops ? handleSaveCrops() : setIsEditingCrops(true)}
            disabled={isSaving}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : isEditingCrops ? 'Save' : 'Edit'}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {isEditingCrops ? (
            CROP_OPTIONS.map((crop) => {
              const isSelected = selectedCrops.includes(crop)
              return (
                <button
                  key={crop}
                  onClick={() => toggleCrop(crop)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {isSelected && '✓ '}{crop}
                </button>
              )
            })
          ) : (
            selectedCrops.map((crop) => (
              <span
                key={crop}
                className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700"
              >
                🌱 {crop}
              </span>
            ))
          )}
        </div>
      </section>

      {/* Language Selection */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900 mb-4">
          Language / Kasa
        </h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {LANGUAGES.map((lang) => {
            const active = lang.code === language
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-sm transition-all ${
                  active
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-emerald-100 bg-white text-emerald-800 hover:border-emerald-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </span>
                {active && <span className="text-emerald-600 font-bold">✓</span>}
              </button>
            )
          })}
        </div>
      </section>

      {/* Settings */}
      <section className="rounded-2xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900 px-5 pt-5 pb-3">
          Settings
        </h2>
        
        {/* Toggle Settings */}
        <div className="border-b border-emerald-50">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <div>
                <p className="font-medium text-emerald-900">Push Notifications</p>
                <p className="text-xs text-emerald-600">Receive alerts & updates</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                notificationsEnabled ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        {MENU_ITEMS.map((item, index) => (
          <button
            key={item.label}
            onClick={() => handleMenuClick(item.href)}
            className={`w-full flex items-center justify-between px-5 py-4 hover:bg-emerald-50 transition-colors ${
              index < MENU_ITEMS.length - 1 ? 'border-b border-emerald-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <p className="font-medium text-emerald-900">{item.label}</p>
            </div>
            <span className="text-emerald-400">→</span>
          </button>
        ))}
      </section>

      {/* Logout Button */}
      <section>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-red-600 font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          Logout
        </button>
      </section>

      {/* App Version */}
      <section className="text-center pb-4">
        <p className="text-xs text-emerald-400">SemmaAI v2.0.0</p>
        <p className="text-xs text-emerald-400">Made with 💚 in Ghana</p>
      </section>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-emerald-900 mb-2">Logout</h3>
            <p className="text-sm text-emerald-600 mb-6">
              Are you sure you want to logout from SemmaAI?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl border border-emerald-200 px-4 py-2.5 font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-emerald-900">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-emerald-400 hover:text-emerald-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-emerald-700 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-emerald-200 px-4 py-3 text-sm text-emerald-900 focus:border-emerald-500 focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-emerald-700 mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-emerald-200 px-4 py-3 text-sm text-emerald-900 focus:border-emerald-500 focus:outline-none"
                  placeholder="+233 XXX XXX XXXX"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-emerald-700 mb-1 block">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full rounded-xl border border-emerald-200 px-4 py-3 text-sm text-emerald-900 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g., Kumasi, Ghana"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-emerald-700 mb-1 block">Farm Size</label>
                <input
                  type="text"
                  value={editFarmSize}
                  onChange={(e) => setEditFarmSize(e.target.value)}
                  className="w-full rounded-xl border border-emerald-200 px-4 py-3 text-sm text-emerald-900 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g., 5 acres"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 rounded-xl border border-emerald-200 px-4 py-2.5 font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={isUpdating}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-700 transition-colors disabled:bg-emerald-400"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Security Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-emerald-900">Privacy & Security</h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-emerald-400 hover:text-emerald-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔐</span>
                  <h4 className="font-semibold text-emerald-900">Data Protection</h4>
                </div>
                <p className="text-sm text-emerald-600">
                  Your data is encrypted and stored securely. We never share your personal information with third parties without your consent.
                </p>
              </div>
              
              <div className="rounded-xl bg-blue-50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📱</span>
                  <h4 className="font-semibold text-blue-900">Two-Factor Authentication</h4>
                </div>
                <p className="text-sm text-blue-600 mb-3">
                  Add an extra layer of security to your account.
                </p>
                <button className="text-sm font-medium text-blue-700 hover:text-blue-800">
                  Enable 2FA →
                </button>
              </div>
              
              <div className="rounded-xl bg-amber-50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔑</span>
                  <h4 className="font-semibold text-amber-900">Change Password</h4>
                </div>
                <p className="text-sm text-amber-600 mb-3">
                  Update your password regularly for better security.
                </p>
                <button className="text-sm font-medium text-amber-700 hover:text-amber-800">
                  Change Password →
                </button>
              </div>
              
              <div className="rounded-xl bg-red-50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🗑️</span>
                  <h4 className="font-semibold text-red-900">Delete Account</h4>
                </div>
                <p className="text-sm text-red-600 mb-3">
                  Permanently delete your account and all associated data.
                </p>
                <button className="text-sm font-medium text-red-700 hover:text-red-800">
                  Delete Account →
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full mt-6 rounded-xl border border-emerald-200 px-4 py-2.5 font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-emerald-900">Help & Support</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-emerald-400 hover:text-emerald-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <a
                href="tel:+233241234567"
                className="flex items-center gap-4 rounded-xl border border-emerald-100 p-4 hover:bg-emerald-50 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl">
                  📞
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">Call Us</p>
                  <p className="text-sm text-emerald-600">+233 24 123 4567</p>
                </div>
              </a>
              
              <a
                href="mailto:support@semmaai.com"
                className="flex items-center gap-4 rounded-xl border border-emerald-100 p-4 hover:bg-emerald-50 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
                  ✉️
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Email Support</p>
                  <p className="text-sm text-blue-600">support@semmaai.com</p>
                </div>
              </a>
              
              <a
                href="https://wa.me/233241234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-emerald-100 p-4 hover:bg-emerald-50 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
                  💬
                </div>
                <div>
                  <p className="font-semibold text-green-900">WhatsApp</p>
                  <p className="text-sm text-green-600">Chat with us on WhatsApp</p>
                </div>
              </a>
              
              <div className="rounded-xl bg-purple-50 p-4">
                <h4 className="font-semibold text-purple-900 mb-3">Frequently Asked Questions</h4>
                <div className="space-y-2">
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-purple-700 hover:text-purple-800">
                      How do I update my crop prices?
                    </summary>
                    <p className="mt-2 text-purple-600 pl-4">
                      Go to the Market page and tap on any crop to see current prices. Prices are updated daily from GCX.
                    </p>
                  </details>
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-purple-700 hover:text-purple-800">
                      How do I diagnose plant diseases?
                    </summary>
                    <p className="mt-2 text-purple-600 pl-4">
                      Use the Disease Detection tool to take a photo of your plant. Our AI will analyze it and provide diagnosis.
                    </p>
                  </details>
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-purple-700 hover:text-purple-800">
                      How do I get weather alerts?
                    </summary>
                    <p className="mt-2 text-purple-600 pl-4">
                      Enable push notifications in your profile settings to receive weather alerts for your location.
                    </p>
                  </details>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-6 rounded-xl border border-emerald-200 px-4 py-2.5 font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-emerald-900">Terms of Service</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-emerald-400 hover:text-emerald-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="prose prose-sm prose-emerald">
              <p className="text-sm text-emerald-600 mb-4">
                Last updated: January 2025
              </p>
              
              <h4 className="font-semibold text-emerald-900 mt-4">1. Acceptance of Terms</h4>
              <p className="text-sm text-emerald-700">
                By using SemmaAI, you agree to these Terms of Service. If you do not agree, please do not use our services.
              </p>
              
              <h4 className="font-semibold text-emerald-900 mt-4">2. Description of Service</h4>
              <p className="text-sm text-emerald-700">
                SemmaAI provides agricultural advisory services, including AI-powered farming advice, market prices, weather information, and community features.
              </p>
              
              <h4 className="font-semibold text-emerald-900 mt-4">3. User Responsibilities</h4>
              <p className="text-sm text-emerald-700">
                Users are responsible for maintaining the confidentiality of their account and for all activities under their account.
              </p>
              
              <h4 className="font-semibold text-emerald-900 mt-4">4. Agricultural Advice Disclaimer</h4>
              <p className="text-sm text-emerald-700">
                The agricultural advice provided by SemmaAI is for informational purposes only. Users should consult with local agricultural experts for specific recommendations.
              </p>
              
              <h4 className="font-semibold text-emerald-900 mt-4">5. Privacy</h4>
              <p className="text-sm text-emerald-700">
                We respect your privacy. Please review our Privacy Policy to understand how we collect, use, and protect your information.
              </p>
              
              <h4 className="font-semibold text-emerald-900 mt-4">6. Contact</h4>
              <p className="text-sm text-emerald-700">
                For questions about these terms, please contact us at support@semmaai.com
              </p>
            </div>
            
            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full mt-6 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              I Accept
            </button>
          </div>
        </div>
      )}
    </div>
  )
}