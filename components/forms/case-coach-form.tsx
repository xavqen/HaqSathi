'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'
import { LANGUAGE_OPTIONS } from '@/lib/i18n/languages'

type Report = {
  score?: number
  grade?: string
  language?: string
  strengths?: string[]
  missing?: string[]
  nextBestActions?: string[]
  improvedOpening?: string
  escalationReadiness?: string
  safeWarnings?: string[]
  disclaimer?: string
  error?: string
}

export function CaseCoachForm() {
  const [result, setResult] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(formData: FormData) {
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/tools/case-coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Server JSON error' }))
    setLoading(false)
    setResult(data.ok ? data.result : { error: data.error || 'Coach failed' })
  }

  return (
    <div className="rounded-[2rem] border bg-white p-4 shadow-soft sm:p-6">
      <form action={submit} className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2"><Label>Case type</Label><Input name="caseType" className="h-12 text-base" placeholder="Refund / UPI / bank / scholarship" required /></div>
        <div className="grid gap-2"><Label>Company/bank/authority</Label><Input name="companyName" className="h-12 text-base" placeholder="Amazon, SBI, college, portal" /></div>
        <div className="grid gap-2"><Label>Amount</Label><Input name="amount" className="h-12 text-base" placeholder="1299" /></div>
        <div className="grid gap-2"><Label>Issue date</Label><Input name="issueDate" type="date" className="h-12 text-base" /></div>
        <div className="grid gap-2"><Label>Transaction/order/reference ID</Label><Input name="transactionId" className="h-12 text-base" /></div>
        <div className="grid gap-2"><Label>Goal</Label><Input name="goal" className="h-12 text-base" placeholder="Refund / reversal / written response" /></div>
        <div className="grid gap-2 lg:col-span-2"><Label>Your complaint draft / issue details</Label><Textarea name="complaintDraft" rows={8} className="text-base" required /></div>
        <div className="grid gap-2"><Label>Evidence available</Label><Textarea name="evidenceAvailable" rows={4} placeholder="Invoice, UTR, screenshot, chat..." /></div>
        <div className="grid gap-2"><Label>Previous reply</Label><Textarea name="previousReply" rows={4} placeholder="Company/bank ne kya reply diya?" /></div>
        <div className="grid gap-2 lg:col-span-2"><Label>Report language</Label><Select name="language" defaultValue="ENGLISH" className="h-12 text-base">{LANGUAGE_OPTIONS.map((language) => <option key={language.code} value={language.code}>{language.label} — {language.nativeName}</option>)}</Select></div>
        <div className="lg:col-span-2"><Button disabled={loading} size="lg" className="w-full rounded-2xl sm:w-auto">{loading ? 'Coaching...' : 'Run AI Case Coach'}</Button></div>
      </form>
      {result && <CaseCoachResult result={result} />}
    </div>
  )
}

function CaseCoachResult({ result }: { result: Report }) {
  if (result.error) return <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{result.error}</div>
  const score = result.score || 0
  return (
    <div className="mt-6 space-y-4 rounded-3xl bg-slate-50 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div className="rounded-3xl bg-white p-5 text-center shadow-sm"><p className="text-5xl font-black text-primary">{score}</p><p className="text-xs font-bold uppercase text-slate-500">Case score</p></div>
        <div className="rounded-3xl bg-white p-5"><h2 className="text-2xl font-black">{result.grade}</h2><p className="mt-2 text-sm font-semibold text-slate-600">{result.escalationReadiness}</p><p className="mt-1 text-xs text-slate-500">Language: {result.language}</p></div>
      </div>
      {Array.isArray(result.strengths) && <List title="Strong points" items={result.strengths} />}
      {Array.isArray(result.missing) && result.missing.length > 0 && <List title="Missing / weak points" items={result.missing} tone="warn" />}
      {Array.isArray(result.nextBestActions) && <List title="Next best actions" items={result.nextBestActions} />}
      {result.improvedOpening && <div className="rounded-2xl bg-white p-4"><div className="mb-3 flex items-center justify-between"><b>Improved opening draft</b><CopyButton text={result.improvedOpening} /></div><pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">{result.improvedOpening}</pre></div>}
      {Array.isArray(result.safeWarnings) && <List title="Safety warnings" items={result.safeWarnings} tone="warn" />}
      {result.disclaimer && <p className="text-xs text-slate-500">{result.disclaimer}</p>}
    </div>
  )
}

function List({ title, items, tone }: { title: string; items: string[]; tone?: 'warn' }) {
  return <div className={`rounded-2xl p-4 ${tone === 'warn' ? 'border border-amber-200 bg-amber-50 text-amber-950' : 'bg-white text-slate-700'}`}><b>{title}</b><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>
}
