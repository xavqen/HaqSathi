'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'

type Reply = { reply: string; actionSteps: string[]; draftMessage: string; checklist: string[]; disclaimer: string }
type ChatItem = { role: 'user' | 'assistant'; text: string; data?: Reply }

export function ChatAssistant() {
  const [message, setMessage] = useState('')
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [items, setItems] = useState<ChatItem[]>([
    { role: 'assistant', text: 'Namaste! Apna refund, UPI, bank, scheme ya document issue simple language me batao.' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send() {
    if (message.trim().length < 4) return
    const text = message.trim()
    setItems((old) => [...old, { role: 'user', text }])
    setMessage('')
    setLoading(true)
    setError(null)
    const res = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, sessionId }) })
    const data = await res.json()
    setLoading(false)
    if (!data.ok) return setError(data.error || 'Chat failed')
    setSessionId(data.sessionId)
    setItems((old) => [...old, { role: 'assistant', text: data.result.reply, data: data.result }])
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      <div className="rounded-3xl border bg-white p-4 shadow-soft">
        <div className="max-h-[560px] space-y-4 overflow-y-auto p-1">
          {items.map((item, index) => (
            <div key={index} className={item.role === 'user' ? 'ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-primary-foreground' : 'mr-auto max-w-[92%] rounded-2xl bg-slate-100 px-4 py-3 text-slate-900'}>
              <p className="whitespace-pre-wrap text-sm leading-6">{item.text}</p>
              {item.data && <AssistantCard data={item.data} />}
            </div>
          ))}
          {loading && <div className="mr-auto rounded-2xl bg-slate-100 px-4 py-3 text-sm">Typing...</div>}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Example: Mera Flipkart refund nahi aaya kya karu?" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
          <Button onClick={send} disabled={loading}><Send className="mr-2 h-4 w-4" />Send</Button>
        </div>
        {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  )
}

function AssistantCard({ data }: { data: Reply }) {
  return (
    <div className="mt-4 space-y-3 rounded-2xl border bg-white p-4 text-slate-900">
      <div><b>Action steps</b><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{data.actionSteps.map((x) => <li key={x}>{x}</li>)}</ul></div>
      <div className="rounded-xl bg-slate-50 p-3"><div className="flex items-center justify-between gap-2"><b>Draft message</b><CopyButton text={data.draftMessage} /></div><p className="mt-2 whitespace-pre-wrap text-sm">{data.draftMessage}</p></div>
      <div><b>Checklist</b><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{data.checklist.map((x) => <li key={x}>{x}</li>)}</ul></div>
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{data.disclaimer}</p>
    </div>
  )
}
