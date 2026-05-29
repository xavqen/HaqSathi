import { CaseCoachForm } from '@/components/forms/case-coach-form'

export const metadata = {
  title: 'AI Case Coach | HaqSathi AI',
  description: 'Complaint draft ko score karo, missing evidence pakdo aur next best action lo.'
}

export default function Page() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">AI coach</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Case strong hai ya weak?</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">Draft paste karo. HaqSathi score, missing points, better opening paragraph, escalation readiness aur next action suggest karega.</p>
        </div>
        <div className="mt-6"><CaseCoachForm /></div>
      </section>
    </main>
  )
}
