'use client'

import React, { forwardRef } from 'react'
import { Node } from 'reactflow'
import { Button, Paper, Typography, Stack } from '@mui/material'

type ExpandOptionsPopoverProps = {
    node: Node
    position: { x: number; y: number }
    onExpand: (type: 'related' | 'deep' | 'new') => void
    onClose: () => void
}

// ⬇️ forwardRef 用于接收 ref，从父组件注入
const ExpandOptionsPopover = forwardRef<HTMLDivElement, ExpandOptionsPopoverProps>(
    ({ node, position, onExpand, onClose }, ref) => {
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
                <Stack direction="column" spacing={1}>
                    <Button variant="outlined" onClick={() => onExpand('related')}>
                        🔗 关联扩展
                    </Button>
                    <Button variant="outlined" onClick={() => onExpand('deep')}>
                        📚 深入展开
                    </Button>
                    <Button variant="outlined" onClick={() => onExpand('new')}>
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
