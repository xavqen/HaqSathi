export type UtilityBillReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const utilityBillReadinessLanes = [
  {
    id: 'bill-copy',
    priority: 'P0',
    lane: 'Bill dispute copy',
    reviewRule: 'Complaint wording must ask for verification/correction without making unsupported accusations.',
    safetyRule: 'Never ask for OTP, UPI PIN, CVV, password, full bank/card details or screen-sharing access.'
  },
  {
    id: 'meter-payment-proof',
    priority: 'P0',
    lane: 'Meter/payment proof',
    reviewRule: 'Meter photo, previous bills, payment receipt and reference ID guidance must be clear.',
    safetyRule: 'Tell users to redact consumer ID, address, QR codes and payment details before public sharing.'
  },
  {
    id: 'provider-route',
    priority: 'P1',
    lane: 'Official provider route',
    reviewRule: 'Escalation flow must prefer official app/site/helpline/office receipt before regulator routes.',
    safetyRule: 'Do not encourage unofficial agents, random WhatsApp numbers or public posting of private bills.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Form, long copy message and escalation cards must work smoothly on small screens.',
    safetyRule: 'Copy action and warnings must remain visible before users share bill details.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): UtilityBillReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getUtilityBillDisputeReadinessReport() {
  const mode = env('UTILITY_BILL_DISPUTE_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Utility bill planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as UtilityBillReadinessStatus : 'BLOCKED' as UtilityBillReadinessStatus,
      envValue: `UTILITY_BILL_DISPUTE_MODE=${mode}`,
      note: 'Keep local_only/dry_run until provider copy, official routes, translations and mobile QA are reviewed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Bill dispute copy reviewed',
      status: boolStatus('UTILITY_BILL_COPY_REVIEWED'),
      envValue: `UTILITY_BILL_COPY_REVIEWED=${env('UTILITY_BILL_COPY_REVIEWED', 'false')}`,
      note: 'Review copy for electricity, water, gas, broadband, DTH and mobile postpaid use cases.'
    },
    {
      id: 'secret-warning-reviewed',
      priority: 'P0',
      label: 'Secret/payment safety warning reviewed',
      status: boolStatus('UTILITY_BILL_SECRET_WARNING_REVIEWED'),
      envValue: `UTILITY_BILL_SECRET_WARNING_REVIEWED=${env('UTILITY_BILL_SECRET_WARNING_REVIEWED', 'false')}`,
      note: 'Warnings must block OTP/UPI PIN/CVV/password/screen-sharing scams in bill correction/refund workflows.'
    },
    {
      id: 'official-route-reviewed',
      priority: 'P1',
      label: 'Official provider route copy reviewed',
      status: boolStatus('UTILITY_BILL_OFFICIAL_ROUTE_REVIEWED'),
      envValue: `UTILITY_BILL_OFFICIAL_ROUTE_REVIEWED=${env('UTILITY_BILL_OFFICIAL_ROUTE_REVIEWED', 'false')}`,
      note: 'Provider support, billing department, nodal officer and regulator wording must be guidance-only.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('UTILITY_BILL_MOBILE_QA_REVIEWED'),
      envValue: `UTILITY_BILL_MOBILE_QA_REVIEWED=${env('UTILITY_BILL_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test form, proof list, escalation cards and copy-ready message on Android Chrome and desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.66-utility-bill-dispute-planner',
    mode,
    owner: env('UTILITY_BILL_OWNER', 'Product/Support'),
    controls,
    utilityBillReadinessLanes,
    safetyPolicy: [
      'Use official provider channels first: app, website, bill desk, verified helpline or office receipt.',
      'Never collect or display OTP, UPI PIN, CVV, passwords, full bank/card details or raw screen-sharing instructions.',
      'Tell users to redact consumer ID, address, QR code, full payment reference and phone before public sharing.',
      'Bill due dates and disconnection risk must be verified from official bill/provider policy before delaying payment.'
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
