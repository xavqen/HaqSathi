'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AgentRevenueSimulatorForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/agent-revenue-simulator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <Card><CardHeader><CardTitle>Agent Revenue Simulator</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
      <div><Label>City/area</Label><Input name="city" placeholder="Patna / Delhi / your area" /></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><Label>Monthly clients</Label><Input name="monthlyClients" type="number" defaultValue="50" /></div><div><Label>Avg service fee ₹</Label><Input name="avgServiceFee" type="number" defaultValue="99" /></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><Label>Paid conversion %</Label><Input name="conversionRate" type="number" defaultValue="20" /></div><div><Label>Plan cost ₹</Label><Input name="planCost" type="number" defaultValue="999" /></div></div>
      <div><Label>Add-on monthly revenue ₹</Label><Input name="addOnRevenue" type="number" defaultValue="0" /></div>
      <Button disabled={loading} className="w-full">{loading ? 'Calculating...' : 'Calculate agent revenue'}</Button>
    </form></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle>{result.title}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Paid clients</p><p className="text-3xl font-black">{result.paidClients}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Net estimate</p><p className="text-3xl font-black">₹{result.estimatedNet}</p></div></div><p className="text-sm text-slate-600">Break-even clients: <b>{result.breakEvenClients}</b></p><div><p className="font-bold">Suggested packages</p><div className="mt-2 grid gap-2">{result.suggestedPackages.map((x:any)=><div key={x.name} className="rounded-2xl border p-3"><b>{x.name}</b> — ₹{x.price}<p className="text-xs text-slate-500">{x.includes.join(', ')}</p></div>)}</div></div><p className="text-xs text-slate-500">{result.warning}</p></CardContent></Card> : null}
  </div>
}
