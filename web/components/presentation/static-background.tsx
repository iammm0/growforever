'use client'

import { useTheme } from '@/context/theme-context'
import styles from '../../styles/static-background.module.css'

type Pos = `${number}% ${number}%` | 'center' | string

export default function StaticBackground({
  darkSrc = '/background/background-dark-v2.jpg',
  lightSrc = '/background/background-light-v2.jpg',
  mobilePosDark = '80% 35%',
  mobilePosLight = '80% 35%',
  desktopPosDark = 'center',
  desktopPosLight = 'center',
  mobileZoom = 1.08,
}: {
  darkSrc?: string
  lightSrc?: string
  mobilePosDark?: Pos
  mobilePosLight?: Pos
  desktopPosDark?: Pos
  desktopPosLight?: Pos
  mobileZoom?: number
}) {
  const { actualMode } = useTheme()
  const isDark = actualMode === 'dark'
  const bgSrc = isDark ? darkSrc : lightSrc

  return (
    <div
      className={styles.container}
      style={
        {
          ['--bg' as string]: `url(${bgSrc})`,
          ['--pos-xs' as string]: isDark ? mobilePosDark : mobilePosLight,
          ['--pos-md' as string]: isDark ? desktopPosDark : desktopPosLight,
          ['--mobileZoom' as string]: mobileZoom.toString(),
        } as React.CSSProperties
      }
      aria-hidden
    />
  )
}
