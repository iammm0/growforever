'use client'

import React, { useState } from 'react'
import { Drawer, Divider, Tabs, Tab, Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useGraphStore } from '@/lib/graphStore'
import ExpandConfigPanel from '@/components/graph/ExpandConfigPanel'
import styles from '../../styles/ConfigDrawer.module.css'
import { GrowMode } from '@/types/GrowthNode'

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
  const [tab, setTab] = useState<GrowMode>('manual')
  const setMode = useGraphStore((s) => s.setGrowMode)

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeAction}
      classes={{ paper: styles.drawerPaper }}
    >
      <div className={styles.header}>
        <Typography variant="h6">高级配置</Typography>
        <IconButton onClick={closeAction} size="small">
          <CloseIcon />
        </IconButton>
      </div>

      <Divider className={styles.divider} />

      <Tabs
        value={tab}
        onChange={(_, val) => setTab(val as GrowMode)}
        textColor="secondary"
        indicatorColor="secondary"
        className={styles.tabs}
      >
        <Tab value="manual" label="手动" />
        <Tab value="free" label="自由" />
        <Tab value="fury" label="狂暴" />
      </Tabs>

      <div className={styles.content}>
        <ExpandConfigPanel mode={tab} />
        <div className={styles.modeInfo}>
          <Typography className={styles.caption} variant="caption">
            当前配置模式：
          </Typography>
          <Typography className={styles.subtitle} variant="subtitle2">
            {modeLabelMap[tab]}
          </Typography>
          <button
            onClick={() => setMode(tab)}
            className={styles.applyButton}
          >
            应用此模式
          </button>
        </div>
      </div>
    </Drawer>
  )
}
