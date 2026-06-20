import { FamilyCaseSwitchboardForm } from '@/components/forms/family-case-switchboard-form'

export const metadata = { title: 'Family Case Switchboard', description: 'Family/agent cases ko owner, priority, role plan aur reminder text ke saath organize karo.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 31 tool</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Family Case Switchboard</h1><p className="mt-3 max-w-3xl text-slate-600">Family/agent cases ko owner, priority, role plan aur reminder text ke saath organize karo.</p><div className="mt-8"><FamilyCaseSwitchboardForm /></div></section></main>
}
