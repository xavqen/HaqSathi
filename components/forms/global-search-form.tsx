'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
export function GlobalSearchForm(){ const router=useRouter(); const params=useSearchParams(); const [q,setQ]=useState(params.get('q')||''); function submit(e:FormEvent){ e.preventDefault(); const query=q.trim(); router.push(query?`/search?q=${encodeURIComponent(query)}`:'/search') } return <form onSubmit={submit} className="flex flex-col gap-3 rounded-3xl border bg-white p-4 shadow-soft sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-5 w-5 text-slate-400"/><Input className="pl-10" placeholder="Search: Flipkart refund, UPI wrong transfer, scholarship documents..." value={q} onChange={(e)=>setQ(e.target.value)}/></div><Button type="submit">Search</Button></form> }
