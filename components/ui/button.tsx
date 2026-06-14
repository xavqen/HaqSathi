// Performance note: previous motion whileTap scale: 0.98 [0.16, 1, 0.3, 1] will-change-transform behavior is now CSS-only to avoid loading framer-motion in every button.
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'premium-interactive inline-flex min-h-11 min-w-0 transform-gpu items-center justify-center gap-2 whitespace-normal rounded-xl text-center text-sm font-semibold leading-tight ring-offset-background transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] sm:whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-primary/90',
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: 'border border-border bg-background hover:-translate-y-0.5 hover:bg-muted',
        secondary: 'bg-muted text-foreground hover:-translate-y-0.5 hover:bg-muted/80',
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

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, disabled, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled}
    className={cn(buttonVariants({ variant, size, className }))}
    {...props}
  />
))
Button.displayName = 'Button'
