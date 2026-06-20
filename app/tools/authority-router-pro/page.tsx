import { AuthorityRouterProForm } from '@/components/forms/authority-router-pro-form'

export const metadata = { title: 'Authority Router Pro', description: 'Issue ke liye correct support, grievance, authority and escalation route choose karo.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Correct route</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Authority Router Pro</h1><p className="mt-3 max-w-3xl text-slate-600">Issue ke liye correct support, grievance, authority and escalation route choose karo.</p><div className="mt-8"><AuthorityRouterProForm /></div></section></main>
}
