'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { AuthProvider } from '@/context/auth-context'

// 主题类型定义
type ThemeMode = 'light' | 'dark' | 'system'

// 主题上下文类型
interface ThemeContextType {
  mode: ThemeMode
  actualMode: 'light' | 'dark' // 实际应用的主题（system 会解析为 light 或 dark）
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  actualMode: 'light',
  setMode: () => {},
  toggleTheme: () => {},
})

// 主题 Hook
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// 创建 Emotion 缓存
const emotionCache = createCache({
  key: 'mui',
  prepend: true,
})

// 主题提供者组件
export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system')
  const [actualMode, setActualMode] = useState<'light' | 'dark'>('light')

  // 获取系统主题偏好
  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // 计算实际主题
  const computeActualMode = (currentMode: ThemeMode): 'light' | 'dark' => {
    if (currentMode === 'system') {
      return getSystemTheme()
    }
    return currentMode as 'light' | 'dark'
  }

  // 初始化主题
  useEffect(() => {
    const savedMode = localStorage.getItem('theme') as ThemeMode | null
    const initialMode = savedMode || 'system'
    setMode(initialMode)
    
    const computedMode = computeActualMode(initialMode)
    setActualMode(computedMode)
    
    // 应用主题到 DOM
    document.documentElement.classList.toggle('dark', computedMode === 'dark')
  }, [])

  // 监听系统主题变化
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

  // 设置主题
  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode)
    localStorage.setItem('theme', newMode)
    
    const computedMode = computeActualMode(newMode)
    setActualMode(computedMode)
    document.documentElement.classList.toggle('dark', computedMode === 'dark')
  }

  // 切换主题（在 light 和 dark 之间切换）
  const toggleTheme = () => {
    const newMode = actualMode === 'light' ? 'dark' : 'light'
    handleSetMode(newMode)
  }

  // 创建 MUI 主题
  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: actualMode,
        primary: {
          main: '#22c55e',
          light: '#4ade80',
          dark: '#16a34a',
        },
        secondary: {
          main: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        ...(actualMode === 'dark'
          ? {
              background: {
                default: '#0f0f0f',
                paper: '#1a1a1a',
              },
              text: {
                primary: '#ffffff',
                secondary: '#a3a3a3',
              },
            }
          : {
              background: {
                default: '#ffffff',
                paper: '#fafafa',
              },
              text: {
                primary: '#111111',
                secondary: '#666666',
              },
            }),
      },
      typography: {
        fontFamily: `'Noto Sans SC', 'Inter', 'Roboto', sans-serif`,
        h1: {
          fontWeight: 800,
          letterSpacing: '-0.02em',
        },
        h2: {
          fontWeight: 700,
          letterSpacing: '-0.01em',
        },
        h3: {
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 8,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: actualMode === 'dark' 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
    })
  }, [actualMode])

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
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  )
}

// 默认导出（保持向后兼容）
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProviderWrapper>
      {children}
    </ThemeProviderWrapper>
  )
}
