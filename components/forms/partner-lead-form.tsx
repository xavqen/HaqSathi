'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function PartnerLeadForm(){
  const [loading,setLoading]=useState(false); const [msg,setMsg]=useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>){ e.preventDefault(); setLoading(true); setMsg(''); const fd=new FormData(e.currentTarget); const body=Object.fromEntries(fd.entries()); const res=await fetch('/api/partner-leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const data=await res.json().catch(()=>({ok:false,error:'Server error'})); setLoading(false); setMsg(data.ok?'Partner request saved. Team aapko contact karegi.':data.error||'Failed') }
  return <Card><CardHeader><CardTitle>Become a HaqSathi partner</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4"><Input name="name" placeholder="Name" required/><Input name="phone" placeholder="Phone / WhatsApp" required/><Input name="email" placeholder="Email optional"/><div className="grid gap-4 md:grid-cols-2"><Input name="city" placeholder="City" required/><Input name="state" placeholder="State" required/></div><Select name="role" defaultValue="CYBER_CAFE"><option value="CYBER_CAFE">Cyber cafe / local agent</option><option value="NGO">NGO / volunteer</option><option value="STUDENT">Student helper</option><option value="BUSINESS">Small business/service center</option></Select><Textarea name="expectedUse" placeholder="Aap HaqSathi ko kaise use karna chahte ho?"/><Button disabled={loading}>{loading?'Saving...':'Submit partner request'}</Button>{msg && <p className="text-sm font-semibold text-slate-700">{msg}</p>}</form></CardContent></Card>
}
