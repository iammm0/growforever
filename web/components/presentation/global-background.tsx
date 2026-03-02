'use client'

import { Box, useTheme, alpha } from '@mui/material'
import { useEffect, useState } from 'react'

type Pos = `${number}% ${number}%` | 'center' | string

interface GlobalBackgroundProps {
  darkSrc?: string
  lightSrc?: string
  mobilePosDark?: Pos
  mobilePosLight?: Pos
  desktopPosDark?: Pos
  desktopPosLight?: Pos
  mobileZoom?: number
  overlay?: boolean
}

export default function GlobalBackground({
  darkSrc = '/background/background-dark-v2.jpg',
  lightSrc = '/background/background-light-v2.jpg',
  mobilePosDark = 'center',
  mobilePosLight = 'center',
  desktopPosDark = 'center',
  desktopPosLight = 'center',
  mobileZoom = 1.0,
  overlay = true,
}: GlobalBackgroundProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const bgSrc = isDark ? darkSrc : lightSrc
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const position = isMobile
    ? isDark
      ? mobilePosDark
      : mobilePosLight
    : isDark
      ? desktopPosDark
      : desktopPosLight

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundImage: `url(${bgSrc})`,
        backgroundSize: isMobile ? 'cover' : 'cover',
        backgroundPosition: position,
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        transform: isMobile ? `scale(${mobileZoom})` : 'none',
        transformOrigin: 'center center',
        filter: isDark
          ? 'brightness(0.95) contrast(1.05) saturate(1.1)'
          : 'brightness(1.0) contrast(1.05) saturate(1.05)',
        '&::before': overlay
          ? {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: isDark
              ? `linear-gradient(
                    to bottom,
                    ${alpha('#000', 0.2)} 0%,
                    ${alpha('#000', 0.05)} 30%,
                    transparent 50%,
                    ${alpha('#000', 0.05)} 70%,
                    ${alpha('#000', 0.2)} 100%
                  )`
              : `linear-gradient(
                    to bottom,
                    ${alpha('#000', 0.15)} 0%,
                    ${alpha('#000', 0.08)} 30%,
                    ${alpha('#000', 0.03)} 50%,
                    ${alpha('#000', 0.08)} 70%,
                    ${alpha('#000', 0.15)} 100%
                  )`,
          }
          : {},
        '&::after': overlay
          ? {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: isDark
              ? `radial-gradient(
                    ellipse at center,
                    transparent 0%,
                    ${alpha('#000', 0.15)} 100%
                  )`
              : `radial-gradient(
                    ellipse at center,
                    ${alpha('#000', 0.05)} 0%,
                    ${alpha('#000', 0.2)} 100%
                  )`,
          }
          : {},
      }}
      aria-hidden
    />
  )
}
