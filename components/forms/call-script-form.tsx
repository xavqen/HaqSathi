'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'

type Result = { script: string; beforeCallChecklist: string[]; afterCallNotes: string[]; followUpMessage: string; disclaimer: string }

export function CallScriptForm() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries())
    const res = await fetch('/api/tools/call-script-generator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json().catch(() => null)
    setLoading(false)
    if (data?.ok) setResult(data.result)
  }
  return <div className="grid gap-6 lg:grid-cols-[420px_1fr]"><form onSubmit={submit} className="grid gap-3 rounded-3xl border bg-white p-5 shadow-soft"><div className="grid gap-2"><Label>Issue type</Label><Input name="issueType" placeholder="Refund not received / UPI wrong transfer" required /></div><div className="grid gap-2"><Label>Authority type</Label><Input name="authorityType" placeholder="Bank support / company care / helpline" required /></div><div className="grid gap-2"><Label>Language</Label><Select name="language" defaultValue="HINGLISH"><option value="HINGLISH">Hinglish</option><option value="HINDI">Hindi</option><option value="ENGLISH">English</option></Select></div><div className="grid gap-2"><Label>Case summary</Label><Textarea name="caseSummary" rows={5} placeholder="Exact issue, date, amount, reference ID..." required /></div><div className="grid gap-2"><Label>Desired outcome</Label><Input name="desiredOutcome" placeholder="Refund / reversal / written reply" required /></div><div className="grid gap-2"><Label>Previous attempts optional</Label><Textarea name="previousAttempts" rows={3} placeholder="Already emailed on date, called support..." /></div><Button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Call Script'}</Button></form>{result && <Card><CardContent className="space-y-5 pt-6"><section><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Call Script</h2><CopyButton text={result.script} /></div><pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm">{result.script}</pre></section><section><h3 className="font-bold">Before call</h3><ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{result.beforeCallChecklist.map((x) => <li key={x}>{x}</li>)}</ul></section><section><h3 className="font-bold">After call notes</h3><ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{result.afterCallNotes.map((x) => <li key={x}>{x}</li>)}</ul></section><section><div className="flex items-center justify-between gap-3"><h3 className="font-bold">Follow-up message</h3><CopyButton text={result.followUpMessage} /></div><p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm">{result.followUpMessage}</p></section><p className="text-xs text-slate-500">{result.disclaimer}</p></CardContent></Card>}</div>
}
