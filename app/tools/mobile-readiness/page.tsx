import { MobileReadinessCheckerForm } from '@/components/forms/mobile-readiness-checker-form'

export const metadata = {
  title: 'Mobile Readiness Checker | HaqSathi AI',
  description: 'Check whether a page or feature is mobile-friendly, thumb-friendly and language-ready.'
}

export default function Page() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">Mobile QA</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Mobile-first page checker</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">Sticky header, horizontal nav, button size, low bandwidth aur language selector ke basis par mobile readiness score.</p>
        </div>
        <div className="mt-6"><MobileReadinessCheckerForm /></div>
      </section>
    </main>
  )
}
