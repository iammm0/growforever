'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Brain, Zap, Lightbulb } from 'lucide-react'

interface AIThinkingProps {
  isThinking: boolean
  currentStep?: string
  progress?: number
  className?: string
}

const thinkingSteps = [
  { icon: Brain, text: '分析输入内容...', color: 'bg-blue-500' },
  { icon: Zap, text: '生成关联想法...', color: 'bg-yellow-500' },
  { icon: Lightbulb, text: '优化思维结构...', color: 'bg-green-500' },
]

export function AIThinking({ 
  isThinking, 
  currentStep = '分析输入内容...',
  progress = 0,
  className 
}: AIThinkingProps) {
  if (!isThinking) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('fixed bottom-4 right-4 z-50', className)}
    >
      <Card className="w-80 shadow-lg border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6"
            >
              <Brain className="w-6 h-6 text-green-600" />
            </motion.div>
            <div>
              <h4 className="font-semibold text-green-800">AI 正在思考</h4>
              <p className="text-sm text-green-600">{currentStep}</p>
            </div>
          </div>

          <div className="space-y-2">
            {thinkingSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: progress > index * 33 ? 1 : 0.3,
                  x: progress > index * 33 ? 0 : -20 
                }}
                transition={{ delay: index * 0.2 }}
                className="flex items-center gap-2"
              >
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  step.color,
                  progress > index * 33 ? 'opacity-100' : 'opacity-30'
                )} />
                <span className={cn(
                  'text-sm',
                  progress > index * 33 ? 'text-green-800' : 'text-green-600'
                )}>
                  {step.text}
                </span>
                {progress > index * 33 && (
                  <Badge variant="grow" className="ml-auto text-xs">
                    完成
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-3">
            <div className="w-full bg-green-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-green-600 mt-1 text-center">
              {Math.round(progress)}% 完成
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
