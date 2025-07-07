'use client'

import {Button, Stack, Popover, IconButton, Tooltip, Box, Drawer} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { useState } from 'react'
import {useMediaQuery, useTheme} from "@mui/system";
import {MenuIcon} from "lucide-react";
import ExpandConfigPanel from "./ExpandConfigPanel";
import ConfigDrawer from "./ConfigDrawer";
import {simulateAutoExpand} from "@/src/lib/simulateAutoExpand";
import {GrowMode} from "@/src/types/GrowthNode";
import {useGraphStore} from "@/src/lib/graphStore";
import {createThoughtNode} from "@/src/lib/nodeUtils";

const modeNameMap = {
    manual: '手动模式',
    free: '自由模式',
    fury: '狂暴模式',
}

export default function ControlPanel() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [menuOpen, setMenuOpen] = useState(false)

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
        <Box
            sx={{
                px: isMobile ? 1.5 : 3,
                py: isMobile ? 1 : 2,
                width: '100%',
            }}
        >
            <>
                {isMobile ? (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <IconButton onClick={() => setMenuOpen(true)} color="primary">
                                <MenuIcon />
                            </IconButton>
                        </Box>

                        <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
                            <Box sx={{ width: 260, p: 2 }}>
                                <Button variant="contained" fullWidth onClick={handleAdd} sx={{ mb: 1 }}>
                                    ➕ 添加节点
                                </Button>
                                <Button variant="outlined" fullWidth color="error" onClick={reset} sx={{ mb: 1 }}>
                                    🗑️ 清空画布
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    onClick={handleAutoGrow}
                                    disabled={growMode === 'manual'}
                                    sx={{ mb: 1 }}
                                >
                                    🚀 自动扩展（{modeNameMap[growMode]}）
                                </Button>
                                <Button variant="text" fullWidth onClick={handleToggleMode} sx={{ mb: 1 }}>
                                    切换为{' '}
                                    {modeNameMap[
                                        growMode === 'manual' ? 'free' : growMode === 'free' ? 'fury' : 'manual'
                                        ]}
                                </Button>
                                <Button
                                    startIcon={<SettingsIcon />}
                                    onClick={() => {
                                        setDrawerOpen(true)
                                        setMenuOpen(false)
                                    }}
                                    fullWidth
                                >
                                    打开高级配置
                                </Button>
                            </Box>
                        </Drawer>
                    </>
                ) : (
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        justifyContent="center"
                        sx={{ mb: 2 }}
                    >
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
                                growMode === 'manual' ? 'free' : growMode === 'free' ? 'fury' : 'manual'
                                ]}
                        </Button>
                        <Tooltip title="打开高级配置">
                            <IconButton onClick={() => setDrawerOpen(true)}>
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                )}



                <Popover
                    open={openPopover}
                    anchorEl={anchorEl}
                    onClose={handleCloseConfig}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    slotProps={{
                        paper: {
                            sx: { mt: 1, p: 1, borderRadius: 2, minWidth: 360 },
                        },
                    }}
                >
                    <ExpandConfigPanel />
                </Popover>

                <ConfigDrawer open={drawerOpen} closeAction={() => setDrawerOpen(false)} />
            </>
        </Box>
    )
}