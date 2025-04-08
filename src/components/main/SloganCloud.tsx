'use client'

import React from 'react'
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material'

const SloganCloud = () => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    return (
        <Box
            sx={{
                px: isMobile ? 2 : 6,
                py: isMobile ? 4 : 8,
                textAlign: 'center',
            }}
        >
            <Typography
                variant={isMobile ? 'h4' : 'h1'}
                color="text.secondary"
                gutterBottom
            >
                从一念出发，筛选最有价值的创造
            </Typography>
            <Typography
                variant={isMobile ? 'h5' : 'h2'}
                color="text.secondary"
                gutterBottom
            >
                接下来请使用高级功法来解构你的心灵奇旅
            </Typography>
            <Typography
                variant={isMobile ? 'h6' : 'h3'}
                color="text.secondary"
                gutterBottom
            >
                为了让每一个有趣的点子不再被遗忘
            </Typography>
            <Typography
                variant="h5"
                color="text.secondary"
                gutterBottom
                sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}
            >
                探索从一个点子出发所发散出的所有可能性
            </Typography>
            <Typography
                variant="h5"
                color="text.secondary"
                gutterBottom
                sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}
            >
                GrowForever 帮助你从无数延展出的点子中，找出最具创造力与可行性的那个
            </Typography>
        </Box>
    )
}

export default SloganCloud

