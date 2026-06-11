export type BankFreezeReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const bankFreezeReadinessLanes = [
  {
    id: 'bank-copy',
    priority: 'P0',
    lane: 'Bank freeze/lien copy',
    reviewRule: 'Tool must generate factual account freeze, lien, hold, KYC, UPI dispute and wrong debit copy without promising unfreeze, refund or regulator outcome.',
    safetyRule: 'Every generated message must ask for written reason, reference, pending action and timeline.'
  },
  {
    id: 'secret-safety',
    priority: 'P0',
    lane: 'Banking secret safety',
    reviewRule: 'Tool must warn users against sharing OTP, UPI PIN, ATM PIN, CVV, card PIN, password, full account/card number and remote access.',
    safetyRule: 'No flow should ask users to paste private banking credentials or full ID details.'
  },
  {
    id: 'official-route',
    priority: 'P0',
    lane: 'Official route safety',
    reviewRule: 'Tool must route users to official bank branch/app/website/grievance and verified cyber/regulator routes only.',
    safetyRule: 'High-risk freeze/lien cases must avoid random agents, unfreeze fees and suspicious links.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Long bank status, proof list, copy block, amount/date fields and escalation cards must work on small Android Chrome screens.',
    safetyRule: 'No horizontal overflow or hidden copy button on mobile.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): BankFreezeReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getBankFreezeReadinessReport() {
  const mode = env('BANK_FREEZE_PLANNER_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Bank freeze planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as BankFreezeReadinessStatus : 'BLOCKED' as BankFreezeReadinessStatus,
      envValue: `BANK_FREEZE_PLANNER_MODE=${mode}`,
      note: 'Keep local_only/dry_run until bank copy, secret safety, official route and mobile QA are reviewed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Bank freeze/lien copy reviewed',
      status: boolStatus('BANK_FREEZE_COPY_REVIEWED'),
      envValue: `BANK_FREEZE_COPY_REVIEWED=${env('BANK_FREEZE_COPY_REVIEWED', 'false')}`,
      note: 'Review account freeze, lien, KYC hold, UPI dispute hold, wrong debit and ATM cash-not-dispensed copy.'
    },
    {
      id: 'secret-safety-reviewed',
      priority: 'P0',
      label: 'Bank secret warnings reviewed',
      status: boolStatus('BANK_FREEZE_SECRET_SAFETY_REVIEWED'),
      envValue: `BANK_FREEZE_SECRET_SAFETY_REVIEWED=${env('BANK_FREEZE_SECRET_SAFETY_REVIEWED', 'false')}`,
      note: 'Confirm OTP, PIN, CVV, password, full account/card number and remote access warnings are visible.'
    },
    {
      id: 'official-route-reviewed',
      priority: 'P0',
      label: 'Official route reviewed',
      status: boolStatus('BANK_FREEZE_OFFICIAL_ROUTE_REVIEWED'),
      envValue: `BANK_FREEZE_OFFICIAL_ROUTE_REVIEWED=${env('BANK_FREEZE_OFFICIAL_ROUTE_REVIEWED', 'false')}`,
      note: 'Confirm users are routed to official bank/cyber/regulator channels only and not random agents/links.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('BANK_FREEZE_MOBILE_QA_REVIEWED'),
      envValue: `BANK_FREEZE_MOBILE_QA_REVIEWED=${env('BANK_FREEZE_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test selects, date/amount fields, copy block and escalation cards on mobile/tablet/desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.76-bank-account-freeze-planner',
    mode,
    owner: env('BANK_FREEZE_OWNER', 'Product/Banking safety'),
    controls,
    bankFreezeReadinessLanes,
    safetyPolicy: [
      'This workflow is guidance only and does not replace bank, regulator, police/cyber authority or expert instructions.',
      'Never request OTP, UPI PIN, ATM PIN, CVV, card PIN, password, full account/card number, full ID or remote access.',
      'Users should open official bank app/site/branch/grievance channels themselves instead of clicking suspicious links.',
      'Freeze/lien/hold cases should ask for written reason, reference, pending action and timeline before escalation.',
      'Generated messages should be factual, calm and proof-based without unfreeze, refund, reversal or regulator outcome guarantees.'
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
