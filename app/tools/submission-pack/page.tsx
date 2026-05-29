import { SubmissionPackForm } from '@/components/forms/submission-pack-form'

export const metadata = {
  title: 'Submission Pack Generator | HaqSathi AI',
  description: 'Email, WhatsApp, support chat, call script, escalation and social-safe complaint messages in one mobile-friendly pack.'
}

export default function Page() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 p-5 text-white shadow-soft sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">Phase 28 · Submission pack</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">One form → all messages ready</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50 sm:text-base">Complaint banane ke baad sabse bada problem hota hai “bhejna kaise hai?” Yeh tool email, WhatsApp, support chat, call script, escalation aur social-safe post ko mobile copy-ready format me dega.</p>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4">Email + subject</div>
            <div className="rounded-2xl bg-white/10 p-4">WhatsApp support</div>
            <div className="rounded-2xl bg-white/10 p-4">Call script</div>
            <div className="rounded-2xl bg-white/10 p-4">Escalation pack</div>
          </div>
        </div>
        <div className="mt-6"><SubmissionPackForm /></div>
      </section>
    </main>
  )
}
