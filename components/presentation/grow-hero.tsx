'use client'

import { Box, Button, Typography, useTheme, alpha, keyframes } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'

const glowPulse = keyframes`
  0% {
    text-shadow:
      0 0 3px #16a34a,
      0 0 6px #22c55e,
      0 0 9px #22c55e;
  }
  50% {
    text-shadow:
      0 0 1px #16a34a,
      0 0 3px #22c55e,
      0 0 6px #22c55e;
  }
  100% {
    text-shadow:
      0 0 3px #16a34a,
      0 0 6px #22c55e,
      0 0 9px #22c55e;
  }
`

export default function GrowHero() {
  const router = useRouter()
  const theme = useTheme()
  const { user } = useAuth()
  const isDark = theme.palette.mode === 'dark'
  const textColor = isDark ? '#fff' : '#000'
  const textShadow = isDark
    ? '0 4px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(34, 197, 94, 0.5)'
    : '0 2px 10px rgba(0, 0, 0, 0.2)'
  const subtitleShadow = isDark ? '0 2px 10px rgba(0, 0, 0, 0.5)' : 'none'
  const borderColor = isDark ? alpha('#fff', 0.5) : alpha('#000', 0.3)

  return (
    <Box
      sx={{
        position: 'relative',
        textAlign: 'center',
        padding: {
          xs: `calc(96px + env(safe-area-inset-top, 0)) 20px 56px`,
          md: `calc(72px + env(safe-area-inset-top, 0)) 24px 72px`,
        },
        minHeight: {
          xs: 'clamp(460px, 70svh, 780px)',
          md: 'min(70vh, 820px)',
        },
        overflow: 'hidden',
      }}
    >
      {/* 前景内容 */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        {/* 主标题 */}
        <Typography
          variant="h1"
          sx={{
            fontFamily: '"Orbitron", system-ui, -apple-system, sans-serif',
            fontWeight: 1000,
            color: textColor,
            fontSize: {
              xs: 'clamp(3rem, 9.5vw, 3.6rem)',
              md: 'clamp(4rem, 8vw, 9.5rem)',
            },
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            mb: { xs: 2, md: 3 },
            animation: isDark ? `${glowPulse} 2.5s ease-in-out infinite` : 'none',
            textShadow,
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >
          GrowForever
        </Typography>

        {/* 移动端副标题 */}
        <Typography
          sx={{
            display: { xs: 'block', md: 'none' },
            fontWeight: 600,
            fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
            mb: 1,
            color: alpha(textColor, 0.95),
            textShadow: subtitleShadow,
          }}
        >
          永恒之森
        </Typography>

        {/* 副标题 */}
        <Typography
          variant="h5"
          sx={{
            color: alpha(textColor, 0.95),
            mb: 1,
            fontWeight: 400,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            textShadow: subtitleShadow,
          }}
        >
          模糊意味着复杂，精确意味着简单。
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: alpha(textColor, 0.85),
            mb: 4,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            textShadow: subtitleShadow,
          }}
        >
          Ambiguity breeds difficulty; Precision fosters simplicity.
        </Typography>

        {/* CTA 按钮 */}
        <Box
          sx={{
            margin: '0 auto',
            paddingTop: { xs: 2, md: 3.5 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={() => router.push('/graph')}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              px: { xs: 4, sm: 6 },
              py: 1.5,
              fontSize: '1.05rem',
              borderRadius: 3,
              fontWeight: 600,
              bgcolor: isDark
                ? alpha(theme.palette.success.main, 0.9)
                : theme.palette.success.main,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${isDark ? alpha('#fff', 0.2) : alpha('#000', 0.1)}`,
              color: isDark ? 'white' : 'white',
              boxShadow: `0 4px 20px ${alpha('#22c55e', 0.4)}`,
              '&:hover': {
                bgcolor: theme.palette.success.main,
                boxShadow: `0 8px 30px ${alpha('#22c55e', 0.5)}`,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            开始播种想法
          </Button>
          {!user && (
            <Button
              variant="outlined"
              color="success"
              size="large"
              onClick={() => router.push('/auth/register')}
              sx={{
                minWidth: { xs: '100%', sm: 'auto' },
                px: { xs: 4, sm: 6 },
                py: 1.5,
                fontSize: '1.05rem',
                borderRadius: 3,
                fontWeight: 600,
                borderWidth: 2,
                borderColor,
                color: textColor,
                backdropFilter: 'blur(10px)',
                bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05),
                '&:hover': {
                  borderWidth: 2,
                  borderColor: textColor,
                  backgroundColor: isDark ? alpha('#fff', 0.2) : alpha('#000', 0.1),
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              注册账号
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}
