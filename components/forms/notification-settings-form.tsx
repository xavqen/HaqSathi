'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { INDIAN_LANGUAGE_OPTIONS, GLOBAL_LANGUAGE_OPTIONS } from '@/lib/i18n/languages'

type Prefs = {
  emailReminders: boolean
  weeklyDigest: boolean
  productUpdates: boolean
  whatsappPlaceholder: boolean
  smsPlaceholder: boolean
  language: string
}

export function NotificationSettingsForm({ initial }: { initial?: Partial<Prefs> | null }) {
  const [prefs, setPrefs] = useState<Prefs>({
    emailReminders: initial?.emailReminders ?? true,
    weeklyDigest: initial?.weeklyDigest ?? true,
    productUpdates: initial?.productUpdates ?? false,
    whatsappPlaceholder: initial?.whatsappPlaceholder ?? false,
    smsPlaceholder: initial?.smsPlaceholder ?? false,
    language: initial?.language || 'ENGLISH'
  })
  const [message, setMessage] = useState('')
  async function save() {
    setMessage('')
    const res = await fetch('/api/user/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) })
    const data = await res.json().catch(() => ({ ok: false }))
    setMessage(data.ok ? 'Settings saved' : data.error || 'Save failed')
  }
  return (
    <div className="grid gap-4 rounded-3xl border bg-white p-5 shadow-soft">
      <div className="grid gap-2"><Label>Preferred notification language</Label><Select value={prefs.language} onChange={(e) => setPrefs((prev) => ({ ...prev, language: e.target.value }))}><optgroup label="India major languages">{INDIAN_LANGUAGE_OPTIONS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</optgroup><optgroup label="World major languages">{GLOBAL_LANGUAGE_OPTIONS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</optgroup></Select></div>
      {(['emailReminders','weeklyDigest','productUpdates','whatsappPlaceholder','smsPlaceholder'] as const).map((key) => <label key={key} className="flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold"><input type="checkbox" checked={prefs[key]} onChange={() => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))} /> {key.replace(/([A-Z])/g, ' $1')}</label>)}
      {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <Button onClick={save}>Save settings</Button>
    </div>
  )
}
