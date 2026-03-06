'use client'

import * as React from 'react'
import { useTheme } from '@/context/theme-context'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initialValue
    } catch {
      return initialValue
    }
  })
  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])
  return [value, setValue] as const
}

export default function Suggest({ storageKey = 'graph_mobile_hint' }: { desktopUrl?: string; storageKey?: string }) {
  const { actualMode } = useTheme()
  const isDark = actualMode === 'dark'
  const isSmall = useMediaQuery('(max-width:900px)')
  const [snoozeUntil, setSnoozeUntil] = useLocalStorage<number | null>(storageKey, null)
  const [dontShowWeek, setDontShowWeek] = React.useState(false)
  const now = Date.now()

  const shouldShow = isSmall && (!snoozeUntil || snoozeUntil < now)
  const [open, setOpen] = React.useState(shouldShow)

  React.useEffect(() => {
    if (isSmall && (!snoozeUntil || snoozeUntil < now)) setOpen(true)
    else setOpen(false)
  }, [isSmall, snoozeUntil])

  const handleContinue = () => {
    if (dontShowWeek) {
      setSnoozeUntil(Date.now() + 7 * 24 * 60 * 60 * 1000)
    } else {
      setSnoozeUntil(Date.now() + 10 * 60 * 1000)
    }
    setOpen(false)
  }

  const textColor = isDark ? 'text-white' : 'text-black'
  const isFullScreen = useMediaQuery('(max-width: 600px)')

  return (
    <Dialog open={open} onClose={handleContinue}>
      <DialogContent
        className={`max-w-md ${isFullScreen ? 'fixed inset-0 h-full max-h-full w-full rounded-none' : ''}`}
        onClose={handleContinue}
      >
        <DialogTitle id="mobile-desktop-suggest" className={`font-bold ${textColor}`}>
          建议在桌面端使用 growforever
        </DialogTitle>
        <div className="mt-4 space-y-4">
          <p className={`text-sm opacity-90 ${textColor}`}>
            为了获得更流畅的交互、更大的画布和更清晰的布局，<strong>建议在桌面浏览器</strong>访问该页面。
          </p>
          <Alert variant="info">
            <AlertDescription>
              你仍然可以在移动端继续使用，我们已针对小屏做过优化，但部分拖拽/缩放体验在触摸屏上可能不如桌面精准。
            </AlertDescription>
          </Alert>
          <Button variant="grow" onClick={handleContinue} className="w-full py-4 font-semibold">
            继续在手机上使用
          </Button>
          <label className={`flex cursor-pointer items-center gap-2 ${textColor}`}>
            <input
              type="checkbox"
              checked={dontShowWeek}
              onChange={(e) => setDontShowWeek(e.target.checked)}
              className="h-4 w-4 rounded border-gray-400 text-primary"
            />
            <span className="text-sm">一周内不再提示</span>
          </label>
        </div>
      </DialogContent>
    </Dialog>
  )
}
