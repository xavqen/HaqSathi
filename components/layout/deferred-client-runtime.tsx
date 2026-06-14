'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const PwaRegister = dynamic(() => import('@/components/layout/pwa-register').then((mod) => mod.PwaRegister), { ssr: false })
const RouteProgress = dynamic(() => import('@/components/layout/route-progress').then((mod) => mod.RouteProgress), { ssr: false })
const AnalyticsScripts = dynamic(() => import('@/components/layout/analytics-scripts').then((mod) => mod.AnalyticsScripts), { ssr: false })
const FirstPartyAnalytics = dynamic(() => import('@/components/layout/first-party-analytics').then((mod) => mod.FirstPartyAnalytics), { ssr: false })
const ClientErrorListener = dynamic(() => import('@/components/layout/client-error-listener').then((mod) => mod.ClientErrorListener), { ssr: false })
const FloatingFeedback = dynamic(() => import('@/components/layout/floating-feedback').then((mod) => mod.FloatingFeedback), { ssr: false })
const CookieConsent = dynamic(() => import('@/components/layout/cookie-consent').then((mod) => mod.CookieConsent), { ssr: false })
const MobileBottomActions = dynamic(() => import('@/components/layout/mobile-bottom-actions').then((mod) => mod.MobileBottomActions), { ssr: false })

function onIdle(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout: 1600 })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(callback, 700)
  return () => clearTimeout(id)
}

export function DeferredClientRuntime() {
  const [ready, setReady] = useState(false)

  useEffect(() => onIdle(() => setReady(true)), [])

  if (!ready) return null

  return (
    <>
      <PwaRegister />
      <RouteProgress />
      <AnalyticsScripts />
      <FirstPartyAnalytics />
      <ClientErrorListener />
      <FloatingFeedback />
      <CookieConsent />
      <MobileBottomActions />
    </>
  )
}
