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
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-3xl border bg-white p-4 shadow-2xl">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-bold text-slate-950">Cookie & analytics notice</p>
          <p className="mt-1 text-sm text-slate-600">HaqSathi basic cookies session ke liye use karta hai. Analytics optional hai aur production me hi enable hota hai.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={minimal}>Only necessary</Button>
          <Button type="button" onClick={accept}>Accept</Button>
        </div>
      </div>
    </div>
  )
}
