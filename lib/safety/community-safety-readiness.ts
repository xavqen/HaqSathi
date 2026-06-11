export type CommunitySafetyStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type CommunitySafetyPriority = 'P0' | 'P1' | 'P2'

export type CommunitySafetyControl = {
  id: string
  priority: CommunitySafetyPriority
  label: string
  status: CommunitySafetyStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type CommunitySafetyLane = {
  id: string
  priority: CommunitySafetyPriority
  category: 'UPI_FRAUD' | 'LOAN_APP' | 'JOB_SCAM' | 'SHOPPING_REFUND' | 'GOVT_FORM' | 'CALL_SMS_LINK'
  userSignal: string
  moderationNeed: string
  publicOutput: string
  safetyRule: string
}

const truthy = (value?: string) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(value || '')
const env = (key: string, fallback = '') => process.env[key] || fallback
const configured = (key: string) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

const allowedModes = ['dry_run', 'manual_review', 'enabled', 'disabled']

export const communitySafetyLanes: CommunitySafetyLane[] = [
  {
    id: 'upi-fraud-warning',
    priority: 'P0',
    category: 'UPI_FRAUD',
    userSignal: 'Wrong UPI transfer, fake QR, fake refund call, screen-sharing payment request or urgent fraud warning from user reports.',
    moderationNeed: 'Remove phone numbers, UPI IDs, bank account details, names and accusation language before public display.',
    publicOutput: 'General safety pattern, next steps and official reporting reminder without identifying private people.',
    safetyRule: 'Never publish full UPI IDs, phone numbers, bank data, screenshots or personal allegations.'
  },
  {
    id: 'loan-app-harassment',
    priority: 'P0',
    category: 'LOAN_APP',
    userSignal: 'Loan app harassment, contact threat, fake recovery agent or illegal intimidation report.',
    moderationNeed: 'High-risk legal/privacy review before any public trend is shown.',
    publicOutput: 'Education alert with proof checklist, cyber/reporting routes and mental-safety wording.',
    safetyRule: 'Do not name private individuals or publish blackmail screenshots without redaction and review.'
  },
  {
    id: 'job-offer-scam',
    priority: 'P1',
    category: 'JOB_SCAM',
    userSignal: 'Registration fee, task job, interview fee, telegram earning group or work-from-home payment demand.',
    moderationNeed: 'Moderate company names and remove recruiter phone/email before trend display.',
    publicOutput: 'Checklist alert: verify domain, never pay for job, save chat proof, report safely.',
    safetyRule: 'Avoid defamatory claims against small/private entities unless official/public proof exists.'
  },
  {
    id: 'shopping-refund-scam',
    priority: 'P1',
    category: 'SHOPPING_REFUND',
    userSignal: 'Fake support number, refund OTP/PIN request, delivery payment link, wrong item complaint pattern.',
    moderationNeed: 'Remove order IDs, addresses, phone numbers and screenshots before trend summary.',
    publicOutput: 'Safe refund warning and official support-channel reminder.',
    safetyRule: 'Never tell users to share OTP, UPI PIN, CVV, remote-access code or full card details.'
  },
  {
    id: 'govt-form-agent-fraud',
    priority: 'P1',
    category: 'GOVT_FORM',
    userSignal: 'Agent asks excess fee for government form, fake scholarship, fake document verification, admission form fraud.',
    moderationNeed: 'Verify official source and avoid implying government endorsement.',
    publicOutput: 'Official-source awareness alert with document safety tips.',
    safetyRule: 'Clearly separate guidance from official government advice.'
  },
  {
    id: 'call-sms-link-alert',
    priority: 'P2',
    category: 'CALL_SMS_LINK',
    userSignal: 'Suspicious SMS link, KYC update link, parcel/courier call, fake bank/court/police call.',
    moderationNeed: 'Block live malicious links and redact phone numbers before review.',
    publicOutput: 'Generic pattern alert and safe verification checklist.',
    safetyRule: 'Do not publish clickable malicious URLs or instructions that help abuse.'
  }
]

export function normalizeSafetyCategory(value?: string) {
  const normalized = (value || '').toLowerCase().trim()
  if (normalized.includes('upi') || normalized.includes('bank') || normalized.includes('payment')) return 'UPI_FRAUD'
  if (normalized.includes('loan')) return 'LOAN_APP'
  if (normalized.includes('job') || normalized.includes('work')) return 'JOB_SCAM'
  if (normalized.includes('shop') || normalized.includes('refund') || normalized.includes('delivery')) return 'SHOPPING_REFUND'
  if (normalized.includes('gov') || normalized.includes('form') || normalized.includes('scheme') || normalized.includes('scholar')) return 'GOVT_FORM'
  return 'CALL_SMS_LINK'
}

export function redactSafetyText(input: string) {
  return input
    .replace(/\b\d{10}\b/g, '[phone-redacted]')
    .replace(/\b\d{12,16}\b/g, '[number-redacted]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email-redacted]')
    .replace(/\b(?:otp|password|upi\s*pin|cvv|card\s*number)\s*[:=]?\s*\S+/gi, '[secret-redacted]')
    .replace(/https?:\/\/\S+/gi, '[link-redacted]')
}

export function getCommunitySafetyReadinessReport() {
  const mode = env('COMMUNITY_SAFETY_ALERTS_MODE', 'dry_run')
  const modeSafe = allowedModes.includes(mode)
  const ownerReady = configured('COMMUNITY_SAFETY_OWNER')
  const intakeReviewed = truthy(env('COMMUNITY_SAFETY_INTAKE_REVIEWED'))
  const moderationReviewed = truthy(env('COMMUNITY_SAFETY_MODERATION_REVIEWED'))
  const redactionReviewed = truthy(env('COMMUNITY_SAFETY_REDACTION_REVIEWED'))
  const sourceReviewed = truthy(env('COMMUNITY_SAFETY_OFFICIAL_SOURCE_REVIEWED'))
  const escalationReviewed = truthy(env('COMMUNITY_SAFETY_ESCALATION_REVIEWED'))
  const publicReviewed = truthy(env('COMMUNITY_SAFETY_PUBLIC_ALERT_REVIEWED'))
  const dryRun = truthy(env('COMMUNITY_SAFETY_REPORT_DRY_RUN', 'true'))

  const controls: CommunitySafetyControl[] = [
    {
      id: 'owner-assigned',
      priority: 'P0',
      label: 'Community safety owner assigned',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `COMMUNITY_SAFETY_OWNER=${env('COMMUNITY_SAFETY_OWNER') || 'empty'}`,
      passCondition: 'A support/safety owner reviews scam reports, public alerts, takedowns and escalations.',
      evidenceRequired: 'Owner/team recorded in env, release notes or admin screenshot.',
      riskIfSkipped: 'User-submitted scam reports can create legal/privacy risk without a reviewer.'
    },
    {
      id: 'mode-safe',
      priority: 'P0',
      label: 'Safety alerts mode is safe',
      status: modeSafe ? 'READY_TO_TEST' : 'BLOCKED',
      envValue: `COMMUNITY_SAFETY_ALERTS_MODE=${mode}`,
      passCondition: 'Mode is dry_run, manual_review, enabled or disabled. Keep dry_run/manual_review before publishing any public alert.',
      evidenceRequired: 'Masked env screenshot or launch evidence showing mode.',
      riskIfSkipped: 'Unsafe mode can publish unreviewed accusations, personal data or malicious links.'
    },
    {
      id: 'report-dry-run',
      priority: 'P0',
      label: 'Public report intake starts in dry-run/manual review',
      status: dryRun ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `COMMUNITY_SAFETY_REPORT_DRY_RUN=${env('COMMUNITY_SAFETY_REPORT_DRY_RUN', 'true')}`,
      passCondition: 'Public scam reports are stored/logged only after privacy and moderation review. Default launch is dry-run.',
      evidenceRequired: 'Report form test, API response and admin readiness screenshot.',
      riskIfSkipped: 'The app may collect sensitive evidence before storage/privacy rules are verified.'
    },
    {
      id: 'intake-reviewed',
      priority: 'P0',
      label: 'Report intake copy reviewed',
      status: intakeReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `COMMUNITY_SAFETY_INTAKE_REVIEWED=${env('COMMUNITY_SAFETY_INTAKE_REVIEWED', 'false')}`,
      passCondition: 'Report form clearly says not to enter OTP, passwords, UPI PIN, CVV, full card/bank data or private documents.',
      evidenceRequired: 'Mobile and desktop screenshot of /safety-alerts report form.',
      riskIfSkipped: 'Users may submit secrets or private documents into a public/community safety workflow.'
    },
    {
      id: 'moderation-reviewed',
      priority: 'P0',
      label: 'Moderation workflow reviewed',
      status: moderationReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `COMMUNITY_SAFETY_MODERATION_REVIEWED=${env('COMMUNITY_SAFETY_MODERATION_REVIEWED', 'false')}`,
      passCondition: 'Each submitted report is reviewed for spam, defamation, private data, unsafe links and official-source accuracy before any public use.',
      evidenceRequired: 'Admin moderation checklist and sample safe/unsafe report review.',
      riskIfSkipped: 'Unreviewed public claims can create safety, trust and legal issues.'
    },
    {
      id: 'redaction-reviewed',
      priority: 'P0',
      label: 'PII/secret redaction reviewed',
      status: redactionReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `COMMUNITY_SAFETY_REDACTION_REVIEWED=${env('COMMUNITY_SAFETY_REDACTION_REVIEWED', 'false')}`,
      passCondition: 'Phone numbers, emails, UPI IDs, links, IDs, OTP/password/PIN/CVV terms and screenshots are redacted before public alerts.',
      evidenceRequired: 'Before/after redaction sample and reviewer signoff.',
      riskIfSkipped: 'Public alerts can leak personal data or live malicious links.'
    },
    {
      id: 'official-source-reviewed',
      priority: 'P1',
      label: 'Official reporting/source routes reviewed',
      status: sourceReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `COMMUNITY_SAFETY_OFFICIAL_SOURCE_REVIEWED=${env('COMMUNITY_SAFETY_OFFICIAL_SOURCE_REVIEWED', 'false')}`,
      passCondition: 'Cyber, bank, consumer and official complaint routes are reviewed and not presented as HaqSathi-owned authorities.',
      evidenceRequired: 'Official link review screenshot and source list.',
      riskIfSkipped: 'Users may rely on outdated or unofficial reporting guidance.'
    },
    {
      id: 'escalation-reviewed',
      priority: 'P1',
      label: 'High-risk escalation path reviewed',
      status: escalationReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `COMMUNITY_SAFETY_ESCALATION_REVIEWED=${env('COMMUNITY_SAFETY_ESCALATION_REVIEWED', 'false')}`,
      passCondition: 'Reports involving harassment, blackmail, self-harm risk, minors, threats or money loss are routed to support/safety review.',
      evidenceRequired: 'Escalation policy and sample ticket routing proof.',
      riskIfSkipped: 'High-risk users may receive generic guidance when urgent human escalation is needed.'
    },
    {
      id: 'public-alert-reviewed',
      priority: 'P1',
      label: 'Public alert publishing reviewed',
      status: publicReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `COMMUNITY_SAFETY_PUBLIC_ALERT_REVIEWED=${env('COMMUNITY_SAFETY_PUBLIC_ALERT_REVIEWED', 'false')}`,
      passCondition: 'Public safety alerts are aggregated, non-identifying, redacted, source-reviewed and takedown-ready.',
      evidenceRequired: 'Public alert sample, takedown workflow and moderation signoff.',
      riskIfSkipped: 'The app can publish claims that harm users, private people or trust.'
    }
  ]

  const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
  const blocked = controls.filter((control) => control.status === 'BLOCKED').length
  const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length

  return {
    phase: 'Phase 89',
    title: 'Community Safety Alerts Readiness',
    mode,
    summary: {
      totalControls: controls.length,
      ready,
      blocked,
      manualRequired,
      lanes: communitySafetyLanes.length
    },
    controls,
    communitySafetyLanes,
    launchPolicy: [
      'Keep report intake in dry-run/manual_review until moderation, redaction and official-source review pass.',
      'Never publish raw user submissions, screenshots, phone numbers, UPI IDs, emails, addresses, IDs, OTPs, passwords, UPI PINs, CVV or live scam links.',
      'Publish aggregated patterns and safety education only; do not name private individuals or make unverified accusations.',
      'Escalate blackmail, harassment, threats, minors, self-harm risk and large money loss to human safety/support review.',
      'Show official reporting routes clearly as external resources, not as HaqSathi-owned complaint authorities.'
    ]
  }
}
