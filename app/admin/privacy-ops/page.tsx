import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Download, FileText, ShieldCheck, Trash2 } from 'lucide-react'
import { collectPrivacyOperationsReadiness } from '@/lib/privacy/operations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Privacy operations | Admin' }

const localCommand = 'npm run privacy:readiness'
const cronEndpoint = '/api/cron/privacy-ops'

export default async function PrivacyOpsPage() {
  const report = await collectPrivacyOperationsReadiness()
  const stats = [
    ['Consent events', report.counts.consentEvents, ShieldCheck],
    ['Exports last 30d', report.counts.recentExports, Download],
    ['Pending deletion', report.counts.pendingDeletionRequests, Trash2],
    ['In review', report.counts.inReviewDeletionRequests, FileText]
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge>Privacy readiness</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Privacy operations</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Data export, deletion requests, consent auditability and launch privacy evidence ek jagah monitor karo.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/admin/compliance" className="inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold">Compliance center</Link>
          <Link href="/dashboard/privacy-center" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">User Privacy Center</Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, Icon]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-600"><Icon className="h-4 w-4 text-emerald-700" />{label}</CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-black">{value}</div></CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local privacy evidence</CardTitle>
            <CardDescription>Launch se pehle privacy evidence JSON/CSV generate karo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-white">{localCommand}</pre>
            <CopyButton text={localCommand} label="Copy command" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protected privacy cron</CardTitle>
            <CardDescription>Production me CRON_SECRET ke saath readiness endpoint call karo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-white">GET {cronEndpoint}</pre>
            <CopyButton text={cronEndpoint} label="Copy endpoint" />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Readiness checklist</CardTitle>
          <CardDescription>SLA, owner, evidence and manual review requirements.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {report.checklist.map((item) => (
            <div key={item.area} className="rounded-2xl border bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">{item.area}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Owner: {item.owner}</p>
                </div>
                <Badge className={item.status === 'ACTION_NEEDED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'}>{item.status}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.action}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">Evidence: {item.evidence}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest deletion requests</CardTitle>
            <CardDescription>Manual review required before irreversible action.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.latestDeletionRequests.length === 0 && <p className="text-sm text-slate-600">No deletion requests yet.</p>}
            {report.latestDeletionRequests.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4 text-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><b>{item.user}</b><Badge>{item.status}</Badge></div>
                <p className="mt-1 text-slate-600">{item.reason || 'No reason'} · {new Date(item.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minimum launch evidence</CardTitle>
            <CardDescription>Without this evidence, public launch is privacy-risky.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.minimumEvidence.map((item) => (
              <div key={item} className="flex gap-2 rounded-2xl border bg-white p-3 text-sm text-slate-700">
                {item.toLowerCase().includes('deletion') ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />}
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
