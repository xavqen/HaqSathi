'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const KEY = 'haqsathi_cookie_consent_v1'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!window.localStorage.getItem(KEY))
  }, [])

  function accept() {
    window.localStorage.setItem(KEY, 'accepted')
    setVisible(false)
  }

  function minimal() {
    window.localStorage.setItem(KEY, 'minimal')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-3 bottom-[calc(86px+env(safe-area-inset-bottom))] z-[80] mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/97 p-3 shadow-2xl backdrop-blur md:bottom-4 md:left-auto md:right-4 md:mx-0 md:max-w-md md:p-4">
      <div className="grid gap-3">
        <div className="min-w-0">
          <p className="font-bold text-slate-950">Cookie & analytics notice</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">HaqSathi uses basic cookies for sessions. Analytics is optional and only enabled in production.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={minimal} className="w-full sm:w-auto">Only necessary</Button>
          <Button type="button" onClick={accept} className="w-full sm:w-auto">Accept</Button>
        </div>
      </div>
    </div>
  )
}
