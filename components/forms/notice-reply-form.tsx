'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

export function NoticeReplyForm() {
  const [sender, setSender] = useState('')
  const [demand, setDemand] = useState('')
  const [facts, setFacts] = useState('')
  const [result, setResult] = useState('')
  function build() {
    setResult(`Subject: Response regarding your notice/communication\n\nDear ${sender || 'Concerned Team'},\n\nI acknowledge receipt of your communication. I am reviewing the matter and sharing my preliminary response below.\n\nMy facts: ${facts || 'Please add your clear facts here.'}\n\nRegarding your demand/claim: ${demand || 'Please mention what they demanded.'}\n\nI request you to share complete supporting documents, calculation, policy/rule basis, and any previous reference number so that I can respond properly. This message should not be treated as admission of liability.\n\nRegards`) }
  return <Card><CardHeader><CardTitle>Notice reply draft</CardTitle></CardHeader><CardContent className="space-y-4"><Input placeholder="Sender/company/department" value={sender} onChange={(e)=>setSender(e.target.value)} /><Textarea placeholder="Unhone kya demand/claim kiya?" value={demand} onChange={(e)=>setDemand(e.target.value)} /><Textarea placeholder="Aapke facts short me" value={facts} onChange={(e)=>setFacts(e.target.value)} /><Button type="button" onClick={build}>Draft reply</Button>{result && <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm">{result}\n\nDisclaimer: Ye general draft hai, legal advice nahi.</pre>}</CardContent></Card>
}
