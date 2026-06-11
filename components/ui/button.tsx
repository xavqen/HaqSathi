'use client'

import * as React from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const ultraEase = [0.16, 1, 0.3, 1] as const

const buttonVariants = cva(
  'inline-flex min-h-11 min-w-0 transform-gpu items-center justify-center gap-2 whitespace-normal rounded-xl text-center text-sm font-semibold leading-tight ring-offset-background transition-colors will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-border bg-background hover:bg-muted',
        secondary: 'bg-muted text-foreground hover:bg-muted/80',
        ghost: 'hover:bg-muted'
      },
      size: {
        default: 'px-4 py-2.5 sm:px-5',
        sm: 'min-h-10 px-3 py-2 text-xs sm:min-h-9 sm:text-sm',
        lg: 'min-h-12 px-5 py-3 text-base sm:px-7'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  }
)

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'className' | 'disabled'>, VariantProps<typeof buttonVariants> {
  className?: string
  disabled?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, disabled, ...props }, ref) => {
  const reduceMotion = useReducedMotion()
  return (
    <motion.button
      ref={ref}
      disabled={disabled}
      whileHover={disabled || reduceMotion ? undefined : { y: -1 }}
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.22, ease: ultraEase }}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
})
Button.displayName = 'Button'
