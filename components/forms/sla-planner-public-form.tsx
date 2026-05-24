'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function SlaPlannerPublicForm() {
  const [result, setResult] = useState<{ stage: string; date: string; action: string }[] | null>(null)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const baseDate = new Date(String(form.get('startDate') || new Date().toISOString().slice(0, 10)))
    const issueType = String(form.get('issueType') || 'complaint')
    const add = (days: number) => new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const stages = issueType === 'bank'
      ? [
          { stage: 'Bank support complaint', date: add(0), action: 'Transaction ID + statement ke sath complaint submit karo.' },
          { stage: 'Nodal officer follow-up', date: add(7), action: 'Response na mile to nodal officer format bhejo.' },
          { stage: 'Ombudsman-ready pack', date: add(30), action: 'Evidence pack, complaint ID aur timeline ready karo.' }
        ]
      : issueType === 'cyber'
        ? [
            { stage: 'Emergency report', date: add(0), action: '1930 / official cyber portal / bank freeze request immediately.' },
            { stage: 'Evidence consolidation', date: add(1), action: 'Screenshots, transaction IDs, phone numbers, chats save karo.' },
            { stage: 'Follow-up tracking', date: add(3), action: 'Complaint acknowledgement ke basis par follow-up note banao.' }
          ]
        : [
            { stage: 'Company support', date: add(0), action: 'Short complaint + proof ke sath support ko bhejo.' },
            { stage: 'Formal follow-up', date: add(3), action: 'Refund/response na mile to formal email bhejo.' },
            { stage: 'Consumer complaint-ready', date: add(7), action: 'Complaint format, proof, order ID, chat history ready rakho.' }
          ]
    setResult(stages)
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border bg-white p-5 shadow-soft">
        <div className="grid gap-2"><Label>Issue type</Label><select name="issueType" className="h-11 rounded-xl border px-3 text-sm"><option value="refund">Refund/e-commerce</option><option value="bank">Bank/UPI</option><option value="cyber">Cyber fraud</option></select></div>
        <div className="grid gap-2"><Label>Start date</Label><Input name="startDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></div>
        <div className="grid gap-2"><Label>Short note optional</Label><Textarea name="note" placeholder="Amount, company, transaction ID..." /></div>
        <Button>Generate timeline</Button>
      </form>
      {result && <div className="grid gap-3">{result.map((item) => <div key={item.stage} className="rounded-2xl border bg-white p-4"><p className="font-bold">{item.stage} · {item.date}</p><p className="mt-1 text-sm text-slate-600">{item.action}</p></div>)}</div>}
    </div>
  )
}
