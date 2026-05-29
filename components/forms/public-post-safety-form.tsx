'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'

export function PublicPostSafetyForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/public-post-safety', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <Card><CardHeader><CardTitle>Public Post Safety Checker</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
      <div><Label>Platform</Label><select name="platform" className="mt-2 w-full rounded-xl border px-3 py-2"><option>X_TWITTER</option><option>FACEBOOK</option><option>INSTAGRAM</option><option>LINKEDIN</option><option>YOUTUBE_COMMENT</option><option>APP_REVIEW</option><option>OTHER</option></select></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><Label>Issue type</Label><select name="issueType" className="mt-2 w-full rounded-xl border px-3 py-2"><option>REFUND</option><option>UPI</option><option>BANK</option><option>CYBER_FRAUD</option><option>ECOMMERCE</option><option>EDUCATION</option><option>TRAVEL</option><option>INSURANCE</option><option>OTHER</option></select></div><div><Label>Company</Label><Input name="companyName" /></div></div>
      <div><Label>Goal</Label><select name="goal" className="mt-2 w-full rounded-xl border px-3 py-2"><option>GET_SUPPORT</option><option>ASK_STATUS</option><option>ESCALATE_POLITELY</option><option>WARN_OTHERS</option></select></div>
      <div><Label>Draft public post</Label><Textarea name="draftPost" required rows={8} placeholder="Paste the post before publishing..." /></div>
      <Button disabled={loading} className="w-full">{loading ? 'Checking...' : 'Check before posting'}</Button>
    </form></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle>{result.title}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-3xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Post risk</p><p className="text-4xl font-black text-slate-950">{result.riskScore}/100</p><p className="font-bold text-primary">{result.riskLevel}</p></div><div><p className="font-bold">Recommended post</p><pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-white">{result.recommendedPost}</pre><CopyButton text={result.recommendedPost} /></div><div><p className="font-bold">Rules</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{result.postingRules.map((x:string)=><li key={x}>{x}</li>)}</ul></div></CardContent></Card> : null}
  </div>
}
