'use client'

import { Button, Stack, Popover, IconButton, Tooltip } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { useGraphStore } from '@/lib/graphStore'
import { createThoughtNode } from '@/lib/nodeUtils'
import { simulateAutoExpand } from '@/lib/simulateAutoExpand'
import { GrowMode } from '@/types/GrowthNode'
import { useState } from 'react'
import ExpandConfigPanel from '@/components/nodes/ExpandConfigPanel'
import ConfigDrawer from "@/components/nodes/ConfigDrawer";

const modeNameMap = {
    manual: '手动模式',
    free: '自由模式',
    fury: '狂暴模式',
}

export default function ControlPanel() {
    const { addNode, reset, growMode, setGrowMode, nodes } = useGraphStore()

    const handleAdd = () => {
        const node = createThoughtNode(Math.random() * 600, Math.random() * 400, {
            title: '手动节点',
            summary: '用户手动添加',
            tags: ['手动'],
            color: '#4ade80',
        })
        addNode(node)
    }

    const handleAutoGrow = () => {
        const root = nodes.find((n) => n.id === 'root')
        if (root) simulateAutoExpand(root.id)
    }

    const handleToggleMode = () => {
        const nextMode: GrowMode =
            growMode === 'manual' ? 'free' : growMode === 'free' ? 'fury' : 'manual'
        setGrowMode(nextMode)
    }

    // Popover 控制
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const handleCloseConfig = () => setAnchorEl(null)
    const openPopover = Boolean(anchorEl)

    // Drawer 控制
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <>
            <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="contained" onClick={handleAdd}>
                    ➕ 添加节点
                </Button>
                <Button variant="outlined" color="error" onClick={reset}>
                    🗑️ 清空画布
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleAutoGrow}
                    disabled={growMode === 'manual'}
                >
                    🚀 自动扩展（{modeNameMap[growMode]}）
                </Button>
                <Button variant="text" onClick={handleToggleMode}>
                    切换为{' '}
                    {modeNameMap[
                        growMode === 'manual'
                            ? 'free'
                            : growMode === 'free'
                                ? 'fury'
                                : 'manual'
                        ]}
                </Button>

                <Tooltip title="打开高级配置">
                    <IconButton onClick={() => setDrawerOpen(true)}>
                        <SettingsIcon />
                    </IconButton>
                </Tooltip>
            </Stack>

            <Popover
                open={openPopover}
                anchorEl={anchorEl}
                onClose={handleCloseConfig}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: { mt: 1, p: 1, borderRadius: 2, minWidth: 360 },
                }}
            >
                <ExpandConfigPanel />
            </Popover>

            <ConfigDrawer open={drawerOpen} close={() => setDrawerOpen(false)} />
        </>
    )
}
