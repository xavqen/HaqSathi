'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { extractVariables } from '@/lib/templates/render'

type Initial = {
  id?: string
  title: string
  slug: string
  category: string
  intent: string
  language: string
  body: string
  variables: unknown
  isPremium: boolean
}

const empty: Initial = { title: '', slug: '', category: 'Refund', intent: '', language: 'ENGLISH', body: '', variables: [], isPremium: false }

function normaliseVariables(value: unknown, body: string) {
  if (Array.isArray(value)) return value.map(String)
  return extractVariables(body)
}

export function AdminTemplateForm({ initial = empty }: { initial?: Initial }) {
  const router = useRouter()
  const [data, setData] = useState<Initial>(initial)
  const [message, setMessage] = useState('')
  const detected = useMemo(() => extractVariables(data.body), [data.body])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('Saving...')
    const variables = normaliseVariables(data.variables, data.body).length ? normaliseVariables(data.variables, data.body) : detected
    const res = await fetch(data.id ? `/api/admin/templates/${data.id}` : '/api/admin/templates', {
      method: data.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, variables })
    })
    setMessage(res.ok ? 'Saved.' : 'Save failed.')
    if (res.ok) router.push('/admin/templates')
    router.refresh()
  }

  return <form onSubmit={submit} className="space-y-4 rounded-3xl border bg-white p-6 shadow-soft">
    <div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label>Title</Label><Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} /></div><div className="grid gap-2"><Label>Slug</Label><Input value={data.slug} onChange={(e) => setData({ ...data, slug: e.target.value })} /></div></div>
    <div className="grid gap-4 md:grid-cols-3"><div className="grid gap-2"><Label>Category</Label><Input value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })} /></div><div className="grid gap-2"><Label>Language</Label><Select value={data.language} onChange={(e) => setData({ ...data, language: e.target.value })}><option>ENGLISH</option><option>HINGLISH</option><option>HINDI</option><option>BENGALI</option><option>MARATHI</option><option>TAMIL</option><option>TELUGU</option><option>URDU</option><option>SPANISH</option><option>FRENCH</option><option>ARABIC</option></Select></div><label className="mt-8 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={data.isPremium} onChange={(e) => setData({ ...data, isPremium: e.target.checked })} /> Premium</label></div>
    <div className="grid gap-2"><Label>Intent</Label><Input value={data.intent} onChange={(e) => setData({ ...data, intent: e.target.value })} /></div>
    <div className="grid gap-2"><Label>Template body</Label><Textarea rows={10} value={data.body} onChange={(e) => setData({ ...data, body: e.target.value })} placeholder="Use variables like {companyName}, {amount}" /></div>
    <p className="text-sm text-slate-500">Detected variables: {detected.length ? detected.join(', ') : 'none'}</p>
    <Button type="submit">Save Template</Button>{message ? <p className="text-sm text-slate-500">{message}</p> : null}
  </form>
}
