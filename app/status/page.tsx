import { FraudEscalationAlert } from '@/components/content/fraud-escalation-alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = { title: 'Service Status', description: 'Service status and safety notes for HaqSathi AI.' }

const statusItems = [
  { title: 'Website', status: 'Operational', description: 'Public pages and tools are available.' },
  { title: 'AI Assistant', status: 'Operational', description: 'AI drafts use provider APIs when configured and safe fallback drafts when providers are unavailable.' },
  { title: 'Database', status: 'Operational', description: 'Account, case and saved-draft workflows are connected through the production database layer.' }
]

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-black">Service Status</h1>
      <p className="mt-3 text-slate-600">Current user-facing service status for HaqSathi AI.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {statusItems.map((item) => (
          <Card key={item.title}>
            <CardHeader><CardTitle>{item.title}: {item.status}</CardTitle></CardHeader>
            <CardContent>
              <p className="font-bold text-emerald-700">All systems normal</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 rounded-3xl border bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black">Production health checks</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">For deployment monitoring, use <code className="rounded bg-slate-100 px-2 py-1 font-semibold">/api/health</code> for basic uptime and <code className="rounded bg-slate-100 px-2 py-1 font-semibold">/api/ready</code> for environment/database readiness. Both endpoints return no-store responses so old health data is not cached.</p>
      </div>
      <FraudEscalationAlert className="mt-8" />
    </main>
  )
}
