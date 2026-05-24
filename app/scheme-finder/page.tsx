import type { Metadata } from 'next'
import { SchemeFinder } from '@/components/forms/scheme-finder'

export const metadata: Metadata = { title: 'Government Scheme Finder', description: 'State, age, income aur purpose ke basis par scheme suggestions in simple Hinglish.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-10"><div className="mb-8 max-w-3xl"><p className="text-sm font-semibold text-emerald-700">Scheme Guidance</p><h1 className="mt-2 text-4xl font-black">Government Scheme Finder</h1><p className="mt-3 text-slate-600">Possible schemes, eligibility clues, required documents aur apply steps pao. Official portal verify zaroor karein.</p></div><SchemeFinder /></section></main>
}
