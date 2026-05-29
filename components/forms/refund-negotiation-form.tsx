'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'

export function RefundNegotiationForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/refund-negotiation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <Card><CardHeader><CardTitle>Refund Negotiation Builder</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2"><div><Label>Company</Label><Input name="companyName" /></div><div><Label>Amount</Label><Input name="amount" /></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><Label>Issue type</Label><select name="issueType" className="mt-2 w-full rounded-xl border px-3 py-2"><option>REFUND_DELAY</option><option>DEFECTIVE_PRODUCT</option><option>WRONG_ITEM</option><option>SERVICE_NOT_PROVIDED</option><option>CANCELLATION</option><option>EDUCATION_FEE</option><option>TRAVEL_REFUND</option><option>OTHER</option></select></div><div><Label>Days pending</Label><Input name="daysPending" type="number" defaultValue="7" /></div></div>
      <div><Label>Tone</Label><select name="tone" className="mt-2 w-full rounded-xl border px-3 py-2"><option>FIRM</option><option>POLITE</option><option>URGENT</option><option>LAST_ESCALATION</option></select></div>
      <div><Label>Previous response</Label><Textarea name="previousResponse" rows={3} /></div><div><Label>Evidence</Label><Textarea name="evidence" rows={3} /></div>
      <Button disabled={loading} className="w-full">{loading ? 'Building...' : 'Build negotiation plan'}</Button>
    </form></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle>{result.title}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-3xl font-black">{result.negotiationScore}/100</p><p className="font-bold text-primary">{result.position}</p>{result.messageLadder.map((m:any)=><div key={m.day} className="rounded-2xl bg-slate-50 p-4"><p className="font-bold">{m.day} · {m.channel}</p><p className="mt-2 text-sm text-slate-700">{m.text}</p><CopyButton text={m.text} /></div>)}<p className="text-xs text-slate-500">{result.disclaimer}</p></CardContent></Card> : null}
  </div>
}
