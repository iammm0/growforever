'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Expand, 
  Minimize, 
  MoreHorizontal, 
  Link, 
  Bookmark,
  Heart,
  Star
} from 'lucide-react'

interface ThoughtNodeProps {
  id: string
  title: string
  description?: string
  type?: 'idea' | 'memory' | 'emotion' | 'feature' | 'event'
  tags?: string[]
  depth?: number
  highlight?: boolean
  magnified?: boolean
  onExpand?: (nodeId: string) => void
  onMagnify?: (nodeId: string) => void
  onBookmark?: (nodeId: string) => void
  onLike?: (nodeId: string) => void
  className?: string
}

const typeConfig = {
  idea: {
    icon: '💡',
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
  },
  memory: {
    icon: '🧠',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  emotion: {
    icon: '❤️',
    color: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/20',
    borderColor: 'border-pink-300 dark:border-pink-700',
  },
  feature: {
    icon: '⭐',
    color: 'from-purple-400 to-violet-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-300 dark:border-purple-700',
  },
  event: {
    icon: '📅',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-300 dark:border-green-700',
  },
}

export function ThoughtNode({
  id,
  title,
  description,
  type = 'idea',
  tags = [],
  depth = 0,
  highlight = false,
  magnified = false,
  onExpand,
  onMagnify,
  onBookmark,
  onLike,
  className,
}: ThoughtNodeProps) {
  const config = typeConfig[type]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: magnified ? 1.1 : 1,
        zIndex: depth + 1,
      }}
      whileHover={{ 
        scale: magnified ? 1.15 : 1.05,
        y: -2,
      }}
      transition={{ duration: 0.2 }}
      className={cn('relative', className)}
    >
      <Card
        className={cn(
          'w-64 transition-all duration-300 cursor-pointer',
          config.bgColor,
          config.borderColor,
          highlight && 'ring-2 ring-green-500 shadow-lg',
          magnified && 'shadow-2xl scale-105',
          'hover:shadow-xl'
        )}
      >
        {/* Type indicator */}
        <div className={cn(
          'h-1 w-full bg-gradient-to-r',
          config.color
        )} />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <CardTitle className="text-base font-semibold line-clamp-1">
                {title}
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-1">
              {depth > 0 && (
                <Badge variant="outline" className="text-xs">
                  L{depth}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {onExpand && (
                <Button
                  size="sm"
                  variant="grow"
                  onClick={() => onExpand(id)}
                  className="h-7 px-2"
                >
                  <Expand className="h-3 w-3 mr-1" />
                  扩展
                </Button>
              )}
              
              {onMagnify && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMagnify(id)}
                  className="h-7 px-2"
                >
                  {magnified ? <Minimize className="h-3 w-3" /> : <Expand className="h-3 w-3" />}
                </Button>
              )}
            </div>

            <div className="flex gap-1">
              {onBookmark && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onBookmark(id)}
                  className="h-7 w-7 p-0"
                >
                  <Bookmark className="h-3 w-3" />
                </Button>
              )}
              
              {onLike && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onLike(id)}
                  className="h-7 w-7 p-0"
                >
                  <Heart className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
