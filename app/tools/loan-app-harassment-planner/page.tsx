import Link from 'next/link'
import { AlertTriangle, PhoneCall, ShieldCheck } from 'lucide-react'
import { LoanAppHarassmentPlannerForm } from '@/components/forms/loan-app-harassment-planner-form'

export const metadata = {
  title: 'Loan App Harassment Planner',
  description: 'Plan safe response, proof checklist and official escalation for loan app harassment, threats, overcharging and privacy misuse.'
}

export default function LoanAppHarassmentPlannerPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><PhoneCall className="h-5 w-5" /> New safety tool</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Loan app harassment planner</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Organize proof, safety warnings and a copy-ready written response for loan app harassment, overcharging, fake legal threats or privacy misuse.
              </p>
            </div>
            <Link href="/tools/proof-file-organizer" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 lg:w-auto">
              Organize proof files
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Threat proof map', 'Know which call logs, screenshots, payment proof and app permission screenshots to preserve.'],
            ['Safe written reply', 'Create a factual message asking for written breakup and harassment stop confirmation.'],
            ['Secret-safe warnings', 'Avoid OTP, PIN, CVV, passwords, screen sharing, ID misuse and contact-list abuse traps.']
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="mt-2 font-black text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-950">
          <div className="flex gap-2 font-black"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Safety note</div>
          <p className="mt-1">Guidance only. For immediate threats, blackmail, physical danger, self-harm pressure or privacy abuse, use trusted people and official emergency/local authority/cybercrime channels quickly.</p>
        </div>

        <div className="mt-6">
          <LoanAppHarassmentPlannerForm />
        </div>
      </section>
    </main>
  )
}
