'use client'

import './globals.css'
import React from "react";
import {usePathname} from "next/navigation";
import CustomThemeProvider from "@/src/context/ThemeContext";
import EmotionProvider from '../components/graph/EmotionProvider';
import Footer from "@/src/components/app/Footer";
import Header from "@/src/components/overall/Header";

export default function RootLayout({
   children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    // 你可以在这里定义要隐藏 Header/Footer 的路径
    const hideHeaderFooter = pathname?.startsWith('/graph')

    return (
        <html lang="zh-CN">
        <head>
        {/* Emotion/MUI 样式插入点，确保 SSR/CSR 顺序一致 */}
            <meta name="emotion-insertion-point" content="mui-insertion-point" />
            <title>永恒之森</title>
        </head>
        <body>
        <CustomThemeProvider>
            <EmotionProvider>
                <div className="layoutContainer">
                    {!hideHeaderFooter && <Header />}
                    <main className="mainContent">{children}</main>
                    {!hideHeaderFooter && <Footer />}
                </div>
            </EmotionProvider>
        </CustomThemeProvider>
        </body>
        </html>
    )
}