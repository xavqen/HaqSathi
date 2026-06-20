import { FraudEscalationAlert } from '@/components/content/fraud-escalation-alert'
import { SmartComplaintWizardForm } from '@/components/forms/smart-complaint-wizard-form'

export const metadata = {
  title: 'Smart Complaint Wizard',
  description: 'Mobile-first complaint pack builder with score, evidence checklist, drafts, call script and follow-up plan.'
}

export default function Page() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-emerald-950 to-cyan-950 p-5 text-white shadow-soft sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">Phase 27 · Smart workflow</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">One mobile flow → full complaint action pack</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50 sm:text-base">User ko alag-alag tools me bhatakna nahi padega. Issue details, evidence, language aur goal enter karo; AI readiness score, complaint draft, WhatsApp message, call script aur follow-up timeline ek saath dega.</p>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4">Case readiness score</div>
            <div className="rounded-2xl bg-white/10 p-4">Evidence gap checker</div>
            <div className="rounded-2xl bg-white/10 p-4">Copy-ready drafts</div>
            <div className="rounded-2xl bg-white/10 p-4">Mobile-first UI</div>
          </div>
        </div>
        <FraudEscalationAlert className="mt-6" compact /><div className="mt-6"><SmartComplaintWizardForm /></div>
      </section>
    </main>
  )
}
