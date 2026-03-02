'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ThoughtCardProps {
  title: string
  description?: string
  tags?: string[]
  type?: 'idea' | 'memory' | 'emotion' | 'feature' | 'event'
  highlight?: boolean
  magnified?: boolean
  depth?: number
  onExpand?: () => void
  onMagnify?: () => void
  className?: string
}

const typeColors = {
  idea: 'bg-gradient-to-r from-green-500 to-emerald-600',
  memory: 'bg-gradient-to-r from-blue-500 to-cyan-600',
  emotion: 'bg-gradient-to-r from-pink-500 to-purple-600',
  feature: 'bg-gradient-to-r from-orange-500 to-red-600',
  event: 'bg-gradient-to-r from-yellow-500 to-orange-600',
}

const typeIcons = {
  idea: '💡',
  memory: '🧠',
  emotion: '❤️',
  feature: '⭐',
  event: '📅',
}

export function ThoughtCard({
  title,
  description,
  tags = [],
  type = 'idea',
  highlight = false,
  magnified = false,
  depth = 0,
  onExpand,
  onMagnify,
  className,
}: ThoughtCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: magnified ? 1.05 : 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn('w-full max-w-sm', className)}
    >
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-300 cursor-pointer',
          highlight && 'ring-2 ring-green-500 shadow-lg',
          magnified && 'scale-105 shadow-2xl',
          'hover:shadow-xl hover:scale-105'
        )}
        style={{
          zIndex: depth + 1,
        }}
      >
        <div className={cn('h-1 w-full', typeColors[type])} />
        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{typeIcons[type]}</span>
              <CardTitle className="text-lg font-bold text-foreground">
                {title}
              </CardTitle>
            </div>
            {depth > 0 && (
              <Badge variant="outline" className="text-xs">
                L{depth}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
              {description}
            </p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {tags.map((tag, index) => (
                <Badge key={index} variant="thought" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {onExpand && (
              <Button
                size="sm"
                variant="grow"
                onClick={onExpand}
                className="flex-1"
              >
                🌱 扩展
              </Button>
            )}
            {onMagnify && (
              <Button
                size="sm"
                variant="outline"
                onClick={onMagnify}
              >
                🔍
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
