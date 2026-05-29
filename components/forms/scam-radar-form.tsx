'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'

export function ScamRadarForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/scam-radar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <Card><CardHeader><CardTitle>Scam Radar</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
      <div><Label>Channel</Label><select name="channel" className="mt-2 w-full rounded-xl border px-3 py-2"><option>WHATSAPP</option><option>SMS</option><option>CALL</option><option>EMAIL</option><option>UPI_APP</option><option>SOCIAL_MEDIA</option><option>WEBSITE</option></select></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><Label>Sender/company/UPI ID</Label><Input name="counterparty" placeholder="Optional" /></div><div><Label>Amount</Label><Input name="amount" placeholder="₹ amount if any" /></div></div>
      <div><Label>Paste suspicious message/call summary</Label><Textarea name="messageText" required rows={8} placeholder="Paste SMS, WhatsApp text, call script, website message..." /></div>
      <div><Label>What did you already do?</Label><Textarea name="userActionTaken" rows={3} placeholder="Clicked link? Paid money? Shared OTP? Optional" /></div>
      <Button disabled={loading} className="w-full">{loading ? 'Checking...' : 'Check scam risk'}</Button>
    </form></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle>{result.title}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-3xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Risk score</p><p className="text-4xl font-black text-slate-950">{result.score}/100</p><p className="font-bold text-primary">{result.riskLevel}</p></div><div><p className="font-bold">Immediate steps</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{result.immediateSteps.map((x:string)=><li key={x}>{x}</li>)}</ul></div><div><p className="font-bold">Safe reply</p><pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-white">{result.safeReply}</pre><CopyButton text={result.safeReply} /></div><p className="text-xs text-slate-500">{result.disclaimer}</p></CardContent></Card> : null}
  </div>
}
