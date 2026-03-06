'use client'

import { useState } from 'react'
import { useTheme } from '@/context/theme-context'
import { useSeedApi } from '@/hooks/useSeed'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

const AVAILABLE_MODELS = [
  { value: '', label: '默认模型' },
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

interface PromptDialogProps {
  open: boolean
  onClose: () => void
  onTextExpand?: (text: string) => Promise<void>
  onGNNProcess?: (text: string, modelName?: string | null, strategy?: string) => Promise<void>
}

export default function PromptDialog({ open, onClose, onTextExpand, onGNNProcess }: PromptDialogProps) {
  const { actualMode } = useTheme()
  const isDark = actualMode === 'dark'
  const { createSeed, expandSeed } = useSeedApi()
  const [seedId, setSeedId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [expandedText, setExpandedText] = useState('')
  const [isExpanding, setIsExpanding] = useState(false)
  const [isProcessingGNN, setIsProcessingGNN] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showExpandedText, setShowExpandedText] = useState(false)
  const [modelName, setModelName] = useState('')
  const [strategy, setStrategy] = useState('single')

  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-white/10' : 'border-black/10'

  const handleTextExpand = async () => {
    if (!prompt.trim()) {
      setError('请输入提示词')
      return
    }
    setIsExpanding(true)
    setError(null)
    try {
      if (onTextExpand) await onTextExpand(prompt)
      const response = await fetch('/api/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'continue', input: prompt, temperature: 0.7, maxTokens: 1000 }),
      })
      if (!response.ok) throw new Error('文本扩展失败')
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
      if (onGNNProcess) await onGNNProcess(expandedText, modelName || null, strategy)
      onClose()
    } catch (err) {
      setError('GNN处理失败')
      console.error('GNN处理错误:', err)
    } finally {
      setIsProcessingGNN(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className={`max-w-2xl border ${borderColor} ${isDark ? 'bg-black/80' : 'bg-white/90'} backdrop-blur-xl`} onClose={onClose}>
        <DialogTitle className={`border-b pb-4 font-bold ${textColor} ${borderColor}`}>
          文本扩展与知识图谱生成
        </DialogTitle>
        <div className="space-y-4 pt-6">
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              {error}
            </Alert>
          )}
          <div>
            <label className={`mb-2 block text-sm font-medium ${textColor}`}>种子标题</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入种子的标题"
              className={`rounded-xl border ${borderColor} bg-transparent ${textColor}`}
            />
          </div>
          <div>
            <label className={`mb-2 block text-sm font-medium ${textColor}`}>提示词（用于文本扩展）</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="请输入用于扩展的提示词"
              rows={3}
              className={`rounded-xl border ${borderColor} bg-transparent ${textColor}`}
            />
          </div>
          <Button
            variant="grow"
            onClick={handleTextExpand}
            disabled={isExpanding || !prompt.trim()}
            className="w-full py-4 font-semibold"
          >
            {isExpanding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在扩展文本...
              </>
            ) : (
              '扩展文本'
            )}
          </Button>
          {expandedText && (
            <>
              <div className={`h-px ${borderColor}`} />
              <Button
                variant="outline"
                onClick={() => setShowExpandedText(!showExpandedText)}
                className={`w-full border ${borderColor} ${textColor} hover:border-primary`}
              >
                {showExpandedText ? '隐藏扩展文本' : '查看扩展文本'}
              </Button>
              {showExpandedText && (
                <>
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${textColor}`}>扩展后的文本</label>
                    <Textarea
                      value={expandedText}
                      onChange={(e) => setExpandedText(e.target.value)}
                      placeholder="扩展后的文本将显示在这里，您可以编辑调整"
                      rows={6}
                      className={`rounded-xl border ${borderColor} bg-transparent ${textColor}`}
                    />
                  </div>
                  <div className={`h-px ${borderColor}`} />
                  <p className={`font-bold ${textColor}`}>GNN模型配置</p>
                  <div>
                    <label className={`mb-2 block text-sm ${textColor}`}>选择模型</label>
                    <Select value={modelName} onValueChange={setModelName}>
                      <SelectTrigger className={`border ${borderColor} bg-transparent ${textColor}`}>
                        <SelectValue placeholder="选择模型" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_MODELS.map((m) => (
                          <SelectItem key={m.value || 'default'} value={m.value || 'default'}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm ${textColor}`}>选择策略</label>
                    <Select value={strategy} onValueChange={setStrategy}>
                      <SelectTrigger className={`border ${borderColor} bg-transparent ${textColor}`}>
                        <SelectValue placeholder="选择策略" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_STRATEGIES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleGNNProcess}
                    disabled={isProcessingGNN || !expandedText.trim()}
                    className="w-full py-4 font-semibold"
                  >
                    {isProcessingGNN ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        正在生成知识图谱...
                      </>
                    ) : (
                      '生成知识图谱'
                    )}
                  </Button>
                </>
              )}
            </>
          )}
          {seedId && (
            <Alert variant="info" className="rounded-xl">
              当前种子ID: {seedId}
            </Alert>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t pt-4 mt-6 border-border">
          <Button variant="ghost" onClick={onClose} className={textColor}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
