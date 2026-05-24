'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

export function DeadlineCalculatorForm() {
  const [rows, setRows] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(formData: FormData) {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/tools/deadline-calculator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    })
    const data = await res.json().catch(() => ({ ok: false, error: 'Server JSON error' }))
    setLoading(false)
    if (!data.ok) return setError(data.error || 'Failed')
    setRows(data.timeline)
  }

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-soft">
      <form action={submit} className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Issue date</Label>
          <Input name="issueDate" type="date" required />
        </div>
        <div>
          <Label>Issue type</Label>
          <Select name="category" defaultValue="refund">
            <option value="refund">Refund / e-commerce</option>
            <option value="upi-bank">UPI / bank</option>
            <option value="fraud">Cyber fraud</option>
            <option value="scheme">Scheme / scholarship</option>
          </Select>
        </div>
        <div className="flex items-end"><Button disabled={loading}>{loading ? 'Calculating...' : 'Make timeline'}</Button></div>
      </form>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {rows.length > 0 && <div className="mt-6 grid gap-3">{rows.map((row) => <div key={row.label} className="rounded-2xl border p-4"><p className="font-bold">{row.label}</p><p className="text-sm text-slate-600">Target: {row.date} · Day +{row.dayOffset}</p></div>)}</div>}
    </div>
  )
}
