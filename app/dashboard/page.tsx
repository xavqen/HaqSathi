import Link from 'next/link'
import { ArrowRight, Bell, ClipboardCheck, Crown, FileText, FolderCheck, Landmark, ShieldAlert, Sparkles, UploadCloud } from 'lucide-react'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { planDisplayName } from '@/lib/billing/plan-labels'

export const dynamic = 'force-dynamic'

async function getStats(userId: string) {
  try {
    const [complaints, reminders, vault, evidencePacks, smartPlans, followUps, privacyRedactions, postChecks] = await Promise.all([
      db.complaint.count({ where: { userId } }),
      db.reminder.count({ where: { userId } }),
      db.documentVaultItem.count({ where: { userId } }),
      db.evidencePack.count({ where: { userId } }),
      db.smartComplaintPlan.count({ where: { userId } }),
      db.followUpAutomation.count({ where: { userId } }),
      db.privacyRedactionResult.count({ where: { userId } }),
      db.publicPostSafetyCheck.count({ where: { userId } })
    ])
    const recent = await db.complaint.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, type: true, companyName: true, createdAt: true, status: true }
    })
    return { complaints, reminders, vault, evidencePacks, smartPlans, followUps, privacyRedactions, postChecks, recent }
  } catch {
    return { complaints: 0, reminders: 0, vault: 0, evidencePacks: 0, smartPlans: 0, followUps: 0, privacyRedactions: 0, postChecks: 0, recent: [] as { id:string; type:string; companyName:string; createdAt:Date; status:string }[] }
  }
}

const primaryActions = [
  { title: 'Start a new complaint', desc: 'Create a clean email, support message and follow-up draft.', href: '/complaint', icon: FileText },
  { title: 'Use Smart Wizard', desc: 'Get readiness score, missing proof and a submission pack.', href: '/tools/smart-complaint-wizard', icon: Sparkles },
  { title: 'Upload evidence', desc: 'Store bills, screenshots and proof in the document vault.', href: '/dashboard/document-vault', icon: UploadCloud },
  { title: 'Plan follow-up', desc: 'Track due dates, reminders and escalation actions.', href: '/dashboard/follow-ups', icon: Bell }
]

const secondaryActions = [
  { title: 'Scam Radar', href: '/tools/scam-radar', icon: ShieldAlert },
  { title: 'Evidence Pack', href: '/dashboard/evidence-packs', icon: FolderCheck },
  { title: 'Scheme Finder', href: '/scheme-finder', icon: Landmark },
  { title: 'Submission Pack', href: '/tools/submission-pack', icon: ClipboardCheck },
  { title: 'Privacy Redactor', href: '/tools/privacy-redactor', icon: ShieldAlert },
  { title: 'OCR Autofill', href: '/tools/ocr-autofill', icon: UploadCloud }
]

export default async function DashboardPage() {
  const user = await requireUser()
  const stats = await getStats(user.id)
  const displayName = user.name || user.email.split('@')[0]

  const kpis = [
    ['Complaints', stats.complaints, '/dashboard/complaints'],
    ['Reminders', stats.reminders, '/dashboard/reminders'],
    ['Vault files', stats.vault, '/dashboard/document-vault'],
    ['Evidence packs', stats.evidencePacks, '/dashboard/evidence-packs']
  ] as const

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 p-5 text-white shadow-soft sm:p-6 xl:p-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div>
            <Badge className="bg-white/10 text-white">{planDisplayName(user.plan)}</Badge>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl xl:text-5xl">Welcome, {displayName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
              Manage complaints, evidence, reminders and follow-ups from one clean command center.
            </p>
          </div>
          <Link href={user.plan === 'FREE' ? '/pricing' : '/dashboard/billing'} className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm">
            <Crown className="mr-2 h-4 w-4" />{user.plan === 'FREE' ? 'Upgrade to Premium' : 'Manage plan'}
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-emerald-200">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
            <p className="mt-2 text-sm font-bold text-emerald-700">Open →</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Recommended next actions</h2>
            <p className="mt-1 text-sm text-slate-600">Start with the workflows that move a case forward fastest.</p>
          </div>
          <Link href="/tools" className="text-sm font-black text-emerald-700">View all tools →</Link>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          {primaryActions.map((action) => (
            <Link href={action.href} key={action.href} className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white">
                <action.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-black text-slate-950">{action.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-[1.5rem]">
          <CardHeader>
            <CardTitle>Recent complaints</CardTitle>
            <CardDescription>Latest saved complaint cases.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recent.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <p className="font-bold text-slate-700">No complaints yet.</p>
                <Link href="/complaint" className="mt-4 inline-flex rounded-2xl bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground">Create first complaint</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recent.map((caseItem) => (
                  <div className="rounded-2xl border border-slate-200 p-4" key={caseItem.id}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-black text-slate-950">{caseItem.type}</p>
                        <p className="mt-1 text-sm text-slate-600">{caseItem.companyName} · {caseItem.createdAt.toDateString()}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{caseItem.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem]">
          <CardHeader>
            <CardTitle>More workflows</CardTitle>
            <CardDescription>Quick access without crowding the main screen.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {secondaryActions.map((action) => (
              <Link href={action.href} key={action.href} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm font-black text-slate-800 hover:border-emerald-200 hover:bg-emerald-50">
                <action.icon className="h-4 w-4 text-emerald-700" />
                {action.title}
                <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
