import { CheckCircle2, ExternalLink, MailCheck, Megaphone, Send, ShieldAlert, Users, AlertTriangle } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getNewsletterCampaignReport } from '@/lib/newsletter/readiness'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Newsletter Campaign Readiness | Admin' }

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

export default async function AdminNewsletterReadinessPage() {
  await requireAdmin()
  const report = getNewsletterCampaignReport()
  const [queuedEmails, sentEmails, failedEmails, newsletterLogs] = await Promise.all([
    db.emailLog.count({ where: { status: 'QUEUED' } }).catch(() => 0),
    db.emailLog.count({ where: { status: 'SENT' } }).catch(() => 0),
    db.emailLog.count({ where: { status: 'FAILED' } }).catch(() => 0),
    db.emailLog.findMany({
      where: { template: { contains: 'newsletter' } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, toEmail: true, subject: true, template: true, status: true, provider: true, createdAt: true }
    }).catch(() => [])
  ])

  const cards = [
    { label: 'Ready controls', value: report.summary.ready, icon: CheckCircle2, note: `${report.summary.totalControls} total controls` },
    { label: 'Manual review', value: report.summary.manualRequired, icon: AlertTriangle, note: 'Needs founder/admin evidence' },
    { label: 'Queued emails', value: queuedEmails, icon: Send, note: 'EmailLog queued items' },
    { label: 'Sent / failed', value: `${sentEmails}/${failedEmails}`, icon: MailCheck, note: 'Delivery health signal' }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Phase 55</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Newsletter campaign readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Operate email campaigns safely with consent, dry-run guard, segment review, unsubscribe checks and provider evidence before sending to real users.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/api/admin/newsletter-readiness" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"><ExternalLink className="h-4 w-4" />Open API</a>
            <a href="/newsletter" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm"><Megaphone className="h-4 w-4" />Subscribe page</a>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="mt-2 text-3xl font-black">{card.value}</CardTitle>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></span>
              </CardHeader>
              <CardContent><p className="text-sm font-semibold text-slate-500">{card.note}</p></CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <ShieldAlert className="h-6 w-6 text-emerald-700" />
          <CardTitle>Campaign readiness controls</CardTitle>
          <CardDescription>Controls are intentionally conservative so emails are not sent without consent and evidence.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {report.controls.map((control) => (
              <div key={control.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-950">{control.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{control.userValue}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${statusClass(control.status)}`}>{control.status}</span>
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 font-mono text-xs text-slate-600 break-words">{control.adminValue}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{control.launchNote}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Megaphone className="h-6 w-6 text-emerald-700" />
            <CardTitle>Allowed campaign types</CardTitle>
            <CardDescription>Start with useful education and product updates only.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {report.campaignTypes.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ShieldAlert className="h-6 w-6 text-amber-600" />
            <CardTitle>Content safety rules</CardTitle>
            <CardDescription>Marketing must not leak private case details or overpromise.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {report.contentSafetyRules.map((item) => <li key={item} className="flex gap-2"><ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-amber-600" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Users className="h-6 w-6 text-emerald-700" />
          <CardTitle>Audience segment risk map</CardTitle>
          <CardDescription>Use this before sending any campaign to a real audience.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.audienceSegments.map((segment) => (
              <div key={segment.id} className="rounded-2xl border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black text-slate-950">{segment.label}</h3>
                  <span className="rounded-full border bg-slate-50 px-2.5 py-1 text-xs font-black uppercase text-slate-600">{segment.risk}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{segment.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent newsletter email logs</CardTitle>
          <CardDescription>Shows newsletter-related EmailLog rows only. Use provider dashboard for final delivery proof.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {newsletterLogs.length === 0 ? <p className="text-sm text-slate-500">No newsletter logs yet. Test /newsletter after setting up your environment.</p> : newsletterLogs.map((log) => (
            <div key={log.id} className="rounded-2xl border bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="break-words font-black text-slate-950">{log.subject}</h3>
                  <p className="mt-1 break-all text-sm text-slate-600">{log.toEmail} · {log.template} · {log.provider}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(log.createdAt)}</p>
                </div>
                <span className="shrink-0 rounded-full border bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">{log.status}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Minimum launch evidence</CardTitle>
          <CardDescription>Collect this before sending to real users.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            {report.launchEvidence.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
          </ul>
          <div className="mt-5 rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">Local command</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs font-bold text-emerald-100">npm run newsletter:readiness</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
