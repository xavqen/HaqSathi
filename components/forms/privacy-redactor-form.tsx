'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'

export function PrivacyRedactorForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = {
      ...Object.fromEntries(formData.entries()),
      keepReferenceIds: formData.get('keepReferenceIds') === 'on',
      publicShareMode: formData.get('publicShareMode') === 'on'
    }
    const res = await fetch('/api/tools/privacy-redactor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <Card><CardHeader><CardTitle>Privacy Redactor</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
      <div><Label>Content type</Label><select name="contentType" className="mt-2 w-full rounded-xl border px-3 py-2"><option>COMPLAINT_DRAFT</option><option>PUBLIC_POST</option><option>CHAT_MESSAGE</option><option>DOCUMENT_TEXT</option><option>EMAIL</option><option>OTHER</option></select></div>
      <div><Label>Language</Label><select name="language" className="mt-2 w-full rounded-xl border px-3 py-2"><option>ENGLISH</option><option>HINDI</option><option>HINGLISH</option><option>BENGALI</option><option>TAMIL</option><option>TELUGU</option><option>MARATHI</option></select></div>
      <div><Label>Paste draft/text</Label><Textarea name="text" required rows={10} placeholder="Paste complaint, public post, chat message or document text..." /></div>
      <label className="flex gap-2 text-sm text-slate-700"><input name="keepReferenceIds" type="checkbox" defaultChecked /> Keep useful reference IDs when safe</label>
      <label className="flex gap-2 text-sm text-slate-700"><input name="publicShareMode" type="checkbox" /> Public share mode: remove risky allegations too</label>
      <Button disabled={loading} className="w-full">{loading ? 'Redacting...' : 'Redact private details'}</Button>
    </form></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle>{result.title}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-3xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Privacy risk score</p><p className="text-4xl font-black text-slate-950">{result.riskScore}/100</p></div><pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-white">{result.safeText}</pre><CopyButton text={result.safeText} /><div><p className="font-bold">Detected</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{result.detectedItems.map((x:any)=><li key={x.label}>{x.label}: {x.count}</li>)}</ul></div><p className="text-xs text-slate-500">{result.disclaimer}</p></CardContent></Card> : null}
  </div>
}
