export type ReturnPickupReadinessControl = {
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

export const returnPickupReadinessLanes = [
  {
    id: 'return-window',
    priority: 'P0',
    lane: 'Return window calculation',
    reviewRule: 'Deadline estimate should be presented as planning help, not as a guaranteed official policy.',
    safetyRule: 'Ask user to verify exact return window inside the official marketplace app or order page.'
  },
  {
    id: 'pickup-proof',
    priority: 'P0',
    lane: 'Pickup proof checklist',
    reviewRule: 'Checklist must include order proof, product photos, packaging photos, pickup receipt and support timeline.',
    safetyRule: 'Warn users not to hand over product without official pickup proof or app acknowledgement.'
  },
  {
    id: 'refund-scam-safety',
    priority: 'P0',
    lane: 'Refund scam safety',
    reviewRule: 'Every flow must show OTP, UPI PIN, CVV, password and screen-sharing warning.',
    safetyRule: 'Never ask for secret payment credentials or full bank/card details.'
  },
  {
    id: 'mobile-shopping-flow',
    priority: 'P1',
    lane: 'Mobile return flow',
    reviewRule: 'Form, date fields, generated text and copy button must work smoothly on Android Chrome.',
    safetyRule: 'No off-screen dropdowns, clipped buttons or horizontal overflow.'
  }
] as const

export function getReturnPickupReadinessReport() {
  const mode = env('RETURN_PICKUP_PLANNER_MODE', 'local_only')
  const controls: ReturnPickupReadinessControl[] = [
    {
      id: 'mode-safe',
      priority: 'P0',
      label: 'Planner mode is safe',
      status: ['local_only', 'dry_run', 'enabled', 'disabled'].includes(mode) ? 'READY_TO_TEST' : 'BLOCKED',
      envValue: `RETURN_PICKUP_PLANNER_MODE=${mode}`,
      note: 'Use local_only/dry_run until return/refund copy, scam warning and marketplace wording are reviewed.'
    },
    {
      id: 'owner-assigned',
      priority: 'P1',
      label: 'Product/support owner assigned',
      status: configured('RETURN_PICKUP_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `RETURN_PICKUP_OWNER=${env('RETURN_PICKUP_OWNER', 'empty')}`,
      note: 'Owner should review marketplace/refund wording, escalation copy and mobile flow.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Return/refund copy reviewed',
      status: enabled('RETURN_PICKUP_COPY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `RETURN_PICKUP_COPY_REVIEWED=${env('RETURN_PICKUP_COPY_REVIEWED', 'false')}`,
      note: 'Copy must not promise guaranteed refund/replacement or bypass official marketplace policy.'
    },
    {
      id: 'scam-warning-reviewed',
      priority: 'P0',
      label: 'Refund scam warning reviewed',
      status: enabled('RETURN_PICKUP_SCAM_WARNING_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `RETURN_PICKUP_SCAM_WARNING_REVIEWED=${env('RETURN_PICKUP_SCAM_WARNING_REVIEWED', 'false')}`,
      note: 'OTP, UPI PIN, CVV, password, full bank/card data and screen-sharing warnings must be visible.'
    },
    {
      id: 'mobile-qa-reviewed',
      priority: 'P1',
      label: 'Mobile return flow reviewed',
      status: enabled('RETURN_PICKUP_MOBILE_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `RETURN_PICKUP_MOBILE_QA_REVIEWED=${env('RETURN_PICKUP_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test tool page, form fields, generated message and copy button on small Android screens.'
    },
    {
      id: 'translation-reviewed',
      priority: 'P2',
      label: 'Priority language copy reviewed',
      status: enabled('RETURN_PICKUP_TRANSLATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `RETURN_PICKUP_TRANSLATION_REVIEWED=${env('RETURN_PICKUP_TRANSLATION_REVIEWED', 'false')}`,
      note: 'Return/refund wording needs human review in priority languages before public launch.'
    }
  ]

  return {
    version: '3.0.65-return-pickup-planner',
    generatedAt: new Date().toISOString(),
    mode,
    summary: {
      totalControls: controls.length,
      ready: controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((item) => item.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((item) => item.status === 'BLOCKED').length,
      lanes: returnPickupReadinessLanes.length
    },
    controls,
    returnPickupReadinessLanes,
    safetyPolicy: [
      'Never ask users for OTP, UPI PIN, card CVV, password, screen-sharing access or full bank/card data for refunds.',
      'Tell users to use the official marketplace app/website and save ticket, pickup and refund timeline screenshots.',
      'Do not guarantee refund, replacement, pickup or return acceptance; official policy and proof decide outcome.',
      'Redact personal address, phone, full order ID and payment details before public sharing.'
    ]
  }
}
