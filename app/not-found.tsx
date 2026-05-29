import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="rounded-3xl border bg-white p-8 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">404</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">Page not found</h1>
          <p className="mt-3 text-slate-600">The link may be incorrect or the page may have moved. Use search to find a tool or guide.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/search" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Search</Link>
            <Link href="/tools" className="rounded-xl border px-5 py-3 text-sm font-semibold">Open tools</Link>
            <Link href="/" className="rounded-xl border px-5 py-3 text-sm font-semibold">Home</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
