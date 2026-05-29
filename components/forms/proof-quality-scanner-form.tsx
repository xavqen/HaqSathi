'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

export function ProofQualityScannerForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/proof-quality-scanner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <Card><CardHeader><CardTitle>Proof scanner</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2"><div><Label>Issue type</Label><select name="issueType" className="mt-2 w-full rounded-xl border px-3 py-2"><option>REFUND</option><option>UPI</option><option>BANK</option><option>CYBER_FRAUD</option><option>ECOMMERCE</option><option>EDUCATION</option><option>TRAVEL</option><option>INSURANCE</option><option>DOCUMENT</option><option>OTHER</option></select></div><div><Label>Channel</Label><select name="channel" className="mt-2 w-full rounded-xl border px-3 py-2"><option>COMPANY_SUPPORT</option><option>BANK</option><option>NPCI</option><option>CONSUMER_HELPLINE</option><option>CYBER_PORTAL</option><option>SOCIAL_MEDIA</option><option>OTHER</option></select></div></div>
      <div><Label>Expected outcome</Label><Input name="expectedOutcome" placeholder="Refund credit / written status / account unblock..." /></div>
      <div><Label>Paste proof list or evidence summary</Label><Textarea name="proofText" required rows={10} placeholder="UTR, invoice, ticket, screenshots, chat dates..." /></div>
      <Button disabled={loading} className="w-full">{loading ? 'Scanning...' : 'Scan proof quality'}</Button>
    </form></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle>{result.title}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-3xl bg-slate-50 p-4"><p className="text-sm font-bold uppercase text-emerald-700">{result.grade}</p><p className="text-4xl font-black text-slate-950">{result.score}/100</p></div><div><p className="font-bold">Improve now</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{result.improvementTasks.map((x:string)=><li key={x}>{x}</li>)}</ul></div><div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-950">{result.rewriteEvidenceSummary}</div><p className="text-xs text-slate-500">{result.disclaimer}</p></CardContent></Card> : null}
  </div>
}
