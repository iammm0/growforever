'use client'

import React from 'react'
import { Box, Typography, Link, useTheme } from '@mui/material'

export default function Footer() {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    return (
        <Box
            component="footer"
            sx={{
                width: '100%',
                background: isDark
                    ? 'linear-gradient(to right, #1a1a1a, #121212)'
                    : 'linear-gradient(to right, #f0fdf4, #ffffff)',
                borderTop: isDark ? '1px solid #333' : '1px solid #e5e7eb',
                py: 4,
                px: 2,
                textAlign: 'center',
                boxShadow: isDark
                    ? 'inset 0 1px 4px rgba(255, 255, 255, 0.05)'
                    : 'inset 0 1px 4px rgba(0, 0, 0, 0.03)',
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    color: isDark ? '#ccc' : '#555',
                    fontSize: '0.875rem',
                }}
            >
                © 2025{' '}
                <Box
                    component="span"
                    sx={{
                        color: isDark ? '#86efac' : '#15803d',
                        fontWeight: 600,
                    }}
                >
                    GrowForever 永恒之森
                </Box>{' '}
                · 图结构人工智能项目
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    color: isDark ? '#aaa' : '#555',
                    fontSize: '0.75rem',
                    mt: 1,
                }}
            >
                <Link
                    href="https://beian.miit.gov.cn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{
                        color: isDark ? '#4ade80' : '#15803d',
                    }}
                >
                    豫ICP备2025117850号
                </Link>
            </Typography>
        </Box>
    )
}
