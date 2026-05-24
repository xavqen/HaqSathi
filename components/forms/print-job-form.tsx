'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function PrintJobForm(){
  const [msg,setMsg]=useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>){ e.preventDefault(); const fd=new FormData(e.currentTarget); const payloadText=String(fd.get('notes')||''); const body={title:fd.get('title'),jobType:fd.get('jobType'),copies:fd.get('copies'),payload:{notes:payloadText}}; const res=await fetch('/api/print-jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const data=await res.json().catch(()=>({ok:false,error:'Server error'})); setMsg(data.ok?'Print job ready.':data.error||'Failed') }
  return <Card><CardHeader><CardTitle>Create print packet</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4"><Input name="title" placeholder="Packet title" required/><Select name="jobType" defaultValue="COMPLAINT"><option>COMPLAINT</option><option>DOCUMENT_CHECKLIST</option><option>CASE_PACKAGE</option><option>EVIDENCE_PACK</option></Select><Input name="copies" type="number" defaultValue="1" min="1" max="20"/><Textarea name="notes" placeholder="Print notes / what to include"/><Button>Create print job</Button>{msg && <p className="text-sm font-semibold">{msg}</p>}</form></CardContent></Card>
}
