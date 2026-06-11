import { Activity, AlertTriangle, CalendarClock, CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { statusTrackingPortals } from '@/lib/status-tracking-readiness'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Status Tracker | Dashboard | HaqSathi AI' }

function portalForComplaint(type: string) {
  const lower = type.toLowerCase()
  if (lower.includes('upi') || lower.includes('payment')) return statusTrackingPortals.find((portal) => portal.id === 'upi')
  if (lower.includes('bank') || lower.includes('refund')) return statusTrackingPortals.find((portal) => portal.id === 'banking')
  if (lower.includes('scheme') || lower.includes('document')) return statusTrackingPortals.find((portal) => portal.id === 'scheme')
  if (lower.includes('fraud') || lower.includes('cyber')) return statusTrackingPortals.find((portal) => portal.id === 'cybercrime')
  return statusTrackingPortals.find((portal) => portal.id === 'consumerhelpline') || statusTrackingPortals[0]
}

export default async function DashboardStatusTrackerPage() {
  const user = await requireUser()
  const [complaints, slaTracks] = await Promise.all([
    db.complaint.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, type: true, companyName: true, transactionId: true, status: true, createdAt: true, updatedAt: true }
    }).catch(() => []),
    db.caseSlaTrack.findMany({
      where: { userId: user.id },
      orderBy: { targetDate: 'asc' },
      take: 6,
      select: { id: true, title: true, stage: true, targetDate: true, status: true, nextAction: true, complaintId: true }
    }).catch(() => [])
  ])

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Safe tracking</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Status tracker</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Track complaint, refund, UPI, bank, cyber and scheme follow-ups safely. Add only reference IDs and visible status — never OTP, password, UPI PIN or bank secrets.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/dashboard/sla-tracker" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"><CalendarClock className="h-4 w-4" />SLA tracker</a>
            <a href="/dashboard/reminders" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm"><Activity className="h-4 w-4" />Reminders</a>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div><CardDescription>Tracked cases</CardDescription><CardTitle className="mt-2 text-3xl font-black">{complaints.length}</CardTitle></div>
            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div><CardDescription>Upcoming SLA actions</CardDescription><CardTitle className="mt-2 text-3xl font-black">{slaTracks.length}</CardTitle></div>
            <CalendarClock className="h-6 w-6 text-emerald-700" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div><CardDescription>Safe portal categories</CardDescription><CardTitle className="mt-2 text-3xl font-black">{statusTrackingPortals.length}</CardTitle></div>
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your case status map</CardTitle>
          <CardDescription>Use this to decide where to check status and what safe reference number is useful.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {complaints.map((complaint) => {
              const portal = portalForComplaint(complaint.type)
              const relatedSla = slaTracks.find((track) => track.complaintId === complaint.id)
              return (
                <div key={complaint.id} className="rounded-2xl border bg-white p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="break-words text-base font-black text-slate-950">{complaint.companyName}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{complaint.type} · current app status: {complaint.status.replace('_', ' ')}</p>
                      {complaint.transactionId && <p className="mt-1 break-words text-xs font-bold text-slate-500">Reference available: {complaint.transactionId}</p>}
                    </div>
                    <Badge className="w-fit">{portal?.label || 'General tracking'}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">Safe next checks</p>
                      <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                        {(portal?.safeStatusChecks || ['Check official source manually', 'Save status and date', 'Set next follow-up']).slice(0, 3).map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-rose-50 p-3">
                      <p className="text-xs font-black uppercase tracking-wide text-rose-700">Never share</p>
                      <ul className="mt-2 grid gap-2 text-sm text-rose-700">
                        {(portal?.neverAskFor || ['OTP', 'password', 'UPI PIN']).slice(0, 4).map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{item}</li>)}
                      </ul>
                    </div>
                  </div>
                  {relatedSla && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">Next SLA action: {relatedSla.nextAction} · due {relatedSla.targetDate.toDateString()}</p>}
                </div>
              )
            })}
            {complaints.length === 0 && (
              <div className="rounded-2xl border bg-white p-5 text-sm text-slate-600">
                <p className="font-black text-slate-900">No cases yet.</p>
                <p className="mt-2">Create a complaint draft first, then this tracker will show safe portal category, reference examples and next follow-up rules.</p>
                <a href="/complaint" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground"><ExternalLink className="h-4 w-4" />Create complaint</a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portal category quick guide</CardTitle>
          <CardDescription>These are guidance maps, not automatic login/scraping systems.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {statusTrackingPortals.map((portal) => (
              <div key={portal.id} className="rounded-2xl border bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-950">{portal.label}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-emerald-700">Useful references</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{portal.referenceExamples.join(' · ')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
