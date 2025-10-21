'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SeedInputProps {
  onSeedCreate?: (data: { title: string; description?: string }) => void
  className?: string
}

export function SeedInput({ onSeedCreate, className }: SeedInputProps) {
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [isExpanded, setIsExpanded] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSeedCreate?.({ title: title.trim(), description: description.trim() || undefined })
      setTitle('')
      setDescription('')
      setIsExpanded(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('w-full max-w-md', className)}
    >
      <Card className="border-2 border-dashed border-green-300 hover:border-green-500 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            播种新想法
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="输入你的想法标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium"
                required
              />
            </div>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Textarea
                  placeholder="详细描述你的想法（可选）..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </motion.div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-1"
              >
                {isExpanded ? '收起' : '详细描述'}
              </Button>
              
              <Button
                type="submit"
                variant="grow"
                size="sm"
                disabled={!title.trim()}
                className="flex-1"
              >
                开始生长 🌱
              </Button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-1">
            <Badge variant="idea">想法</Badge>
            <Badge variant="memory">记忆</Badge>
            <Badge variant="emotion">情感</Badge>
            <Badge variant="feature">特征</Badge>
            <Badge variant="event">事件</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
