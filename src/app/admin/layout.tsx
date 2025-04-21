// app/admin/layout.tsx
'use client'

import React from 'react'
import { Box, Container, Typography } from '@mui/material'
import EmotionProvider from "@/components/graph/EmotionProvider";

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN">
        <body>
        <EmotionProvider>
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        mb: 4,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#2e7d32',
                    }}
                >
                    🎨 艺术家后台管理面板
                </Typography>
                <Box>{children}</Box>
            </Container>
        </EmotionProvider>
        </body>
        </html>
    )
}
