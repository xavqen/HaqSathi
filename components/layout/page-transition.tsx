'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-reduced-motion'
import { premiumEase } from '@/components/ui/motion-primitives'

export function PageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <motion.div
      suppressHydrationWarning
      className="motion-page min-w-0"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: premiumEase }}
    >
      {children}
    </motion.div>
  )
}
