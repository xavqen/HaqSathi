import { AlertTriangle, CheckCircle2, Clock3, Headphones, LifeBuoy, LockKeyhole, MessageSquareText, ShieldCheck } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getSupportTriageReport } from '@/lib/support/triage-readiness'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Support Triage Readiness | Admin | HaqSathi AI' }

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function ageLabel(date: Date) {
  const diffMs = Date.now() - date.getTime()
  const hours = Math.max(0, Math.floor(diffMs / 36e5))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h old`
  const days = Math.floor(hours / 24)
  return `${days}d old`
}

export default async function AdminSupportTriagePage() {
  await requireAdmin()
  const report = getSupportTriageReport()
  const [openTickets, inReviewTickets, resolvedTickets, totalTickets, recentTickets, contactMessages] = await Promise.all([
    db.supportTicket.count({ where: { status: 'OPEN' } }).catch(() => 0),
    db.supportTicket.count({ where: { status: 'IN_REVIEW' } }).catch(() => 0),
    db.supportTicket.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }).catch(() => 0),
    db.supportTicket.count().catch(() => 0),
    db.supportTicket.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8
    }).catch(() => []),
    db.contactMessage.count().catch(() => 0)
  ])

  const urgentTickets = recentTickets.filter((ticket) => /payment|billing|refund|login|account|vault|document|upi|fraud|urgent/i.test(`${ticket.subject} ${ticket.category} ${ticket.message}`)).length

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Badge className="bg-emerald-100 text-emerald-800">Phase 52</Badge>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Support triage readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Human support, live chat readiness, SLA ownership aur privacy-safe reply system ko verify karo. Existing ticket creation logic change nahi kiya gaya.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white bg-white/80 p-3 text-center shadow-sm sm:min-w-[320px]">
            <div><p className="text-2xl font-black text-emerald-700">{report.summary.ready}</p><p className="text-xs font-bold text-slate-500">Ready</p></div>
            <div><p className="text-2xl font-black text-amber-600">{report.summary.manualRequired}</p><p className="text-xs font-bold text-slate-500">Manual</p></div>
            <div><p className="text-2xl font-black text-rose-600">{report.summary.blocked}</p><p className="text-xs font-bold text-slate-500">Blocked</p></div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <LifeBuoy className="h-6 w-6 text-emerald-700" />
            <CardTitle>{totalTickets}</CardTitle>
            <CardDescription>Total support tickets</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Clock3 className="h-6 w-6 text-amber-600" />
            <CardTitle>{openTickets}</CardTitle>
            <CardDescription>Open tickets</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Headphones className="h-6 w-6 text-emerald-700" />
            <CardTitle>{inReviewTickets}</CardTitle>
            <CardDescription>In review</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
            <CardTitle>{resolvedTickets}</CardTitle>
            <CardDescription>Resolved / closed</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <MessageSquareText className="h-6 w-6 text-rose-600" />
            <CardTitle>{urgentTickets}</CardTitle>
            <CardDescription>Urgent-looking latest tickets</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Readiness controls</CardTitle>
          <CardDescription>Run <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run support:readiness</code> and save generated JSON/CSV evidence.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {report.controls.map((control) => (
              <div key={control.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-950">{control.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{control.userValue}</p>
                    <p className="mt-2 text-xs font-bold text-slate-500">{control.adminValue}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${statusClass(control.status)}`}>{control.status}</span>
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{control.launchNote}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest tickets</CardTitle>
            <CardDescription>Fast triage view. Full ticket list remains on /admin/support.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTickets.length === 0 ? <p className="text-sm text-slate-500">No tickets yet. Create one test ticket before launch.</p> : recentTickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate font-black text-slate-950">{ticket.subject}</h3>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{ticket.user?.email || 'guest'} · {ticket.category} · {ageLabel(ticket.createdAt)}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">{ticket.status}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{ticket.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority and safe reply rules</CardTitle>
            <CardDescription>Support reply me legal/financial overclaim aur private-data leakage avoid karo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <h3 className="font-black text-slate-950">Priority rules</h3>
              <ul className="mt-3 space-y-3 text-sm text-slate-700">
                {report.priorityRules.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />{item}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-black text-slate-950">Safe reply checklist</h3>
              <ul className="mt-3 space-y-3 text-sm text-slate-700">
                {report.safeReplyChecklist.map((item) => <li key={item} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Minimum launch evidence</CardTitle>
            <CardDescription>Support system ko public launch se pehle manually prove karo.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-700">
              {report.minimumEvidence.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Protected API + intake count</CardTitle>
            <CardDescription>Admin-only support readiness endpoint for QA automation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs font-bold text-emerald-100">GET /api/admin/support-triage-readiness</pre>
            <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
              Contact messages waiting in database: <b>{contactMessages}</b>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.recommendedStatuses.map((status) => <span key={status} className="rounded-full border bg-white px-3 py-1 text-xs font-black text-slate-700">{status}</span>)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <LockKeyhole className="h-6 w-6 text-emerald-700" />
          <CardTitle>Privacy note for live chat</CardTitle>
          <CardDescription>Third-party live chat widgets can add cookies and collect metadata.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">
            Default mode ticket-based support hi rakho. Live chat widget tabhi enable karo jab privacy policy, cookie consent, data retention aur sensitive-document rules verify ho jayein.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
