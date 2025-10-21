'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
  responsive?: boolean
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
}

export function Grid({
  children,
  className,
  cols = 3,
  gap = 'md',
  responsive = true,
}: GridProps) {
  const baseClasses = 'grid'
  const colClasses = responsive
    ? `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols}`
    : `grid-cols-${cols}`
  
  return (
    <div
      className={cn(
        baseClasses,
        colClasses,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}
