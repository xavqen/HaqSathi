'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function EvidenceTimelineBuilderForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/evidence-timeline-builder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <Card><CardHeader><CardTitle>Evidence Timeline Builder</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
      <div><Label>Issue type</Label><select name="issueType" className="mt-2 w-full rounded-xl border px-3 py-2"><option>REFUND</option><option>UPI</option><option>BANK</option><option>CYBER_FRAUD</option><option>ECOMMERCE</option><option>DOCUMENT</option><option>SCHEME</option><option>EDUCATION</option><option>TRAVEL</option><option>INSURANCE</option><option>OTHER</option></select></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><Label>Company/office</Label><Input name="companyName" /></div><div><Label>Reference ID</Label><Input name="referenceId" /></div></div>
      <div><Label>Events / timeline</Label><Textarea name="eventsText" required rows={7} placeholder="Example: 12 May order placed; 15 May payment deducted; 18 May refund promised; 25 May no refund..." /></div>
      <div><Label>Evidence you already have</Label><Textarea name="evidenceText" rows={5} placeholder="Invoice, screenshot, UTR, support chat, email..." /></div>
      <div><Label>Target outcome</Label><Input name="targetOutcome" placeholder="Refund / written status / correction / escalation" /></div>
      <Button disabled={loading} className="w-full">{loading ? 'Building...' : 'Build evidence timeline'}</Button>
    </form></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle>{result.title}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-3xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Readiness</p><p className="text-4xl font-black text-slate-950">{result.readinessScore}/100</p><p className="font-bold text-primary">{result.nextBestAction}</p></div><div><p className="font-bold">Timeline</p><ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-600">{result.timeline.map((x:any)=><li key={x.step}><b>{x.event}</b><br />Proof: {x.proofNeeded}</li>)}</ol></div><div><p className="font-bold">Missing proof</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{result.missingEvidence.map((x:string)=><li key={x}>{x}</li>)}</ul></div></CardContent></Card> : null}
  </div>
}
