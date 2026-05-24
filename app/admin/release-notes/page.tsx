import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const releases = [
  ['v1.9.0', 'Phase 18', 'Final QA, dependency guard, route inventory, launch checklist, CI workflow.'],
  ['v1.8.0', 'Phase 17', 'Health/ready APIs, build center, env audit, error boundaries, deploy guide.'],
  ['v1.7.0', 'Phase 16', 'Partner ops, knowledge base, verification requests, print center, localization.'],
  ['v1.6.0', 'Phase 15', 'Official sources, production QA, feature flags, incidents, case package.'],
  ['v1.5.0', 'Phase 14', 'State rollout, SLA tracker, prompt lab, link checks, success stories.'],
  ['v1.4.0', 'Phase 13', 'Communication logs, outcomes, authority directory, revenue insights.'],
  ['v1.3.0', 'Phase 12', 'Emergency center, filing guides, case tasks, AI review workflow.'],
  ['v1.2.0', 'Phase 11', 'Referrals, privacy center, deletion requests, reminder cron.'],
  ['v1.1.0', 'Phase 10', 'Storage, password reset, Razorpay checkout, proxy cleanup.'],
  ['v1.0.0', 'MVP', 'Complaint, UPI, scheme, documents, dashboard, admin, SEO foundation.']
]

export default function Page() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Release Notes</h1>
        <p className="mt-2 text-slate-600">Internal launch history for support, debugging and rollout planning.</p>
      </div>
      <div className="grid gap-4">
        {releases.map(([version, phase, summary]) => <Card key={version}><CardHeader><CardTitle>{version} — {phase}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-slate-600">{summary}</p></CardContent></Card>)}
      </div>
    </div>
  )
}
