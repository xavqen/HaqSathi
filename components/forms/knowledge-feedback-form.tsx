'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export function KnowledgeFeedbackForm({ articleId }: { articleId?: string }){
  const [msg,setMsg]=useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>){ e.preventDefault(); const fd=new FormData(e.currentTarget); const body={articleId,rating:fd.get('rating'),comment:fd.get('comment')}; const res=await fetch('/api/knowledge-feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const data=await res.json().catch(()=>({ok:false})); setMsg(data.ok?'Feedback saved.':'Feedback failed') }
  return <form onSubmit={submit} className="mt-6 flex flex-col gap-3 rounded-2xl border bg-white p-4 md:flex-row"><Select name="rating" defaultValue="5"><option value="5">5 - Helpful</option><option value="4">4 - Good</option><option value="3">3 - Okay</option><option value="2">2 - Confusing</option><option value="1">1 - Not useful</option></Select><Input name="comment" placeholder="Short feedback optional"/><Button type="submit">Send</Button>{msg && <span className="text-sm font-semibold">{msg}</span>}</form>
}
