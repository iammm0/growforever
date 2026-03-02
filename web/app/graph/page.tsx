'use client'
import { useState } from 'react'
import { Box } from '@mui/material'
import { ReactFlowProvider } from 'reactflow'
import GraphCanvas from '../../components/graph/graph-canvas'
import ControlPanel from '../../components/graph/control-panel'
import ConfigDrawer from '../../components/graph/config-drawer'
import Suggest from '@/components/presentation/suggest'
import GlobalBackground from '@/components/presentation/global-background'

export default function GraphPage() {
  const desktopUrl = typeof window !== 'undefined' ? window.location.href : 'https://growforver.physicistscard.com/graph'

  const [configDrawerOpen, setConfigDrawerOpen] = useState(false)
  const [openPromptDialog, setOpenPromptDialog] = useState(false)

  const handlePromptOpen = () => {
    setOpenPromptDialog(true)
  }

  const handlePromptClose = () => {
    setOpenPromptDialog(false)
  }

  const handleConfigOpen = () => {
    setConfigDrawerOpen(true)
  }

  const handleConfigClose = () => {
    setConfigDrawerOpen(false)
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* 全局背景 */}
      <GlobalBackground
        mobilePosDark="center"
        mobilePosLight="center"
        desktopPosDark="center"
        desktopPosLight="center"
        mobileZoom={1.0}
        overlay={true}
      />

      <Suggest desktopUrl={desktopUrl} />

      {/* 浮动控制面板 */}
      <ControlPanel onPromptOpen={handlePromptOpen} onConfigOpen={handleConfigOpen} />

      {/* 配置抽屉 */}
      <ConfigDrawer open={configDrawerOpen} closeAction={handleConfigClose} />

      {/* 图形画布 */}
      <ReactFlowProvider>
        <GraphCanvas
          promptDialogOpen={openPromptDialog}
          onPromptDialogOpen={handlePromptOpen}
          onPromptDialogClose={handlePromptClose}
        />
      </ReactFlowProvider>
    </Box>
  )
}
