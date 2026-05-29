import { PublicPostSafetyForm } from '@/components/forms/public-post-safety-form'

export const metadata = { title: 'Public Post Safety Checker | HaqSathi AI', description: 'Check Facebook, Instagram, X or app review text before posting complaint publicly.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 30 trust tool</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Public Post Safety Checker</h1><p className="mt-3 max-w-3xl text-slate-600">Check Facebook, Instagram, X or app review text before posting complaint publicly.</p><div className="mt-8"><PublicPostSafetyForm /></div></section></main>
}
