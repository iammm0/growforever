'use client'

import React from 'react'
import { Github } from 'lucide-react'
import { useTheme } from '@/context/theme-context'

export default function Footer() {
  const { actualMode } = useTheme()
  const isDark = actualMode === 'dark'
  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-white/20' : 'border-black/15'

  return (
    <footer
      className={`relative z-10 mt-auto w-full border-t ${borderColor} backdrop-blur-xl ${
        isDark ? 'bg-white/10' : 'bg-white/15'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
          <div className="text-center sm:text-left">
            <h3 className="mb-1 font-bold bg-gradient-to-r from-green-500 to-indigo-500 bg-clip-text text-transparent">
              GrowForever
            </h3>
            <p className={`mb-2 text-sm ${textColor}`}>永恒之森 · 循环生成式知识图谱研究</p>
            <p className={`text-xs opacity-80 ${textColor}`}>模糊意味着复杂，精确意味着简单</p>
          </div>

          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            <a
              href="https://github.com/iammm0/growforever-web"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 text-sm ${textColor} transition-all hover:translate-x-1 hover:text-primary`}
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs opacity-80 ${textColor} transition-colors hover:text-primary`}
            >
              豫ICP备2025117850号-2
            </a>
          </div>

          <div className="text-center sm:text-right">
            <p className={`mb-1 text-sm ${textColor}`}>© 2025 GrowForever</p>
            <p className={`text-xs opacity-80 ${textColor}`}>All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
