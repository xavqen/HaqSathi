import { FollowUpAutomationForm } from '@/components/forms/follow-up-automation-form'

export const metadata = {
  title: 'Auto Follow-up Planner',
  description: 'Complaint ke liye 3, 7, 14 din ke follow-up aur escalation message plan banao.'
}

export default function Page() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border bg-white p-5 shadow-soft sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">Automation</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Auto follow-up system</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">Initial complaint, follow-up, escalation aur final review dates auto-generate karo. Login user ke dashboard reminders bhi create honge.</p>
        </div>
        <div className="mt-6"><FollowUpAutomationForm /></div>
      </section>
    </main>
  )
}
