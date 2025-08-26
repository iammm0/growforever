'use client'

import { Box, Button, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import '@fontsource/orbitron'
import styles from '../../styles/GrowHero.module.css'
import BackgroundThemeCarousel from "@/components/app/BackgroundThemeStatic";
import BackgroundThemeStatic from "@/components/app/BackgroundThemeStatic";
import TornEdge from "@/components/app/TornEdge";

export default function GrowHero() {
  const router = useRouter()

  return (
    <>
    <Box className={styles.hero} sx={{ position: 'relative' }}>
      {/* 背景淡入淡出 */}
      <BackgroundThemeStatic
          mobilePosDark="82% 28%"
          mobilePosLight="82% 28%"
          mobileZoom={1.12}
      />

      {/* 前景内容 */}
      <Box className={styles.heroInner} sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h1" className={styles.glow} gutterBottom>
          GrowForever
        </Typography>
        <Typography className={styles.mobileSubtitle}>永恒之森</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          模糊意味者复杂，精确意味着简单。
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Ambiguity breeds difficulty; Precision fosters simplicity.
        </Typography>
        <Box className={styles.section}>
          <Button
            variant="contained"
            color="success"
            size="large"
            className={styles.cta}
            onClick={() => router.push('/graph')}
          >
            开始播种想法
          </Button>
        </Box>
      </Box>
    </Box>

    </>
  )
}
