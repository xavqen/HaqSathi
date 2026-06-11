'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, ShieldCheck, Trash2 } from 'lucide-react'
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
    <div className="rounded-3xl border bg-white p-4 shadow-soft sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><ShieldCheck className="h-5 w-5" /></span>
        <div className="min-w-0">
          <h2 className="text-xl font-bold">Privacy controls</h2>
          <p className="mt-1 text-sm text-slate-600">Consent, export aur deletion request ko same place se manage karo.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        {CONSENT_TYPES.map((item) => {
          const current = latest[item.key]?.granted ?? true
          return <div key={item.key} className="rounded-2xl border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-bold">{item.label}</p>
                <p className="text-sm leading-6 text-slate-600">{item.help}</p>
                <p className="mt-1 text-xs text-slate-500">Current: {current ? 'Allowed' : 'Disabled'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                <Button type="button" variant={current ? 'default' : 'secondary'} onClick={() => save(item.key, true)}>Allow</Button>
                <Button type="button" variant={!current ? 'default' : 'secondary'} onClick={() => save(item.key, false)}>Disable</Button>
              </div>
            </div>
          </div>
        })}
      </div>
      {message && <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-brand-700">{message}</p>}
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border bg-white p-4 shadow-soft sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><Download className="h-5 w-5" /></span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Download my data</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Apna saved complaints, reminders, document-vault metadata, support tickets aur activity JSON format me export karo.</p>
          </div>
        </div>
        <Link href="/api/dashboard/export/data" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground sm:w-auto">
          Download my data
        </Link>
      </div>

      <div className="rounded-3xl border bg-white p-4 shadow-soft sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700"><Trash2 className="h-5 w-5" /></span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Delete my account/data request</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Yeh instant delete nahi karega. Admin review ke baad export/deletion process follow hoga.</p>
          </div>
        </div>
        <Textarea className="mt-4" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason optional" />
        <Button type="button" className="mt-4 w-full sm:w-auto" variant="secondary" onClick={deletionRequest}>Submit deletion request</Button>
      </div>
    </div>
  </div>
}
