'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                width: '100%',
                background: 'linear-gradient(to right, #f0fdf4, #ffffff)',
                borderTop: '1px solid #e5e7eb',
                py: 4,
                px: 2,
                textAlign: 'center',
                boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 0.03)',
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    color: '#555',
                    fontSize: '0.875rem',
                }}
            >
                © 2025{' '}
                <Box
                    component="span"
                    sx={{ color: '#15803d', fontWeight: 600 }}
                >
                    GrowForever 永恒之森
                </Box>{' '}
                · 图结构人工智能演示项目
            </Typography>
        </Box>
    )
}
