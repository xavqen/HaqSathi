import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'premium-form-control flex min-h-[120px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none ring-offset-background placeholder:text-muted-foreground disabled:opacity-50',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
