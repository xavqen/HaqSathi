import * as React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton-shimmer rounded-2xl bg-slate-200/80', className)}
      {...props}
    />
  )
}

export function LoadingCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft', className)}>
      <Skeleton className="h-11 w-11" />
      <Skeleton className="mt-5 h-5 w-3/4" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-6 h-10 w-32 rounded-full" />
    </div>
  )
}
