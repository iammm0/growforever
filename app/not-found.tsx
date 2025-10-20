'use client'

import { Box, Typography, Button } from '@mui/material'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {useColorMode} from "@/context/theme-context";

export default function NotFound() {
    const { mode } = useColorMode()

    const isDark = mode === 'dark'

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: isDark
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                    : 'linear-gradient(135deg, #f0f4ff 0%, #dbeafe 100%)',
                color: isDark ? '#e2e8f0' : '#1e293b',
                transition: 'all 0.4s ease',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: '4rem', sm: '6rem' },
                        fontWeight: 800,
                        mb: 1,
                    }}
                >
                    404
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        opacity: 0.8,
                        mb: 3,
                    }}
                >
                    哎呀！这个页面走丢啦 🤔
                </Typography>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Button
                    component={Link}
                    href="/"
                    variant="contained"
                    size="large"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        backgroundColor: isDark ? '#3b82f6' : '#2563eb',
                        '&:hover': {
                            backgroundColor: isDark ? '#2563eb' : '#1d4ed8',
                        },
                    }}
                >
                    返回首页
                </Button>
            </motion.div>
        </Box>
    )
}
