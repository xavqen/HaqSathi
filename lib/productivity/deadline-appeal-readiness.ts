export type DeadlineAppealReadinessControl = {
  id: string
  priority: 'P0' | 'P1' | 'P2'
  label: string
  status: 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
  envValue: string
  note: string
}

const env = (key: string, fallback = '') => process.env[key] || fallback
const enabled = (key: string) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(key))
const configured = (key: string) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

export const deadlineAppealReadinessLanes = [
  {
    id: 'deadline-calculation',
    priority: 'P0',
    lane: 'Deadline calculation',
    reviewRule: 'Planner must show that calculated dates are estimates unless the user enters an official final date.',
    safetyRule: 'Exact limitation/deadline must be verified from official portal, notice or order.'
  },
  {
    id: 'appeal-copy',
    priority: 'P0',
    lane: 'Appeal copy generation',
    reviewRule: 'Generated note must stay polite, factual and proof-based.',
    safetyRule: 'Do not ask for OTP, password, UPI PIN, CVV, full card/bank or full ID numbers.'
  },
  {
    id: 'proof-readiness',
    priority: 'P1',
    lane: 'Proof checklist',
    reviewRule: 'Checklist should include acknowledgement, payment, reply/rejection and follow-up proof.',
    safetyRule: 'Mention redaction before sharing evidence outside official channels.'
  },
  {
    id: 'mobile-usability',
    priority: 'P1',
    lane: 'Mobile deadline flow',
    reviewRule: 'Date inputs, copy button and timeline cards must fit small Android screens.',
    safetyRule: 'No horizontal overflow or hidden action buttons.'
  }
] as const

export function getDeadlineAppealReadinessReport() {
  const mode = env('DEADLINE_APPEAL_PLANNER_MODE', 'local_only')
  const controls: DeadlineAppealReadinessControl[] = [
    {
      id: 'mode-safe',
      priority: 'P0',
      label: 'Planner mode is safe',
      status: ['local_only', 'dry_run', 'enabled', 'disabled'].includes(mode) ? 'READY_TO_TEST' : 'BLOCKED',
      envValue: `DEADLINE_APPEAL_PLANNER_MODE=${mode}`,
      note: 'Use local_only/dry_run until copy, deadline wording and legal disclaimer review pass.'
    },
    {
      id: 'owner-assigned',
      priority: 'P1',
      label: 'Product/support owner assigned',
      status: configured('DEADLINE_APPEAL_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `DEADLINE_APPEAL_OWNER=${env('DEADLINE_APPEAL_OWNER', 'empty')}`,
      note: 'Owner should review deadline wording and user support escalation flow.'
    },
    {
      id: 'deadline-copy-reviewed',
      priority: 'P0',
      label: 'Deadline estimate copy reviewed',
      status: enabled('DEADLINE_APPEAL_COPY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `DEADLINE_APPEAL_COPY_REVIEWED=${env('DEADLINE_APPEAL_COPY_REVIEWED', 'false')}`,
      note: 'Users must understand the tool estimates dates unless official deadline is provided.'
    },
    {
      id: 'legal-disclaimer-reviewed',
      priority: 'P0',
      label: 'Legal/guidance disclaimer reviewed',
      status: enabled('DEADLINE_APPEAL_LEGAL_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `DEADLINE_APPEAL_LEGAL_REVIEWED=${env('DEADLINE_APPEAL_LEGAL_REVIEWED', 'false')}`,
      note: 'The tool must not present legal deadline advice as final legal opinion.'
    },
    {
      id: 'mobile-qa-reviewed',
      priority: 'P1',
      label: 'Mobile deadline flow reviewed',
      status: enabled('DEADLINE_APPEAL_MOBILE_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `DEADLINE_APPEAL_MOBILE_QA_REVIEWED=${env('DEADLINE_APPEAL_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test Android Chrome and desktop at minimum.'
    },
    {
      id: 'translation-reviewed',
      priority: 'P2',
      label: 'Priority language copy reviewed',
      status: enabled('DEADLINE_APPEAL_TRANSLATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `DEADLINE_APPEAL_TRANSLATION_REVIEWED=${env('DEADLINE_APPEAL_TRANSLATION_REVIEWED', 'false')}`,
      note: 'Deadline and appeal wording needs human review in priority languages.'
    }
  ]

  return {
    version: '3.0.63-deadline-appeal-planner',
    generatedAt: new Date().toISOString(),
    mode,
    summary: {
      totalControls: controls.length,
      ready: controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((item) => item.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((item) => item.status === 'BLOCKED').length,
      lanes: deadlineAppealReadinessLanes.length
    },
    controls,
    deadlineAppealReadinessLanes,
    safetyPolicy: [
      'Show deadline calculations as planning estimates unless user enters official final date.',
      'Tell users to verify exact rules from official portal, notice, order or expert where needed.',
      'Never ask for OTPs, passwords, UPI PINs, CVV, full card/bank details or full Aadhaar/PAN.',
      'For fraud/banking/cyber issues, urgent official reporting comes before normal appeal planning.'
    ]
  }
}
