import Link from 'next/link'
import type { ReactNode } from 'react'
import { BarChart3, BookOpen, DatabaseZap, LayoutDashboard, LifeBuoy, Rocket, ShieldCheck, Users } from 'lucide-react'

const groups = [
  {
    title: 'Core',
    icon: LayoutDashboard,
    links: [
      ['/admin', 'Overview'],
      ['/admin/users', 'Users'],
      ['/admin/complaints', 'Complaints'],
      ['/admin/analytics', 'Analytics'],
      ['/admin/payments', 'Payments'],
      ['/admin/support', 'Support']
    ]
  },
  {
    title: 'Content',
    icon: BookOpen,
    links: [
      ['/admin/seo-pages', 'SEO pages'],
      ['/admin/blog', 'Blog'],
      ['/admin/templates', 'Templates'],
      ['/admin/schemes', 'Schemes'],
      ['/admin/resources', 'Resources'],
      ['/admin/filing-guides', 'Filing guides'],
      ['/admin/state-guides', 'State guides']
    ]
  },
  {
    title: 'Quality & safety',
    icon: ShieldCheck,
    links: [
      ['/admin/data-quality', 'Data quality'],
      ['/admin/source-verification', 'Source verification'],
      ['/admin/link-checks', 'Link checks'],
      ['/admin/ai-reviews', 'AI reviews'],
      ['/admin/security-hardening', 'Security'],
      ['/admin/compliance', 'Compliance'],
      ['/admin/moderation', 'Moderation']
    ]
  },
  {
    title: 'Growth',
    icon: BarChart3,
    links: [
      ['/admin/growth', 'Growth'],
      ['/admin/content-ideas', 'Content ideas'],
      ['/admin/seo-keywords', 'SEO keywords'],
      ['/admin/revenue-insights', 'Revenue'],
      ['/admin/partner-leads', 'Partner leads'],
      ['/admin/success-stories', 'Success stories'],
      ['/admin/issue-trends', 'Issue trends']
    ]
  },
  {
    title: 'Operations',
    icon: DatabaseZap,
    links: [
      ['/admin/ops', 'Ops center'],
      ['/admin/automation', 'Automation'],
      ['/admin/notifications', 'Notifications'],
      ['/admin/emails', 'Emails'],
      ['/admin/backups', 'Backups'],
      ['/admin/backup-restore', 'Backup restore'],
      ['/admin/audit', 'Audit log'],
      ['/admin/incidents', 'Incidents']
    ]
  },
  {
    title: 'Tools monitoring',
    icon: Users,
    links: [
      ['/admin/scam-radar', 'Scam radar'],
      ['/admin/smart-wizard-insights', 'Smart wizard'],
      ['/admin/submission-packs', 'Submission packs'],
      ['/admin/chargeback-helpers', 'Chargeback'],
      ['/admin/proof-quality', 'Proof quality'],
      ['/admin/privacy-redactions', 'Privacy redactions'],
      ['/admin/authority-routes', 'Authority routes'],
      ['/admin/refund-negotiations', 'Refund negotiations']
    ]
  },
  {
    title: 'Launch',
    icon: Rocket,
    links: [
      ['/admin/final-qa', 'Final QA'],
      ['/admin/route-inventory', 'Routes'],
      ['/admin/env-health', 'Environment'],
      ['/admin/build-center', 'Build center'],
      ['/admin/production-qa', 'Production QA'],
      ['/admin/launch', 'Launch'],
      ['/admin/release-notes', 'Release notes']
    ]
  },
  {
    title: 'Support data',
    icon: LifeBuoy,
    links: [
      ['/admin/support-macros', 'Support macros'],
      ['/admin/feedback', 'Feedback'],
      ['/admin/localization', 'Localization'],
      ['/admin/playbooks', 'Playbooks'],
      ['/admin/experiments', 'Experiments'],
      ['/admin/prompt-lab', 'Prompt lab'],
      ['/admin/metrics-snapshots', 'Metrics']
    ]
  }
]

const mobileLinks = [
  ['/admin', 'Overview'],
  ['/admin/users', 'Users'],
  ['/admin/complaints', 'Complaints'],
  ['/admin/support', 'Support'],
  ['/admin/data-quality', 'Quality'],
  ['/admin/analytics', 'Analytics'],
  ['/admin/final-qa', 'QA']
]

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
        <div className="lg:hidden">
          <div className="rounded-[1.35rem] border border-slate-200 bg-white p-2 shadow-soft">
            <nav className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="Admin quick navigation">
              {mobileLinks.map(([href, label]) => <Link key={href} href={href} className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-black text-slate-700">{label}</Link>)}
            </nav>
          </div>
        </div>
        <div className="mt-4 grid gap-6 lg:mt-0 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden max-h-[calc(100vh-7.25rem)] overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-soft lg:sticky lg:top-[88px] lg:block">
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-sm font-black">Admin command center</p>
              <p className="mt-1 text-xs font-semibold text-white/65">Operate content, quality, growth and launch tasks.</p>
            </div>
            <nav className="mt-4 grid gap-3" aria-label="Admin navigation">
              {groups.map((group, index) => {
                const Icon = group.icon
                return (
                  <details key={group.title} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-2" open={index < 3}>
                    <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-2 text-sm font-black text-slate-800 hover:bg-white">
                      <Icon className="h-4 w-4 text-emerald-700" />
                      {group.title}
                    </summary>
                    <div className="mt-1 grid gap-1">
                      {group.links.map(([href, label]) => <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm">{label}</Link>)}
                    </div>
                  </details>
                )
              })}
            </nav>
          </aside>
          <section className="min-w-0 pb-8">{children}</section>
        </div>
      </div>
    </main>
  )
}
