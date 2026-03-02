import React, { useEffect, useState } from 'react'
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow'

interface GrowingConnectionLineData {
  type?: string
  properties?: any
  isGrowing?: boolean
  label?: string
}

interface GrowingConnectionLineProps extends EdgeProps {
  data: GrowingConnectionLineData
}

export default function GrowingConnectionLine({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: GrowingConnectionLineProps) {
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'growing' | 'stable'>('entering')
  const [pathLength, setPathLength] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const [strokeDasharray, setStrokeDasharray] = useState('0 1000')

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  useEffect(() => {
    if (data.isGrowing) {
      // 进入动画
      setAnimationPhase('entering')
      setPathLength(0)
      setOpacity(0)
      setStrokeDasharray('0 1000')

      // 延迟后开始生长动画
      const enterTimer = setTimeout(() => {
        setAnimationPhase('growing')
        
        // 路径生长动画
        const growTimer = setTimeout(() => {
          setPathLength(1000)
          setOpacity(1)
          setStrokeDasharray('1000 0')
          
          // 稳定状态
          setTimeout(() => {
            setAnimationPhase('stable')
            setStrokeDasharray('none')
          }, 800)
        }, 200)

        return () => clearTimeout(growTimer)
      }, 100)

      return () => clearTimeout(enterTimer)
    } else {
      // 正常状态
      setAnimationPhase('stable')
      setPathLength(1000)
      setOpacity(1)
      setStrokeDasharray('none')
    }
  }, [data.isGrowing])

  const getEdgeStyle = () => {
    const baseStyle = {
      stroke: animationPhase === 'growing' 
        ? 'url(#gradient-growing)' 
        : 'url(#gradient-normal)',
      strokeWidth: animationPhase === 'growing' ? 4 : 3,
      strokeDasharray: strokeDasharray,
      opacity: opacity,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      filter: animationPhase === 'growing' 
        ? 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.8))'
        : 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.3))',
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
    }

    if (animationPhase === 'growing') {
      return {
        ...baseStyle,
        strokeWidth: 5,
        filter: 'drop-shadow(0 0 16px rgba(34, 197, 94, 0.9))',
      }
    }

    return baseStyle
  }

  const getLabelStyle = () => {
    if (animationPhase === 'entering') {
      return {
        opacity: 0,
        transform: 'scale(0.8)',
        transition: 'all 0.3s ease',
      }
    }

    if (animationPhase === 'growing') {
      return {
        opacity: 1,
        transform: 'scale(1.1)',
        transition: 'all 0.3s ease',
        color: '#22c55e',
        fontWeight: 'bold',
        textShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
      }
    }

    return {
      opacity: 1,
      transform: 'scale(1)',
      transition: 'all 0.3s ease',
    }
  }

  return (
    <>
      {/* SVG渐变定义 */}
      <defs>
        <linearGradient id="gradient-normal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#4ade80" stopOpacity="1" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="gradient-growing" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
          <stop offset="25%" stopColor="#4ade80" stopOpacity="1" />
          <stop offset="50%" stopColor="#22c55e" stopOpacity="1" />
          <stop offset="75%" stopColor="#4ade80" stopOpacity="1" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="1" />
        </linearGradient>
      </defs>

      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={getEdgeStyle()}
      />
      
      {/* 生长动画的发光效果 */}
      {animationPhase === 'growing' && (
        <path
          d={edgePath}
          stroke="url(#gradient-growing)"
          strokeWidth="8"
          fill="none"
          opacity="0.4"
          strokeDasharray="1000 0"
          style={{
            filter: 'blur(6px)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      )}

      {/* 边标签 */}
      {data.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
              ...getLabelStyle(),
            }}
            className="nodrag nopan"
          >
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
                padding: '6px 12px',
                borderRadius: '12px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(8px)',
                color: '#22c55e',
                fontWeight: '600',
                fontSize: '11px',
              }}
            >
              {data.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
