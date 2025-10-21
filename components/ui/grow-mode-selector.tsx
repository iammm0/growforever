'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type GrowMode = 'manual' | 'free' | 'fury'

interface GrowModeSelectorProps {
  mode: GrowMode
  onModeChange: (mode: GrowMode) => void
  className?: string
}

const modeConfig = {
  manual: {
    name: '手动模式',
    description: '完全手动控制，精确操作',
    icon: '✋',
    color: 'bg-blue-500',
    speed: '慢',
    control: '完全控制',
  },
  free: {
    name: '自由模式',
    description: '温和的自动扩展，适合深度思考',
    icon: '🌊',
    color: 'bg-green-500',
    speed: '中',
    control: '半自动',
  },
  fury: {
    name: '狂暴模式',
    description: '快速爆发式扩展，适合脑暴',
    icon: '⚡',
    color: 'bg-red-500',
    speed: '快',
    control: '全自动',
  },
}

export function GrowModeSelector({ mode, onModeChange, className }: GrowModeSelectorProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">🎛️</span>
          成长模式
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(modeConfig).map(([modeKey, config]) => (
            <motion.div
              key={modeKey}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={mode === modeKey ? 'grow' : 'outline'}
                className={cn(
                  'w-full h-auto p-4 flex flex-col items-start gap-2',
                  mode === modeKey && 'ring-2 ring-green-500'
                )}
                onClick={() => onModeChange(modeKey as GrowMode)}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-lg">{config.icon}</span>
                  <span className="font-semibold">{config.name}</span>
                  {mode === modeKey && (
                    <Badge variant="default" className="ml-auto">
                      当前
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground text-left">
                  {config.description}
                </p>
                
                <div className="flex gap-2 w-full">
                  <Badge variant="outline" className="text-xs">
                    速度: {config.speed}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    控制: {config.control}
                  </Badge>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
