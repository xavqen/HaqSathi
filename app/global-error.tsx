'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html lang="en-IN">
      <body>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
          <section style={{ maxWidth: 640, border: '1px solid #e2e8f0', borderRadius: 24, padding: 32 }}>
            <p style={{ color: '#dc2626', fontWeight: 800 }}>Critical app error</p>
            <h1 style={{ fontSize: 36, margin: '12px 0' }}>HaqSathi could not load</h1>
            <p>Try again. If it repeats, check deployment logs.</p>
            <button onClick={reset} style={{ marginTop: 20, borderRadius: 12, padding: '12px 18px', background: '#047857', color: 'white', fontWeight: 700 }}>Try again</button>
          </section>
        </main>
      </body>
    </html>
  )
}
