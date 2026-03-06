'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/context/theme-context'

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
  const { actualMode } = useTheme()
  const isDark = actualMode === 'dark'
  const bgSrc = isDark ? darkSrc : lightSrc
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900)
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
    <div
      className="fixed inset-0 z-0 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgSrc})`,
        backgroundPosition: position,
        backgroundAttachment: 'fixed',
        transform: isMobile ? `scale(${mobileZoom})` : undefined,
        filter: isDark
          ? 'brightness(0.95) contrast(1.05) saturate(1.1)'
          : 'brightness(1.0) contrast(1.05) saturate(1.05)',
      }}
      aria-hidden
    >
      {overlay && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 30%, transparent 50%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.2) 100%)'
                : 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0.03) 50%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.15) 100%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.15) 100%)'
                : 'radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 100%)',
            }}
          />
        </>
      )}
    </div>
  )
}
