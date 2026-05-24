'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

export function EvidenceChecklistForm() {
  const [result, setResult] = useState<any>(null)

  async function submit(formData: FormData) {
    const res = await fetch('/api/tools/evidence-checklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false }))
    setResult(data.ok ? data.checklist : null)
  }

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-soft">
      <form action={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1"><Label>Case type</Label><Select name="category" defaultValue="refund"><option value="refund">Refund / shopping</option><option value="fraud">Cyber fraud</option><option value="scheme">Scholarship / scheme</option><option value="document">Document application</option></Select></div>
        <Button>Generate checklist</Button>
      </form>
      {result && <div className="mt-6 grid gap-4 md:grid-cols-2"><div><p className="font-bold">Required</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{result.required.map((x: string) => <li key={x}>{x}</li>)}</ul></div><div><p className="font-bold">Category-specific</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{result.categorySpecific.map((x: string) => <li key={x}>{x}</li>)}</ul></div><p className="md:col-span-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{result.note}</p></div>}
    </div>
  )
}
