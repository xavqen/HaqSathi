export type TravelRefundReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const travelRefundReadinessLanes = [
  {
    id: 'refund-policy-copy',
    priority: 'P0',
    lane: 'Refund policy copy',
    reviewRule: 'Tool must not guarantee refunds and must ask users to verify booking/fare/cancellation policy.',
    safetyRule: 'Refund deduction calculation must be framed as an estimate, not a final legal or provider decision.'
  },
  {
    id: 'payment-secret-safety',
    priority: 'P0',
    lane: 'Payment secret safety',
    reviewRule: 'Tool must warn against OTP, CVV, UPI PIN, card PIN, password, full bank and screen-share requests.',
    safetyRule: 'No workflow should ask users to enter secrets or full payment credentials.'
  },
  {
    id: 'travel-document-privacy',
    priority: 'P1',
    lane: 'Travel document privacy',
    reviewRule: 'Passport/visa/travel document proof must be redacted before sharing unless officially required.',
    safetyRule: 'Avoid storing full passport/visa/private identity details in copy blocks.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Amount fields, date fields, long copy block and proof cards must work on mobile/tablet/desktop.',
    safetyRule: 'Safety note and copy button must remain usable without horizontal overflow.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): TravelRefundReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getTravelRefundReadinessReport() {
  const mode = env('TRAVEL_REFUND_PLANNER_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Travel refund planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as TravelRefundReadinessStatus : 'BLOCKED' as TravelRefundReadinessStatus,
      envValue: `TRAVEL_REFUND_PLANNER_MODE=${mode}`,
      note: 'Keep local_only/dry_run until refund copy, payment safety and mobile QA are reviewed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Refund/cancellation copy reviewed',
      status: boolStatus('TRAVEL_REFUND_COPY_REVIEWED'),
      envValue: `TRAVEL_REFUND_COPY_REVIEWED=${env('TRAVEL_REFUND_COPY_REVIEWED', 'false')}`,
      note: 'Review train, flight, bus, hotel, cab, package and visa/travel service refund copy.'
    },
    {
      id: 'secret-safety-reviewed',
      priority: 'P0',
      label: 'Payment secret safety reviewed',
      status: boolStatus('TRAVEL_REFUND_SECRET_SAFETY_REVIEWED'),
      envValue: `TRAVEL_REFUND_SECRET_SAFETY_REVIEWED=${env('TRAVEL_REFUND_SECRET_SAFETY_REVIEWED', 'false')}`,
      note: 'Review OTP, CVV, card PIN, UPI PIN, password, full bank and screen-share warnings.'
    },
    {
      id: 'provider-policy-reviewed',
      priority: 'P1',
      label: 'Provider policy wording reviewed',
      status: boolStatus('TRAVEL_REFUND_POLICY_REVIEWED'),
      envValue: `TRAVEL_REFUND_POLICY_REVIEWED=${env('TRAVEL_REFUND_POLICY_REVIEWED', 'false')}`,
      note: 'Review no-guarantee language, deduction breakup wording and bank dispute guidance.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('TRAVEL_REFUND_MOBILE_QA_REVIEWED'),
      envValue: `TRAVEL_REFUND_MOBILE_QA_REVIEWED=${env('TRAVEL_REFUND_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test selects, date fields, amount fields, proof checklist and copy block on mobile/tablet/desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.72-travel-refund-cancellation-planner',
    mode,
    owner: env('TRAVEL_REFUND_OWNER', 'Product/Payments safety'),
    controls,
    travelRefundReadinessLanes,
    safetyPolicy: [
      'This workflow is guidance only and does not guarantee refund, compensation, chargeback or cancellation-fee reversal.',
      'Users must verify booking terms, fare rules, cancellation policy and provider/app/bank instructions before action.',
      'Never ask for or store OTP, CVV, UPI PIN, card PIN, password, screen-share access, full bank details or full travel document IDs.',
      'Bank/payment dispute guidance should be used only for valid duplicate payment, failed refund, no service or wrong-debit cases with proof.',
      'Users should keep communication factual, calm and evidence-based.'
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
