import React, { useEffect, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/context/theme-context'

interface GrowingThoughtNodeData {
  title: string
  description?: string
  node_metadata?: {
    tags?: string[]
    highlight?: boolean
  }
  highlight?: boolean
  color?: string
  role: string
  depth?: number
  prompt?: string
  order?: number | string
  magnified?: boolean
  expandedText?: string
  isGrowing?: boolean
}

interface GrowingThoughtNodeProps extends NodeProps {
  data: GrowingThoughtNodeData
}

export default function GrowingThoughtNode({ data, selected }: GrowingThoughtNodeProps) {
  const { actualMode } = useTheme()
  const isDark = actualMode === 'dark'
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'growing' | 'stable'>('entering')
  const [scale, setScale] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const [glowIntensity, setGlowIntensity] = useState(0)

  useEffect(() => {
    if (data.isGrowing) {
      // 进入动画
      setAnimationPhase('entering')
      setScale(0)
      setOpacity(0)
      setGlowIntensity(0)

      // 延迟后开始生长动画
      const enterTimer = setTimeout(() => {
        setAnimationPhase('growing')
        
        // 生长动画
        const growTimer = setTimeout(() => {
          setScale(1)
          setOpacity(1)
          setGlowIntensity(1)
          
          // 稳定状态
          setTimeout(() => {
            setAnimationPhase('stable')
            setGlowIntensity(0.3)
          }, 500)
        }, 200)

        return () => clearTimeout(growTimer)
      }, 100)

      return () => clearTimeout(enterTimer)
    } else {
      // 正常状态
      setAnimationPhase('stable')
      setScale(1)
      setOpacity(1)
      setGlowIntensity(0.3)
    }
  }, [data.isGrowing])

  const getNodeStyle = () => {
    const baseStyle = {
      transform: `scale(${scale})`,
      opacity: opacity,
      transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      filter: `drop-shadow(0 0 ${glowIntensity * 20}px rgba(34, 197, 94, ${glowIntensity}))`,
    }

    if (animationPhase === 'entering') {
      return {
        ...baseStyle,
        transform: `scale(${scale}) rotate(-5deg)`,
      }
    }

    if (animationPhase === 'growing') {
      return {
        ...baseStyle,
        transform: `scale(${scale * 1.1})`,
        filter: `drop-shadow(0 0 ${glowIntensity * 30}px rgba(34, 197, 94, ${glowIntensity})) brightness(1.2)`,
      }
    }

    return baseStyle
  }

  const getCardStyle = () => {
    const baseStyle = {
      minWidth: '200px',
      maxWidth: '280px',
      border: data.highlight 
        ? `2px solid ${isDark ? '#4ade80' : '#22c55e'}`
        : `1px solid ${isDark ? 'rgba(74, 222, 128, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
      borderRadius: '16px',
      background: data.highlight
        ? isDark 
          ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(34, 197, 94, 0.15))'
          : 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(74, 222, 128, 0.1))'
        : isDark
          ? 'rgba(18, 18, 18, 0.9)'
          : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(8px)',
      boxShadow: data.highlight
        ? `0 8px 32px rgba(34, 197, 94, 0.3)`
        : `0 4px 16px rgba(0, 0, 0, 0.1)`,
    }

    if (animationPhase === 'growing') {
      return {
        ...baseStyle,
        boxShadow: `0 0 ${glowIntensity * 40}px rgba(34, 197, 94, ${glowIntensity * 0.8})`,
        border: `2px solid ${isDark ? '#4ade80' : '#22c55e'}`,
      }
    }

    return baseStyle
  }

  return (
    <div style={getNodeStyle()}>
      <Card 
        className={`thought-card ${data.highlight ? 'highlight' : ''} ${selected ? 'selected' : ''}`}
        style={getCardStyle()}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {data.title}
            </h3>
            {data.node_metadata?.tags && (
              <Badge 
                variant="secondary" 
                className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                {data.node_metadata.tags[0]}
              </Badge>
            )}
          </div>
          
          {data.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {data.description}
            </p>
          )}

          {data.expandedText && (
            <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted/50 rounded-md">
              <div className="line-clamp-3">
                {data.expandedText}
              </div>
            </div>
          )}

          {data.node_metadata?.tags && data.node_metadata.tags.length > 1 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {data.node_metadata.tags.slice(1).map((tag, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* 生长动画指示器 */}
          {animationPhase === 'growing' && (
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="absolute inset-0 rounded-2xl animate-pulse"
                style={{
                  background: `radial-gradient(circle, rgba(34, 197, 94, ${glowIntensity * 0.3}) 0%, transparent 70%)`,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{
          opacity: animationPhase === 'stable' ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{
          opacity: animationPhase === 'stable' ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </div>
  )
}
