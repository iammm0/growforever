'use client'

import { Button, Stack } from '@mui/material'
import { useGraphStore } from '@/lib/graphStore'
import { createThoughtNode } from '@/lib/nodeUtils'
import { simulateAutoExpand } from '@/lib/simulateAutoExpand'

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

    return (
        <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleAdd}>
                ➕ 添加节点
            </Button>
            <Button variant="outlined" color="error" onClick={reset}>
                🗑️ 清空画布
            </Button>
            <Button variant="contained" color="secondary" onClick={handleAutoGrow}>
                🚀 自动扩展（{growMode === 'fury' ? '狂暴' : '自由'}）
            </Button>
            <Button variant="text" onClick={() => setGrowMode(growMode === 'fury' ? 'free' : 'fury')}>
                切换为 {growMode === 'fury' ? '自由模式' : '狂暴模式'}
            </Button>
        </Stack>
    )
}
