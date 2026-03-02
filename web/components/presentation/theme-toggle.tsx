'use client'

import { IconButton, Tooltip, alpha, useTheme } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import { useTheme as useAppTheme } from '@/app/providers'

export default function ThemeToggle() {
  const { mode, actualMode, setMode } = useAppTheme()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const textColor = isDark ? '#fff' : '#000'
  const hoverBgColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)

  const handleToggle = () => {
    if (mode === 'system') {
      setMode(actualMode === 'dark' ? 'light' : 'dark')
    } else {
      setMode(actualMode === 'dark' ? 'light' : 'dark')
    }
  }

  const getIcon = () => {
    if (mode === 'system') {
      return <SettingsBrightnessIcon />
    }
    return actualMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />
  }

  const getTooltip = () => {
    if (mode === 'system') {
      return `系统主题 (${actualMode === 'dark' ? '深色' : '浅色'})`
    }
    return actualMode === 'dark' ? '切换到浅色主题' : '切换到深色主题'
  }

  return (
    <Tooltip title={getTooltip()} arrow placement="bottom">
      <IconButton
        onClick={handleToggle}
        sx={{
          color: textColor,
          '&:hover': {
            backgroundColor: hoverBgColor,
            transform: 'rotate(15deg)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  )
}
