'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material'
import { useSeedApi } from '@/hooks/useSeed'

interface PromptDialogProps {
    open: boolean
    onClose: () => void
    onTextExpand?: (text: string) => Promise<void>
    onGNNProcess?: (text: string) => Promise<void>
}

export default function PromptDialog({ open, onClose, onTextExpand, onGNNProcess }: PromptDialogProps) {
    const { createSeed, expandSeed } = useSeedApi()
    const [seedId, setSeedId] = useState<number | null>(null)
    const [title, setTitle] = useState('')
    const [prompt, setPrompt] = useState('')
    const [expandedText, setExpandedText] = useState('')
    const [isExpanding, setIsExpanding] = useState(false)
    const [isProcessingGNN, setIsProcessingGNN] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showExpandedText, setShowExpandedText] = useState(false)

    const handleCreateSeed = async () => {
        try {
            const seed = await createSeed({ title })
            setSeedId(seed.id)
            setError(null)
        } catch (error) {
            console.error('创建种子失败', error)
            setError('创建种子失败')
        }
    }

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
            // 模拟获取扩展文本（实际应该从API获取）
            const response = await fetch('/api/expand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'continue',
                    input: prompt,
                    temperature: 0.7,
                    maxTokens: 1000
                })
            })
            
            if (!response.ok) {
                throw new Error('文本扩展失败')
            }
            
            const data = await response.json()
            setExpandedText(data.text)
            setShowExpandedText(true)
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
            // 关闭对话框
            onClose()
        } catch (err) {
            setError('GNN处理失败')
            console.error('GNN处理错误:', err)
        } finally {
            setIsProcessingGNN(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>种子扩展与知识图谱生成</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    <TextField
                        label="种子标题"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        placeholder="请输入种子的标题"
                    />
                    
                    <TextField
                        label="提示词（用于文本扩展）"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                        placeholder="请输入用于扩展的提示词"
                    />

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
                            <Divider />
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
                                    label="扩展后的文本"
                                    value={expandedText}
                                    onChange={(e) => setExpandedText(e.target.value)}
                                    multiline
                                    minRows={6}
                                    maxRows={12}
                                    placeholder="扩展后的文本将显示在这里，您可以编辑调整"
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
                                {isProcessingGNN ? '正在生成知识图谱...' : '生成知识图谱'}
                            </Button>
                        </>
                    )}

                    {seedId && (
                        <Alert severity="info">
                            当前种子ID: {seedId}
                        </Alert>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>关闭</Button>
                <Button onClick={handleCreateSeed} variant="outlined">
                    新建种子
                </Button>
            </DialogActions>
        </Dialog>
    )
}

