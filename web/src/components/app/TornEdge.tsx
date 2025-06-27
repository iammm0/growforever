'use client'

import { Box, useTheme } from '@mui/material'

export default function TornEdge() {
    const theme = useTheme()

    return (
        <Box
            sx={{
                width: '100%',
                height: '40px',
                overflow: 'hidden',
                lineHeight: 0,
                position: 'relative',
                top: '0px',
            }}
        >
            <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                style={{
                    display: 'block',
                    width: 'calc(150% + 1.3px)',
                    height: '120%',
                    transform: 'rotate(180deg)',
                }}
            >
                <path
                    d="M0,0 C150,100 350,0 600,60 C850,120 1050,20 1200,80 L1200,0 L0,0 Z"
                    fill={theme.palette.background.default}
                />
            </svg>
        </Box>
    )
}
