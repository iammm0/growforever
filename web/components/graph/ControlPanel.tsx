'use client'

import {
    Button,
    Stack,
    IconButton,
    Box,
    Drawer,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    FormHelperText,
} from '@mui/material'
import { useState } from 'react'
import {useMediaQuery, useTheme} from "@mui/system";
import {MenuIcon} from "lucide-react";
import ConfigDrawer from "./ConfigDrawer";
import {useGraphStore} from "@/lib/graphStore";
import PromptDialog from "./PromptDialog";
import {useServiceConfigStore} from "@/lib/serviceConfigStore";

export default function ControlPanel() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [menuOpen, setMenuOpen] = useState(false)

    const { reset } = useGraphStore()

    const [promptOpen, setPromptOpen] = useState(false)
    const {
        gptService,
        gptEndpoint,
        gnnService,
        gnnEndpoint,
        setGptService,
        setGptEndpoint,
        setGnnService,
        setGnnEndpoint,
    } = useServiceConfigStore()

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
                                            <MenuItem value="custom">自定义</MenuItem>
                                        </Select>
                                        <FormHelperText>支持配置远程 GPT 推理地址</FormHelperText>
                                    </FormControl>
                                    <TextField
                                        label="GPT 服务地址"
                                        value={gptEndpoint}
                                        onChange={(e) => setGptEndpoint(e.target.value)}
                                        size="small"
                                        fullWidth
                                        placeholder="https://your-gpt-service/api"
                                        sx={{ mt: 1 }}
                                        disabled={gptService !== 'custom'}
                                    />
                                    <FormControl fullWidth>
                                        <InputLabel>GNN 服务</InputLabel>
                                        <Select
                                            value={gnnService}
                                            label="GNN 服务"
                                            onChange={(e) => setGnnService(e.target.value)}
                                        >
                                            <MenuItem value="default">默认</MenuItem>
                                            <MenuItem value="custom">自定义</MenuItem>
                                        </Select>
                                        <FormHelperText>允许连接自托管的图网络服务</FormHelperText>
                                    </FormControl>
                                    <TextField
                                        label="GNN 服务地址"
                                        value={gnnEndpoint}
                                        onChange={(e) => setGnnEndpoint(e.target.value)}
                                        size="small"
                                        fullWidth
                                        placeholder="https://your-gnn-service/api"
                                        sx={{ mt: 1 }}
                                        disabled={gnnService !== 'custom'}
                                    />
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
                        <FormControl sx={{ minWidth: 160 }} size="small">
                            <InputLabel>GPT 服务选项</InputLabel>
                            <Select
                                value={gptService}
                                label="GPT 服务"
                                onChange={(e) => setGptService(e.target.value)}
                            >
                                <MenuItem value="default">TGT-TextGeneration</MenuItem>
                                <MenuItem value="custom">自定义</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="GPT 服务地址"
                            value={gptEndpoint}
                            onChange={(e) => setGptEndpoint(e.target.value)}
                            size="small"
                            sx={{ minWidth: 200 }}
                            placeholder="https://your-gpt-service/api"
                            disabled={gptService !== 'custom'}
                        />
                        <FormControl sx={{ minWidth: 160 }} size="small">
                            <InputLabel>GNN 服务选项</InputLabel>
                            <Select
                                value={gnnService}
                                label="GNN 服务"
                                onChange={(e) => setGnnService(e.target.value)}
                            >
                                <MenuItem value="default">TGT-Text2Graph</MenuItem>
                                <MenuItem value="custom">自定义</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="GNN 服务地址"
                            value={gnnEndpoint}
                            onChange={(e) => setGnnEndpoint(e.target.value)}
                            size="small"
                            sx={{ minWidth: 200 }}
                            placeholder="https://your-gnn-service/api"
                            disabled={gnnService !== 'custom'}
                        />
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