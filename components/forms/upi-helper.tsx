'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { upiIssues } from '@/lib/constants'
import { upiInputSchema, type UpiInput, type UpiOutput } from '@/lib/validators/upi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'

export function UpiHelper() {
  const [result, setResult] = useState<UpiOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const form = useForm<UpiInput>({ resolver: zodResolver(upiInputSchema), defaultValues: { issue: 'Money deducted but not received', appName: '', bankName: '', amount: '', transactionId: '', date: '', description: '' } })

  async function onSubmit(values: UpiInput) {
    setLoading(true)
    const res = await fetch('/api/ai/upi-help', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
    const data = await res.json()
    setResult(data.result)
    setLoading(false)
  }

  return <div className="grid gap-6 lg:grid-cols-2">
    <Card><CardHeader><CardTitle>UPI issue details</CardTitle><CardDescription>Fraud case me delay mat karo — official channels par immediately report karo.</CardDescription></CardHeader><CardContent>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-2"><Label>Issue</Label><Select {...form.register('issue')}>{upiIssues.map(i => <option key={i}>{i}</option>)}</Select></div>
        <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label>UPI App</Label><Input placeholder="PhonePe/GPay/Paytm" {...form.register('appName')} /></div><div className="grid gap-2"><Label>Bank</Label><Input placeholder="SBI/HDFC..." {...form.register('bankName')} /></div></div>
        <div className="grid gap-4 sm:grid-cols-3"><div className="grid gap-2"><Label>Amount</Label><Input {...form.register('amount')} /></div><div className="grid gap-2"><Label>UTR/Txn ID</Label><Input {...form.register('transactionId')} /></div><div className="grid gap-2"><Label>Date</Label><Input type="date" {...form.register('date')} /></div></div>
        <div className="grid gap-2"><Label>Description</Label><Textarea placeholder="Kya hua detail me likho" {...form.register('description')} /></div>
        <Button className="w-full" disabled={loading}>{loading ? 'Generating...' : 'Get UPI Help'}</Button>
      </form>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Action guide</CardTitle><CardDescription>Copy-ready bank/NPCI draft.</CardDescription></CardHeader><CardContent>{!result ? <p className="rounded-2xl border border-dashed p-8 text-center text-slate-500">Output yahan aayega.</p> : <div className="space-y-5">
      <List title="Urgent actions" items={result.urgentActions} />
      <Block title="Bank message" text={result.bankMessage} />
      <Block title="NPCI/bank draft" text={result.npciDraft} />
      <List title="Documents" items={result.documentChecklist} />
      <List title="Follow-up plan" items={result.followUpPlan} />
      <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{result.disclaimer}</p>
    </div>}</CardContent></Card>
  </div>
}
function Block({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border p-4"><div className="mb-3 flex justify-between"><b>{title}</b><CopyButton text={text}/></div><pre className="whitespace-pre-wrap font-sans text-sm leading-7">{text}</pre></div> }
function List({ title, items }: { title: string; items: string[] }) { return <div className="rounded-2xl bg-slate-50 p-4"><b>{title}</b><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{items.map(i => <li key={i}>{i}</li>)}</ul></div> }
