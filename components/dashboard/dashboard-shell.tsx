import Link from 'next/link'
import type { ReactNode } from 'react'

const dashboardLinks = [
  ['/dashboard', 'Overview'],
  ['/dashboard/cases', 'Case Center'],
  ['/dashboard/case-health', 'Case Health'],
  ['/dashboard/sla-tracker', 'SLA Tracker'],
  ['/dashboard/action-plan', 'Action Plan'],
  ['/dashboard/case-notes', 'Case Notes'],
  ['/dashboard/communications', 'Communications'],
  ['/dashboard/outcomes', 'Outcomes'],
  ['/dashboard/escalations', 'Escalations'],
  ['/dashboard/evidence-packs', 'Evidence Packs'],
  ['/dashboard/case-package', 'Case Package'],
  ['/dashboard/verification-requests', 'Verification'],
  ['/dashboard/print-center', 'Print Center'],
  ['/dashboard/learning', 'Learning'],
  ['/dashboard/partner', 'Partner'],
  ['/dashboard/calendar', 'Calendar'],
  ['/dashboard/saved-links', 'Saved Links'],
  ['/dashboard/language', 'Language'],
  ['/dashboard/digest', 'Weekly Digest'],
  ['/dashboard/referrals', 'Referrals'],
  ['/dashboard/privacy-center', 'Privacy Center'],
  ['/dashboard/risk-reports', 'Risk Reports'],
  ['/dashboard/complaints', 'My Complaints'],
  ['/dashboard/saved-drafts', 'Saved Drafts'],
  ['/dashboard/reminders', 'Reminders'],
  ['/dashboard/usage', 'Usage'],
  ['/dashboard/templates', 'Templates'],
  ['/dashboard/settings', 'Settings'],
  ['/dashboard/security', 'Security'],
  ['/dashboard/onboarding', 'Onboarding'],
  ['/dashboard/activity', 'Activity'],
  ['/dashboard/export', 'Export'],
  ['/dashboard/document-vault', 'Document Vault'],
  ['/dashboard/family', 'Family Profiles'],
  ['/dashboard/agent-clients', 'Agent Clients'],
  ['/dashboard/agent-invoices', 'Agent Invoices'],
  ['/dashboard/profile', 'Profile'],
  ['/dashboard/billing', 'Billing'],
  ['/dashboard/support', 'Support']
]

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <main className="bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-3xl border bg-white p-4 shadow-soft">
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500">Dashboard</p>
          <nav className="mt-3 grid gap-1">{dashboardLinks.map(([href, label]) => <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">{label}</Link>)}</nav>
        </aside>
        <section>{children}</section>
      </div>
    </main>
  )
}
