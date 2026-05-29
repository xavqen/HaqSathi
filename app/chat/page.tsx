import type { Metadata } from 'next'
import { ChatAssistant } from '@/components/forms/chat-assistant'

export const metadata: Metadata = { title: 'AI Chat Assistant', description: 'WhatsApp-style assistant for refunds, UPI, bank issues, documents and schemes.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-10"><div className="mb-8 max-w-3xl"><p className="text-sm font-semibold text-emerald-700">AI Assistant</p><h1 className="mt-2 text-4xl font-black">HaqSathi Chat</h1><p className="mt-3 text-slate-600">Describe your issue in your preferred language. The assistant will return action steps, a draft message and a checklist.</p></div><ChatAssistant /></section></main>
}
