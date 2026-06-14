'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { premiumEase } from '@/components/ui/motion-primitives'

export function PageTransition({ children }: { children: ReactNode }) {
  // ❌ NO MORE useReducedMotion() HERE!
  
  return (
    <motion.div
      className="motion-page min-w-0"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ 
        duration: 0.28, 
        ease: premiumEase 
      }}
    >
      {children}
    </motion.div>
  )
}