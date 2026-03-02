'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Brain, 
  Zap, 
  Settings, 
  BarChart3, 
  History, 
  BookOpen,
  Lightbulb,
  Heart,
  Star,
  Calendar
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

const navigationItems = [
  { icon: Brain, label: '思维图谱', href: '/graph', active: true },
  { icon: BookOpen, label: '文本扩展', href: '/expand' },
  { icon: BarChart3, label: '分析统计', href: '/analytics' },
  { icon: History, label: '历史记录', href: '/history' },
]

const quickActions = [
  { icon: Lightbulb, label: '新想法', color: 'bg-yellow-500' },
  { icon: Heart, label: '情感记录', color: 'bg-pink-500' },
  { icon: Star, label: '重要标记', color: 'bg-purple-500' },
  { icon: Calendar, label: '时间线', color: 'bg-blue-500' },
]

export function Sidebar({ className }: SidebarProps) {
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('w-64 h-full bg-background border-r', className)}
    >
      <div className="p-4 space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">G</span>
          </div>
          <span className="font-bold text-lg">GrowForever</span>
        </div>

        {/* Navigation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              导航
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.label}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant={item.active ? 'grow' : 'ghost'}
                  className="w-full justify-start"
                  size="sm"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                  {item.active && (
                    <Badge variant="default" className="ml-auto text-xs">
                      当前
                    </Badge>
                  )}
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              快速操作
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <div className={cn('w-2 h-2 rounded-full mr-2', action.color)} />
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              统计信息
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">思维节点</span>
              <Badge variant="outline">24</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">连接关系</span>
              <Badge variant="outline">18</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">今日扩展</span>
              <Badge variant="grow">5</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          设置
        </Button>
      </div>
    </motion.div>
  )
}
