'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { AuthProvider } from '@/context/auth-context'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  mode: ThemeMode
  actualMode: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  actualMode: 'light',
  setMode: () => {},
  toggleTheme: () => {},
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system')
  const [actualMode, setActualMode] = useState<'light' | 'dark'>('light')

  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  const computeActualMode = (currentMode: ThemeMode): 'light' | 'dark' => {
    if (currentMode === 'system') {
      return getSystemTheme()
    }
    return currentMode as 'light' | 'dark'
  }

  useEffect(() => {
    const savedMode = localStorage.getItem('theme') as ThemeMode | null
    const initialMode = savedMode || 'system'
    setMode(initialMode)
    const computedMode = computeActualMode(initialMode)
    setActualMode(computedMode)
    document.documentElement.classList.toggle('dark', computedMode === 'dark')
  }, [])

  useEffect(() => {
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        const newActualMode = getSystemTheme()
        setActualMode(newActualMode)
        document.documentElement.classList.toggle('dark', newActualMode === 'dark')
      }
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [mode])

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode)
    localStorage.setItem('theme', newMode)
    const computedMode = computeActualMode(newMode)
    setActualMode(computedMode)
    document.documentElement.classList.toggle('dark', computedMode === 'dark')
  }

  const toggleTheme = () => {
    const newMode = actualMode === 'light' ? 'dark' : 'light'
    handleSetMode(newMode)
  }

  const contextValue = useMemo(
    () => ({
      mode,
      actualMode,
      setMode: handleSetMode,
      toggleTheme,
    }),
    [mode, actualMode]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <AuthProvider>{children}</AuthProvider>
    </ThemeContext.Provider>
  )
}

export default function Providers({ children }: { children: ReactNode }) {
  return <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
}
