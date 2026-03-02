'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { 
  Brain, 
  Link, 
  Zap, 
  TrendingUp, 
  Clock,
  Target,
  Sparkles
} from 'lucide-react'

interface ThoughtStatsProps {
  totalNodes: number
  totalConnections: number
  avgDepth: number
  complexity: number
  growthRate: number
  className?: string
}

export function ThoughtStats({
  totalNodes,
  totalConnections,
  avgDepth,
  complexity,
  growthRate,
  className,
}: ThoughtStatsProps) {
  const stats = [
    {
      icon: Brain,
      label: '思维节点',
      value: totalNodes,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Link,
      label: '连接关系',
      value: totalConnections,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Target,
      label: '平均深度',
      value: avgDepth.toFixed(1),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Zap,
      label: '复杂度',
      value: `${complexity}%`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: TrendingUp,
      label: '成长率',
      value: `${growthRate}%`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ]

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          思维统计
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-lg border',
                stat.bgColor
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={cn('w-4 h-4', stat.color)} />
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">思维复杂度</span>
              <Badge variant="outline">{complexity}%</Badge>
            </div>
            <Progress value={complexity} variant="grow" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">成长活跃度</span>
              <Badge variant="grow">{growthRate}%</Badge>
            </div>
            <Progress value={growthRate} variant="success" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="idea">想法 {Math.floor(totalNodes * 0.4)}</Badge>
          <Badge variant="memory">记忆 {Math.floor(totalNodes * 0.3)}</Badge>
          <Badge variant="emotion">情感 {Math.floor(totalNodes * 0.2)}</Badge>
          <Badge variant="feature">特征 {Math.floor(totalNodes * 0.1)}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
