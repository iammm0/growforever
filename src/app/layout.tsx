import './globals.css'
import type { Metadata } from 'next'
import EmotionProvider from '../components/EmotionProvider'
import React from "react";

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
            <footer className="w-full p-4 text-center text-sm text-gray-500 border-t">
                © 2025 GrowForever 永恒之森 · 图结构人工智能演示项目
            </footer>
        </EmotionProvider>
        </body>
        </html>
    )
}
