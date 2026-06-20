import Link from 'next/link'
import { ClipboardList, ShieldCheck } from 'lucide-react'
import { CallVisitLogbookForm } from '@/components/forms/call-visit-logbook-form'

export const metadata = {
  title: 'Call & Visit Logbook',
  description: 'Record calls, office visits, service center visits and support interactions for complaint escalation.'
}

export default function CallVisitLogbookPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800"><ClipboardList className="h-5 w-5" /> New productivity tool</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Call & visit logbook</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Keep a clean record of calls, office visits, branch visits and service center promises. Turn your notes into proof checklist, next follow-up date and a copy-ready message.
              </p>
            </div>
            <Link href="/tools/evidence-timeline-builder" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 lg:w-auto">
              Open evidence timeline
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Verbal promise proof', 'Save date, person, reference and exact outcome after every call or visit.'],
            ['Follow-up ready', 'Create a polite written follow-up from the log entry.'],
            ['Privacy safe', 'Strong warnings stop users from storing OTP/PIN/bank secrets.']
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="mt-2 font-black text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <CallVisitLogbookForm />
        </div>
      </section>
    </main>
  )
}
