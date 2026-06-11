export type TelecomSimReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const telecomSimReadinessLanes = [
  {
    id: 'telecom-copy',
    priority: 'P0',
    lane: 'Telecom complaint copy',
    reviewRule: 'Tool must generate factual recharge, bill, SIM, porting and KYC complaint copy without promising refund, activation or regulator outcome.',
    safetyRule: 'Every generated message must ask for official written status/timeline, not unofficial shortcuts.'
  },
  {
    id: 'otp-sim-safety',
    priority: 'P0',
    lane: 'OTP/SIM safety',
    reviewRule: 'Tool must warn against OTP, SIM swap/porting OTP, UPI PIN, CVV, passwords, full ID numbers and remote access.',
    safetyRule: 'No flow should ask users to paste secret codes, full identity data or unrestricted mobile/account access.'
  },
  {
    id: 'kyc-misuse-route',
    priority: 'P0',
    lane: 'KYC misuse / suspicious SIM route',
    reviewRule: 'Tool must push official operator support/store and evidence preservation for suspected KYC misuse or SIM risk.',
    safetyRule: 'High-risk cases must not direct users to random third-party recovery agents.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Long select labels, date/amount fields, copy block and escalation cards must work on small Android Chrome screens.',
    safetyRule: 'No horizontal overflow or hidden copy button on mobile.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): TelecomSimReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getTelecomSimReadinessReport() {
  const mode = env('TELECOM_SIM_PLANNER_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Telecom SIM planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as TelecomSimReadinessStatus : 'BLOCKED' as TelecomSimReadinessStatus,
      envValue: `TELECOM_SIM_PLANNER_MODE=${mode}`,
      note: 'Keep local_only/dry_run until copy, OTP/SIM safety, KYC misuse route and mobile QA are reviewed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Telecom complaint copy reviewed',
      status: boolStatus('TELECOM_SIM_COPY_REVIEWED'),
      envValue: `TELECOM_SIM_COPY_REVIEWED=${env('TELECOM_SIM_COPY_REVIEWED', 'false')}`,
      note: 'Review recharge, bill, porting, SIM block, KYC misuse and scam-call copy.'
    },
    {
      id: 'secret-safety-reviewed',
      priority: 'P0',
      label: 'OTP/SIM secret safety reviewed',
      status: boolStatus('TELECOM_SIM_SECRET_SAFETY_REVIEWED'),
      envValue: `TELECOM_SIM_SECRET_SAFETY_REVIEWED=${env('TELECOM_SIM_SECRET_SAFETY_REVIEWED', 'false')}`,
      note: 'Confirm warnings for OTP, SIM swap/porting OTP, UPI PIN, CVV, password, full ID and remote-access scams.'
    },
    {
      id: 'kyc-reviewed',
      priority: 'P0',
      label: 'KYC misuse route reviewed',
      status: boolStatus('TELECOM_SIM_KYC_ROUTE_REVIEWED'),
      envValue: `TELECOM_SIM_KYC_ROUTE_REVIEWED=${env('TELECOM_SIM_KYC_ROUTE_REVIEWED', 'false')}`,
      note: 'Confirm suspected KYC misuse/SIM risk instructions route users to official operator channels.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('TELECOM_SIM_MOBILE_QA_REVIEWED'),
      envValue: `TELECOM_SIM_MOBILE_QA_REVIEWED=${env('TELECOM_SIM_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test selects, long proof list, copy block and CTA layout on mobile/tablet/desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.74-telecom-sim-complaint-planner',
    mode,
    owner: env('TELECOM_SIM_OWNER', 'Product/Telecom safety'),
    controls,
    telecomSimReadinessLanes,
    safetyPolicy: [
      'This workflow is guidance only and does not replace official operator, bank/payment app or authority instructions.',
      'Never request OTP, SIM swap/porting OTP, UPI PIN, CVV, card PIN, account password, full Aadhaar/ID number or remote access.',
      'Users should open official operator apps/sites themselves instead of clicking suspicious refund/activation links.',
      'Suspected KYC/SIM misuse should be handled quickly through official operator support/store and evidence preservation.',
      'Generated messages should be factual, calm and proof-based without refund/activation guarantees.'
    ],
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      status: blocked ? 'BLOCKED' : manualRequired ? 'MANUAL_REQUIRED' : 'READY_TO_TEST'
    }
  }
}
