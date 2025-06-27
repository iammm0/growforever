'use client'

import { Box, Button, Stack, Typography } from '@mui/material'
import { useGraphStore } from '@/lib/graphStore'

const layoutNames = {
    tree: '🌲 树状',
    circle: '⭕ 圆形',
    star: '⭐ 星形',
} as const

export default function LayoutPresetSelector() {
    const growMode = useGraphStore((s) => s.growMode)
    const setConfig = useGraphStore((s) => s.setConfig)

    const handleSelect = (type: keyof typeof layoutNames) => {
        const presets = {
            tree: { spreadRadius: 500, angleSpread: 60, autoArrange: true },
            circle: { spreadRadius: 500, angleSpread: 360, autoArrange: true },
            star: { spreadRadius: 500, angleSpread: 180, autoArrange: true },
        }

        setConfig(growMode, presets[type])
    }

    return (
        <Box>
            <Typography fontWeight="bold" gutterBottom>
                💠 布局模板预设
            </Typography>
            <Stack direction="row" spacing={1}>
                {Object.entries(layoutNames).map(([key, label]) => (
                    <Button key={key} variant="outlined" onClick={() => handleSelect(key as keyof typeof layoutNames)}>
                        {label}
                    </Button>
                ))}
            </Stack>
        </Box>
    )
}
