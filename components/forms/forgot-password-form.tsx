'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ForgotResponse = { ok: boolean; message?: string; devResetUrl?: string }

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [devLink, setDevLink] = useState<string | null>(null)
  async function submit() {
    setLoading(true)
    setMsg(null)
    setDevLink(null)
    const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    const data = (await res.json().catch(() => ({ message: 'Request failed' }))) as ForgotResponse
    setLoading(false)
    setMsg(data.message || 'Request received.')
    if (data.devResetUrl) setDevLink(data.devResetUrl)
  }
  return <div className="space-y-4"><div className="grid gap-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div><Button className="w-full" onClick={submit} disabled={loading}>{loading ? 'Submitting...' : 'Send reset link'}</Button>{msg && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{msg}</p>}{devLink && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><b>Local dev reset link:</b><br /><a className="break-all underline" href={devLink}>{devLink}</a></div>}</div>
}
