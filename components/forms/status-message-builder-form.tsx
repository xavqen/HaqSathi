'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export function StatusMessageBuilderForm() {
  const [type, setType] = useState('polite-followup')
  const [ref, setRef] = useState('')
  const [days, setDays] = useState('7')
  const [msg, setMsg] = useState('')
  function build(){
    const map: Record<string,string> = {
      'polite-followup': `Hello, my complaint/reference ID is ${ref || '[ID]'}. It has been ${days} days. Please share the current status and expected resolution timeline.`,
      'urgent-upi': `Urgent: My UPI/bank issue reference is ${ref || '[ID]'}. Please review immediately and share complaint status. I have kept transaction proof ready.`,
      'scheme-status': `Namaste, my application/reference ID is ${ref || '[ID]'}. Please tell me current status, pending documents if any, and next step.`,
      'final-reminder': `This is a final polite reminder for reference ${ref || '[ID]'}. Please resolve or provide a written reason and escalation contact.`
    }
    setMsg(map[type])
  }
  return <Card><CardHeader><CardTitle>Status message builder</CardTitle></CardHeader><CardContent className="space-y-4"><Select value={type} onChange={(e)=>setType(e.target.value)}><option value="polite-followup">Polite follow-up</option><option value="urgent-upi">Urgent UPI/bank</option><option value="scheme-status">Scheme/application status</option><option value="final-reminder">Final reminder</option></Select><Input placeholder="Complaint/Application/Transaction ID" value={ref} onChange={(e)=>setRef(e.target.value)} /><Input placeholder="Days pending" value={days} onChange={(e)=>setDays(e.target.value)} /><Button type="button" onClick={build}>Create message</Button>{msg && <div className="rounded-2xl bg-slate-50 p-4 text-sm">{msg}</div>}</CardContent></Card>
}
