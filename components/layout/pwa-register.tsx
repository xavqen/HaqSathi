'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_PWA !== 'true') return
    if (!('serviceWorker' in navigator)) return

    let refreshing = false
    const onControllerChange = () => {
      if (refreshing) return
      refreshing = true
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.update().catch(() => undefined)
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          if (!worker) return
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
      }).catch(() => undefined)
    })

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
  }, [])

  return null
}
