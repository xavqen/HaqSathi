import { ChatAssistantLoading } from '@/components/forms/chat-assistant-loading'

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="hs-container py-8 sm:py-10">
        <div className="mb-8 max-w-3xl">
          <div className="skeleton-shimmer h-4 w-28 rounded-full" />
          <div className="skeleton-shimmer mt-3 h-10 w-64 max-w-full rounded-full" />
          <div className="skeleton-shimmer mt-3 h-5 w-full max-w-xl rounded-full" />
        </div>
        <ChatAssistantLoading />
      </section>
    </main>
  )
}
