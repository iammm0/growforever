'use client'

import React, { forwardRef, useEffect, useMemo, useState } from 'react'
import { Node } from 'reactflow'
import { Button, Paper, Typography, Stack, TextField, Divider, CircularProgress, Alert } from '@mui/material'

type ExpandOptionsPopoverProps = {
    node: Node
    position: { x: number; y: number }
    onExpand: () => void // 保留接口兼容性，但不再使用
    onMagnify: (nodeId: string) => void
    hasExpandedSeed: boolean
    isLeaf: boolean
    onClose: () => void
    onTextExpand?: (text: string) => Promise<void>
    onGNNProcess?: (text: string) => Promise<void>
}

// ⬇️ forwardRef 用于接收 ref，从父组件注入
const ExpandOptionsPopover = forwardRef<HTMLDivElement, ExpandOptionsPopoverProps>(
    ({ node, position, onExpand, onMagnify, hasExpandedSeed, isLeaf, onClose, onTextExpand, onGNNProcess }, ref) => {
        const isSeed = node.data?.role === 'seed'
        const [title, setTitle] = useState(() => (typeof node.data?.title === 'string' ? node.data.title : ''))
        const [prompt, setPrompt] = useState(() => (typeof node.data?.prompt === 'string' ? node.data.prompt : ''))
        const [expandedText, setExpandedText] = useState(() => (typeof node.data?.expandedText === 'string' ? node.data.expandedText : ''))
        const [isExpanding, setIsExpanding] = useState(false)
        const [isProcessingGNN, setIsProcessingGNN] = useState(false)
        const [error, setError] = useState<string | null>(null)
        const [showExpandedText, setShowExpandedText] = useState(false)

        useEffect(() => {
            setTitle(typeof node.data?.title === 'string' ? node.data.title : '')
            setPrompt(typeof node.data?.prompt === 'string' ? node.data.prompt : '')
            setExpandedText(typeof node.data?.expandedText === 'string' ? node.data.expandedText : '')
        }, [node])

        const handleTextExpand = async () => {
            if (!prompt.trim()) {
                setError('请输入提示词')
                return
            }
            
            setIsExpanding(true)
            setError(null)
            
            try {
                if (onTextExpand) {
                    await onTextExpand(prompt)
                }
            } catch (err) {
                setError('文本扩展失败')
                console.error('文本扩展错误:', err)
            } finally {
                setIsExpanding(false)
            }
        }

        const handleGNNProcess = async () => {
            if (!expandedText.trim()) {
                setError('请先进行文本扩展')
                return
            }
            
            setIsProcessingGNN(true)
            setError(null)
            
            try {
                if (onGNNProcess) {
                    await onGNNProcess(expandedText)
                }
            } catch (err) {
                setError('GNN处理失败')
                console.error('GNN处理错误:', err)
            } finally {
                setIsProcessingGNN(false)
            }
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
                    maxWidth: 400,
                    minWidth: 300,
                }}
            >
                <Typography fontWeight="bold" gutterBottom>
                    {isSeed ? '种子设置' : '展开'} {node.data?.title || ''}
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 1.5 }}>
                        {error}
                    </Alert>
                )}

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

                {isSeed && (
                    <Stack spacing={1.5}>
                        <Button
                            variant="contained"
                            onClick={handleTextExpand}
                            disabled={isExpanding || !prompt.trim()}
                            startIcon={isExpanding ? <CircularProgress size={16} /> : null}
                            fullWidth
                        >
                            {isExpanding ? '正在扩展文本...' : '扩展文本'}
                        </Button>

                        {expandedText && (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={() => setShowExpandedText(!showExpandedText)}
                                    fullWidth
                                >
                                    {showExpandedText ? '隐藏扩展文本' : '查看扩展文本'}
                                </Button>

                                {showExpandedText && (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="扩展后的文本"
                                        value={expandedText}
                                        onChange={(event) => setExpandedText(event.target.value)}
                                        multiline
                                        minRows={4}
                                        maxRows={8}
                                        sx={{ mb: 1.5 }}
                                    />
                                )}

                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleGNNProcess}
                                    disabled={isProcessingGNN || !expandedText.trim()}
                                    startIcon={isProcessingGNN ? <CircularProgress size={16} /> : null}
                                    fullWidth
                                >
                                    {isProcessingGNN ? '正在处理...' : '生成知识图谱'}
                                </Button>
                            </>
                        )}
                    </Stack>
                )}

                {!isSeed && (
                    <Button
                        variant="contained"
                        color={node.data?.magnified ? 'secondary' : 'primary'}
                        onClick={() => onMagnify(node.id)}
                        sx={{ mb: 1.5 }}
                        fullWidth
                    >
                        {node.data?.magnified ? '还原卡片' : '放大查看'}
                    </Button>
                )}

                <Divider sx={{ my: 1.5 }} />
                
                <Button
                    variant="outlined"
                    onClick={onClose}
                    fullWidth
                >
                    关闭
                </Button>
            </Paper>
        )
    }
)

// 🔐 必须加 displayName，避免 React Dev Tools 报错
ExpandOptionsPopover.displayName = 'ExpandOptionsPopover'

export default ExpandOptionsPopover
