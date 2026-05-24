'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

const routes: Record<string, string[]> = {
  ecommerce: ['Company support ko written complaint bhejo', '7-10 din wait + follow-up evidence save karo', 'National Consumer Helpline par complaint consider karo', 'Amount/issue serious ho to consumer commission process samjho'],
  banking: ['Bank branch/customer care ko written complaint bhejo', 'Service request/ticket number save karo', '30 din tak response track karo', 'RBI CMS/ombudsman route consider karo'],
  upi: ['Bank/UPI app ko immediately report karo', 'Transaction ID + screenshots save karo', 'Fraud hai to 1930/cybercrime official channel use karo', 'Bank response ke baad escalation plan banao'],
  scheme: ['Official portal notification verify karo', 'Document checklist complete karo', 'Application ID save karo', 'Department/helpdesk follow-up draft banao'],
  education: ['Institute policy/refund rule collect karo', 'Written refund request bhejo', 'Payment proof + prospectus save karo', 'Consumer grievance route evaluate karo']
}

export function GrievanceRouteFinderForm() {
  const [type, setType] = useState('ecommerce')
  const steps = routes[type] || routes.ecommerce
  return <Card><CardHeader><CardTitle>Grievance route finder</CardTitle></CardHeader><CardContent className="space-y-4"><Select value={type} onChange={(e)=>setType(e.target.value)}><option value="ecommerce">E-commerce/refund</option><option value="banking">Banking issue</option><option value="upi">UPI/fraud</option><option value="scheme">Government scheme</option><option value="education">Education fee/refund</option></Select><Button type="button">Suggested route</Button><div className="rounded-2xl bg-slate-50 p-4"><ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">{steps.map((s)=><li key={s}>{s}</li>)}</ol><p className="mt-4 text-xs text-slate-500">Disclaimer: final filing official portal/rules ke hisaab se verify karein.</p></div></CardContent></Card>
}
