'use client'

import './globals.css'
import React from 'react'
import { usePathname } from 'next/navigation'
import Providers from './providers'
import Footer from '@/components/presentation/footer'
import Navigation from '@/components/presentation/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideHeaderFooter = pathname?.startsWith('/graph')

  return (
    <html lang="zh-CN">
      <head>
        <title>GrowForever-循环生成式知识图谱研究</title>
      </head>
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {!hideHeaderFooter && <Navigation />}
            <main className="flex-1">{children}</main>
            {!hideHeaderFooter && <Footer />}
          </div>
        </Providers>
      </body>
    </html>
  )
}
