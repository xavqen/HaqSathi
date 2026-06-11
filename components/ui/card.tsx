'use client'

import * as React from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

const ultraEase = [0.16, 1, 0.3, 1] as const

export function Card({ className, ...props }: HTMLMotionProps<'div'>) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={cn('card min-w-0 max-w-full transform-gpu rounded-[1.35rem] border border-border bg-card text-card-foreground shadow-soft will-change-transform sm:rounded-2xl', className)}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.28, ease: ultraEase }}
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
