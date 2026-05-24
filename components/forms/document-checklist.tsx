'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { documentTypes, indianStates } from '@/lib/constants'
import { documentInputSchema, type DocumentInput, type DocumentOutput } from '@/lib/validators/document'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function DocumentChecklistForm() {
  const [result, setResult] = useState<DocumentOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const form = useForm<DocumentInput>({ resolver: zodResolver(documentInputSchema), defaultValues: { type: 'Income certificate', state: 'Bihar', applicantType: 'Student', extraInfo: '' } })
  async function onSubmit(values: DocumentInput) { setLoading(true); const res = await fetch('/api/ai/document-checklist', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(values)}); const data = await res.json(); setResult(data.result); setLoading(false) }
  return <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle>Checklist details</CardTitle><CardDescription>Document type choose karo.</CardDescription></CardHeader><CardContent><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <div className="grid gap-2"><Label>Document type</Label><Select {...form.register('type')}>{documentTypes.map(t => <option key={t}>{t}</option>)}</Select></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label>State</Label><Select {...form.register('state')}>{indianStates.map(s => <option key={s}>{s}</option>)}</Select></div><div className="grid gap-2"><Label>Applicant type</Label><Input {...form.register('applicantType')} /></div></div>
    <div className="grid gap-2"><Label>Extra info</Label><Textarea placeholder="Correction/renewal/minor/urgent etc." {...form.register('extraInfo')} /></div>
    <Button className="w-full" disabled={loading}>{loading ? 'Generating...' : 'Generate Checklist'}</Button>
  </form></CardContent></Card><Card><CardHeader><CardTitle>Checklist</CardTitle><CardDescription>State rules verify karein.</CardDescription></CardHeader><CardContent>{!result ? <p className="rounded-2xl border border-dashed p-8 text-center text-slate-500">Output yahan aayega.</p> : <div className="space-y-5"><List title="Required documents" items={result.requiredDocuments}/><List title="Optional documents" items={result.optionalDocuments}/><List title="Process" items={result.stepByStepProcess}/><List title="Common mistakes" items={result.commonMistakes}/><p className="rounded-2xl bg-slate-50 p-4 text-sm"><b>Time:</b> {result.timeEstimate}<br/><b>Mode:</b> {result.mode}</p><p className="rounded-2xl bg-amber-50 p-4 text-sm">{result.disclaimer}</p></div>}</CardContent></Card></div>
}
function List({ title, items }: { title: string; items: string[] }) { return <div className="rounded-2xl bg-slate-50 p-4"><b>{title}</b><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{items.map(i => <li key={i}>{i}</li>)}</ul></div> }
