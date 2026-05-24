'use client'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const required: Record<string,string[]> = {
  scholarship: ['Aadhaar', 'Bank passbook', 'Income certificate', 'Previous marksheet', 'Admission proof', 'Fee receipt'],
  income: ['Aadhaar', 'Residence proof', 'Income proof', 'Photo', 'Self declaration'],
  bankkyc: ['PAN', 'Aadhaar', 'Photo', 'Address proof', 'Mobile number'],
  refund: ['Payment proof', 'Order ID', 'Support chat/email', 'Refund promise screenshot']
}
export function DocumentGapAnalyzerForm(){
  const [type,setType]=useState('scholarship')
  const [have,setHave]=useState('')
  const [done,setDone]=useState(false)
  const missing=useMemo(()=>required[type].filter(x=>!have.toLowerCase().includes(x.toLowerCase().split(' ')[0])),[type,have])
  return <Card><CardHeader><CardTitle>Document gap analyzer</CardTitle></CardHeader><CardContent className="space-y-4"><Select value={type} onChange={(e)=>setType(e.target.value)}><option value="scholarship">Scholarship</option><option value="income">Income certificate</option><option value="bankkyc">Bank KYC</option><option value="refund">Refund complaint</option></Select><Textarea placeholder="Jo documents aapke paas hain, comma se likho" value={have} onChange={(e)=>setHave(e.target.value)} /><Button type="button" onClick={()=>setDone(true)}>Check gaps</Button>{done && <div className="rounded-2xl bg-slate-50 p-4"><p className="font-bold">Missing / verify:</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{missing.map(m=><li key={m}>{m}</li>)}</ul><p className="mt-3 text-xs text-slate-500">Final list official portal/department se verify karein.</p></div>}</CardContent></Card>
}
