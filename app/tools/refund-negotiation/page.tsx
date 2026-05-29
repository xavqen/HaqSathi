import { RefundNegotiationForm } from '@/components/forms/refund-negotiation-form'

export const metadata = { title: 'Refund Negotiation Builder | HaqSathi AI', description: 'Refund delay ke liye message ladder, proof order, firm wording and escalation schedule generate karo.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Money recovery</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Refund Negotiation Builder</h1><p className="mt-3 max-w-3xl text-slate-600">Refund delay ke liye message ladder, proof order, firm wording and escalation schedule generate karo.</p><div className="mt-8"><RefundNegotiationForm /></div></section></main>
}
