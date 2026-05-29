'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'
import { LANGUAGE_OPTIONS } from '@/lib/i18n/languages'

type Plan = {
  title?: string
  plan?: Array<{ step: number; label: string; dueDate: string; channel: string; subject: string; message: string; status: string }>
  copyPack?: string
  remindersToCreate?: Array<{ title: string; dueDate: string }>
  disclaimer?: string
  error?: string
}

export function FollowUpAutomationForm() {
  const [result, setResult] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  async function submit(formData: FormData) {
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/tools/follow-up-automation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Server JSON error' }))
    setLoading(false)
    setResult(data.ok ? data.result : { error: data.error || 'Automation failed' })
  }

  return (
    <div className="rounded-[2rem] border bg-white p-4 shadow-soft sm:p-6">
      <form action={submit} className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2"><Label>Case title</Label><Input name="caseTitle" className="h-12 text-base" placeholder="Flipkart refund not received" required /></div>
        <div className="grid gap-2"><Label>Case type</Label><Input name="caseType" className="h-12 text-base" placeholder="Refund / UPI / bank / document" required /></div>
        <div className="grid gap-2"><Label>Company/bank</Label><Input name="companyName" className="h-12 text-base" /></div>
        <div className="grid gap-2"><Label>Reference ID</Label><Input name="referenceId" className="h-12 text-base" /></div>
        <div className="grid gap-2"><Label>Start date</Label><Input name="startDate" type="date" defaultValue={today} className="h-12 text-base" required /></div>
        <div className="grid gap-2"><Label>Channel</Label><Select name="channel" defaultValue="EMAIL" className="h-12 text-base"><option value="EMAIL">Email</option><option value="WHATSAPP">WhatsApp</option><option value="CALL">Call</option><option value="APP_REMINDER">App reminder</option></Select></div>
        <div className="grid gap-2"><Label>Urgency</Label><Select name="urgency" defaultValue="NORMAL" className="h-12 text-base"><option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="FRAUD">Fraud / urgent</option></Select></div>
        <div className="grid gap-2"><Label>Preferred language</Label><Select name="preferredLanguage" defaultValue="ENGLISH" className="h-12 text-base">{LANGUAGE_OPTIONS.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}</Select></div>
        <div className="lg:col-span-2"><Button disabled={loading} size="lg" className="w-full rounded-2xl sm:w-auto">{loading ? 'Planning...' : 'Create follow-up automation'}</Button></div>
      </form>
      {result && <FollowUpResult result={result} />}
    </div>
  )
}

function FollowUpResult({ result }: { result: Plan }) {
  if (result.error) return <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{result.error}</div>
  return (
    <div className="mt-6 space-y-4 rounded-3xl bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-2xl font-black">{result.title}</h2>{result.copyPack && <CopyButton text={result.copyPack} />}</div>
      <div className="grid gap-3">
        {(result.plan || []).map((item) => <div key={item.step} className="rounded-2xl border bg-white p-4"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><b>{item.step}. {item.label}</b><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{item.dueDate} · {item.channel}</span></div><p className="mt-3 text-sm font-semibold text-slate-800">{item.subject}</p><Textarea readOnly value={item.message} className="mt-2 min-h-[90px] bg-slate-50 text-sm" /></div>)}
      </div>
      {result.disclaimer && <p className="text-xs text-slate-500">{result.disclaimer}</p>}
    </div>
  )
}
