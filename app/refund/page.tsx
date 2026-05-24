import type { Metadata } from 'next'
import Link from 'next/link'
import { ComplaintGenerator } from '@/components/forms/complaint-generator'

export const metadata: Metadata = { title: 'Refund Complaint Generator', description: 'Refund not received complaint email, support message and follow-up draft generator.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-10"><div className="mb-8 max-w-3xl"><p className="text-sm font-semibold text-emerald-700">Refund Tool</p><h1 className="mt-2 text-4xl font-black">Refund Complaint Generator</h1><p className="mt-3 text-slate-600">Refund issue ke liye same complaint engine use karo. Type me “Refund not received” select rakho.</p><div className="mt-4 flex flex-wrap gap-3 text-sm"><Link className="text-emerald-700 font-semibold" href="/refund/amazon-refund-not-received">Amazon refund guide</Link><Link className="text-emerald-700 font-semibold" href="/refund/flipkart-refund-complaint">Flipkart refund guide</Link></div></div><ComplaintGenerator /></section></main>
}
