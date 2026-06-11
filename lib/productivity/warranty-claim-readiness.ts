export type WarrantyClaimReadinessControl = {
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

export const warrantyClaimReadinessLanes = [
  {
    id: 'claim-copy',
    priority: 'P0',
    lane: 'Warranty claim copy',
    reviewRule: 'Generated claim should stay factual, polite and warranty/service-policy aware.',
    safetyRule: 'Never ask for OTP, passwords, screen-lock PIN, UPI PIN, CVV or full card/bank data.'
  },
  {
    id: 'proof-checklist',
    priority: 'P0',
    lane: 'Proof checklist',
    reviewRule: 'Checklist must include invoice, warranty card, defect proof, job sheet and support log.',
    safetyRule: 'Remind users to redact private serial/ID/contact details before public sharing.'
  },
  {
    id: 'service-center-safety',
    priority: 'P1',
    lane: 'Service center safety',
    reviewRule: 'Users should know what to ask before product handover.',
    safetyRule: 'Device data backup/removal and authorized-channel warning must be visible.'
  },
  {
    id: 'mobile-flow',
    priority: 'P1',
    lane: 'Mobile warranty flow',
    reviewRule: 'Date inputs, long claim text and copy button must fit Android Chrome.',
    safetyRule: 'No hidden actions, no horizontal overflow, no cut-off warning text.'
  }
] as const

export function getWarrantyClaimReadinessReport() {
  const mode = env('WARRANTY_CLAIM_PLANNER_MODE', 'local_only')
  const controls: WarrantyClaimReadinessControl[] = [
    {
      id: 'mode-safe',
      priority: 'P0',
      label: 'Planner mode is safe',
      status: ['local_only', 'dry_run', 'enabled', 'disabled'].includes(mode) ? 'READY_TO_TEST' : 'BLOCKED',
      envValue: `WARRANTY_CLAIM_PLANNER_MODE=${mode}`,
      note: 'Use local_only/dry_run until service-center copy and safety wording are reviewed.'
    },
    {
      id: 'owner-assigned',
      priority: 'P1',
      label: 'Product/support owner assigned',
      status: configured('WARRANTY_CLAIM_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `WARRANTY_CLAIM_OWNER=${env('WARRANTY_CLAIM_OWNER', 'empty')}`,
      note: 'Owner should review warranty wording, service-center flow and claim tone.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Warranty claim copy reviewed',
      status: enabled('WARRANTY_CLAIM_COPY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `WARRANTY_CLAIM_COPY_REVIEWED=${env('WARRANTY_CLAIM_COPY_REVIEWED', 'false')}`,
      note: 'Claim copy must not promise guaranteed repair/replacement/refund.'
    },
    {
      id: 'privacy-reviewed',
      priority: 'P0',
      label: 'Device/privacy safety reviewed',
      status: enabled('WARRANTY_CLAIM_PRIVACY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `WARRANTY_CLAIM_PRIVACY_REVIEWED=${env('WARRANTY_CLAIM_PRIVACY_REVIEWED', 'false')}`,
      note: 'Device handover warning and secret-sharing warning must be visible.'
    },
    {
      id: 'mobile-qa-reviewed',
      priority: 'P1',
      label: 'Mobile claim flow reviewed',
      status: enabled('WARRANTY_CLAIM_MOBILE_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `WARRANTY_CLAIM_MOBILE_QA_REVIEWED=${env('WARRANTY_CLAIM_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test form, generated plan and copy button on small Android screens.'
    },
    {
      id: 'translation-reviewed',
      priority: 'P2',
      label: 'Priority language copy reviewed',
      status: enabled('WARRANTY_CLAIM_TRANSLATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `WARRANTY_CLAIM_TRANSLATION_REVIEWED=${env('WARRANTY_CLAIM_TRANSLATION_REVIEWED', 'false')}`,
      note: 'Warranty/service-center wording needs human review in priority languages.'
    }
  ]

  return {
    version: '3.0.64-warranty-claim-planner',
    generatedAt: new Date().toISOString(),
    mode,
    summary: {
      totalControls: controls.length,
      ready: controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((item) => item.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((item) => item.status === 'BLOCKED').length,
      lanes: warrantyClaimReadinessLanes.length
    },
    controls,
    warrantyClaimReadinessLanes,
    safetyPolicy: [
      'Never ask users to share OTP, password, UPI PIN, CVV, screen lock PIN or full card/bank data.',
      'Show product handover safety: backup data, remove accounts where possible and collect job sheet.',
      'Tell users to use authorized service channels and save written diagnosis/denial proof.',
      'Warranty status is a planning estimate unless official warranty terms or invoice proof confirm it.'
    ]
  }
}
