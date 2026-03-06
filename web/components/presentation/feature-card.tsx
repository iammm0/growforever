'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/theme-context'

interface FeatureCardProps {
  icon?: ReactNode
  title: string
  description: string
  color?: string
}

export default function FeatureCard({
  icon,
  title,
  description,
  color = '#22c55e',
}: FeatureCardProps) {
  const { actualMode } = useTheme()
  const isDark = actualMode === 'dark'
  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-white/20' : 'border-black/15'
  const bgColor = isDark ? 'bg-white/10' : 'bg-white/15'
  const hoverBg = isDark ? 'hover:bg-white/15' : 'hover:bg-white/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
    >
      <div
        className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-400 ${borderColor} ${bgColor} ${hoverBg}`}
        style={{
          ['--accent-color' as string]: color,
        }}
      >
        <div
          className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-[var(--accent-color)] to-transparent transition-transform duration-400 group-hover:scale-x-100"
          style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}60 100%)` }}
        />
        <div
          className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 transition-opacity duration-400 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle, ${color}33 0%, transparent 70%)` }}
        />

        {icon && (
          <div
            className="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-xl border"
            style={{
              background: `${color}33`,
              borderColor: `${color}4d`,
            }}
          >
            {icon}
          </div>
        )}

        <h3 className={`mb-2 text-xl font-bold leading-tight tracking-tight sm:text-2xl ${textColor}`}>{title}</h3>
        <p className={`flex-1 text-base leading-relaxed opacity-90 sm:text-lg ${textColor}`}>{description}</p>
        <div
          className="mt-4 h-0.5 w-10 rounded opacity-70"
          style={{ background: `linear-gradient(90deg, ${color} 0%, transparent 100%)` }}
        />
      </div>
    </motion.div>
  )
}
