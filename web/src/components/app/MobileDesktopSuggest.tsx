'use client'

import * as React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  Stack,
  Alert
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

/** 简单的 localStorage Hook */
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

/**
 * 在小屏（≤ 900px）时提示用户去桌面端体验更好。
 * 支持“本次不再提示/一周内不再提示”，可复制链接在桌面打开。
 */
export default function MobileDesktopSuggest({
  storageKey = 'graph_mobile_hint',
}: {
  desktopUrl?: string
  storageKey?: string
}) {
  const theme = useTheme()
  const isSmall = useMediaQuery('(max-width:900px)') // 你也可以改成 768px
  const [snoozeUntil, setSnoozeUntil] = useLocalStorage<number | null>(storageKey, null)
  const [dontShowWeek, setDontShowWeek] = React.useState(false)
  const now = Date.now()

  const shouldShow = isSmall && (!snoozeUntil || snoozeUntil < now)
  const [open, setOpen] = React.useState(shouldShow)

  React.useEffect(() => {
    // 视口变化时实时控制
    if (isSmall && (!snoozeUntil || snoozeUntil < now)) setOpen(true)
    else setOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSmall, snoozeUntil])

  const handleContinue = () => {
    if (dontShowWeek) {
      // 一周内不再提示
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000
      setSnoozeUntil(Date.now() + oneWeekMs)
    } else {
      // 仅本次不再提示（直到刷新/路由切换）
      setSnoozeUntil(Date.now() + 10 * 60 * 1000) // 10 分钟
    }
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      fullScreen={useMediaQuery(theme.breakpoints.down('sm'))}
      onClose={handleContinue}
      aria-labelledby="mobile-desktop-suggest"
    >
      <DialogTitle id="mobile-desktop-suggest">建议在桌面端使用 growforever</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography color="text.secondary">
            为了获得更流畅的交互、更大的画布和更清晰的布局，<strong>建议在桌面浏览器</strong>访问该页面。
          </Typography>

          <Alert severity="info" variant="outlined">
            你仍然可以在移动端继续使用，我们已针对小屏做过优化，但部分拖拽/缩放体验在触摸屏上可能不如桌面精准。
          </Alert>

          <Button onClick={handleContinue} variant="contained" color="success">
                  继续在手机上使用
          </Button>

          <FormControlLabel
            control={
              <Checkbox
                checked={dontShowWeek}
                onChange={(e) => setDontShowWeek(e.target.checked)}
              />
            }
            label="一周内不再提示"
          />
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
