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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useSeedApi } from '@/hooks/useSeed'

interface PromptDialogProps {
  open: boolean
  onClose: () => void
  onTextExpand?: (text: string) => Promise<void>
  onGNNProcess?: (text: string, modelName?: string | null, strategy?: string) => Promise<void>
}

const AVAILABLE_MODELS = [
  { value: null, label: '默认模型' },
  { value: 'bert-base-chinese', label: 'BERT中文基础模型' },
  { value: 'roberta-base-chinese', label: 'RoBERTa中文模型（推荐，准确率较高）' },
  { value: 'macbert-base-chinese', label: 'MacBERT中文模型' },
  { value: 'bert-large-chinese', label: 'BERT Large中文模型（可选，需要更多GPU内存）' },
  { value: 'roberta-large-chinese', label: 'RoBERTa Large中文模型（可选，需要更多GPU内存）' },
]

const AVAILABLE_STRATEGIES = [
  { value: 'single', label: '单模型模式（最快）' },
  { value: 'vote', label: '多模型投票（准确率高）' },
  { value: 'union', label: '多模型并集（召回率高）' },
  { value: 'intersection', label: '多模型交集（精确率高）' },
]

export default function PromptDialog({ open, onClose, onTextExpand, onGNNProcess }: PromptDialogProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { createSeed, expandSeed } = useSeedApi()
  const [seedId, setSeedId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [expandedText, setExpandedText] = useState('')
  const [isExpanding, setIsExpanding] = useState(false)
  const [isProcessingGNN, setIsProcessingGNN] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showExpandedText, setShowExpandedText] = useState(false)
  const [modelName, setModelName] = useState<string | null>(null)
  const [strategy, setStrategy] = useState<string>('single')

  const textColor = isDark ? '#fff' : '#000'
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)
  const bgColor = isDark ? alpha('#000', 0.8) : alpha('#fff', 0.9)

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
      const response = await fetch('/api/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'continue',
          input: prompt,
          temperature: 0.7,
          maxTokens: 1000,
        }),
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
        await onGNNProcess(expandedText, modelName, strategy)
      }
      onClose()
    } catch (err) {
      setError('GNN处理失败')
      console.error('GNN处理错误:', err)
    } finally {
      setIsProcessingGNN(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: `1px solid ${borderColor}`,
          background: bgColor,
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <DialogTitle sx={{ color: textColor, fontWeight: 700, pb: 2, borderBottom: `1px solid ${borderColor}` }}>
        文本扩展与知识图谱生成
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="种子标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            placeholder="请输入种子的标题"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: borderColor,
                },
              },
            }}
          />

          <TextField
            label="提示词（用于文本扩展）"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            placeholder="请输入用于扩展的提示词"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: borderColor,
                },
              },
            }}
          />

          <Button
            variant="contained"
            onClick={handleTextExpand}
            disabled={isExpanding || !prompt.trim()}
            startIcon={isExpanding ? <CircularProgress size={16} /> : null}
            fullWidth
            sx={{
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 2,
              },
            }}
          >
            {isExpanding ? '正在扩展文本...' : '扩展文本'}
          </Button>

          {expandedText && (
            <>
              <Divider sx={{ borderColor: borderColor }} />
              <Button
                variant="outlined"
                onClick={() => setShowExpandedText(!showExpandedText)}
                fullWidth
                sx={{
                  borderRadius: 2,
                  borderColor: borderColor,
                  color: textColor,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                {showExpandedText ? '隐藏扩展文本' : '查看扩展文本'}
              </Button>

              {showExpandedText && (
                <>
                  <TextField
                    fullWidth
                    label="扩展后的文本"
                    value={expandedText}
                    onChange={(e) => setExpandedText(e.target.value)}
                    multiline
                    minRows={6}
                    maxRows={12}
                    placeholder="扩展后的文本将显示在这里，您可以编辑调整"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: borderColor,
                        },
                      },
                    }}
                  />

                  <Divider sx={{ borderColor: borderColor }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textColor }}>
                    GNN模型配置
                  </Typography>

                  <FormControl fullWidth>
                    <InputLabel sx={{ color: textColor }}>选择模型</InputLabel>
                    <Select
                      value={modelName ?? ''}
                      onChange={(e) => setModelName(e.target.value || null)}
                      label="选择模型"
                      sx={{
                        borderRadius: 2,
                        color: textColor,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: borderColor,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      {AVAILABLE_MODELS.map((model) => (
                        <MenuItem key={model.value ?? 'default'} value={model.value ?? ''}>
                          {model.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel sx={{ color: textColor }}>选择策略</InputLabel>
                    <Select
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      label="选择策略"
                      sx={{
                        borderRadius: 2,
                        color: textColor,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: borderColor,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      }}
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
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 2,
                  },
                }}
              >
                {isProcessingGNN ? '正在生成知识图谱...' : '生成知识图谱'}
              </Button>
            </>
          )}

          {seedId && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              当前种子ID: {seedId}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 2,
            color: textColor,
          }}
        >
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  )
}
