'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function EmailTestButton() {
  const [state, setState] = useState('')
  async function send() {
    setState('Sending...')
    const res = await fetch('/api/email/test', { method: 'POST' })
    const data = await res.json()
    setState(data.ok ? (data.skipped ? 'Logged as SKIPPED: add RESEND_API_KEY to send.' : 'Sent/logged.') : data.error || 'Failed')
  }
  return <div className="flex flex-col items-end gap-2"><Button onClick={send}>Send test email</Button>{state && <p className="text-xs text-slate-600">{state}</p>}</div>
}
