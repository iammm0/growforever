'use client'

import './globals.css'
import React from "react";
import {usePathname} from "next/navigation";
import CustomThemeProvider from "@/src/context/ThemeContext";
import Header from "@/src/components/app/Header";
import EmotionProvider from '../components/graph/EmotionProvider';
import Footer from "@/src/components/app/Footer";



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