import type { Metadata } from 'next'
import Link from 'next/link'
import { SUPPORT_EMAIL } from '@/lib/content/site-contact'

export const dynamic = 'force-static'
export const revalidate = 86400

export const metadata: Metadata = { title: 'About', description: 'Why HaqSathi AI exists and how it helps people in India create complaint drafts, checklists and next steps.' }

export default function Page() {
  return (
    <main className="bg-slate-50">
      <article className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-[2rem] border bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-black uppercase tracking-wider text-emerald-700">About</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950 sm:text-5xl">About HaqSathi AI</h1>
          <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700 sm:text-base">
            <section><h2 className="text-2xl font-black text-slate-950">Why we built this</h2><p className="mt-2">Every year, millions of people in India deal with a wrong UPI transfer, a refund that never comes, a defective product, or a government scheme they do not know how to apply for — and most give up, not because they are wrong, but because they do not know the right words, the right form, or the right place to send it.</p><p className="mt-2">HaqSathi AI exists to fix that. Describe your problem in plain language — English, Hindi, or your preferred language — and get back a clear, copy-ready complaint draft, evidence checklist, follow-up plan, and the right next step.</p></section>
            <section><h2 className="text-2xl font-black text-slate-950">What we are and are not</h2><p className="mt-2">HaqSathi AI is a guidance and drafting tool. We are not a government department, bank, court, or law firm, and we do not guarantee outcomes. What we do is help you organize your facts, write clearly, and know what to send, to whom, and when — so you are prepared before contacting your bank, a consumer forum, an RTI office, or a scheme portal.</p></section>
            <section><h2 className="text-2xl font-black text-slate-950">How it works</h2><ol className="mt-3 list-decimal space-y-2 pl-5"><li><b>Choose your issue</b> — refund, UPI, bank, document, scheme, or safety problem.</li><li><b>Fill in simple details</b> — amount, date, company, proof, and what you want.</li><li><b>Copy and act</b> — use the draft, checklist, call script, and reminders.</li></ol></section>
            <section><h2 className="text-2xl font-black text-slate-950">Built for India</h2><p className="mt-2">HaqSathi AI defaults to English and supports Hinglish, Hindi, and over 20 other Indian and global languages, with mobile-first workflows — including for local service agents helping multiple clients.</p></section>
            <section><h2 className="text-2xl font-black text-slate-950">Get in touch</h2><p className="mt-2">Questions, feedback, or a correction to suggest? Email us at <a className="font-black text-emerald-700 underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p></section>
          </div>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/complaint" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Generate Complaint</Link><Link href="/tools" className="rounded-xl border px-5 py-3 font-semibold">Explore Tools</Link></div>
        </div>
      </article>
    </main>
  )
}
