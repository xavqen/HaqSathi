// Performance note: previous motion.div whileHover useReducedMotion [0.16, 1, 0.3, 1] behavior is now CSS-only to avoid loading framer-motion in every card.
import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'card min-w-0 max-w-full transform-gpu rounded-[1.35rem] border border-border bg-card text-card-foreground shadow-soft transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(15,23,42,0.09)] sm:rounded-2xl',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('min-w-0 space-y-2 p-4 sm:p-6', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('min-w-0 text-lg font-bold tracking-tight text-balance text-slate-950 sm:text-xl', className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('min-w-0 text-sm leading-6 text-muted-foreground', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('min-w-0 p-4 pt-0 sm:p-6 sm:pt-0', className)} {...props} />
}
