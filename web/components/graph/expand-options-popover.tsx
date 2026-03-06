'use client'

import React, { forwardRef, useEffect, useState } from 'react'
import { Node } from 'reactflow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

const AVAILABLE_MODELS = [
  { value: '', label: '默认模型' },
  { value: 'bert-base-chinese', label: 'BERT中文基础模型' },
  { value: 'roberta-base-chinese', label: 'RoBERTa中文模型（推荐）' },
  { value: 'macbert-base-chinese', label: 'MacBERT中文模型' },
  { value: 'bert-large-chinese', label: 'BERT Large中文模型' },
  { value: 'roberta-large-chinese', label: 'RoBERTa Large中文模型' },
]

const AVAILABLE_STRATEGIES = [
  { value: 'single', label: '单模型模式（最快）' },
  { value: 'vote', label: '多模型投票（准确率高）' },
  { value: 'union', label: '多模型并集（召回率高）' },
  { value: 'intersection', label: '多模型交集（精确率高）' },
]

type ExpandOptionsPopoverProps = {
  node: Node
  position: { x: number; y: number }
  onExpand: () => void
  onMagnify: (nodeId: string) => void
  hasExpandedSeed: boolean
  isLeaf: boolean
  onClose: () => void
  onTextExpand?: (text: string) => Promise<void>
  onGNNProcess?: (text: string, modelName?: string | null, strategy?: string) => Promise<void>
}

const ExpandOptionsPopover = forwardRef<HTMLDivElement, ExpandOptionsPopoverProps>(
  ({ node, position, onMagnify, onClose, onTextExpand, onGNNProcess }, ref) => {
    const isSeed = node.data?.role === 'seed'
    const [title, setTitle] = useState(() => (typeof node.data?.title === 'string' ? node.data.title : ''))
    const [prompt, setPrompt] = useState(() => (typeof node.data?.prompt === 'string' ? node.data.prompt : ''))
    const [expandedText, setExpandedText] = useState(() => (typeof node.data?.expandedText === 'string' ? node.data.expandedText : ''))
    const [isExpanding, setIsExpanding] = useState(false)
    const [isProcessingGNN, setIsProcessingGNN] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showExpandedText, setShowExpandedText] = useState(false)
    const [modelName, setModelName] = useState('')
    const [strategy, setStrategy] = useState('single')

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
        if (onTextExpand) await onTextExpand(prompt)
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
      } catch (err) {
        setError('GNN处理失败')
        console.error('GNN处理错误:', err)
      } finally {
        setIsProcessingGNN(false)
      }
    }

    return (
      <div
        ref={ref}
        className="absolute z-[1000] min-w-[300px] max-w-[400px] rounded-lg border bg-white p-4 shadow-xl dark:border-white/20 dark:bg-black/90"
        style={{
          top: position.y + (typeof window !== 'undefined' ? window.scrollY : 0),
          left: position.x + (typeof window !== 'undefined' ? window.scrollX : 0),
        }}
      >
        <h3 className="mb-4 font-bold"> {isSeed ? '种子设置' : '展开'} {node.data?.title || ''}</h3>
        {error && (
          <Alert variant="destructive" className="mb-3">
            {error}
          </Alert>
        )}
        {isSeed && (
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium">种子标题</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-3" />
          </div>
        )}
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">{isSeed ? '提示词（用于第一次扩展）' : '提示词'}</label>
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} className="mb-3" />
        </div>
        {isSeed && (
          <div className="space-y-3">
            <Button
              variant="grow"
              onClick={handleTextExpand}
              disabled={isExpanding || !prompt.trim()}
              className="w-full"
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
                <Button variant="outline" onClick={() => setShowExpandedText(!showExpandedText)} className="w-full">
                  {showExpandedText ? '隐藏扩展文本' : '查看扩展文本'}
                </Button>
                {showExpandedText && (
                  <>
                    <div className="mb-3">
                      <label className="mb-1 block text-sm font-medium">扩展后的文本</label>
                      <Textarea
                        value={expandedText}
                        onChange={(e) => setExpandedText(e.target.value)}
                        rows={4}
                        className="mb-3"
                      />
                    </div>
                    <div className="my-3 h-px bg-border" />
                    <p className="mb-2 font-bold">GNN模型配置</p>
                    <div className="mb-3">
                      <label className="mb-1 block text-sm">选择模型</label>
                      <Select value={modelName} onValueChange={setModelName}>
                        <SelectTrigger>
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
                    <div className="mb-3">
                      <label className="mb-1 block text-sm">选择策略</label>
                      <Select value={strategy} onValueChange={setStrategy}>
                        <SelectTrigger>
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
                  </>
                )}
                <Button
                  variant="secondary"
                  onClick={handleGNNProcess}
                  disabled={isProcessingGNN || !expandedText.trim()}
                  className="w-full"
                >
                  {isProcessingGNN ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      正在处理...
                    </>
                  ) : (
                    '生成知识图谱'
                  )}
                </Button>
              </>
            )}
          </div>
        )}
        {!isSeed && (
          <Button
            variant={node.data?.magnified ? 'secondary' : 'grow'}
            onClick={() => onMagnify(node.id)}
            className="mb-3 w-full"
          >
            {node.data?.magnified ? '还原卡片' : '放大查看'}
          </Button>
        )}
        <div className="my-3 h-px bg-border" />
        <Button variant="outline" onClick={onClose} className="w-full">
          关闭
        </Button>
      </div>
    )
  }
)

ExpandOptionsPopover.displayName = 'ExpandOptionsPopover'

export default ExpandOptionsPopover
