import { FraudEscalationAlert } from '@/components/content/fraud-escalation-alert'
import { ScamRadarForm } from '@/components/forms/scam-radar-form'

export const metadata = { title: 'Scam Radar', description: 'Paste suspicious SMS, WhatsApp, call summary or UPI message and get risk score, red flags, safe reply and immediate action steps.' }

export default function Page() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Fraud safety</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Scam Radar</h1><p className="mt-3 max-w-3xl text-slate-600">Paste suspicious SMS, WhatsApp, call summary or UPI message and get risk score, red flags, safe reply and immediate action steps.</p><FraudEscalationAlert className="mt-6" compact /><div className="mt-8"><ScamRadarForm /></div></section></main>
}
