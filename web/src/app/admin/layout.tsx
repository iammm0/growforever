'use client'

import React from 'react'
import { Box, Container, Typography } from '@mui/material'
import EmotionProvider from "../../components/graph/EmotionProvider";

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode
}) {
    return (
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
                    后台管理面板
                </Typography>
                <Box>{children}</Box>
            </Container>
        </EmotionProvider>
    )
}
