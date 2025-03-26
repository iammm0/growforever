'use client'

import { Button, Stack } from '@mui/material'
import { useGraphStore } from '@/lib/graphStore'
import { createThoughtNode } from '@/lib/nodeUtils'

export default function ControlPanel() {
    const { addNode, reset } = useGraphStore()

    return (
        <Stack direction="row" spacing={2}>
            <Button
                variant="contained"
                color="success"
                onClick={() => {
                    const node = createThoughtNode(Math.random() * 600, Math.random() * 400, {
                        title: '手动节点',
                        summary: '用户手动添加',
                        tags: ['手动'],
                        color: '#4ade80',
                    })
                    addNode(node)
                }}
            >
                ➕ 添加节点
            </Button>
            <Button variant="outlined" color="error" onClick={reset}>
                🗑️ 清空画布
            </Button>
        </Stack>
    )
}
