'use client'

import React from 'react'
import { Box, Typography, Link, useTheme, alpha, Container } from '@mui/material'
import { GitHub } from '@mui/icons-material'

export default function Footer() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const textColor = isDark ? '#fff' : '#000'
  const textShadow = isDark ? '0 1px 8px rgba(0, 0, 0, 0.5)' : 'none'

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        mt: 'auto',
        position: 'relative',
        zIndex: 1,
        background: isDark ? alpha('#fff', 0.1) : alpha('#fff', 0.15),
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${isDark ? alpha('#fff', 0.2) : alpha('#000', 0.15)}`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            py: 6,
            px: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 4,
          }}
        >
          {/* 左侧：品牌信息 */}
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: 'linear-gradient(135deg, #22c55e 0%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              GrowForever
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: textColor,
                fontSize: '0.875rem',
                mb: 2,
                textShadow,
              }}
            >
              永恒之森 · 循环生成式知识图谱研究
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: alpha(textColor, 0.8),
                fontSize: '0.75rem',
                textShadow,
              }}
            >
              模糊意味着复杂，精确意味着简单
            </Typography>
          </Box>

          {/* 中间：链接 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              alignItems: { xs: 'center', sm: 'flex-start' },
            }}
          >
            <Link
              href="https://github.com/iammm0/growforever-web"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                color: textColor,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '0.875rem',
                textShadow,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#22c55e',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <GitHub sx={{ fontSize: 18 }} />
              GitHub
            </Link>
            <Link
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{
                color: alpha(textColor, 0.8),
                fontSize: '0.75rem',
                textShadow,
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: '#22c55e',
                },
              }}
            >
              豫ICP备2025117850号-2
            </Link>
          </Box>

          {/* 右侧：版权信息 */}
          <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
            <Typography
              variant="body2"
              sx={{
                color: textColor,
                fontSize: '0.875rem',
                mb: 1,
                textShadow,
              }}
            >
              © 2025 GrowForever
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: alpha(textColor, 0.8),
                fontSize: '0.75rem',
                textShadow,
              }}
            >
              All rights reserved
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
