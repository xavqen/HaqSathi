export type DocumentExpiryReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type DocumentExpiryReadinessPriority = 'P0' | 'P1' | 'P2'

export type DocumentExpiryControl = {
  id: string
  priority: DocumentExpiryReadinessPriority
  label: string
  status: DocumentExpiryReadinessStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type DocumentExpiryLane = {
  id: string
  priority: DocumentExpiryReadinessPriority
  document: string
  renewalWindow: string
  officialRoute: string
  safetyRule: string
}

const env = (key: string, fallback = '') => process.env[key] || fallback
const truthy = (value?: string) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(value || '')
const configured = (key: string) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

export const documentExpiryReadinessLanes: DocumentExpiryLane[] = [
  {
    id: 'identity-renewal',
    priority: 'P0',
    document: 'Passport, driving license and identity document renewal',
    renewalWindow: 'Start 180-270 days before expiry where applicable.',
    officialRoute: 'Official passport/Parivahan/state department route only.',
    safetyRule: 'Never ask users for OTP, password, full Aadhaar/PAN, CVV, UPI PIN or raw private scans in the planner.'
  },
  {
    id: 'vehicle-renewal',
    priority: 'P1',
    document: 'Vehicle insurance and PUC reminders',
    renewalWindow: 'Start 15-30 days before expiry.',
    officialRoute: 'Insurer, authorized PUC center or official transport system.',
    safetyRule: 'Warn against fake policy links, unknown agents and unofficial payment requests.'
  },
  {
    id: 'student-certificates',
    priority: 'P0',
    document: 'Income, caste, domicile and scholarship documents',
    renewalWindow: 'Start 45-90 days before form deadlines.',
    officialRoute: 'State e-district, scholarship portal, school/college official notice or verified CSC.',
    safetyRule: 'Tell users certificate validity differs by state/scheme and they must verify current official instructions.'
  },
  {
    id: 'bank-kyc-review',
    priority: 'P0',
    document: 'Bank KYC review reminders',
    renewalWindow: 'Act only after official bank notice or branch/app prompt.',
    officialRoute: 'Bank branch, official bank app or bank website.',
    safetyRule: 'Strongly warn that banks never need OTP, UPI PIN, CVV or password for KYC renewal.'
  }
]

export function getDocumentExpiryReadinessReport() {
  const mode = env('DOCUMENT_EXPIRY_PLANNER_MODE', 'local_only')
  const ownerReady = configured('DOCUMENT_EXPIRY_OWNER')
  const officialLinksReviewed = truthy(env('DOCUMENT_EXPIRY_OFFICIAL_LINKS_REVIEWED'))
  const copyReviewed = truthy(env('DOCUMENT_EXPIRY_PRIVACY_COPY_REVIEWED'))
  const translationReviewed = truthy(env('DOCUMENT_EXPIRY_TRANSLATION_REVIEWED'))
  const reminderReviewed = truthy(env('DOCUMENT_EXPIRY_REMINDER_DELIVERY_REVIEWED'))
  const mobileReviewed = truthy(env('DOCUMENT_EXPIRY_MOBILE_QA_REVIEWED'))
  const allowedModes = ['local_only', 'dry_run', 'enabled', 'disabled']

  const controls: DocumentExpiryControl[] = [
    {
      id: 'mode-safe',
      priority: 'P0',
      label: 'Planner mode is safe',
      status: allowedModes.includes(mode) ? 'READY_TO_TEST' : 'BLOCKED',
      envValue: `DOCUMENT_EXPIRY_PLANNER_MODE=${mode}`,
      passCondition: 'Planner mode is local_only, dry_run, enabled or disabled. MVP can run without storing personal document data.',
      evidenceRequired: 'Env screenshot or admin readiness screenshot showing mode.',
      riskIfSkipped: 'Unsafe mode can store sensitive document timelines before privacy/storage review.'
    },
    {
      id: 'owner-assigned',
      priority: 'P1',
      label: 'Document renewal owner assigned',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `DOCUMENT_EXPIRY_OWNER=${env('DOCUMENT_EXPIRY_OWNER') || 'empty'}`,
      passCondition: 'Owner reviews official routes, renewal windows and support macros before public promotion.',
      evidenceRequired: 'Owner/team noted in release evidence or admin screenshot.',
      riskIfSkipped: 'Outdated renewal wording may confuse users during scholarship, KYC or official form deadlines.'
    },
    {
      id: 'official-routes-reviewed',
      priority: 'P0',
      label: 'Official renewal routes reviewed',
      status: officialLinksReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `DOCUMENT_EXPIRY_OFFICIAL_LINKS_REVIEWED=${env('DOCUMENT_EXPIRY_OFFICIAL_LINKS_REVIEWED', 'false')}`,
      passCondition: 'Passport, Parivahan, state certificate, insurer, bank and scholarship route text is reviewed for official-only wording.',
      evidenceRequired: 'Checklist with official source review and sample user-facing route proof.',
      riskIfSkipped: 'Users may follow unofficial links or agents for sensitive document renewals.'
    },
    {
      id: 'privacy-copy-reviewed',
      priority: 'P0',
      label: 'Sensitive-data warning reviewed',
      status: copyReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `DOCUMENT_EXPIRY_PRIVACY_COPY_REVIEWED=${env('DOCUMENT_EXPIRY_PRIVACY_COPY_REVIEWED', 'false')}`,
      passCondition: 'Tool clearly says not to enter OTP, password, UPI PIN, CVV, full card/bank details, Aadhaar/PAN numbers or raw scans.',
      evidenceRequired: 'Mobile and desktop screenshot of /tools/document-expiry-planner warning panel.',
      riskIfSkipped: 'Users may disclose secrets into a reminder/checklist workflow.'
    },
    {
      id: 'translation-reviewed',
      priority: 'P1',
      label: 'Key-language translation reviewed',
      status: translationReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `DOCUMENT_EXPIRY_TRANSLATION_REVIEWED=${env('DOCUMENT_EXPIRY_TRANSLATION_REVIEWED', 'false')}`,
      passCondition: 'Expiry, renewal, reminder and official-only safety terms are reviewed in priority languages.',
      evidenceRequired: 'Translation matrix screenshot or reviewer signoff.',
      riskIfSkipped: 'Users may misunderstand renewal timing or safety warnings in translated UI.'
    },
    {
      id: 'reminder-delivery-reviewed',
      priority: 'P1',
      label: 'Reminder delivery reviewed',
      status: reminderReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `DOCUMENT_EXPIRY_REMINDER_DELIVERY_REVIEWED=${env('DOCUMENT_EXPIRY_REMINDER_DELIVERY_REVIEWED', 'false')}`,
      passCondition: 'If email/push reminders are enabled later, consent, unsubscribe and privacy-safe reminder copy are verified first.',
      evidenceRequired: 'Notification/email reminder test evidence or local-only launch decision.',
      riskIfSkipped: 'Automated reminders can leak document categories or create unwanted notifications.'
    },
    {
      id: 'mobile-qa-reviewed',
      priority: 'P1',
      label: 'Mobile UX reviewed',
      status: mobileReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `DOCUMENT_EXPIRY_MOBILE_QA_REVIEWED=${env('DOCUMENT_EXPIRY_MOBILE_QA_REVIEWED', 'false')}`,
      passCondition: 'Tool form, result cards and warning panels are readable and touch-friendly on Android/iPhone widths.',
      evidenceRequired: 'Real device screenshots of input form and generated plan.',
      riskIfSkipped: 'Date input/result cards can become hard to use on small screens.'
    }
  ]

  const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
  const blocked = controls.filter((control) => control.status === 'BLOCKED').length
  const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length

  return {
    version: '3.0.60-document-expiry-planner',
    mode,
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      lanes: documentExpiryReadinessLanes.length,
      launchStatus: blocked > 0 ? 'BLOCKED' : manualRequired > 0 ? 'MANUAL_REVIEW_REQUIRED' : 'READY_TO_TEST'
    },
    controls,
    documentExpiryReadinessLanes,
    safetyPolicy: [
      'Planner should work with date + document type only.',
      'Do not collect raw document scans, Aadhaar/PAN numbers, OTP, password, UPI PIN, CVV or full card/bank details.',
      'Use official-only wording and avoid agent endorsement.',
      'If reminders are stored later, ask consent and keep document labels privacy-safe.'
    ]
  }
}
