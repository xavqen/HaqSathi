'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

export function RiskAssessmentForm() {
  const [result, setResult] = useState<any>(null)
  async function submit(formData: FormData) {
    const res = await fetch('/api/tools/risk-assessment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false }))
    setResult(data.ok ? data.result : { error: data.error || 'Failed' })
  }
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-soft">
      <form action={submit} className="grid gap-4 md:grid-cols-2">
        <div><Label>Issue type</Label><Input name="issueType" placeholder="UPI fraud, refund delay..." required /></div>
        <div><Label>Amount</Label><Input name="amount" placeholder="5000" /></div>
        <div><Label>Days passed</Label><Input name="daysPassed" placeholder="7" /></div>
        <div><Label>Fraud involved?</Label><Select name="hasFraud" defaultValue="no"><option value="no">No</option><option value="yes">Yes</option></Select></div>
        <div><Label>Bank/company responded?</Label><Select name="bankResponded" defaultValue="not-needed"><option value="not-needed">Not needed</option><option value="yes">Yes</option><option value="no">No</option></Select></div>
        <div className="flex items-end"><Button>Assess risk</Button></div>
      </form>
      {result && <div className="mt-6 rounded-2xl bg-slate-50 p-5"><p className="text-2xl font-black">Risk: {result.level || result.error}</p>{result.actions && <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">{result.actions.map((x: string) => <li key={x}>{x}</li>)}</ul>}<p className="mt-3 text-xs text-slate-500">{result.disclaimer}</p></div>}
    </div>
  )
}
