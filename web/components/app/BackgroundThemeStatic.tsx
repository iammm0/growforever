'use client'

import { useTheme } from '@mui/material/styles'
import styles from '../../styles/BackgroundThemeStatic.module.css'
import TornEdge from "@/components/app/TornEdge";

type Pos = `${number}% ${number}%` | 'center' | string

export default function BackgroundThemeStatic({
  darkSrc = '/background/background-dark.jpg',
  lightSrc = '/background/background-light.jpg',
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
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const bgSrc = isDark ? darkSrc : lightSrc

  return (
    <>
      <div
      className={styles.container}
      style={
        {
          ['--bg' as any]: `url(${bgSrc})`,
          ['--pos-xs' as any]: isDark ? mobilePosDark : mobilePosLight,
          ['--pos-md' as any]: isDark ? desktopPosDark : desktopPosLight,
          ['--mobileZoom' as any]: mobileZoom.toString(),
        } as React.CSSProperties
      }
      aria-hidden
    />
    </>
  )
}
