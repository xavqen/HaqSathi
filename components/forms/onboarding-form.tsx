'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

const steps = [
  ['PROFILE', 'Profile complete kiya'],
  ['FIRST_COMPLAINT', 'First complaint generate kiya'],
  ['FIRST_REMINDER', 'Reminder set kiya'],
  ['DOCUMENTS', 'Document checklist banaya'],
  ['SCHEME_SEARCH', 'Scheme search kiya']
]

export function OnboardingForm({ initial }: { initial?: { completedSteps?: unknown; preferredState?: string | null; mainGoal?: string | null; language?: string | null } | null }) {
  const router = useRouter()
  const initialSteps = Array.isArray(initial?.completedSteps) ? initial?.completedSteps as string[] : []
  const [completedSteps, setCompletedSteps] = useState<string[]>(initialSteps)
  const [preferredState, setPreferredState] = useState(initial?.preferredState || '')
  const [mainGoal, setMainGoal] = useState(initial?.mainGoal || 'COMPLAINT')
  const [language, setLanguage] = useState(initial?.language || 'HINGLISH')
  const [message, setMessage] = useState<string | null>(null)

  function toggle(step: string) {
    setCompletedSteps(current => current.includes(step) ? current.filter(s => s !== step) : [...current, step])
  }

  async function save() {
    const res = await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completedSteps, preferredState, mainGoal, language }) })
    const data = await res.json()
    setMessage(data.ok ? 'Saved. Dashboard ab aapke goal ke hisaab se better guide karega.' : data.error || 'Save failed')
    router.refresh()
  }

  return <div className="grid gap-5 rounded-3xl border bg-white p-5 shadow-soft"><div className="grid gap-4 md:grid-cols-3"><div className="grid gap-2"><Label>Preferred state</Label><Input value={preferredState} onChange={e => setPreferredState(e.target.value)} placeholder="Bihar" /></div><div className="grid gap-2"><Label>Main goal</Label><Select value={mainGoal} onChange={e => setMainGoal(e.target.value)}><option value="COMPLAINT">Complaint</option><option value="REFUND">Refund</option><option value="UPI_HELP">UPI Help</option><option value="SCHEME">Scheme</option><option value="DOCUMENTS">Documents</option><option value="OTHER">Other</option></Select></div><div className="grid gap-2"><Label>Language</Label><Select value={language} onChange={e => setLanguage(e.target.value)}><option value="HINGLISH">Hinglish</option><option value="HINDI">Hindi</option><option value="ENGLISH">English</option></Select></div></div><div className="grid gap-2"><p className="text-sm font-bold text-slate-700">Checklist</p>{steps.map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-xl border p-3 text-sm"><input type="checkbox" checked={completedSteps.includes(key)} onChange={() => toggle(key)} /> {label}</label>)}</div>{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}<Button onClick={save}>Save onboarding</Button></div>
}
