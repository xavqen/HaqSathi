import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const tools = [
  ['/tools/deadline-calculator', 'Complaint Deadline Calculator', 'Follow-up aur escalation dates auto calculate karo.'],
  ['/tools/complaint-strength-checker', 'Complaint Strength Checker', 'Draft strong hai ya weak, 100 score me check karo.'],
  ['/tools/evidence-checklist', 'Evidence Checklist', 'Case type ke hisaab se proof list nikalo.'],
  ['/tools/risk-assessment', 'Risk Assessment', 'Fraud/refund/bank issue ki urgency samjho.'],
  ['/tools/application-tracker', 'Application Tracker', 'Scheme/document application ko manually track karo.'],
  ['/tools/legal-notice-draft', 'Legal Notice Style Draft', 'Formal notice-style draft with safe disclaimer.'],
  ['/tools/rti-helper', 'RTI Application Helper', 'Clear RTI questions and application draft.'],
  ['/tools/consumer-forum-pack', 'Consumer Forum Pack', 'Complaint summary + evidence index builder.'],
  ['/tools/bank-escalation', 'Bank Escalation Planner', 'Bank grievance stage, draft and evidence plan.'],
  ['/tools/ombudsman-planner', 'Ombudsman Planner', 'Official escalation readiness pack banao.'],
  ['/tools/call-script-generator', 'Call Script Generator', 'Bank/company/helpline call ke liye safe script banao.'],
  ['/tools/sla-planner', 'SLA Planner', 'Case follow-up dates aur escalation stages plan karo.'],
  ['/tools/grievance-route-finder', 'Grievance Route Finder', 'Issue ke liye best escalation route choose karo.'],
  ['/tools/fee-refund-calculator', 'Fee Refund Calculator', 'Paid amount aur deduction se refund estimate nikalo.'],
  ['/tools/appeal-draft', 'Appeal Draft Helper', 'Authority ko polite appeal/follow-up draft banao.'],
  ['/tools/notice-reply-draft', 'Notice Reply Draft', 'General notice/communication ka safe reply draft.'],
  ['/tools/status-message-builder', 'Status Message Builder', 'Complaint/application status follow-up message.'],
  ['/tools/document-gap-analyzer', 'Document Gap Analyzer', 'Missing documents ko quick identify karo.']
]

export const metadata = { title: 'Free Public Tools | HaqSathi AI', description: 'Complaint, refund, UPI, scheme and document help ke free public tools.' }

export default function ToolsPage() {
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Public toolkit</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Free life-admin tools</h1><p className="mt-3 max-w-2xl text-slate-600">Complaint bhejne se pehle timeline, risk, evidence, legal-style draft, RTI aur escalation pack prepare kar lo.</p><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{tools.map(([href, title, desc]) => <Link key={href} href={href}><Card className="h-full transition hover:-translate-y-1 hover:shadow-lg"><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600">{desc}</p><p className="mt-4 text-sm font-bold text-primary">Open tool →</p></CardContent></Card></Link>)}</div></section></main>
}
