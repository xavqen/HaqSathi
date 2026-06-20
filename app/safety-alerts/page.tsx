import Link from 'next/link'
import { AlertTriangle, BellRing, FileWarning, ShieldCheck, Siren, Sparkles } from 'lucide-react'
import { SafetyAlertReportForm } from '@/components/forms/safety-alert-report-form'
import { communitySafetyLanes } from '@/lib/safety/community-safety-readiness'

export const metadata = {
  title: 'Community Safety Alerts',
  description: 'Report scam patterns safely and learn common UPI, loan app, job, shopping and suspicious link warning signs.'
}

const warningCards = [
  ['Never share OTP, UPI PIN, CVV or passwords', 'Real banks, payment apps and support teams never need these secrets.'],
  ['Do not trust urgent refund links', 'Fake support numbers often create panic and ask you to pay a small amount first.'],
  ['Save proof, then use official reporting routes', 'Screenshots, transaction IDs and dates help, but keep private data protected.']
]

export default function SafetyAlertsPage() {
  return (
    <main className="bg-slate-50">
      <section className="hero-grid-bg border-b border-emerald-100 bg-gradient-to-b from-emerald-50 via-white to-slate-50">
        <div className="hs-container grid gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-black text-emerald-800 shadow-sm">
              <BellRing className="h-4 w-4" /> Community safety alerts
            </div>
            <h1 className="mt-5 text-[2.35rem] font-black leading-[0.95] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Report scam patterns safely. Learn before money is lost.</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">HaqSathi can collect privacy-safe scam pattern reports for moderation and turn them into educational alerts. Public alerts should always be aggregated, redacted and reviewed.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#report" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-emerald-900/10">Report a pattern</a>
              <Link href="/emergency" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 hover:bg-slate-50">Urgent help routes</Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><ShieldCheck className="h-6 w-6" /></div>
              <div>
                <p className="text-sm font-black text-slate-950">Guidance only</p>
                <p className="text-xs font-semibold text-slate-500">Use official portals for final reports.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {warningCards.map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-black text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hs-container grid gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><Sparkles className="h-5 w-5" /> Common alert lanes</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {communitySafetyLanes.map((lane) => (
              <article key={lane.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800">{lane.priority}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-700">{lane.category.replaceAll('_', ' ')}</span>
                </div>
                <h2 className="mt-3 font-black text-slate-950">{lane.id.replaceAll('-', ' ')}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Signal:</strong> {lane.userSignal}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Safety rule:</strong> {lane.safetyRule}</p>
              </article>
            ))}
          </div>
        </div>

        <aside id="report" className="scroll-mt-28">
          <SafetyAlertReportForm />
        </aside>
      </section>

      <section className="hs-container pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <Siren className="h-6 w-6 text-emerald-700" />
            <h2 className="mt-3 font-black text-slate-950">Urgent money loss?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Contact your bank/payment app and official cyber reporting channels immediately.</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <FileWarning className="h-6 w-6 text-emerald-700" />
            <h2 className="mt-3 font-black text-slate-950">Keep proof safe</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Save screenshots, dates, transaction IDs and messages, but redact private secrets before sharing.</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <AlertTriangle className="h-6 w-6 text-emerald-700" />
            <h2 className="mt-3 font-black text-slate-950">No public accusations</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Public alerts should show patterns, not private names, phone numbers or unverified claims.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
