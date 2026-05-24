'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function FeeRefundCalculatorForm() {
  const [paid, setPaid] = useState('10000')
  const [deduction, setDeduction] = useState('10')
  const p = Number(paid) || 0
  const d = Math.min(Math.max(Number(deduction) || 0, 0), 100)
  const refund = Math.max(p - (p * d / 100), 0)
  return <Card><CardHeader><CardTitle>Fee/refund estimate calculator</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><div><Label>Total paid amount</Label><Input value={paid} onChange={(e)=>setPaid(e.target.value)} inputMode="decimal" /></div><div><Label>Possible deduction %</Label><Input value={deduction} onChange={(e)=>setDeduction(e.target.value)} inputMode="decimal" /></div></div><Button type="button">Calculate estimate</Button><div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-600">Estimated refundable amount</p><p className="text-3xl font-black">₹{refund.toFixed(2)}</p><p className="mt-2 text-xs text-slate-500">Ye sirf estimate hai. Actual refund policy, agreement, cancellation date aur official rules par depend karega.</p></div></CardContent></Card>
}
