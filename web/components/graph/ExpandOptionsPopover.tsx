'use client'

import React, { forwardRef, useEffect, useMemo, useState } from 'react'
import { Node } from 'reactflow'
import { Button, Paper, Typography, Stack, TextField, Divider } from '@mui/material'

type ExpandOptionsPopoverProps = {
    node: Node
    position: { x: number; y: number }
    onExpand: (payload: { type: 'related' | 'deep' | 'new'; prompt?: string; title?: string }) => void
    onMagnify: (nodeId: string) => void
    hasExpandedSeed: boolean
    isLeaf: boolean
    onClose: () => void
}

// ⬇️ forwardRef 用于接收 ref，从父组件注入
const ExpandOptionsPopover = forwardRef<HTMLDivElement, ExpandOptionsPopoverProps>(
    ({ node, position, onExpand, onMagnify, hasExpandedSeed, isLeaf, onClose }, ref) => {
        const isSeed = node.data?.role === 'seed'
        const [title, setTitle] = useState(() => (typeof node.data?.title === 'string' ? node.data.title : ''))
        const [prompt, setPrompt] = useState(() => (typeof node.data?.prompt === 'string' ? node.data.prompt : ''))

        useEffect(() => {
            setTitle(typeof node.data?.title === 'string' ? node.data.title : '')
            setPrompt(typeof node.data?.prompt === 'string' ? node.data.prompt : '')
        }, [node])

        const canExpand = useMemo(() => prompt.trim().length > 0, [prompt])

        const handleExpand = (type: 'related' | 'deep' | 'new') => {
            onExpand({
                type,
                prompt,
                title: isSeed ? title : undefined,
            })
        }

        return (
            <Paper
                ref={ref}
                elevation={4}
                style={{
                    position: 'absolute',
                    top: position.y + window.scrollY,
                    left: position.x + window.scrollX,
                    zIndex: 1000,
                    padding: 16,
                    borderRadius: 8,
                    background: 'white',
                    pointerEvents: 'auto',
                }}
            >
                <Typography fontWeight="bold" gutterBottom>
                    展开 {node.data?.title || ''}
                </Typography>
                {isSeed && (
                    <TextField
                        fullWidth
                        size="small"
                        label="种子标题"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        sx={{ mb: 1.5 }}
                    />
                )}
                <TextField
                    fullWidth
                    size="small"
                    label={isSeed ? '提示词（用于第一次扩展）' : '提示词'}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    multiline
                    minRows={2}
                    sx={{ mb: 1.5 }}
                />
                {hasExpandedSeed && isLeaf && (
                    <Button
                        variant="contained"
                        color={node.data?.magnified ? 'secondary' : 'primary'}
                        onClick={() => onMagnify(node.id)}
                        sx={{ mb: 1.5 }}
                    >
                        {node.data?.magnified ? '还原卡片' : '放大查看'}
                    </Button>
                )}
                <Divider sx={{ mb: 1.5 }} />
                <Stack direction="column" spacing={1}>
                    <Button
                        variant="outlined"
                        onClick={() => handleExpand('related')}
                        disabled={!canExpand}
                    >
                        🔗 关联扩展
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleExpand('deep')}
                        disabled={!canExpand}
                    >
                        📚 深入展开
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => handleExpand('new')}
                        disabled={!canExpand}
                    >
                        🌱 新想法
                    </Button>
                    <Button color="inherit" size="small" onClick={onClose}>
                        取消
                    </Button>
                </Stack>
            </Paper>
        )
    }
)

// 🔐 必须加 displayName，避免 React Dev Tools 报错
ExpandOptionsPopover.displayName = 'ExpandOptionsPopover'

export default ExpandOptionsPopover
