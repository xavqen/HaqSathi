import { AgentRevenueSimulatorForm } from '@/components/forms/agent-revenue-simulator-form'

export const metadata = { title: 'Agent Revenue Simulator | HaqSathi AI', description: 'Cyber cafe, local agents and service partners can estimate client revenue, break-even and package pricing.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 30 trust tool</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Agent Revenue Simulator</h1><p className="mt-3 max-w-3xl text-slate-600">Cyber cafe, local agents and service partners can estimate client revenue, break-even and package pricing.</p><div className="mt-8"><AgentRevenueSimulatorForm /></div></section></main>
}
