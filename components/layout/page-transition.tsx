'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { premiumEase } from '@/components/ui/motion-primitives'

export function PageTransition({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const reduceMotion = useReducedMotion()

  // This tells React to wait until the client has fully loaded the server's HTML
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // During Server-Side Rendering AND the first client paint, return a plain HTML div.
  // This perfectly matches what Next.js expects and prevents the Suspense mismatch.
  if (!isMounted || reduceMotion) {
    return <div className="motion-page min-w-0">{children}</div>
  }

  // Once safely mounted on the client, swap in the animated Framer Motion component
  return (
    <motion.div
      className="motion-page min-w-0"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: premiumEase }}
    >
      {children}
    </motion.div>
  )
}