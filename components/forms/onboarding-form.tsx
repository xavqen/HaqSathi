'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { INDIAN_LANGUAGE_OPTIONS, GLOBAL_LANGUAGE_OPTIONS } from '@/lib/i18n/languages'

const steps = [
  ['PROFILE', 'Profile basic details checked'],
  ['FIRST_COMPLAINT', 'First complaint/document/scheme tool tried'],
  ['FIRST_REMINDER', 'Reminder system understood'],
  ['DOCUMENTS', 'Document checklist tried'],
  ['SCHEME_SEARCH', 'Scheme search tried']
] as const

export function OnboardingForm({ initial }: { initial?: { completedSteps?: unknown; preferredState?: string | null; mainGoal?: string | null; language?: string | null } | null }) {
  const currentSteps = Array.isArray(initial?.completedSteps) ? initial.completedSteps as string[] : []
  const [completedSteps, setCompletedSteps] = useState<string[]>(currentSteps)
  const [preferredState, setPreferredState] = useState(initial?.preferredState || '')
  const [mainGoal, setMainGoal] = useState(initial?.mainGoal || 'COMPLAINT')
  const [language, setLanguage] = useState(initial?.language || 'ENGLISH')
  const [message, setMessage] = useState('')
  function toggle(step: string) { setCompletedSteps((prev) => prev.includes(step) ? prev.filter((x) => x !== step) : [...prev, step]) }
  async function save() {
    setMessage('')
    const res = await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completedSteps, preferredState, mainGoal, language }) })
    const data = await res.json().catch(() => ({ ok: false }))
    setMessage(data.ok ? 'Onboarding saved' : data.error || 'Save failed')
  }
  return <div className="grid gap-5 rounded-3xl border bg-white p-5 shadow-soft"><div className="grid gap-4 md:grid-cols-3"><div className="grid gap-2"><Label>Preferred state</Label><Input value={preferredState} onChange={e => setPreferredState(e.target.value)} placeholder="Bihar" /></div><div className="grid gap-2"><Label>Main goal</Label><Select value={mainGoal} onChange={e => setMainGoal(e.target.value)}><option value="COMPLAINT">Complaint</option><option value="REFUND">Refund</option><option value="UPI_HELP">UPI Help</option><option value="SCHEME">Scheme</option><option value="DOCUMENTS">Documents</option><option value="OTHER">Other</option></Select></div><div className="grid gap-2"><Label>Language</Label><Select value={language} onChange={e => setLanguage(e.target.value)}><optgroup label="India major languages">{INDIAN_LANGUAGE_OPTIONS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</optgroup><optgroup label="World major languages">{GLOBAL_LANGUAGE_OPTIONS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</optgroup></Select></div></div><div className="grid gap-2"><p className="text-sm font-bold text-slate-700">Checklist</p>{steps.map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-xl border p-3 text-sm"><input type="checkbox" checked={completedSteps.includes(key)} onChange={() => toggle(key)} /> {label}</label>)}</div>{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}<Button onClick={save}>Save onboarding</Button></div>
}
