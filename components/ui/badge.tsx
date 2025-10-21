'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        thought:
          'border-black bg-white text-black hover:bg-green-50 hover:border-green-500',
        emotion:
          'border-transparent bg-gradient-to-r from-pink-500 to-purple-600 text-white',
        memory:
          'border-transparent bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
        idea:
          'border-transparent bg-gradient-to-r from-green-500 to-emerald-600 text-white',
        feature:
          'border-transparent bg-gradient-to-r from-orange-500 to-red-600 text-white',
        event:
          'border-transparent bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
        grow:
          'border-transparent bg-gradient-to-r from-green-500 to-emerald-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
