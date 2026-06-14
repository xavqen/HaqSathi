'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { premiumEase } from '@/components/ui/motion-primitives'

export function RouteProgress() {
  const pathname = usePathname()
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(true)
    const hide = window.setTimeout(() => setActive(false), 520)
    return () => window.clearTimeout(hide)
  }, [pathname])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden="true"
          className="fixed left-0 top-0 z-[90] h-1 w-screen origin-left rounded-r-full bg-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.38)]"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.46, ease: premiumEase }}
        />
      )}
    </AnimatePresence>
  )
}