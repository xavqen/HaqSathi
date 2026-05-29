import { RightsExplainerForm } from '@/components/forms/rights-explainer-form'

export const metadata = { title: 'Rights Explainer | HaqSathi AI', description: 'Common people ke liye practical rights, what to ask, next steps and safe words in simple language.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Simple rights</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Rights Explainer</h1><p className="mt-3 max-w-3xl text-slate-600">Common people ke liye practical rights, what to ask, next steps and safe words in simple language.</p><div className="mt-8"><RightsExplainerForm /></div></section></main>
}
