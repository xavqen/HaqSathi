'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'

export function AppealDraftForm() {
  const [authority, setAuthority] = useState('Concerned Officer')
  const [ref, setRef] = useState('Application/Complaint ID')
  const [issue, setIssue] = useState('Meri application/complaint par abhi tak clear response nahi mila hai.')
  const draft = `Subject: Appeal/Follow-up regarding ${ref}\n\nRespected ${authority},\n\nMain vinamrata se batana chahta/chahti hoon ki ${issue}\n\nRequest hai ki meri application/complaint ka status verify karke written response provide kiya jaye. Main required documents aur previous communication attach kar raha/rahi hoon.\n\nReference: ${ref}\n\nRegards,\n[Your Name]\n[Mobile Number]\n\nDisclaimer: Yeh general appeal draft hai. Official format aur rules verify karein.`
  return <Card><CardHeader><CardTitle>Appeal / follow-up draft helper</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><div><Label>Authority/office name</Label><Input value={authority} onChange={(e)=>setAuthority(e.target.value)} /></div><div><Label>Reference ID</Label><Input value={ref} onChange={(e)=>setRef(e.target.value)} /></div></div><div><Label>Issue summary</Label><Textarea value={issue} onChange={(e)=>setIssue(e.target.value)} /></div><div className="rounded-2xl bg-slate-50 p-4"><pre className="whitespace-pre-wrap text-sm text-slate-700">{draft}</pre><div className="mt-4"><CopyButton text={draft} /></div></div><Button type="button">Draft ready</Button></CardContent></Card>
}
