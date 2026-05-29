import { EvidenceTimelineBuilderForm } from '@/components/forms/evidence-timeline-builder-form'

export const metadata = { title: 'Evidence Timeline Builder | HaqSathi AI', description: 'Convert messy events into clean timeline, proof index, missing evidence and next best action.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Phase 30 trust tool</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Evidence Timeline Builder</h1><p className="mt-3 max-w-3xl text-slate-600">Convert messy events into clean timeline, proof index, missing evidence and next best action.</p><div className="mt-8"><EvidenceTimelineBuilderForm /></div></section></main>
}
