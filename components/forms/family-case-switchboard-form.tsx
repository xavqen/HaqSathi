'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'

export function FamilyCaseSwitchboardForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/family-case-switchboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <Card><CardHeader><CardTitle>Family case setup</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2"><div><Label>Family/group name</Label><Input name="familyName" placeholder="Khan family" /></div><div><Label>Member name</Label><Input name="memberName" required placeholder="Father / sister / client name" /></div></div>
      <div className="grid gap-3 sm:grid-cols-3"><div><Label>Issue type</Label><select name="issueType" className="mt-2 w-full rounded-xl border px-3 py-2"><option>REFUND</option><option>UPI</option><option>BANK</option><option>CYBER_FRAUD</option><option>DOCUMENT</option><option>SCHEME</option><option>EDUCATION</option><option>HEALTH</option><option>TRAVEL</option><option>INSURANCE</option><option>OTHER</option></select></div><div><Label>Priority</Label><select name="priority" className="mt-2 w-full rounded-xl border px-3 py-2"><option>MEDIUM</option><option>HIGH</option><option>URGENT</option><option>LOW</option></select></div><div><Label>Due date</Label><Input name="dueDate" placeholder="2026-06-01" /></div></div>
      <div><Label>Responsible person</Label><Input name="responsiblePerson" placeholder="Who will follow up?" /></div>
      <div><Label>Case summary</Label><Textarea name="caseSummary" required rows={6} placeholder="Write issue, amount/reference, current status..." /></div>
      <Button disabled={loading} className="w-full">{loading ? 'Organizing...' : 'Create family switchboard'}</Button>
    </form></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle>{result.title}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-3xl bg-slate-50 p-4"><p className="text-sm font-bold text-emerald-700">Owner: {result.caseOwner}</p><p className="text-2xl font-black text-slate-950">{result.caseCard.member}</p><p className="text-sm text-slate-600">{result.caseCard.issueType} · {result.caseCard.dueDate}</p></div><div className="space-y-2">{result.rolePlan.map((r:any)=><div key={r.role} className="rounded-2xl border p-3"><p className="font-bold">{r.role}: {r.person}</p><p className="text-sm text-slate-600">{r.job}</p></div>)}</div><pre className="whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-white">{result.reminderText}</pre><CopyButton text={result.reminderText} /><p className="text-xs text-slate-500">{result.disclaimer}</p></CardContent></Card> : null}
  </div>
}
