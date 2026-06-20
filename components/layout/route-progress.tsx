'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/lib/motion/use-prefers-reduced-motion'
import { premiumEase } from '@/components/ui/motion-primitives'

export function RouteProgress() {
  const pathname = usePathname()
  const reduceMotion = usePrefersReducedMotion()
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (reduceMotion) return
    setActive(true)
    const hide = setTimeout(() => setActive(false), 520)
    return () => clearTimeout(hide)
  }, [pathname, reduceMotion])

  if (reduceMotion) return null

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          aria-hidden="true"
          suppressHydrationWarning
          className="fixed left-0 top-0 z-[90] h-1 w-screen origin-left rounded-r-full bg-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.38)]"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.46, ease: premiumEase }}
        />
      ) : null}
    </AnimatePresence>
  )
}
