'use client'

import { useEffect } from 'react'

function shouldRegisterPwa() {
  if (process.env.NEXT_PUBLIC_ENABLE_PWA === 'false') return false
  if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_PWA !== 'true') return false
  return true
}

export function PwaRegister() {
  useEffect(() => {
    if (!shouldRegisterPwa()) return
    if (!('serviceWorker' in navigator)) return

    let mounted = true
    let refreshing = false

    const onControllerChange = () => {
      if (refreshing) return
      refreshing = true
      window.dispatchEvent(new CustomEvent('haqsathi:pwa-updated'))
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        if (!mounted) return
        await registration.update().catch(() => undefined)
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          if (!worker) return
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
      } catch {
        // PWA must never block the app shell.
      }
    }

    if (document.readyState === 'complete') {
      void register()
    } else {
      window.addEventListener('load', register, { once: true })
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    return () => {
      mounted = false
      window.removeEventListener('load', register)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  return null
}
