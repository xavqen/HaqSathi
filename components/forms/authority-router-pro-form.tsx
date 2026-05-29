'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'

export function AuthorityRouterProForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/authority-router-pro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <Card><CardHeader><CardTitle>Authority Router Pro</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2"><div><Label>Issue type</Label><select name="issueType" className="mt-2 w-full rounded-xl border px-3 py-2"><option>REFUND</option><option>UPI</option><option>BANK</option><option>CYBER_FRAUD</option><option>ECOMMERCE</option><option>INSURANCE</option><option>TELECOM</option><option>EDUCATION</option><option>GOVERNMENT_SERVICE</option><option>DOCUMENT</option><option>OTHER</option></select></div><div><Label>Company/office type</Label><select name="companyType" className="mt-2 w-full rounded-xl border px-3 py-2"><option>PRIVATE_COMPANY</option><option>BANK</option><option>PAYMENT_APP</option><option>MARKETPLACE</option><option>GOVERNMENT_OFFICE</option><option>COLLEGE_SCHOOL</option><option>INSURANCE_COMPANY</option><option>TELECOM</option><option>TRAVEL_PORTAL</option><option>OTHER</option></select></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><Label>State</Label><Input name="state" /></div><div><Label>Urgency</Label><select name="urgency" className="mt-2 w-full rounded-xl border px-3 py-2"><option>NORMAL</option><option>HIGH</option><option>URGENT</option></select></div></div>
      <div><Label>Problem</Label><Textarea name="problem" required rows={6} /></div><div><Label>Already tried</Label><Textarea name="alreadyTried" rows={3} /></div>
      <Button disabled={loading} className="w-full">{loading ? 'Routing...' : 'Find best authority route'}</Button>
    </form></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle>{result.title}</CardTitle></CardHeader><CardContent className="space-y-4"><div><p className="font-bold">Recommended route</p><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">{result.recommendedRoute.map((x:string)=><li key={x}>{x}</li>)}</ol></div><div><p className="font-bold">First message</p><pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-white">{result.firstMessage}</pre><CopyButton text={result.firstMessage} /></div><p className="text-sm text-slate-600"><b>Escalation:</b> {result.escalationTrigger}</p><p className="text-xs text-slate-500">{result.disclaimer}</p></CardContent></Card> : null}
  </div>
}
