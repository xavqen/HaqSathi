'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'

export function ChargebackHelperForm() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  async function submit(formData: FormData) {
    setLoading(true)
    const body = Object.fromEntries(formData.entries())
    const res = await fetch('/api/tools/chargeback-helper', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setResult(data.result || null)
    setLoading(false)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <Card><CardHeader><CardTitle>Payment dispute details</CardTitle></CardHeader><CardContent><form action={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2"><div><Label>Payment mode</Label><select name="paymentMode" className="mt-2 w-full rounded-xl border px-3 py-2"><option>DEBIT_CARD</option><option>CREDIT_CARD</option><option>UPI</option><option>NETBANKING</option><option>WALLET</option><option>EMI</option><option>OTHER</option></select></div><div><Label>Issue type</Label><select name="issueType" className="mt-2 w-full rounded-xl border px-3 py-2"><option>REFUND_NOT_CREDITED</option><option>UNAUTHORIZED</option><option>PRODUCT_NOT_RECEIVED</option><option>DUPLICATE_DEBIT</option><option>SERVICE_NOT_PROVIDED</option><option>WRONG_AMOUNT</option><option>MERCHANT_DENIED</option><option>OTHER</option></select></div></div>
      <div className="grid gap-3 sm:grid-cols-2"><div><Label>Bank/payment app</Label><Input name="bankName" placeholder="SBI / HDFC / PhonePe..." /></div><div><Label>Merchant/company</Label><Input name="merchantName" placeholder="Amazon / shop / travel app" /></div></div>
      <div className="grid gap-3 sm:grid-cols-3"><div><Label>Amount</Label><Input name="amount" type="number" placeholder="999" /></div><div><Label>Transaction date</Label><Input name="transactionDate" placeholder="2026-05-27" /></div><div><Label>Transaction ID / UTR</Label><Input name="transactionId" /></div></div>
      <div><Label>What happened?</Label><Textarea name="whatHappened" required rows={5} placeholder="Explain the issue clearly..." /></div>
      <div><Label>Evidence available</Label><Textarea name="evidenceAvailable" rows={4} placeholder="Invoice, screenshot, chat, ticket, refund promise..." /></div>
      <Button disabled={loading} className="w-full">{loading ? 'Preparing...' : 'Generate dispute pack'}</Button>
    </form></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle>{result.title}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-3xl bg-emerald-50 p-4"><p className="text-sm font-bold text-emerald-700">Readiness</p><p className="text-4xl font-black text-slate-950">{result.readinessScore}/100</p><p className="text-sm text-slate-600">{result.urgency}</p></div><div><p className="font-bold">Missing signals</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{(result.missingSignals.length ? result.missingSignals : ['No major missing signal']).map((x:string)=><li key={x}>{x}</li>)}</ul></div><pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-white">{result.bankMessage}</pre><CopyButton text={result.bankMessage} /><p className="text-xs text-slate-500">{result.disclaimer}</p></CardContent></Card> : null}
  </div>
}
