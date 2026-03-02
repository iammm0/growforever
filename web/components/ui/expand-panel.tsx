'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface ExpandPanelProps {
  onExpand?: (data: {
    type: 'related' | 'deep' | 'new'
    prompt: string
    temperature?: number
    maxTokens?: number
  }) => void
  className?: string
}

const expandTypes = {
  related: {
    name: '关联扩展',
    description: '寻找相关的概念和想法',
    icon: '🔗',
    color: 'bg-blue-500',
  },
  deep: {
    name: '深入展开',
    description: '深入挖掘当前主题的细节',
    icon: '📚',
    color: 'bg-purple-500',
  },
  new: {
    name: '新想法',
    description: '生成全新的创意方向',
    icon: '🌱',
    color: 'bg-green-500',
  },
}

export function ExpandPanel({ onExpand, className }: ExpandPanelProps) {
  const [prompt, setPrompt] = React.useState('')
  const [type, setType] = React.useState<'related' | 'deep' | 'new'>('related')
  const [temperature, setTemperature] = React.useState(0.7)
  const [maxTokens, setMaxTokens] = React.useState(512)
  const [isExpanded, setIsExpanded] = React.useState(false)

  const handleExpand = (expandType: 'related' | 'deep' | 'new') => {
    if (prompt.trim()) {
      onExpand?.({
        type: expandType,
        prompt: prompt.trim(),
        temperature,
        maxTokens,
      })
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          AI 思维扩展
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="输入你想要扩展的想法或概念..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="flex gap-2">
          {Object.entries(expandTypes).map(([typeKey, config]) => (
            <Button
              key={typeKey}
              variant={type === typeKey ? 'grow' : 'outline'}
              size="sm"
              onClick={() => setType(typeKey as any)}
              className="flex-1"
            >
              <span className="mr-1">{config.icon}</span>
              {config.name}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          {isExpanded ? '收起高级设置' : '展开高级设置'}
        </Button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 p-4 bg-muted rounded-lg"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  创造性 (Temperature): {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  最大长度: {maxTokens}
                </label>
                <input
                  type="range"
                  min="64"
                  max="2048"
                  step="64"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-2">
          <Button
            variant="grow"
            onClick={() => handleExpand(type)}
            disabled={!prompt.trim()}
            className="flex-1"
          >
            <span className="mr-1">{expandTypes[type].icon}</span>
            开始扩展
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setPrompt('')}
            disabled={!prompt.trim()}
          >
            清空
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant="idea">想法</Badge>
          <Badge variant="memory">记忆</Badge>
          <Badge variant="emotion">情感</Badge>
          <Badge variant="feature">特征</Badge>
          <Badge variant="event">事件</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
