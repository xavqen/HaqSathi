'use client'

import { useEffect, useRef } from 'react'

type ErrorPayload = {
  message: string
  path: string
  url: string
  source: string
  stack?: string
  userAgent: string
  release: string
  level?: 'info' | 'warning' | 'error' | 'critical'
}

function sendError(payload: ErrorPayload) {
  return fetch('/api/system/client-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => undefined)
}

export function ClientErrorListener() {
  const sentFingerprints = useRef(new Map<string, number>())

  useEffect(() => {
    const buildPayload = (message: string, source: string, stack?: string): ErrorPayload => ({
      message: String(message || 'Unknown browser error').slice(0, 700),
      path: window.location.pathname,
      url: window.location.href,
      source,
      stack: stack?.slice(0, 1200),
      userAgent: window.navigator.userAgent,
      release: process.env.NEXT_PUBLIC_APP_VERSION || 'local',
      level: /chunkloaderror|hydration|failed|unhandled|exception|error/i.test(message) ? 'error' : 'warning'
    })

    const shouldSend = (payload: ErrorPayload) => {
      const now = Date.now()
      const key = `${payload.source}:${payload.path}:${payload.message.slice(0, 120)}`
      const previous = sentFingerprints.current.get(key) || 0
      if (now - previous < 30_000) return false
      sentFingerprints.current.set(key, now)
      return true
    }

    const capture = (payload: ErrorPayload) => {
      if (shouldSend(payload)) sendError(payload)
    }

    const onError = (event: ErrorEvent) => {
      capture(buildPayload(event.message, 'window.error', event.error?.stack))
    }

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || 'Unhandled promise rejection')
      const stack = event.reason instanceof Error ? event.reason.stack : undefined
      capture(buildPayload(reason, 'window.unhandledrejection', stack))
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}
