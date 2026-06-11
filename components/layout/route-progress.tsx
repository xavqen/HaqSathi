'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { premiumEase } from '@/components/ui/motion-primitives'

export function RouteProgress() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 1. Tell React when the component has safely mounted in the browser
  useEffect(() => {
    setMounted(true)
  }, [])

  // 2. Safely handle the progress bar state only after mounting
  useEffect(() => {
    if (!mounted || reduceMotion) return
    setActive(true)
    const hide = window.setTimeout(() => setActive(false), 520)
    return () => window.clearTimeout(hide)
  }, [pathname, reduceMotion, mounted])

  // 3. Force the Server AND the initial Client paint to both output `null`. 
  // This completely eliminates the hydration mismatch!
  if (!mounted || reduceMotion) return null

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          aria-hidden="true"
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
