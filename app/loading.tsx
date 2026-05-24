export default function Loading() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="animate-pulse rounded-3xl border bg-white p-8 shadow-soft">
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="mt-4 h-10 max-w-lg rounded bg-slate-200" />
          <div className="mt-4 h-4 max-w-2xl rounded bg-slate-200" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[1,2,3].map((i) => <div key={i} className="h-40 rounded-2xl bg-slate-200" />)}
          </div>
        </div>
      </section>
    </main>
  )
}
