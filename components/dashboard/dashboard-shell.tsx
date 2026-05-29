import Link from 'next/link'
import type { ReactNode } from 'react'
import { Briefcase, ClipboardList, FolderOpen, LayoutDashboard, LifeBuoy, Settings, ShieldCheck, WalletCards } from 'lucide-react'

const navGroups = [
  {
    title: 'Main',
    icon: LayoutDashboard,
    links: [
      ['/dashboard', 'Overview'],
      ['/dashboard/cases', 'Cases'],
      ['/dashboard/smart-wizard', 'Smart wizard'],
      ['/dashboard/submission-packs', 'Submission packs'],
      ['/dashboard/complaints', 'Complaints'],
      ['/dashboard/reminders', 'Reminders']
    ]
  },
  {
    title: 'Documents & evidence',
    icon: FolderOpen,
    links: [
      ['/dashboard/document-vault', 'Document vault'],
      ['/dashboard/evidence-packs', 'Evidence packs'],
      ['/dashboard/evidence-timelines', 'Evidence timelines'],
      ['/dashboard/proof-quality-scans', 'Proof scans'],
      ['/dashboard/ocr-autofill', 'OCR autofill'],
      ['/dashboard/document-reader', 'Document reader']
    ]
  },
  {
    title: 'Case intelligence',
    icon: ClipboardList,
    links: [
      ['/dashboard/case-coach', 'Case coach'],
      ['/dashboard/case-health', 'Case health'],
      ['/dashboard/follow-ups', 'Follow-ups'],
      ['/dashboard/sla-tracker', 'SLA tracker'],
      ['/dashboard/action-plan', 'Action plan'],
      ['/dashboard/communications', 'Communications'],
      ['/dashboard/outcomes', 'Outcomes']
    ]
  },
  {
    title: 'Safety & money',
    icon: ShieldCheck,
    links: [
      ['/dashboard/scam-radar', 'Scam radar'],
      ['/dashboard/risk-reports', 'Risk reports'],
      ['/dashboard/privacy-redactions', 'Privacy redactions'],
      ['/dashboard/public-post-checks', 'Post safety'],
      ['/dashboard/chargeback-helpers', 'Chargeback'],
      ['/dashboard/refund-negotiations', 'Refund negotiation'],
      ['/dashboard/authority-routes', 'Authority routes']
    ]
  },
  {
    title: 'Family & agent',
    icon: Briefcase,
    links: [
      ['/dashboard/family', 'Family profiles'],
      ['/dashboard/family-switchboard', 'Family switchboard'],
      ['/dashboard/partner', 'Partner workspace'],
      ['/dashboard/agent-clients', 'Agent clients'],
      ['/dashboard/agent-invoices', 'Agent invoices'],
      ['/dashboard/agent-revenue', 'Agent revenue'],
      ['/dashboard/print-center', 'Print center']
    ]
  },
  {
    title: 'Account',
    icon: Settings,
    links: [
      ['/dashboard/profile', 'Profile'],
      ['/dashboard/language', 'Language'],
      ['/dashboard/billing', 'Billing'],
      ['/dashboard/security', 'Security'],
      ['/dashboard/settings', 'Notifications'],
      ['/dashboard/privacy-center', 'Privacy center'],
      ['/dashboard/export', 'Export data']
    ]
  },
  {
    title: 'Support',
    icon: LifeBuoy,
    links: [
      ['/dashboard/support', 'Support tickets'],
      ['/dashboard/activity', 'Activity'],
      ['/dashboard/usage', 'Usage'],
      ['/dashboard/referrals', 'Referrals'],
      ['/dashboard/templates', 'Templates'],
      ['/dashboard/saved-links', 'Saved links'],
      ['/dashboard/saved-drafts', 'Saved drafts']
    ]
  }
]

const mobileLinks = [
  ['/dashboard', 'Overview'],
  ['/dashboard/cases', 'Cases'],
  ['/dashboard/smart-wizard', 'Wizard'],
  ['/dashboard/complaints', 'Complaints'],
  ['/dashboard/document-vault', 'Vault'],
  ['/dashboard/reminders', 'Reminders'],
  ['/dashboard/support', 'Support'],
  ['/dashboard/profile', 'Profile']
]

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
        <div className="md:hidden">
          <div className="rounded-[1.35rem] border border-slate-200 bg-white p-2 shadow-soft">
            <div className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="Dashboard quick navigation">
              {mobileLinks.map(([href, label]) => (
                <Link key={href} href={href} className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-black text-slate-700 active:bg-emerald-50 active:text-emerald-800">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-5 md:mt-0 md:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden max-h-[calc(100vh-7.25rem)] overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-soft md:sticky md:top-[88px] md:block">
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 text-emerald-900">
              <WalletCards className="h-5 w-5" />
              <div>
                <p className="text-sm font-black">Dashboard</p>
                <p className="text-xs font-semibold text-emerald-700">Cases, evidence and account</p>
              </div>
            </div>
            <nav className="mt-4 grid gap-3" aria-label="Dashboard navigation">
              {navGroups.map((group, groupIndex) => {
                const Icon = group.icon
                const openByDefault = groupIndex < 3
                return (
                  <details key={group.title} className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-2" open={openByDefault}>
                    <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-2 text-sm font-black text-slate-800 hover:bg-white">
                      <Icon className="h-4 w-4 text-emerald-700" />
                      <span>{group.title}</span>
                    </summary>
                    <div className="mt-1 grid gap-1">
                      {group.links.map(([href, label]) => (
                        <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm">
                          {label}
                        </Link>
                      ))}
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
