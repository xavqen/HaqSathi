'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type ResponseBody = { ok?: boolean; alreadyVerified?: boolean; skipped?: boolean; devVerifyUrl?: string; error?: string }

export function EmailVerificationResendForm() {
  const [message, setMessage] = useState('')
  const [devLink, setDevLink] = useState('')
  const [loading, setLoading] = useState(false)

  async function resend() {
    setLoading(true)
    setMessage('Sending verification email...')
    setDevLink('')
    const res = await fetch('/api/auth/email-verification/request', { method: 'POST' })
    const data = (await res.json().catch(() => ({ ok: false, error: 'Request failed' }))) as ResponseBody
    setLoading(false)
    if (data.alreadyVerified) setMessage('Email already verified.')
    else if (data.ok) setMessage(data.skipped ? 'Email logged as SKIPPED. Add RESEND_API_KEY to send real email.' : 'Verification email sent.')
    else setMessage(data.error || 'Could not send verification email.')
    if (data.devVerifyUrl) setDevLink(data.devVerifyUrl)
  }

  return <div className="space-y-3"><Button onClick={resend} disabled={loading}>{loading ? 'Sending...' : 'Resend verification email'}</Button>{message && <p className="text-sm text-slate-600">{message}</p>}{devLink && <p className="break-all rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><b>Local dev verify link:</b><br /><a className="underline" href={devLink}>{devLink}</a></p>}</div>
}
