import nextDynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { ChatAssistantLoading } from '@/components/forms/chat-assistant-loading'
import { InstallPwaCard } from '@/components/layout/install-pwa'

const ChatAssistant = nextDynamic(
  () => import('@/components/forms/chat-assistant').then((mod) => mod.ChatAssistant),
  { loading: () => <ChatAssistantLoading /> }
)

export const dynamic = 'force-static'
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'AI Chat Assistant',
  description: 'Fast, mobile-first AI assistant for refunds, UPI, bank issues, documents and schemes.',
  alternates: { canonical: '/chat' }
}

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="hs-container py-8 sm:py-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">AI Assistant</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">HaqSathi Chat</h1>
          <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">Describe your issue once. Get action steps, a copy-ready draft, checklist and safety warnings without a broken loading state.</p>
        </div>
        <div className="mb-5">
          <InstallPwaCard compact />
        </div>
        <ChatAssistant />
      </section>
    </main>
  )
}
