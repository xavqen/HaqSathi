'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ServiceCenterLocatorForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = {
      ...Object.fromEntries(formData.entries()),
      onlinePreferred: formData.get('onlinePreferred') === 'on'
    }
    const res = await fetch('/api/tools/service-center-locator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <Card><CardHeader><CardTitle>Find best route</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3"><div><Label>Issue type</Label><select name="issueType" className="mt-2 w-full rounded-xl border px-3 py-2"><option>BANK</option><option>UPI</option><option>CYBER_FRAUD</option><option>ECOMMERCE</option><option>TELECOM</option><option>ELECTRICITY</option><option>EDUCATION</option><option>DOCUMENT</option><option>SCHEME</option><option>INSURANCE</option><option>TRAVEL</option><option>OTHER</option></select></div><div><Label>State</Label><Input name="state" required placeholder="Bihar" /></div><div><Label>City</Label><Input name="city" required placeholder="Patna" /></div></div>
      <div><Label>Urgency</Label><select name="urgency" className="mt-2 w-full rounded-xl border px-3 py-2"><option>NORMAL</option><option>URGENT</option><option>EMERGENCY</option></select></div>
      <div><Label>What help do you need?</Label><Textarea name="userNeed" required rows={5} placeholder="Explain your issue and where you are stuck..." /></div>
      <label className="flex gap-2 text-sm text-slate-700"><input name="onlinePreferred" type="checkbox" defaultChecked /> Online-first route preferred</label>
      <Button disabled={loading} className="w-full">{loading ? 'Finding route...' : 'Create route plan'}</Button>
    </form></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle>{result.title}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-3xl bg-emerald-50 p-4"><p className="font-bold text-emerald-900">{result.location}</p><p className="text-sm text-emerald-800">{result.firstMode}</p></div><div className="space-y-3">{result.recommendedRoutes.map((r:any)=><div key={r.step} className="rounded-2xl border p-3"><p className="font-bold">Step {r.step}: {r.name}</p><p className="text-sm text-slate-600">{r.action}</p></div>)}</div><div><p className="font-bold">Visit checklist</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{result.visitChecklist.map((x:string)=><li key={x}>{x}</li>)}</ul></div><p className="text-xs text-slate-500">{result.disclaimer}</p></CardContent></Card> : null}
  </div>
}
