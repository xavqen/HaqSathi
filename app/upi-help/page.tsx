import type { Metadata } from 'next'
import { UpiHelper } from '@/components/forms/upi-helper'

export const metadata: Metadata = { title: 'UPI Help', description: 'Wrong UPI transfer, UPI fraud, failed payment ke urgent steps and complaint drafts.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-10"><div className="mb-8 max-w-3xl"><p className="text-sm font-semibold text-emerald-700">Urgent Helper</p><h1 className="mt-2 text-4xl font-black">UPI Fraud / Wrong Transfer Helper</h1><p className="mt-3 text-slate-600">Bank message, NPCI-style draft, document checklist aur follow-up plan generate karo.</p></div><UpiHelper /></section></main>
}
