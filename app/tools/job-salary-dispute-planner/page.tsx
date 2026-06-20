import Link from 'next/link'
import { AlertTriangle, BriefcaseBusiness, ShieldCheck } from 'lucide-react'
import { JobSalaryDisputePlannerForm } from '@/components/forms/job-salary-dispute-planner-form'

export const metadata = {
  title: 'Job & Salary Dispute Planner',
  description: 'Plan salary delay, job scam, fake offer, deduction, experience letter or freelance payment follow-up with proof checklist and safe copy.'
}

export default function JobSalaryDisputePlannerPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><BriefcaseBusiness className="h-5 w-5" /> New work-safety tool</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Job & salary dispute planner</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Organize salary delay, wrong deduction, fake offer, job fee scam, experience letter and freelance payment issues into proof checklist, escalation route and safe written follow-up.
              </p>
            </div>
            <Link href="/tools/proof-file-organizer" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 lg:w-auto">
              Organize proof files
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Salary proof map', 'Know which salary slips, offer letters, attendance/work proof and payment screenshots to preserve.'],
            ['Job scam safety', 'Avoid registration/security/training/kit fee traps and document misuse before it gets worse.'],
            ['Written follow-up', 'Create a factual HR/client/recruiter message asking for breakup, status and resolution date.']
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="mt-2 font-black text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <div className="flex gap-2 font-black"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Safety note</div>
          <p className="mt-1">Guidance only. Verify job offers, recruiter identity, official company domain and payment requests before sharing documents or paying any fee. For fraud/threats, use official channels quickly.</p>
        </div>

        <div className="mt-6">
          <JobSalaryDisputePlannerForm />
        </div>
      </section>
    </main>
  )
}
