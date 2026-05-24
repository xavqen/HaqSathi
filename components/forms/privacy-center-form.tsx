'use client'

import { useState } from 'react'
import { CONSENT_TYPES } from '@/lib/privacy/consent'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Consent = { type: string; granted: boolean; createdAt: string }

export function PrivacyCenterForm({ latest }: { latest: Record<string, Consent | undefined> }) {
  const [message, setMessage] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  async function save(type: string, granted: boolean) {
    setMessage(null)
    const res = await fetch('/api/privacy/consent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, granted }) })
    const data = await res.json().catch(() => ({ ok: false }))
    setMessage(data.ok ? 'Preference saved.' : data.error || 'Save failed')
  }

  async function deletionRequest() {
    setMessage(null)
    const res = await fetch('/api/privacy/deletion-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) })
    const data = await res.json().catch(() => ({ ok: false }))
    setMessage(data.ok ? 'Deletion request submitted. Admin review karega.' : data.error || 'Request failed')
  }

  return <div className="grid gap-6">
    <div className="rounded-3xl border bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold">Privacy controls</h2>
      <div className="mt-5 grid gap-4">
        {CONSENT_TYPES.map((item) => {
          const current = latest[item.key]?.granted ?? true
          return <div key={item.key} className="rounded-2xl border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">{item.label}</p>
                <p className="text-sm text-slate-600">{item.help}</p>
                <p className="mt-1 text-xs text-slate-500">Current: {current ? 'Allowed' : 'Disabled'}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant={current ? 'default' : 'secondary'} onClick={() => save(item.key, true)}>Allow</Button>
                <Button type="button" variant={!current ? 'default' : 'secondary'} onClick={() => save(item.key, false)}>Disable</Button>
              </div>
            </div>
          </div>
        })}
      </div>
      {message && <p className="mt-4 text-sm font-semibold text-brand-700">{message}</p>}
    </div>

    <div className="rounded-3xl border bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold">Delete my account/data request</h2>
      <p className="mt-2 text-sm text-slate-600">Yeh instant delete nahi karega. Admin review ke baad data export/deletion process follow hoga.</p>
      <Textarea className="mt-4" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason optional" />
      <Button type="button" className="mt-4" variant="secondary" onClick={deletionRequest}>Submit deletion request</Button>
    </div>
  </div>
}
