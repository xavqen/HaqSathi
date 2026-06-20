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
      ['/admin/analytics-readiness', 'Analytics readiness'],
      ['/admin/search-readiness', 'Search readiness'],
      ['/admin/status-tracking', 'Status tracking'],
      ['/admin/official-data-refresh', 'Official data'],
      ['/admin/ai-safety-readiness', 'AI safety'],
      ['/admin/onboarding-assistant', 'Onboarding assistant'],
      ['/admin/payments', 'Payments'],
      ['/admin/payment-lifecycle', 'Payment lifecycle'],
      ['/admin/entitlement-readiness', 'Entitlements'],
      ['/admin/invoice-tax-readiness', 'Invoice/tax'],
      ['/admin/refund-dispute-readiness', 'Refund disputes'],
      ['/admin/payment-reconciliation', 'Reconciliation'],
      ['/admin/travel-refund-readiness', 'Travel refund'],
      ['/admin/medical-bill-readiness', 'Medical bill'],
      ['/admin/telecom-sim-readiness', 'Telecom SIM'],
      ['/admin/courier-parcel-readiness', 'Courier parcel'],
      ['/admin/bank-freeze-readiness', 'Bank freeze'],
      ['/admin/vehicle-challan-readiness', 'Vehicle challan'],
      ['/admin/identity-document-readiness', 'Identity docs'],
      ['/admin/lost-document-readiness', 'Lost document'],
      ['/admin/support', 'Support'],
      ['/admin/support-triage', 'Support triage'],
      ['/admin/post-launch-support', 'Post-launch support'],
      ['/admin/community-safety', 'Community safety'],
      ['/admin/document-expiry-readiness', 'Document expiry'],
      ['/admin/call-logbook-readiness', 'Call logbook'],
      ['/admin/proof-file-organizer-readiness', 'Proof files'],
      ['/admin/deadline-appeal-readiness', 'Deadline appeal'],
      ['/admin/warranty-claim-readiness', 'Warranty claim'],
      ['/admin/return-pickup-readiness', 'Return pickup'],
  ['/admin/insurance-claim-readiness', 'Insurance'],
  ['/admin/rent-deposit-readiness', 'Rent deposit'],
  ['/admin/utility-bill-readiness', 'Utility bill'],
      ['/admin/insurance-claim-readiness', 'Insurance claim'],
      ['/admin/rent-deposit-readiness', 'Rent deposit'],
      ['/admin/utility-bill-readiness', 'Utility bill']
    ]
  },
  {
    title: 'Content',
    icon: BookOpen,
    links: [
      ['/admin/seo-pages', 'SEO pages'],
      ['/admin/seo-indexing', 'SEO indexing'],
      ['/admin/performance-readiness', 'Performance'],
      ['/admin/pwa-readiness', 'PWA readiness'],
      ['/admin/mobile-app-readiness', 'Mobile app'],
      ['/admin/real-device-qa', 'Real device QA'],
      ['/admin/accessibility-readiness', 'Accessibility'],
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
      ['/admin/accessibility-readiness', 'Accessibility readiness'],
      ['/admin/translation-review', 'Translation review'],
      ['/admin/official-data-refresh', 'Official data refresh'],
      ['/admin/link-checks', 'Link checks'],
      ['/admin/ai-reviews', 'AI reviews'],
      ['/admin/ai-safety-readiness', 'AI safety readiness'],
      ['/admin/security-hardening', 'Security'],
      ['/admin/secrets-readiness', 'Secrets'],
  ['/admin/feature-flags-readiness', 'Flags'],
      ['/admin/feature-flags-readiness', 'Feature flags'],
      ['/admin/document-vault-safety', 'Vault safety'],
      ['/admin/document-expiry-readiness', 'Document expiry'],
      ['/admin/call-logbook-readiness', 'Call logbook'],
      ['/admin/account-security', 'Account security'],
      ['/admin/rbac', 'RBAC'],
      ['/admin/compliance', 'Compliance'],
      ['/admin/legal-compliance-readiness', 'Legal compliance'],
      ['/admin/abuse-prevention', 'Abuse prevention'],
      ['/admin/privacy-ops', 'Privacy ops'],
      ['/admin/data-retention', 'Data retention'],
      ['/admin/database-integrity', 'Database integrity'],
      ['/admin/dependency-readiness', 'Dependencies'],
      ['/admin/audit-trail-readiness', 'Audit trail'],
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
      ['/admin/referral-readiness', 'Referral readiness'],
      ['/admin/newsletter-readiness', 'Newsletter readiness'],
      ['/admin/feedback-readiness', 'Feedback readiness'],
      ['/admin/onboarding-assistant', 'Onboarding assistant'],
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
      ['/admin/notification-readiness', 'Notification readiness'],
      ['/admin/emails', 'Emails'],
      ['/admin/email-delivery-readiness', 'Email delivery'],
      ['/admin/backups', 'Backups'],
      ['/admin/backup-restore', 'Backup restore'],
      ['/admin/audit', 'Audit log'],
      ['/admin/incidents', 'Incidents'],
      ['/admin/incident-response', 'Incident response'],
      ['/admin/observability-slo', 'Observability SLO'],
      ['/admin/error-monitoring', 'Error monitoring']
    ]
  },
  {
    title: 'Tools monitoring',
    icon: Users,
    links: [
      ['/admin/scam-radar', 'Scam radar'],
      ['/admin/community-safety', 'Safety alerts'],
      ['/admin/smart-wizard-insights', 'Smart wizard'],
      ['/admin/voice-input-readiness', 'Voice input'],
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
      ['/admin/launch-command-center', 'Launch command'],
      ['/admin/release-governance', 'Release governance'],
      ['/admin/route-inventory', 'Routes'],
      ['/admin/env-health', 'Environment'],
      ['/admin/build-center', 'Build center'],
      ['/admin/production-qa', 'Production QA'],
      ['/admin/deployment-qa', 'Deployment QA'],
      ['/admin/performance-readiness', 'Performance QA'],
      ['/admin/pwa-readiness', 'PWA QA'],
      ['/admin/mobile-app-readiness', 'Mobile QA'],
      ['/admin/mobile-app-readiness', 'Mobile app'],
      ['/admin/real-device-qa', 'Real device'],
      ['/admin/accessibility-readiness', 'Accessibility'],
      ['/admin/launch', 'Launch'],
      ['/admin/release-notes', 'Release notes']
    ]
  },
  {
    title: 'Support data',
    icon: LifeBuoy,
    links: [
      ['/admin/support-macros', 'Support macros'],
      ['/admin/post-launch-support', 'Post-launch support'],
      ['/admin/feedback', 'Feedback'],
      ['/admin/feedback-readiness', 'Feedback QA'],
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
  ['/admin/support-triage', 'Triage'],
  ['/admin/data-quality', 'Quality'],
  ['/admin/translation-review', 'Translation QA'],
  ['/admin/seo-indexing', 'SEO index'],
  ['/admin/analytics', 'Analytics'],
  ['/admin/analytics-readiness', 'Growth QA'],
  ['/admin/search-readiness', 'Search QA'],
  ['/admin/status-tracking', 'Status QA'],
  ['/admin/community-safety', 'Safety'],
  ['/admin/official-data-refresh', 'Data QA'],
  ['/admin/ai-safety-readiness', 'AI safety'],
  ['/admin/onboarding-assistant', 'Onboarding'],
  ['/admin/payment-lifecycle', 'Payments'],
  ['/admin/entitlement-readiness', 'Entitlements'],
  ['/admin/invoice-tax-readiness', 'Billing docs'],
  ['/admin/refund-dispute-readiness', 'Refunds'],
  ['/admin/payment-reconciliation', 'Recon'],
  ['/admin/referral-readiness', 'Referrals'],
  ['/admin/newsletter-readiness', 'Newsletter'],
  ['/admin/feedback-readiness', 'Reviews'],
  ['/admin/final-qa', 'QA'],
  ['/admin/launch-command-center', 'Launch cmd'],
  ['/admin/release-governance', 'Release'],
  ['/admin/deployment-qa', 'Deploy QA'],
  ['/admin/performance-readiness', 'Speed QA'],
  ['/admin/pwa-readiness', 'PWA QA'],
      ['/admin/mobile-app-readiness', 'Mobile QA'],
      ['/admin/mobile-app-readiness', 'Mobile app'],
  ['/admin/real-device-qa', 'Real device'],
  ['/admin/accessibility-readiness', 'A11y'],
  ['/admin/legal-compliance-readiness', 'Legal'],
  ['/admin/abuse-prevention', 'Abuse'],
  ['/admin/data-retention', 'Retention'],
  ['/admin/database-integrity', 'DB integrity'],
  ['/admin/dependency-readiness', 'Deps'],
  ['/admin/audit-trail-readiness', 'Audit'],
  ['/admin/incident-response', 'Incident'],
  ['/admin/observability-slo', 'SLO'],
  ['/admin/error-monitoring', 'Errors'],
  ['/admin/document-vault-safety', 'Vault'],
  ['/admin/account-security', 'Security'],
  ['/admin/secrets-readiness', 'Secrets'],
      ['/admin/feature-flags-readiness', 'Feature flags'],
  ['/admin/rbac', 'RBAC'],
  ['/admin/privacy-ops', 'Privacy'],
  ['/admin/notification-readiness', 'Notify'],
  ['/admin/email-delivery-readiness', 'Email QA'],
  ['/admin/voice-input-readiness', 'Voice'],
  ['/admin/proof-file-organizer-readiness', 'Proof files'],
  ['/admin/deadline-appeal-readiness', 'Deadlines'],
  ['/admin/warranty-claim-readiness', 'Warranty'],
  ['/admin/return-pickup-readiness', 'Return pickup'],
  ['/admin/insurance-claim-readiness', 'Insurance'],
  ['/admin/loan-app-readiness', 'Loan safety'],
  ['/admin/job-salary-readiness', 'Job salary'],
  ['/admin/education-form-readiness', 'Edu forms'],
  ['/admin/travel-refund-readiness', 'Travel refund'],
  ['/admin/medical-bill-readiness', 'Medical bill'],
      ['/admin/education-form-readiness', 'Education forms']
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
