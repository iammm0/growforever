'use client'

import {
    Button,
    Stack,
    IconButton,
    Tooltip,
    Box,
    Drawer,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { useState } from 'react'
import {useMediaQuery, useTheme} from "@mui/system";
import {MenuIcon} from "lucide-react";
import ConfigDrawer from "./ConfigDrawer";
import {useGraphStore} from "@/lib/graphStore";
import PromptDialog from "./PromptDialog";

export default function ControlPanel() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [menuOpen, setMenuOpen] = useState(false)

    const { reset } = useGraphStore()

    const [promptOpen, setPromptOpen] = useState(false)
    const [gptService, setGptService] = useState('default')
    const [gnnService, setGnnService] = useState('default')

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
                                <Stack spacing={1}>
                                    <FormControl fullWidth>
                                        <InputLabel>GPT 服务</InputLabel>
                                        <Select
                                            value={gptService}
                                            label="GPT 服务"
                                            onChange={(e) => setGptService(e.target.value)}
                                        >
                                            <MenuItem value="default">默认</MenuItem>
                                            <MenuItem value="gpt-4">GPT-4</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>GNN 服务</InputLabel>
                                        <Select
                                            value={gnnService}
                                            label="GNN 服务"
                                            onChange={(e) => setGnnService(e.target.value)}
                                        >
                                            <MenuItem value="default">默认</MenuItem>
                                            <MenuItem value="gnn-advanced">高级</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Button variant="contained" fullWidth onClick={() => setPromptOpen(true)}>
                                        打开提示词
                                    </Button>
                                    <Button variant="outlined" fullWidth color="error" onClick={reset}>
                                        🗑️ 清空画布
                                    </Button>
                                </Stack>
                            </Box>
                        </Drawer>
                    </>
                ) : (
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        justifyContent="center"
                        sx={{ mb: 2, flexWrap: 'wrap' }}
                    >
                        <FormControl sx={{ minWidth: 120 }} size="small">
                            <InputLabel>GPT 服务</InputLabel>
                            <Select
                                value={gptService}
                                label="GPT 服务"
                                onChange={(e) => setGptService(e.target.value)}
                            >
                                <MenuItem value="default">默认</MenuItem>
                                <MenuItem value="gpt-4">GPT-4</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 120 }} size="small">
                            <InputLabel>GNN 服务</InputLabel>
                            <Select
                                value={gnnService}
                                label="GNN 服务"
                                onChange={(e) => setGnnService(e.target.value)}
                            >
                                <MenuItem value="default">默认</MenuItem>
                                <MenuItem value="gnn-advanced">高级</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="contained" onClick={() => setPromptOpen(true)}>
                            打开提示词
                        </Button>
                        <Button variant="outlined" color="error" onClick={reset}>
                            清空画布
                        </Button>
                    </Stack>
                )}

                <PromptDialog open={promptOpen} onClose={() => setPromptOpen(false)} />
                <ConfigDrawer open={drawerOpen} closeAction={() => setDrawerOpen(false)} />
            </>
        </Box>
    )
}