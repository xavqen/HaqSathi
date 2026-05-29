'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    fetch('/api/system/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: error.message, digest: error.digest, source: 'app-error-boundary' })
    }).catch(() => undefined)
  }, [error])

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="rounded-3xl border bg-white p-8 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-wider text-red-600">Something broke</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">Page could not load</h1>
          <p className="mt-3 text-slate-600">Refresh the page. If the issue repeats, create a support ticket and attach a screenshot.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={reset} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Try again</button>
            <Link href="/dashboard/support" className="rounded-xl border px-5 py-3 text-sm font-semibold">Report issue</Link>
            <Link href="/" className="rounded-xl border px-5 py-3 text-sm font-semibold">Home</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
