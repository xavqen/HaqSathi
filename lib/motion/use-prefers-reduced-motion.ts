'use client'

import { useEffect, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Hydration-safe reduced-motion preference hook.
 *
 * Framer Motion's useReducedMotion() can change animation props between the
 * server render and the first client render, which may create React hydration
 * diffs in Next.js 16. This hook starts with a stable SSR/client value and
 * updates only after mount.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false)

  useEffect((): (() => void) | undefined => {
    if (typeof globalThis.matchMedia !== 'function') return undefined

    const mediaQueryList = globalThis.matchMedia(REDUCED_MOTION_QUERY)
    const updatePreference = (): void => setPrefersReducedMotion(mediaQueryList.matches)

    updatePreference()
    mediaQueryList.addEventListener('change', updatePreference)
    return (): void => mediaQueryList.removeEventListener('change', updatePreference)
  }, [])

  return prefersReducedMotion
}
