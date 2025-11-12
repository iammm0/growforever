'use client'

import React, { useState } from 'react'
import { Drawer, Divider, Tabs, Tab, Box, Typography, IconButton, alpha, useTheme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useGraphStore } from '@/core/store/graph-store'
import ExpandConfigPanel from './expand-config-panel'
import { GrowMode } from '@/types/grow-mode'

type Props = {
  open: boolean
  closeAction: () => void
}

const modeLabelMap: Record<GrowMode, string> = {
  manual: '手动模式',
  free: '自由模式',
  fury: '狂暴模式',
}

export default function ConfigDrawer({ open, closeAction }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [tab, setTab] = useState<GrowMode>('manual')
  const setMode = useGraphStore((s) => s.setGrowMode)

  const textColor = isDark ? '#fff' : '#000'
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)
  const bgColor = isDark ? alpha('#000', 0.8) : alpha('#fff', 0.9)

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeAction}
      PaperProps={{
        sx: {
          width: { xs: 280, sm: 320, md: 420 },
          p: { xs: 2, sm: 3, md: 4 },
          background: bgColor,
          backdropFilter: 'blur(20px)',
          borderLeft: `1px solid ${borderColor}`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: textColor }}>
          高级配置
        </Typography>
        <IconButton onClick={closeAction} size="small" sx={{ color: textColor }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: borderColor, mb: 3 }} />

      <Tabs
        value={tab}
        onChange={(_, val) => setTab(val as GrowMode)}
        textColor="secondary"
        indicatorColor="secondary"
        sx={{ mb: 3 }}
      >
        <Tab value="manual" label="手动" sx={{ color: textColor }} />
        <Tab value="free" label="自由" sx={{ color: textColor }} />
        <Tab value="fury" label="狂暴" sx={{ color: textColor }} />
      </Tabs>

      <Box>
        <ExpandConfigPanel mode={tab} />
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: textColor, opacity: 0.7 }}>
            当前配置模式：
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: textColor }}>
            {modeLabelMap[tab]}
          </Typography>
          <Box
            component="button"
            onClick={() => setMode(tab)}
            sx={{
              mt: 1.5,
              p: 1.25,
              width: '100%',
              bgcolor: theme.palette.primary.main,
              color: 'white',
              border: 'none',
              borderRadius: 1.5,
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'scale(1.02)',
              },
            }}
          >
            应用此模式
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}
