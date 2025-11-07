'use client'

import React, { forwardRef, useEffect, useMemo, useState } from 'react'
import { Node } from 'reactflow'
import { 
    Button, 
    Paper, 
    Typography, 
    Stack, 
    TextField, 
    Divider, 
    CircularProgress, 
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material'

type ExpandOptionsPopoverProps = {
    node: Node
    position: { x: number; y: number }
    onExpand: () => void // 保留接口兼容性，但不再使用
    onMagnify: (nodeId: string) => void
    hasExpandedSeed: boolean
    isLeaf: boolean
    onClose: () => void
    onTextExpand?: (text: string) => Promise<void>
    onGNNProcess?: (text: string, modelName?: string | null, strategy?: string) => Promise<void>
}

// 可用的模型列表（根据API文档v2.1.0）
const AVAILABLE_MODELS = [
    { value: null, label: '默认模型' },
    { value: 'bert-base-chinese', label: 'BERT中文基础模型' },
    { value: 'roberta-base-chinese', label: 'RoBERTa中文模型（推荐，准确率较高）' },
    { value: 'macbert-base-chinese', label: 'MacBERT中文模型' },
    { value: 'bert-large-chinese', label: 'BERT Large中文模型（可选，需要更多GPU内存）' },
    { value: 'roberta-large-chinese', label: 'RoBERTa Large中文模型（可选，需要更多GPU内存）' },
]

// 可用的策略列表（根据API文档v2.1.0）
const AVAILABLE_STRATEGIES = [
    { value: 'single', label: '单模型模式（最快）' },
    { value: 'vote', label: '多模型投票（准确率高）' },
    { value: 'union', label: '多模型并集（召回率高）' },
    { value: 'intersection', label: '多模型交集（精确率高）' },
]

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
        const [modelName, setModelName] = useState<string | null>(null)
        const [strategy, setStrategy] = useState<string>('single')

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
                    await onGNNProcess(expandedText, modelName, strategy)
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
                                    <>
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
                                        
                                        <Divider sx={{ my: 1.5 }} />
                                        
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            GNN模型配置
                                        </Typography>
                                        
                                        <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                                            <InputLabel>选择模型</InputLabel>
                                            <Select
                                                value={modelName ?? ''}
                                                onChange={(e) => setModelName(e.target.value || null)}
                                                label="选择模型"
                                            >
                                                {AVAILABLE_MODELS.map((model) => (
                                                    <MenuItem key={model.value ?? 'default'} value={model.value ?? ''}>
                                                        {model.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        
                                        <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                                            <InputLabel>选择策略</InputLabel>
                                            <Select
                                                value={strategy}
                                                onChange={(e) => setStrategy(e.target.value)}
                                                label="选择策略"
                                            >
                                                {AVAILABLE_STRATEGIES.map((strat) => (
                                                    <MenuItem key={strat.value} value={strat.value}>
                                                        {strat.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </>
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
