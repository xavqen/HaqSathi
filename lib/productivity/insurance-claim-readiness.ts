export type InsuranceClaimReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const insuranceClaimReadinessLanes = [
  {
    id: 'claim-copy-safety',
    priority: 'P0',
    lane: 'Claim copy safety',
    reviewRule: 'Copy must stay factual and avoid guaranteed approval, payout or legal certainty claims.',
    safetyRule: 'Route high-value, health, life or rejected claims to official insurer/grievance/expert review.'
  },
  {
    id: 'secret-redaction',
    priority: 'P0',
    lane: 'Secret and document redaction',
    reviewRule: 'Tool must warn against OTP, UPI PIN, CVV, passwords, remote screen access, full ID/medical/policy data in public posts.',
    safetyRule: 'Users should share full documents only with verified official insurer/TPA channels.'
  },
  {
    id: 'proof-checklist',
    priority: 'P1',
    lane: 'Policy/claim proof checklist',
    reviewRule: 'Proof checklist must cover policy copy, claim ID, bills, incident proof and written insurer communication.',
    safetyRule: 'Avoid fake claims and keep original evidence unchanged.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Claim form, date inputs, long copy blocks and proof checklist must work on small screens.',
    safetyRule: 'Fraud warning must remain visible before copy/share actions.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): InsuranceClaimReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getInsuranceClaimReadinessReport() {
  const mode = env('INSURANCE_CLAIM_PLANNER_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Insurance claim planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as InsuranceClaimReadinessStatus : 'BLOCKED' as InsuranceClaimReadinessStatus,
      envValue: `INSURANCE_CLAIM_PLANNER_MODE=${mode}`,
      note: 'Keep local_only/dry_run until claim copy, fraud warnings, privacy redaction and mobile QA are reviewed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Claim copy reviewed',
      status: boolStatus('INSURANCE_CLAIM_COPY_REVIEWED'),
      envValue: `INSURANCE_CLAIM_COPY_REVIEWED=${env('INSURANCE_CLAIM_COPY_REVIEWED', 'false')}`,
      note: 'Review wording for vehicle, health, travel, phone/device, appliance, life, crop and other claim types.'
    },
    {
      id: 'secret-warning-reviewed',
      priority: 'P0',
      label: 'Fraud/secret warning reviewed',
      status: boolStatus('INSURANCE_CLAIM_SECRET_WARNING_REVIEWED'),
      envValue: `INSURANCE_CLAIM_SECRET_WARNING_REVIEWED=${env('INSURANCE_CLAIM_SECRET_WARNING_REVIEWED', 'false')}`,
      note: 'Confirm warnings against OTP, UPI PIN, CVV, passwords, remote screen access and fake claim settlement calls.'
    },
    {
      id: 'privacy-reviewed',
      priority: 'P0',
      label: 'Sensitive document privacy reviewed',
      status: boolStatus('INSURANCE_CLAIM_PRIVACY_REVIEWED'),
      envValue: `INSURANCE_CLAIM_PRIVACY_REVIEWED=${env('INSURANCE_CLAIM_PRIVACY_REVIEWED', 'false')}`,
      note: 'Review public-sharing redaction for policy number, ID proof, address, bank details and medical records.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('INSURANCE_CLAIM_MOBILE_QA_REVIEWED'),
      envValue: `INSURANCE_CLAIM_MOBILE_QA_REVIEWED=${env('INSURANCE_CLAIM_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test form fields, proof checklist, long copy message and escalation cards on mobile/tablet/desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.68-insurance-claim-planner',
    mode,
    owner: env('INSURANCE_CLAIM_OWNER', 'Product/Support'),
    controls,
    insuranceClaimReadinessLanes,
    safetyPolicy: [
      'This workflow is claim-organization guidance only and must not promise payout, approval, legal outcome or medical advice.',
      'Users should use verified official insurer/TPA/app/website/email/branch channels only.',
      'Never ask for or store OTP, UPI PIN, CVV, net-banking password, remote screen access or card details.',
      'Sensitive health, life, ID, address, policy and bank details must be redacted before public sharing.',
      'High-value, life, health, rejected or legal notice cases should route to official grievance/expert review.'
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
