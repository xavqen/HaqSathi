'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Invite = { code: string; reward?: string | null; email?: string | null }

export function ReferralForm() {
  const [email, setEmail] = useState('')
  const [invite, setInvite] = useState<Invite | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/referrals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Server response error' }))
    setLoading(false)
    if (!data.ok) return setError(data.error || 'Invite create nahi hua')
    setInvite(data.invite)
  }

  const link = invite ? `${window.location.origin}/register?ref=${invite.code}` : ''

  return <form onSubmit={submit} className="space-y-4 rounded-3xl border bg-white p-6 shadow-soft">
    <div>
      <Label>Friend/client email optional</Label>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="friend@example.com" />
    </div>
    <Button disabled={loading}>{loading ? 'Creating...' : 'Create referral link'}</Button>
    {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
    {invite && <div className="rounded-2xl bg-emerald-50 p-4 text-sm">
      <p className="font-bold text-emerald-800">Referral code: {invite.code}</p>
      <p className="mt-1 text-emerald-700">Reward: {invite.reward || 'Bonus usage after successful referral'}</p>
      <div className="mt-3 rounded-xl bg-white p-3 font-mono text-xs text-slate-700 break-all">{link}</div>
      <Button type="button" className="mt-3" variant="secondary" onClick={() => navigator.clipboard.writeText(link)}>Copy link</Button>
    </div>}
  </form>
}
