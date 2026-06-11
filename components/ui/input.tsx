import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'premium-form-control flex h-12 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none ring-offset-background placeholder:text-muted-foreground disabled:opacity-50',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'
