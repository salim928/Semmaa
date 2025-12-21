'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light')

  // Set theme and persist
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('semmaai-theme', newTheme)
  }, [])

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('semmaai-theme') as Theme | null
    if (savedTheme === 'light' || savedTheme === 'system') {
      setThemeState(savedTheme)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
