'use client'

import { ToggleButton, ToggleButtonGroup, Typography, Stack } from '@mui/material'
import { useGraphStore } from '@/lib/graphStore'
import React from 'react'
import {GrowMode} from "@/types/GrowthNode";

export default function GrowModeToggle() {
    const growMode = useGraphStore((s) => s.growMode)
    const setGrowMode = useGraphStore((s) => s.setGrowMode)

    const handleChange = (_e: React.MouseEvent<HTMLElement>, newMode: GrowMode) => {
        if (newMode) setGrowMode(newMode)
    }

    return (
        <Stack spacing={1} alignItems="flex-start">
            <Typography variant="body2" fontWeight="bold">
                模式选择：
            </Typography>
            <ToggleButtonGroup
                value={growMode}
                exclusive
                onChange={handleChange}
                color="primary"
                size="small"
            >
                <ToggleButton value="free">🌱 自由模式</ToggleButton>
                <ToggleButton value="rage">🔥 狂暴模式</ToggleButton>
            </ToggleButtonGroup>
        </Stack>
    )
}
