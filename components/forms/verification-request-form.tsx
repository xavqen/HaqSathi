'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function VerificationRequestForm(){
  const [msg,setMsg]=useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>){ e.preventDefault(); const fd=new FormData(e.currentTarget); const body=Object.fromEntries(fd.entries()); const res=await fetch('/api/verification-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const data=await res.json().catch(()=>({ok:false,error:'Server error'})); setMsg(data.ok?'Verification request saved.':'Failed: '+(data.error||'')); if(data.ok) e.currentTarget.reset() }
  return <Card><CardHeader><CardTitle>Ask for human-style verification</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4"><Input name="title" placeholder="Short title" required/><Select name="category" defaultValue="Complaint"><option>Complaint</option><option>UPI</option><option>Scheme</option><option>Document</option><option>Legal draft</option></Select><Select name="sourceType" defaultValue="AI_OUTPUT"><option>AI_OUTPUT</option><option>COMPLAINT</option><option>CASE_PACKAGE</option><option>DOCUMENT</option></Select><Textarea name="userQuestion" placeholder="Kya verify karwana hai?" required/><Textarea name="aiOutput" placeholder="AI draft/output paste karo optional"/><Button>Submit verification</Button>{msg && <p className="text-sm font-semibold">{msg}</p>}</form></CardContent></Card>
}
