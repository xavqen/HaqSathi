'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

type Prefs = {
  emailReminders: boolean
  weeklyDigest: boolean
  productUpdates: boolean
  whatsappPlaceholder: boolean
  smsPlaceholder: boolean
  language: 'HINGLISH' | 'HINDI' | 'ENGLISH'
}

const boolFields: { key: keyof Omit<Prefs, 'language'>; label: string; help: string }[] = [
  { key: 'emailReminders', label: 'Email reminders', help: 'Reminder due hone par email-ready log create hoga.' },
  { key: 'weeklyDigest', label: 'Weekly digest', help: 'Week me ek summary preference.' },
  { key: 'productUpdates', label: 'Product updates', help: 'New templates/features ke updates.' },
  { key: 'whatsappPlaceholder', label: 'WhatsApp alerts placeholder', help: 'Future WhatsApp provider integration ke liye.' },
  { key: 'smsPlaceholder', label: 'SMS alerts placeholder', help: 'Future SMS provider integration ke liye.' }
]

export function NotificationSettingsForm({ initial }: { initial: Prefs }) {
  const router = useRouter()
  const [prefs, setPrefs] = useState<Prefs>(initial)
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('Saving...')
    const res = await fetch('/api/user/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) })
    setMessage(res.ok ? 'Settings saved.' : 'Save failed.')
    router.refresh()
  }

  return <form onSubmit={submit} className="space-y-5">
    <div className="grid gap-2"><Label>Preferred language</Label><Select value={prefs.language} onChange={(e) => setPrefs((prev) => ({ ...prev, language: e.target.value as Prefs['language'] }))}><option value="HINGLISH">Hinglish</option><option value="HINDI">Hindi</option><option value="ENGLISH">English</option></Select></div>
    <div className="grid gap-3">
      {boolFields.map((field) => <label key={field.key} className="flex items-start gap-3 rounded-2xl border bg-white p-4"><input type="checkbox" className="mt-1" checked={Boolean(prefs[field.key])} onChange={(e) => setPrefs((prev) => ({ ...prev, [field.key]: e.target.checked }))} /><span><b>{field.label}</b><p className="text-sm text-slate-500">{field.help}</p></span></label>)}
    </div>
    <Button type="submit">Save Settings</Button>{message ? <p className="text-sm text-slate-500">{message}</p> : null}
  </form>
}
