'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/theme-context'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const { actualMode } = useTheme()
  const isDark = actualMode === 'dark'

  return (
    <div
      className={`flex h-screen flex-col items-center justify-center text-center transition-all duration-400 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200'
          : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800'
      }`}
    >
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="mb-2 text-6xl font-extrabold sm:text-8xl">404</h1>
        <p className="mb-6 opacity-80">哎呀！这个页面走丢啦 🤔</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Button asChild variant="default" size="lg" className="rounded-xl px-6 py-3 font-semibold">
          <Link href="/">返回首页</Link>
        </Button>
      </motion.div>
    </div>
  )
}
