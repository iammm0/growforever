'use client'

import './globals.css'
import React from "react"
import { usePathname } from "next/navigation"
import { Box } from '@mui/material'
import Providers from "./providers"
import Footer from "@/components/presentation/footer"
import Navigation from "@/components/presentation/navigation"

export default function RootLayout({
   children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    // 你可以在这里定义要隐藏 Navigation/Footer 的路径
    const hideHeaderFooter = pathname?.startsWith('/graph')

    return (
        <html lang="zh-CN">
        <head>
        {/* Emotion/MUI 样式插入点，确保 SSR/CSR 顺序一致 */}
            <meta name="emotion-insertion-point" content="mui-insertion-point" />
            <title>GrowForever-循环生成式知识图谱研究</title>
        </head>
        <body>
        <Providers>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                }}
            >
                {!hideHeaderFooter && <Navigation />}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                    }}
                >
                    {children}
                </Box>
                {!hideHeaderFooter && <Footer />}
            </Box>
        </Providers>
        </body>
        </html>
    )
}
