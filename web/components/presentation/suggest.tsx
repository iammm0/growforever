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
  Alert,
  alpha,
  useTheme,
} from '@mui/material'
import { useTheme as useMuiTheme } from '@mui/material/styles'

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

export default function Suggest({
  storageKey = 'graph_mobile_hint',
}: {
  desktopUrl?: string
  storageKey?: string
}) {
  const theme = useMuiTheme()
  const isDark = theme.palette.mode === 'dark'
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
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000
      setSnoozeUntil(Date.now() + oneWeekMs)
    } else {
      setSnoozeUntil(Date.now() + 10 * 60 * 1000)
    }
    setOpen(false)
  }

  const textColor = isDark ? '#fff' : '#000'
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)
  const bgColor = isDark ? alpha('#000', 0.8) : alpha('#fff', 0.9)

  return (
    <Dialog
      open={open}
      fullScreen={useMediaQuery(theme.breakpoints.down('sm'))}
      onClose={handleContinue}
      aria-labelledby="mobile-desktop-suggest"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          border: { xs: 'none', sm: `1px solid ${borderColor}` },
          background: bgColor,
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <DialogTitle id="mobile-desktop-suggest" sx={{ color: textColor, fontWeight: 700 }}>
        建议在桌面端使用 growforever
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography sx={{ color: textColor, opacity: 0.9 }}>
            为了获得更流畅的交互、更大的画布和更清晰的布局，<strong>建议在桌面浏览器</strong>访问该页面。
          </Typography>

          <Alert
            severity="info"
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: borderColor,
            }}
          >
            你仍然可以在移动端继续使用，我们已针对小屏做过优化，但部分拖拽/缩放体验在触摸屏上可能不如桌面精准。
          </Alert>

          <Button
            onClick={handleContinue}
            variant="contained"
            color="success"
            fullWidth
            sx={{
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 2,
              },
            }}
          >
            继续在手机上使用
          </Button>

          <FormControlLabel
            control={
              <Checkbox
                checked={dontShowWeek}
                onChange={(e) => setDontShowWeek(e.target.checked)}
                sx={{
                  color: textColor,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={<Typography sx={{ color: textColor }}>一周内不再提示</Typography>}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
