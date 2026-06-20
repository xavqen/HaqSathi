'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const CONSENT_KEY = 'haqsathi_cookie_consent_v1'

function analyticsEnabled() {
  return process.env.NEXT_PUBLIC_FIRST_PARTY_ANALYTICS === 'true'
}

function consentAccepted() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(CONSENT_KEY) === 'accepted'
}

function cleanPath(pathname: string, search: string) {
  const params = new URLSearchParams(search)
  const kept = new URLSearchParams()
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = params.get(key)
    if (value) kept.set(key, value.slice(0, 80))
  }
  const query = kept.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function FirstPartyAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (!analyticsEnabled() || !consentAccepted()) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      void fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        keepalive: true,
        signal: controller.signal,
        body: JSON.stringify({
          event: 'page_view',
          path: cleanPath(pathname, window.location.search),
          referrer: document.referrer ? new URL(document.referrer).hostname : '',
          viewport: { width: window.innerWidth, height: window.innerHeight },
          language: document.documentElement.lang || navigator.language,
          source: 'first_party_client'
        })
      }).catch(() => undefined)
    }, 900)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [pathname])

  return null
}
