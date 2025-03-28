import './globals.css'
import type { Metadata } from 'next'
import EmotionProvider from '../components/nodes/EmotionProvider'
import React from "react";
import Footer from "@/components/main/Footer";

export const metadata: Metadata = {
    title: 'GrowForever - 永恒之森',
    description: '一个基于图结构的人工智能可视化界面',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN">
        <body>
        <EmotionProvider>

            <main className="min-h-screen">{children}</main>
            <Footer />
        </EmotionProvider>
        </body>
        </html>
    )
}
