'use client'

import { useTheme } from '@/context/theme-context'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function ThemeToggle() {
  const { actualMode, setMode } = useTheme()
  const isDark = actualMode === 'dark'

  const getTooltip = () => {
    if (isDark) return '切换到浅色模式'
    return '切换到深色模式'
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-background/50 p-0.5">
      <button
        type="button"
        onClick={() => setMode('light')}
        title="浅色"
        className={`rounded-md p-1.5 transition-colors ${
          !isDark ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
        }`}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setMode('dark')}
        title="深色"
        className={`rounded-md p-1.5 transition-colors ${
          isDark ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
        }`}
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setMode('system')}
        title="跟随系统"
        className="rounded-md p-1.5 text-foreground transition-colors hover:bg-accent"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  )
}
