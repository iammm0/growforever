'use client'

import { useTheme } from '@mui/material/styles'
import styles from '../../styles/static-background.module.css'

type Pos = `${number}% ${number}%` | 'center' | string

// 这里才是实际控制背景的代码
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
