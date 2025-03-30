'use client'

import {
    Box, Typography, Slider, Switch, FormControlLabel, InputLabel, Stack
} from '@mui/material'
import { useGraphStore } from '@/lib/graphStore'
import {GrowMode} from "@/types/GrowthNode";
import LayoutPresetSelector from "@/components/nodes/LayoutPresetSelector";
import {useMediaQuery, useTheme} from "@mui/system";

type ExpandConfigPanelProps = {
    mode?: GrowMode
}

export default function ExpandConfigPanel({ mode }: ExpandConfigPanelProps) {
    const currentMode = useGraphStore((s) => s.growMode)
    const realMode = mode || currentMode
    const config = useGraphStore((s) => s.config[realMode])
    const setConfig = useGraphStore((s) => s.setConfig)

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const update = (key: keyof typeof config, value: number | boolean | number[]) => {
        setConfig(realMode, { [key]: value })
    }

    return (
        <Box
            p={3}
            bgcolor="#f9f9f9"
            borderRadius={2}
            width={320}
            maxWidth="100%"
            sx={{
                '@media (max-width: 600px)': {
                    transform: 'scale(0.94)',
                    transformOrigin: 'top center',
                    px: 1.5,
                    py: 2,
                },
            }}
            boxShadow={2}
        >
            <Typography variant="subtitle1" fontWeight="bold">
                {[realMode]} 配置
            </Typography>

            <Stack spacing={isMobile ? 2 : 3}>
                {/* 💠 布局模板 */}
                <LayoutPresetSelector />
                <Box>
                    <InputLabel>最大扩展深度</InputLabel>
                    <Slider
                        value={config.maxDepth}
                        onChange={(_, val) => update('maxDepth', val)}
                        min={1}
                        max={10}
                    />
                </Box>

                <Box>
                    <InputLabel>子节点数量范围</InputLabel>
                    <Slider
                        value={config.childrenRange}
                        onChange={(_, val) => update('childrenRange', val)}
                        valueLabelDisplay="auto"
                        min={1}
                        max={6}
                    />
                </Box>

                <Box>
                    <InputLabel>生成间隔速度（ms）</InputLabel>
                    <Slider
                        value={config.interval}
                        onChange={(_, val) => update('interval', val)}
                        min={50}
                        max={2000}
                        step={50}
                    />
                </Box>

                <Box>
                    <InputLabel>发散角度（°）</InputLabel>
                    <Slider
                        value={config.angleSpread}
                        onChange={(_, val) => update('angleSpread', val)}
                        min={30}
                        max={360}
                    />
                </Box>

                <Box>
                    <InputLabel>子节点扩散半径</InputLabel>
                    <Slider
                        value={config.spreadRadius}
                        onChange={(_, val) => update('spreadRadius', val)}
                        min={300}
                        max={1000}
                    />
                </Box>

                <FormControlLabel
                    control={
                        <Switch
                            checked={config.autoArrange}
                            onChange={(_, checked) => update('autoArrange', checked)}
                        />
                    }
                    label="自动排列节点"
                />
            </Stack>
        </Box>
    )
}
