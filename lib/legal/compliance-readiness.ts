export type LegalComplianceStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type LegalCompliancePriority = 'P0' | 'P1' | 'P2'

export type LegalComplianceControl = {
  id: string
  label: string
  status: LegalComplianceStatus
  priority: LegalCompliancePriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type LegalCompliancePageReview = {
  route: string
  priority: LegalCompliancePriority
  reviewItems: string[]
  evidenceRequired: string[]
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function control(
  id: string,
  label: string,
  status: LegalComplianceStatus,
  priority: LegalCompliancePriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): LegalComplianceControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const routeTargets = env('LEGAL_COMPLIANCE_ROUTE_TARGETS', '/privacy,/terms,/disclaimer,/contact,/pricing,/complaint,/upi-help,/documents,/dashboard/privacy-center,/newsletter')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

const pageReviews: LegalCompliancePageReview[] = routeTargets.map((route, index) => ({
  route,
  priority: index < 5 ? 'P0' : index < 8 ? 'P1' : 'P2',
  reviewItems: [
    'Guidance-only disclaimer is visible where decisions could affect money, complaints, documents or rights',
    'Privacy, consent and data-retention wording matches the real production behavior',
    'No page promises guaranteed refunds, legal outcomes, scheme approval or official government status',
    'Contact/support path is visible for correction, deletion, billing and safety requests',
    'Paid plan, refund and cancellation language is understandable before checkout'
  ],
  evidenceRequired: [
    'Mobile screenshot for the route',
    'Desktop screenshot for the route',
    'Reviewer name/date/status in launch evidence folder',
    'Copy diff or approval note for changed legal text'
  ]
}))

const controls: LegalComplianceControl[] = [
  control(
    'owner-assigned',
    'Legal/compliance review owner assigned',
    configured('LEGAL_COMPLIANCE_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `LEGAL_COMPLIANCE_OWNER=${env('LEGAL_COMPLIANCE_OWNER') || 'empty'}`,
    'A named owner is responsible for final legal copy and compliance signoff.',
    'Owner name in env/evidence notes and /admin/legal-compliance-readiness screenshot.',
    'Legal copy can remain unowned, inconsistent, or risky before public launch.'
  ),
  control(
    'guidance-disclaimer-reviewed',
    'Guidance-only disclaimer reviewed',
    enabled('LEGAL_GUIDANCE_DISCLAIMER_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `LEGAL_GUIDANCE_DISCLAIMER_REVIEWED=${env('LEGAL_GUIDANCE_DISCLAIMER_REVIEWED', 'false')}`,
    'Complaint, UPI, document, scheme and AI pages clearly say the app provides guidance, not official/legal authority.',
    'Screenshots of disclaimer banner, tool disclaimer and footer/legal page language.',
    'Users may think the service is an official government, bank or legal authority.'
  ),
  control(
    'privacy-policy-reviewed',
    'Privacy policy behavior reviewed',
    enabled('LEGAL_PRIVACY_POLICY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `LEGAL_PRIVACY_POLICY_REVIEWED=${env('LEGAL_PRIVACY_POLICY_REVIEWED', 'false')}`,
    'Privacy policy matches real analytics, cookies, document vault, email, payment and support behavior.',
    'Privacy page screenshot, consent banner proof and data-flow notes.',
    'The site may collect or process data in a way the policy does not explain.'
  ),
  control(
    'terms-reviewed',
    'Terms, refund and billing copy reviewed',
    enabled('LEGAL_TERMS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `LEGAL_TERMS_REVIEWED=${env('LEGAL_TERMS_REVIEWED', 'false')}`,
    'Terms describe acceptable use, paid plans, refunds, cancellation, user responsibility and misuse boundaries.',
    'Terms page screenshot, pricing page screenshot and billing/refund notes.',
    'Payment disputes, refund confusion and misuse issues may increase after launch.'
  ),
  control(
    'dpdp-reviewed',
    'India DPDP/privacy operations reviewed',
    enabled('LEGAL_DPDP_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `LEGAL_DPDP_REVIEWED=${env('LEGAL_DPDP_REVIEWED', 'false')}`,
    'Consent, deletion, export and grievance/contact flow are reviewed for India launch readiness.',
    'Privacy center screenshot, export/deletion evidence and grievance/contact path proof.',
    'User privacy requests may be mishandled or delayed after launch.'
  ),
  control(
    'ads-affiliate-reviewed',
    'Ads, affiliate and sponsored-content disclosure reviewed',
    enabled('LEGAL_ADS_AFFILIATE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `LEGAL_ADS_AFFILIATE_REVIEWED=${env('LEGAL_ADS_AFFILIATE_REVIEWED', 'false')}`,
    'AdSense, affiliate links, sponsored posts and referral rewards are disclosed where applicable.',
    'Ad placement screenshots, affiliate/referral disclosure copy and newsletter disclosure proof.',
    'Users may not understand when content is sponsored or monetized.'
  ),
  control(
    'age-safety-reviewed',
    'Minor/age safety review completed',
    enabled('LEGAL_MINOR_SAFETY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `LEGAL_MINOR_SAFETY_REVIEWED=${env('LEGAL_MINOR_SAFETY_REVIEWED', 'false')}`,
    'Signup, support, document vault and AI guidance avoid collecting unnecessary minor-sensitive data.',
    'Signup/support/document-vault screenshots and safety notes.',
    'The service may collect sensitive data from younger users without a reviewed safety path.'
  ),
  control(
    'evidence-dir',
    'Legal compliance evidence directory configured',
    Boolean(env('LEGAL_COMPLIANCE_EVIDENCE_DIR', './artifacts/legal-compliance')) ? 'READY_TO_TEST' : 'BLOCKED',
    'P2',
    `LEGAL_COMPLIANCE_EVIDENCE_DIR=${env('LEGAL_COMPLIANCE_EVIDENCE_DIR', './artifacts/legal-compliance')}`,
    'Local evidence generator writes legal compliance JSON and CSV files.',
    'Generated artifacts/legal-compliance folder.',
    'Launch reviewers cannot verify legal/compliance readiness history.'
  )
]

const runbook = [
  'Run npm run legal:readiness and open /admin/legal-compliance-readiness.',
  'Review P0 legal routes first: privacy, terms, disclaimer, contact and pricing.',
  'Check every high-risk tool for guidance-only wording and no guaranteed-outcome claims.',
  'Confirm privacy policy matches real analytics, email, support, document vault and payment behavior.',
  'Save mobile and desktop screenshots plus reviewer notes in the evidence directory.',
  'Mark env review flags true only after review evidence is saved and copy issues are fixed.'
]

export function getLegalComplianceReadinessReport() {
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const p0Controls = controls.filter((item) => item.priority === 'P0').length
  const p0Routes = pageReviews.filter((item) => item.priority === 'P0').length

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.42-legal-compliance-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      p0Controls,
      routeTargets: pageReviews.length,
      p0Routes
    },
    controls,
    pageReviews,
    runbook,
    nextAction: blocked
      ? 'Fix blocked legal compliance configuration before launch review.'
      : manualRequired
        ? 'Complete legal copy, privacy, terms and disclaimer review before public launch.'
        : 'Legal compliance readiness gates are complete for launch review.'
  }
}
