import * as React from 'react'
import { cn } from '@/lib/utils'

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'premium-form-control flex h-12 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'
