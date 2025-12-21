'use client'

import { useTheme } from '@/context/ThemeContext'
import { Sun, Monitor } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'buttons'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ]

  // Simple icon toggle (cycles through themes)
  if (variant === 'icon') {
    const nextTheme = () => {
      const order: ('light' | 'system')[] = ['light', 'system']
      const currentIndex = order.indexOf(theme as 'light' | 'system')
      const nextIndex = (currentIndex + 1) % order.length
      setTheme(order[nextIndex])
    }

    return (
      <button
        onClick={nextTheme}
        className={`p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors ${className}`}
        title={`Current: ${theme}`}
      >
        {theme === 'system' ? (
          <Monitor className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>
    )
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
        >
          {theme === 'system' ? (
            <Monitor className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
          <span className="text-sm font-medium capitalize">{theme}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-emerald-100 overflow-hidden z-50">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  theme === value
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {theme === value && <span className="ml-auto">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Buttons variant (all options visible)
  return (
    <div className={`flex gap-1 p-1 bg-emerald-50 rounded-xl ${className}`}>
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            theme === value
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-gray-600 hover:text-emerald-600'
          }`}
          title={label}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
