'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <div className="group/tooltip relative inline-flex">{children}</div>
}

export function TooltipTrigger({
  children,
  asChild,
  className,
  ...props
}: { children: React.ReactNode; asChild?: boolean } & React.HTMLAttributes<HTMLElement>) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      className: cn((children as React.ReactElement<any>).props.className, className),
    })
  }
  return (
    <span className={cn('inline-flex', className)} {...props}>
      {children}
    </span>
  )
}

export function TooltipContent({
  children,
  className,
  sideOffset = 4,
  side = 'bottom',
  ...props
}: {
  children: React.ReactNode
  sideOffset?: number
  side?: 'top' | 'bottom' | 'left' | 'right'
} & React.HTMLAttributes<HTMLDivElement>) {
  const positionClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1',
  }[side]
  return (
    <div
      role="tooltip"
      className={cn(
        'pointer-events-none absolute z-50 hidden overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md group-hover/tooltip:block',
        positionClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
