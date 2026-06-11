export type RentDepositReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const rentDepositReadinessLanes = [
  {
    id: 'legal-guidance-copy',
    priority: 'P0',
    lane: 'Guidance-only legal copy',
    reviewRule: 'Copy must not claim legal certainty or replace local legal advice.',
    safetyRule: 'High-risk eviction, lockout, threat or violence cases must route to local expert/authority guidance.'
  },
  {
    id: 'privacy-redaction',
    priority: 'P0',
    lane: 'Address/privacy redaction',
    reviewRule: 'Tool must warn against exposing full address, phone, ID proof, account/UPI details or family details.',
    safetyRule: 'Public sharing must be redacted and should avoid doxxing, threats or harassment.'
  },
  {
    id: 'proof-pack',
    priority: 'P1',
    lane: 'Agreement/payment/handover proof',
    reviewRule: 'Proof checklist must include agreement terms, payment proof, photos, handover and written request timeline.',
    safetyRule: 'Avoid fake claims; request written deduction breakup and preserve original evidence.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Long landlord/tenant copy, proof cards and date inputs must work on small screens.',
    safetyRule: 'Safety warning must remain visible before copy/share actions.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): RentDepositReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getRentDepositReadinessReport() {
  const mode = env('RENT_DEPOSIT_PLANNER_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Rent deposit planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as RentDepositReadinessStatus : 'BLOCKED' as RentDepositReadinessStatus,
      envValue: `RENT_DEPOSIT_PLANNER_MODE=${mode}`,
      note: 'Keep local_only/dry_run until legal guidance copy, privacy redaction and mobile QA are reviewed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Rent dispute copy reviewed',
      status: boolStatus('RENT_DEPOSIT_COPY_REVIEWED'),
      envValue: `RENT_DEPOSIT_COPY_REVIEWED=${env('RENT_DEPOSIT_COPY_REVIEWED', 'false')}`,
      note: 'Review wording for deposit return, unfair deduction, rent receipt, notice period and maintenance disputes.'
    },
    {
      id: 'legal-reviewed',
      priority: 'P0',
      label: 'Guidance-only legal safety reviewed',
      status: boolStatus('RENT_DEPOSIT_LEGAL_REVIEWED'),
      envValue: `RENT_DEPOSIT_LEGAL_REVIEWED=${env('RENT_DEPOSIT_LEGAL_REVIEWED', 'false')}`,
      note: 'Check disclaimer and high-risk escalation for eviction, illegal lockout, threat, violence or high-value disputes.'
    },
    {
      id: 'privacy-reviewed',
      priority: 'P0',
      label: 'Address/privacy redaction reviewed',
      status: boolStatus('RENT_DEPOSIT_PRIVACY_REVIEWED'),
      envValue: `RENT_DEPOSIT_PRIVACY_REVIEWED=${env('RENT_DEPOSIT_PRIVACY_REVIEWED', 'false')}`,
      note: 'Confirm users are warned not to expose exact address, phone, family details, ID proofs or account details publicly.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('RENT_DEPOSIT_MOBILE_QA_REVIEWED'),
      envValue: `RENT_DEPOSIT_MOBILE_QA_REVIEWED=${env('RENT_DEPOSIT_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test form, date inputs, proof checklist, escalation cards and copy-ready message on mobile and desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.67-rent-deposit-dispute-planner',
    mode,
    owner: env('RENT_DEPOSIT_OWNER', 'Product/Support'),
    controls,
    rentDepositReadinessLanes,
    safetyPolicy: [
      'This workflow is guidance-only and must not replace local legal advice or authority instructions.',
      'Never expose full address, phone, ID proof, account details, UPI IDs or family details in public complaint posts.',
      'Do not encourage threats, harassment, forced entry, lock conflict, fake claims or unsafe confrontation.',
      'High-risk eviction, illegal lockout, threat, violence or large money disputes should route to local legal aid/expert/authority.'
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
