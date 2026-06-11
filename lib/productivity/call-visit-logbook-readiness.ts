export type CallLogbookReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type CallLogbookReadinessPriority = 'P0' | 'P1' | 'P2'

export type CallLogbookControl = {
  id: string
  priority: CallLogbookReadinessPriority
  label: string
  status: CallLogbookReadinessStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type CallLogbookLane = {
  id: string
  priority: CallLogbookReadinessPriority
  lane: string
  captureRule: string
  safetyRule: string
}

const env = (key: string, fallback = '') => process.env[key] || fallback
const truthy = (value?: string) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(value || '')
const configured = (key: string) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

export const callLogbookReadinessLanes: CallLogbookLane[] = [
  {
    id: 'customer-care-call',
    priority: 'P0',
    lane: 'Helpline/customer care calls',
    captureRule: 'Capture date, time, ticket ID, agent name if shared and written follow-up message.',
    safetyRule: 'Never record or ask for OTP, password, UPI PIN, CVV, full card/bank details or remote access approval.'
  },
  {
    id: 'office-counter-visit',
    priority: 'P0',
    lane: 'Office/government counter visits',
    captureRule: 'Capture office, counter, token/acknowledgement and next promised date.',
    safetyRule: 'Do not publish staff names, private photos or location details without review.'
  },
  {
    id: 'service-center-visit',
    priority: 'P1',
    lane: 'Service center visits',
    captureRule: 'Capture job sheet, invoice, device/item photo, promised delivery and warranty status.',
    safetyRule: 'Hide serial numbers/IMEI/account IDs before sharing proof publicly.'
  },
  {
    id: 'bank-branch-visit',
    priority: 'P0',
    lane: 'Bank branch/payment desk visits',
    captureRule: 'Capture branch name, complaint number, transaction reference and acknowledgement.',
    safetyRule: 'Warn that banks never need OTP, UPI PIN, CVV or passwords for complaint tracking.'
  }
]

export function getCallVisitLogbookReadinessReport() {
  const mode = env('CALL_LOGBOOK_MODE', 'local_only')
  const ownerReady = configured('CALL_LOGBOOK_OWNER')
  const privacyReviewed = truthy(env('CALL_LOGBOOK_PRIVACY_COPY_REVIEWED'))
  const mobileReviewed = truthy(env('CALL_LOGBOOK_MOBILE_QA_REVIEWED'))
  const exportReviewed = truthy(env('CALL_LOGBOOK_EXPORT_REVIEWED'))
  const translationReviewed = truthy(env('CALL_LOGBOOK_TRANSLATION_REVIEWED'))
  const escalationReviewed = truthy(env('CALL_LOGBOOK_ESCALATION_COPY_REVIEWED'))
  const allowedModes = ['local_only', 'dry_run', 'enabled', 'disabled']

  const controls: CallLogbookControl[] = [
    {
      id: 'mode-safe',
      priority: 'P0',
      label: 'Logbook mode is safe',
      status: allowedModes.includes(mode) ? 'READY_TO_TEST' : 'BLOCKED',
      envValue: `CALL_LOGBOOK_MODE=${mode}`,
      passCondition: 'Mode is local_only, dry_run, enabled or disabled. MVP can work without storing private logs server-side.',
      evidenceRequired: 'Env screenshot or admin readiness screenshot showing selected mode.',
      riskIfSkipped: 'Unsafe storage mode can collect private interaction notes before privacy review.'
    },
    {
      id: 'owner-assigned',
      priority: 'P1',
      label: 'Ops/support owner assigned',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `CALL_LOGBOOK_OWNER=${env('CALL_LOGBOOK_OWNER') || 'empty'}`,
      passCondition: 'Support or product owner reviews logbook wording, proof checklist and escalation use-cases.',
      evidenceRequired: 'Owner/team noted in release evidence or admin screenshot.',
      riskIfSkipped: 'Users may rely on weak or unsafe interaction logs during escalation.'
    },
    {
      id: 'privacy-copy-reviewed',
      priority: 'P0',
      label: 'Secret-data warning reviewed',
      status: privacyReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `CALL_LOGBOOK_PRIVACY_COPY_REVIEWED=${env('CALL_LOGBOOK_PRIVACY_COPY_REVIEWED', 'false')}`,
      passCondition: 'Tool clearly warns against OTP, password, UPI PIN, CVV, full card/bank details, full Aadhaar/PAN and private address capture.',
      evidenceRequired: 'Mobile and desktop screenshot of /tools/call-visit-logbook warning panels.',
      riskIfSkipped: 'Users can store or copy sensitive secrets into follow-up messages.'
    },
    {
      id: 'mobile-qa-reviewed',
      priority: 'P1',
      label: 'Mobile UX reviewed',
      status: mobileReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `CALL_LOGBOOK_MOBILE_QA_REVIEWED=${env('CALL_LOGBOOK_MOBILE_QA_REVIEWED', 'false')}`,
      passCondition: 'Form, date input, text area, result cards and copy button are readable and touch-friendly on Android/iPhone widths.',
      evidenceRequired: 'Real device screenshots of input form and generated logbook entry.',
      riskIfSkipped: 'Users may fail to save call/visit details immediately after an interaction on mobile.'
    },
    {
      id: 'export-reviewed',
      priority: 'P1',
      label: 'Export/copy safety reviewed',
      status: exportReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `CALL_LOGBOOK_EXPORT_REVIEWED=${env('CALL_LOGBOOK_EXPORT_REVIEWED', 'false')}`,
      passCondition: 'Copy-ready message excludes secrets and tells users to redact private identifiers before public sharing.',
      evidenceRequired: 'Copied follow-up message proof and redaction checklist screenshot.',
      riskIfSkipped: 'Follow-up text may accidentally leak sensitive data to public channels or third parties.'
    },
    {
      id: 'translation-reviewed',
      priority: 'P2',
      label: 'Key-language translation reviewed',
      status: translationReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `CALL_LOGBOOK_TRANSLATION_REVIEWED=${env('CALL_LOGBOOK_TRANSLATION_REVIEWED', 'false')}`,
      passCondition: 'Terms like reference ID, acknowledgement, follow-up and secret-data warning are reviewed in priority languages.',
      evidenceRequired: 'Translation review note or language QA screenshot.',
      riskIfSkipped: 'Users may misunderstand what to record or what secrets to avoid.'
    },
    {
      id: 'escalation-copy-reviewed',
      priority: 'P1',
      label: 'Escalation copy reviewed',
      status: escalationReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `CALL_LOGBOOK_ESCALATION_COPY_REVIEWED=${env('CALL_LOGBOOK_ESCALATION_COPY_REVIEWED', 'false')}`,
      passCondition: 'Follow-up message tone is polite, factual and suitable for support, bank, office or service-center escalation.',
      evidenceRequired: 'Sample generated messages for at least three interaction types.',
      riskIfSkipped: 'Poor tone or unsupported allegations can weaken complaint escalation.'
    }
  ]

  const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
  const blocked = controls.filter((control) => control.status === 'BLOCKED').length
  const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length

  return {
    version: '3.0.61-call-visit-logbook',
    mode,
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      lanes: callLogbookReadinessLanes.length,
      launchStatus: blocked > 0 ? 'BLOCKED' : manualRequired > 0 ? 'MANUAL_REVIEW_REQUIRED' : 'READY_TO_TEST'
    },
    controls,
    callLogbookReadinessLanes,
    safetyPolicy: [
      'Logbook should work with user-entered notes locally unless explicit storage consent exists.',
      'Do not collect OTP, passwords, UPI PIN, CVV, full card/bank data, full Aadhaar/PAN or raw private documents.',
      'Encourage factual notes: date, time, reference ID, promise, refusal, acknowledgement and official channel.',
      'Public sharing must redact phone, email, address, account IDs, ticket IDs where sensitive, staff names and private photos.'
    ]
  }
}
