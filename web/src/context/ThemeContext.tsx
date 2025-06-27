'use client'

import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactNode,
} from 'react'

type ThemeMode = 'light' | 'dark'

interface ColorModeContextType {
    toggleColorMode: () => void
    mode: ThemeMode
}

const ColorModeContext = createContext<ColorModeContextType>({
    toggleColorMode: () => {},
    mode: 'light',
})

export const useColorMode = () => useContext(ColorModeContext)

export default function CustomThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>('light')

    // 初始化：使用 localStorage 或系统偏好
    useEffect(() => {
        const saved = localStorage.getItem('theme') as ThemeMode | null
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const initialMode = saved || (prefersDark ? 'dark' : 'light')
        setMode(initialMode)
        document.documentElement.classList.toggle('dark', initialMode === 'dark')
    }, [])

    // 切换主题
    const toggleColorMode = () => {
        const newMode = mode === 'light' ? 'dark' : 'light'
        setMode(newMode)
        localStorage.setItem('theme', newMode)
        document.documentElement.classList.toggle('dark', newMode === 'dark')
    }

    // 创建 MUI 主题
    const theme = useMemo(() => {
        return createTheme({
            palette: {
                mode,
                ...(mode === 'dark'
                    ? {
                        background: {
                            default: '#121212',
                            paper: '#1d1d1d',
                        },
                        text: {
                            primary: '#ffffff',
                            secondary: '#cccccc',
                        },
                    }
                    : {}),
            },
            typography: {
                fontFamily: `'Noto Sans SC', 'Roboto', sans-serif`,
            },
        })
    }, [mode])

    return (
        <ColorModeContext.Provider value={{ toggleColorMode, mode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    )
}
