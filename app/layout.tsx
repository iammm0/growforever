'use client'

import './globals.css'
import React from "react";
import {usePathname} from "next/navigation";
import Providers from "./providers";
import Footer from "@/components/presentation/footer";
import Navigation from "@/components/presentation/navigation";

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
            <title>永恒之森</title>
        </head>
        <body>
        <Providers>
            <div className="layoutContainer">
                {!hideHeaderFooter && <Navigation />}
                <main className="mainContent">{children}</main>
                {!hideHeaderFooter && <Footer />}
            </div>
        </Providers>
        </body>
        </html>
    )
}