export function ChatAssistantLoading() {
  return (
    <div className="mx-auto grid max-w-5xl gap-5" aria-hidden="true">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
        <div className="space-y-4">
          <div className="mr-auto max-w-[86%] rounded-3xl bg-slate-100 p-4">
            <div className="skeleton-shimmer h-4 w-36 rounded-full" />
            <div className="skeleton-shimmer mt-3 h-4 w-64 max-w-full rounded-full" />
          </div>
          <div className="ml-auto max-w-[78%] rounded-3xl bg-emerald-50 p-4">
            <div className="skeleton-shimmer h-4 w-48 max-w-full rounded-full" />
          </div>
          <div className="mr-auto max-w-[92%] rounded-3xl bg-slate-100 p-4">
            <div className="skeleton-shimmer h-4 w-56 max-w-full rounded-full" />
            <div className="skeleton-shimmer mt-3 h-4 w-80 max-w-full rounded-full" />
            <div className="skeleton-shimmer mt-3 h-24 rounded-2xl" />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="skeleton-shimmer h-28 rounded-2xl" />
          <div className="skeleton-shimmer h-12 rounded-2xl sm:w-28" />
        </div>
      </div>
    </div>
  )
}
