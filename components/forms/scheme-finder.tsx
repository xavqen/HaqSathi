'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { indianStates, schemePurposes } from '@/lib/constants'
import { schemeInputSchema, type SchemeInput, type SchemeOutput } from '@/lib/validators/scheme'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

export function SchemeFinder() {
  const [result, setResult] = useState<SchemeOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const form = useForm<SchemeInput>({ resolver: zodResolver(schemeInputSchema), defaultValues: { state: 'Bihar', age: 18, gender: 'Male', profile: 'Student', incomeRange: 'Below ₹2.5 lakh/year', category: '', educationLevel: 'Class 9-12', disability: '', purpose: 'Scholarship' } })
  async function onSubmit(values: SchemeInput) { setLoading(true); const res = await fetch('/api/ai/scheme-finder', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(values)}); const data = await res.json(); setResult(data.result); setLoading(false) }
  return <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle>Scheme profile</CardTitle><CardDescription>Add details to get possible schemes and required documents.</CardDescription></CardHeader><CardContent><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label>State</Label><Select {...form.register('state')}>{indianStates.map(s => <option key={s}>{s}</option>)}</Select></div><div className="grid gap-2"><Label>Age</Label><Input type="number" {...form.register('age')} /></div></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label>Gender</Label><Input {...form.register('gender')} /></div><div className="grid gap-2"><Label>Profile</Label><Input placeholder="Student/Farmer/Women..." {...form.register('profile')} /></div></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label>Income range</Label><Input {...form.register('incomeRange')} /></div><div className="grid gap-2"><Label>Purpose</Label><Select {...form.register('purpose')}>{schemePurposes.map(p => <option key={p}>{p}</option>)}</Select></div></div>
    <div className="grid gap-4 sm:grid-cols-3"><div className="grid gap-2"><Label>Category</Label><Input {...form.register('category')} /></div><div className="grid gap-2"><Label>Education</Label><Input {...form.register('educationLevel')} /></div><div className="grid gap-2"><Label>Disability</Label><Input {...form.register('disability')} /></div></div>
    <Button disabled={loading} className="w-full">{loading ? 'Finding...' : 'Find Schemes'}</Button>
  </form></CardContent></Card><Card><CardHeader><CardTitle>Scheme suggestions</CardTitle><CardDescription>Always verify on the official portal.</CardDescription></CardHeader><CardContent>{!result ? <p className="rounded-2xl border border-dashed p-8 text-center text-slate-500">Output will appear here.</p> : <div className="space-y-5"><div className="space-y-3">{result.possibleSchemes.map(s => <div className="rounded-2xl border p-4" key={s.name}><b>{s.name}</b><p className="mt-2 text-sm text-slate-600">{s.whyMayFit}</p><p className="mt-2 text-xs text-amber-700">{s.caution}</p></div>)}</div><List title="Eligibility clues" items={result.eligibilityExplanation}/><List title="Documents" items={result.requiredDocuments}/><List title="Apply steps" items={result.applySteps}/><p className="rounded-2xl bg-amber-50 p-4 text-sm">{result.officialLinkNote}<br/>{result.disclaimer}</p></div>}</CardContent></Card></div>
}
function List({ title, items }: { title: string; items: string[] }) { return <div className="rounded-2xl bg-slate-50 p-4"><b>{title}</b><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{items.map(i => <li key={i}>{i}</li>)}</ul></div> }
