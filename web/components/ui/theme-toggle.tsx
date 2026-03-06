'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/context/theme-context'

interface ThemeToggleProps {
  className?: string
}

const themes = [
  { value: 'light', icon: Sun, label: '浅色' },
  { value: 'dark', icon: Moon, label: '深色' },
  { value: 'system', icon: Monitor, label: '系统' },
] as const

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { mode, setMode } = useTheme()

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={mode === value ? 'grow' : 'ghost'}
          size="sm"
          onClick={() => setMode(value as any)}
          className="h-8 w-8 p-0"
          title={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  )
}
