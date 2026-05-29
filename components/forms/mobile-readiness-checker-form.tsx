'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

type Report = { pageName?: string; score?: number; grade?: string; fixes?: string[]; checklist?: string[]; error?: string }

export function MobileReadinessCheckerForm() {
  const [result, setResult] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(formData: FormData) {
    setLoading(true)
    const normalized = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/mobile-readiness', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(normalized) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Server JSON error' }))
    setLoading(false)
    setResult(data.ok ? data.result : { error: data.error || 'Mobile check failed' })
  }

  return (
    <div className="rounded-[2rem] border bg-white p-4 shadow-soft sm:p-6">
      <form action={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2"><Label>Page / feature name</Label><Input name="pageName" defaultValue="Complaint Generator" className="h-12 text-base" /></div>
        <div className="grid gap-2"><Label>Primary button size</Label><Select name="buttonSize" defaultValue="LARGE" className="h-12 text-base"><option value="LARGE">Large / thumb friendly</option><option value="MEDIUM">Medium</option><option value="SMALL">Small</option></Select></div>
        <div className="grid gap-2"><Label>Form fields count</Label><Input name="formFields" type="number" defaultValue="8" min="0" max="80" className="h-12 text-base" /></div>
        <div className="grid gap-2"><Label>Sticky header?</Label><Select name="hasStickyHeader" defaultValue="true" className="h-12 text-base"><option value="true">Yes</option><option value="false">No</option></Select></div>
        <div className="grid gap-2"><Label>Horizontal header nav?</Label><Select name="hasHorizontalNav" defaultValue="true" className="h-12 text-base"><option value="true">Yes</option><option value="false">No</option></Select></div>
        <div className="grid gap-2"><Label>Long text blocks?</Label><Select name="usesLongText" defaultValue="false" className="h-12 text-base"><option value="false">No</option><option value="true">Yes</option></Select></div>
        <div className="grid gap-2"><Label>Low bandwidth friendly?</Label><Select name="supportsLowBandwidth" defaultValue="true" className="h-12 text-base"><option value="true">Yes</option><option value="false">No</option></Select></div>
        <div className="grid gap-2"><Label>Language selector visible?</Label><Select name="languageSelectorVisible" defaultValue="true" className="h-12 text-base"><option value="true">Yes</option><option value="false">No</option></Select></div>
        <div className="sm:col-span-2"><Button disabled={loading} size="lg" className="w-full rounded-2xl sm:w-auto">{loading ? 'Checking...' : 'Check mobile readiness'}</Button></div>
      </form>
      {result && <div className="mt-6 rounded-3xl bg-slate-50 p-5">{result.error ? <p className="font-bold text-red-700">{result.error}</p> : <><p className="text-sm font-bold text-slate-500">{result.pageName}</p><h2 className="mt-1 text-4xl font-black text-primary">{result.score}/100</h2><p className="mt-2 font-bold">{result.grade}</p><div className="mt-4 grid gap-4 md:grid-cols-2"><List title="Fixes" items={result.fixes || []} /><List title="QA checklist" items={result.checklist || []} /></div></>}</div>}
    </div>
  )
}

function List({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl bg-white p-4"><b>{title}</b><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>
}
