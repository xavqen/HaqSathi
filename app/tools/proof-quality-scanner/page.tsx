import { ProofQualityScannerForm } from '@/components/forms/proof-quality-scanner-form'

export const metadata = { title: 'Proof Quality Scanner | HaqSathi AI', description: 'Evidence weak hai ya strong, missing proof aur file order instantly check karo.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 31 tool</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Proof Quality Scanner</h1><p className="mt-3 max-w-3xl text-slate-600">Evidence weak hai ya strong, missing proof aur file order instantly check karo.</p><div className="mt-8"><ProofQualityScannerForm /></div></section></main>
}
