import { CallScriptForm } from '@/components/forms/call-script-form'

export const metadata = { title: 'Call Script Generator', description: 'Bank, company support, helpline ya authority ko call karne ke liye safe Hinglish call script generate karo.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 13 tool</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Call Script Generator</h1><p className="mt-3 max-w-2xl text-slate-600">Support ya authority ko call karte waqt kya bolna hai, kya note karna hai, aur baad me kya message bhejna hai — sab ready.</p><div className="mt-8"><CallScriptForm /></div></section></main>
}
