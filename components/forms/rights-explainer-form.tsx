'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RightsExplainerForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/rights-explainer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <Card><CardHeader><CardTitle>Rights Explainer</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2"><div><Label>Issue type</Label><select name="issueType" className="mt-2 w-full rounded-xl border px-3 py-2"><option>REFUND</option><option>BANK</option><option>UPI</option><option>CYBER_FRAUD</option><option>ECOMMERCE</option><option>EDUCATION_FEE</option><option>GOVERNMENT_SERVICE</option><option>DOCUMENT</option><option>OTHER</option></select></div><div><Label>State</Label><Input name="state" placeholder="Bihar, UP, Maharashtra..." /></div></div>
      <div><Label>Language</Label><Input name="language" defaultValue="ENGLISH" /></div>
      <div><Label>Your question</Label><Textarea name="question" required rows={7} placeholder="Mera refund pending hai, mere rights kya hain?" /></div>
      <div><Label>User profile/context</Label><Textarea name="userProfile" rows={3} placeholder="Student/farmer/senior citizen etc. Optional" /></div>
      <Button disabled={loading} className="w-full">{loading ? 'Explaining...' : 'Explain my rights'}</Button>
    </form></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle>{result.title}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-slate-600">{result.summary}</p><div><p className="font-bold">Your practical rights</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{result.rights.map((x:string)=><li key={x}>{x}</li>)}</ul></div><div><p className="font-bold">Ask these questions</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{result.whatToAsk.map((x:string)=><li key={x}>{x}</li>)}</ul></div><p className="text-xs text-slate-500">{result.warning}</p></CardContent></Card> : null}
  </div>
}
