'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ConnectionLineProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  type?: 'default' | 'causal' | 'temporal' | 'association'
  strength?: 'weak' | 'medium' | 'strong'
  animated?: boolean
  className?: string
}

const typeConfig = {
  default: {
    color: 'stroke-gray-400',
    dashArray: '0',
  },
  causal: {
    color: 'stroke-red-400',
    dashArray: '0',
  },
  temporal: {
    color: 'stroke-blue-400',
    dashArray: '5,5',
  },
  association: {
    color: 'stroke-green-400',
    dashArray: '10,5',
  },
}

const strengthConfig = {
  weak: 'stroke-width-1',
  medium: 'stroke-width-2',
  strong: 'stroke-width-3',
}

export function ConnectionLine({
  from,
  to,
  type = 'default',
  strength = 'medium',
  animated = true,
  className,
}: ConnectionLineProps) {
  const config = typeConfig[type]
  const strengthClass = strengthConfig[strength]
  
  // Calculate control points for a smooth curve
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const controlOffset = Math.min(distance * 0.3, 100)
  
  const cp1x = from.x + controlOffset
  const cp1y = from.y
  const cp2x = to.x - controlOffset
  const cp2y = to.y
  
  const pathData = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`
  
  return (
    <svg
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ zIndex: 0 }}
    >
      <motion.path
        d={pathData}
        fill="none"
        className={cn(
          config.color,
          strengthClass,
          'drop-shadow-sm'
        )}
        strokeDasharray={config.dashArray}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: animated ? 0.8 : 0 }}
      />
      
      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrow-${type}`}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            className={config.color}
            fill="currentColor"
          />
        </marker>
      </defs>
      
      <motion.path
        d={pathData}
        fill="none"
        className={cn(
          config.color,
          strengthClass
        )}
        strokeDasharray={config.dashArray}
        markerEnd={`url(#arrow-${type})`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: animated ? 0.8 : 0 }}
      />
    </svg>
  )
}
