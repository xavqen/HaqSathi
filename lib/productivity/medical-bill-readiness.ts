export type MedicalBillReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const medicalBillReadinessLanes = [
  {
    id: 'billing-copy',
    priority: 'P0',
    lane: 'Billing dispute copy',
    reviewRule: 'Tool must ask for itemized billing breakup without promising refund, insurance approval or legal success.',
    safetyRule: 'All billing estimates must be framed as user-entered/disputed estimates, not final liability decisions.'
  },
  {
    id: 'medical-disclaimer',
    priority: 'P0',
    lane: 'Medical disclaimer',
    reviewRule: 'Tool must clearly state it is not medical, legal, insurance or financial advice.',
    safetyRule: 'For urgent health risk, users must be directed to prioritize qualified medical care.'
  },
  {
    id: 'secret-privacy-safety',
    priority: 'P0',
    lane: 'Secret and health privacy safety',
    reviewRule: 'Tool must warn against OTP, CVV, UPI PIN, password, full health ID, full policy number and unnecessary health details.',
    safetyRule: 'No flow should ask for or store payment secrets or excessive medical data.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Provider selects, amount/date inputs, long copy block and proof checklist must work on mobile/tablet/desktop.',
    safetyRule: 'Safety note and copy button must remain usable without horizontal overflow.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): MedicalBillReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getMedicalBillReadinessReport() {
  const mode = env('MEDICAL_BILL_PLANNER_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Medical bill planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as MedicalBillReadinessStatus : 'BLOCKED' as MedicalBillReadinessStatus,
      envValue: `MEDICAL_BILL_PLANNER_MODE=${mode}`,
      note: 'Keep local_only/dry_run until billing copy, medical disclaimer, privacy and mobile QA are reviewed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Billing copy reviewed',
      status: boolStatus('MEDICAL_BILL_COPY_REVIEWED'),
      envValue: `MEDICAL_BILL_COPY_REVIEWED=${env('MEDICAL_BILL_COPY_REVIEWED', 'false')}`,
      note: 'Review hospital, lab, pharmacy, ambulance and insurance billing copy.'
    },
    {
      id: 'medical-disclaimer-reviewed',
      priority: 'P0',
      label: 'Medical/legal disclaimer reviewed',
      status: boolStatus('MEDICAL_BILL_DISCLAIMER_REVIEWED'),
      envValue: `MEDICAL_BILL_DISCLAIMER_REVIEWED=${env('MEDICAL_BILL_DISCLAIMER_REVIEWED', 'false')}`,
      note: 'Confirm no medical, legal, insurance or financial advice is implied.'
    },
    {
      id: 'privacy-reviewed',
      priority: 'P0',
      label: 'Health/payment privacy reviewed',
      status: boolStatus('MEDICAL_BILL_PRIVACY_REVIEWED'),
      envValue: `MEDICAL_BILL_PRIVACY_REVIEWED=${env('MEDICAL_BILL_PRIVACY_REVIEWED', 'false')}`,
      note: 'Review warnings for health IDs, policy numbers, OTP, CVV, UPI PIN, password and full bank details.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('MEDICAL_BILL_MOBILE_QA_REVIEWED'),
      envValue: `MEDICAL_BILL_MOBILE_QA_REVIEWED=${env('MEDICAL_BILL_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test selects, dates, amount fields, proof checklist and copy block on mobile/tablet/desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.73-medical-bill-dispute-planner',
    mode,
    owner: env('MEDICAL_BILL_OWNER', 'Product/Healthcare billing safety'),
    controls,
    medicalBillReadinessLanes,
    safetyPolicy: [
      'This workflow is guidance only and does not provide medical, legal, insurance or financial advice.',
      'Users must verify bills, estimates, package terms, insurer/TPA communication and provider policies before action.',
      'Never ask for or store OTP, CVV, UPI PIN, card PIN, passwords, full health ID, full policy number, full bank details or excessive medical history.',
      'For urgent health risk, users should prioritize care from qualified healthcare professionals.',
      'Users should keep billing communication factual, calm and evidence-based.'
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
