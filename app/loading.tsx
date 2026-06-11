import { LoadingCardSkeleton, Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="min-h-[70vh] bg-slate-50">
      <section className="hs-container py-8 sm:py-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="mt-5 h-11 max-w-xl" />
          <Skeleton className="mt-3 h-11 max-w-lg" />
          <Skeleton className="mt-5 h-4 max-w-2xl" />
          <Skeleton className="mt-2 h-4 max-w-xl" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <LoadingCardSkeleton key={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
