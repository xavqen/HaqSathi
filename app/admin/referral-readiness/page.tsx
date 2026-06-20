import { Gift, ShieldCheck, Share2, TrendingUp, Users, AlertTriangle, CheckCircle2, ExternalLink, BadgeIndianRupee } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getReferralGrowthReport, maskReferralEmail } from '@/lib/referrals'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Referral Growth Readiness | Admin' }

function statusClass(status: string) {
  if (status === 'PASS' || status === 'READY_TO_TEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'BLOCKED') return 'border-rose-200 bg-rose-50 text-rose-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default async function AdminReferralReadinessPage() {
  await requireAdmin()
  const report = getReferralGrowthReport()
  const [totalInvites, convertedInvites, createdInvites, recentInvites, activeUsers] = await Promise.all([
    db.referralInvite.count().catch(() => 0),
    db.referralInvite.count({ where: { status: 'CONVERTED' } }).catch(() => 0),
    db.referralInvite.count({ where: { status: 'CREATED' } }).catch(() => 0),
    db.referralInvite.findMany({ orderBy: { createdAt: 'desc' }, take: 12 }).catch(() => []),
    db.user.count().catch(() => 0)
  ])
  const conversionRate = totalInvites ? Math.round((convertedInvites / totalInvites) * 1000) / 10 : 0
  const cards = [
    { label: 'Total invites', value: totalInvites, icon: Share2, note: 'Created referral links' },
    { label: 'Converted', value: convertedInvites, icon: TrendingUp, note: `${conversionRate}% conversion rate` },
    { label: 'Pending/review', value: createdInvites, icon: AlertTriangle, note: 'Created but not converted' },
    { label: 'Users', value: activeUsers, icon: Users, note: 'Potential referrers' }
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-soft sm:p-7">
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Phase 54</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Referral growth readiness</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Referral links already exist for users. This page adds launch controls for rewards, fraud review, disclosure, evidence and safe growth operations before public promotion.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/api/admin/referral-readiness" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"><ExternalLink className="h-4 w-4" />Open API</a>
            <a href="/dashboard/referrals" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm"><Gift className="h-4 w-4" />User referrals</a>
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
          <ShieldCheck className="h-6 w-6 text-emerald-700" />
          <CardTitle>Readiness controls</CardTitle>
          <CardDescription>These controls decide whether referral growth is safe enough for real launch.</CardDescription>
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
            <BadgeIndianRupee className="h-6 w-6 text-emerald-700" />
            <CardTitle>Reward rules</CardTitle>
            <CardDescription>Keep MVP rewards simple and low-risk.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {report.rewardRules.map((rule) => <li key={rule} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{rule}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <CardTitle>Fraud guards</CardTitle>
            <CardDescription>Checks needed before paid or agent referral campaigns.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              {report.fraudGuards.map((guard) => <li key={guard} className="flex gap-2"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{guard}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent referral invites</CardTitle>
          <CardDescription>Email is masked here to keep admin surfaces privacy-safe by default.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentInvites.length === 0 ? <p className="text-sm text-slate-500">No referral invites yet.</p> : recentInvites.map((invite) => (
            <div key={invite.id} className="rounded-2xl border bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="break-all font-black text-slate-950">{invite.code}</h3>
                  <p className="mt-1 text-sm text-slate-600">{maskReferralEmail(invite.email)} · {invite.reward || 'Bonus reward'}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{formatDate(invite.createdAt)}</p>
                </div>
                <span className="shrink-0 rounded-full border bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">{invite.status}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Minimum launch evidence</CardTitle>
          <CardDescription>Collect this before promoting referral links publicly.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            {report.launchEvidence.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</li>)}
          </ul>
          <div className="mt-5 rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">Local command</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs font-bold text-emerald-100">npm run referral:readiness</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
