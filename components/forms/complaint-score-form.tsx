'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ComplaintScoreForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function submit(formData: FormData) {
    setLoading(true)
    const res = await fetch('/api/tools/complaint-score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) })
    const data = await res.json().catch(() => ({ ok: false, error: 'Server JSON error' }))
    setLoading(false)
    setResult(data.ok ? data.result : { error: data.error || 'Failed' })
  }

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-soft">
      <form action={submit} className="grid gap-4 md:grid-cols-2">
        <div><Label>Company/bank name</Label><Input name="companyName" /></div>
        <div><Label>Order/transaction ID</Label><Input name="transactionId" /></div>
        <div><Label>Amount</Label><Input name="amount" /></div>
        <div><Label>Issue date</Label><Input name="issueDate" type="date" /></div>
        <div className="md:col-span-2"><Label>Issue description</Label><Textarea name="description" rows={4} /></div>
        <div><Label>Desired resolution</Label><Input name="desiredResolution" placeholder="Refund / replacement / reversal" /></div>
        <div><Label>Previous communication</Label><Input name="previousCommunication" placeholder="Ticket number, email, chat etc." /></div>
        <div className="md:col-span-2"><Button disabled={loading}>{loading ? 'Checking...' : 'Check strength'}</Button></div>
      </form>
      {result && <div className="mt-6 rounded-2xl bg-slate-50 p-5"><p className="text-2xl font-black">{result.score ?? 0}/100 · {result.grade || result.error}</p>{result.tips && <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">{result.tips.map((tip: string) => <li key={tip}>{tip}</li>)}</ul>}</div>}
    </div>
  )
}
