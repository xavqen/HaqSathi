export type LoanAppReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const loanAppReadinessLanes = [
  {
    id: 'threat-safety',
    priority: 'P0',
    lane: 'Threat and harassment safety',
    reviewRule: 'Copy must not escalate risk, shame users or promise legal outcomes. Immediate threat guidance must route to trusted people and official emergency/local authority channels.',
    safetyRule: 'Do not advise users to confront abusive recovery agents alone or share sensitive data publicly.'
  },
  {
    id: 'secret-redaction',
    priority: 'P0',
    lane: 'Secret redaction',
    reviewRule: 'Tool must warn against OTP, UPI PIN, CVV, password, remote screen access, Aadhaar/PAN and family contact sharing.',
    safetyRule: 'Private screenshots must be redacted before sharing outside official complaint channels.'
  },
  {
    id: 'proof-preservation',
    priority: 'P1',
    lane: 'Proof preservation',
    reviewRule: 'Proof checklist must include call logs, messages, payment proof, app details, permission screenshots and timeline.',
    safetyRule: 'Warn users not to edit or fabricate screenshots, receipts or call logs.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Long safety warnings, copied message, textarea inputs and proof cards must work on low-width mobile screens.',
    safetyRule: 'Emergency safety note must remain visible and readable on mobile.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): LoanAppReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getLoanAppReadinessReport() {
  const mode = env('LOAN_APP_PLANNER_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Loan app harassment planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as LoanAppReadinessStatus : 'BLOCKED' as LoanAppReadinessStatus,
      envValue: `LOAN_APP_PLANNER_MODE=${mode}`,
      note: 'Keep local_only/dry_run until threat copy, emergency guidance, privacy redaction and mobile QA are reviewed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Harassment response copy reviewed',
      status: boolStatus('LOAN_APP_COPY_REVIEWED'),
      envValue: `LOAN_APP_COPY_REVIEWED=${env('LOAN_APP_COPY_REVIEWED', 'false')}`,
      note: 'Review wording for harassment calls, contact-list threats, fake legal threats, overcharging, privacy misuse and paid-but-demanding scenarios.'
    },
    {
      id: 'safety-reviewed',
      priority: 'P0',
      label: 'Emergency/safety guidance reviewed',
      status: boolStatus('LOAN_APP_SAFETY_REVIEWED'),
      envValue: `LOAN_APP_SAFETY_REVIEWED=${env('LOAN_APP_SAFETY_REVIEWED', 'false')}`,
      note: 'Confirm threat, blackmail, privacy abuse and self-harm pressure language routes users to trusted people and official help channels.'
    },
    {
      id: 'privacy-reviewed',
      priority: 'P0',
      label: 'Sensitive privacy redaction reviewed',
      status: boolStatus('LOAN_APP_PRIVACY_REVIEWED'),
      envValue: `LOAN_APP_PRIVACY_REVIEWED=${env('LOAN_APP_PRIVACY_REVIEWED', 'false')}`,
      note: 'Review redaction for phone, address, Aadhaar/PAN, family contacts, photos, bank data, UPI IDs and payment receipts.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('LOAN_APP_MOBILE_QA_REVIEWED'),
      envValue: `LOAN_APP_MOBILE_QA_REVIEWED=${env('LOAN_APP_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test form fields, safety cards, proof checklist and copy action on mobile/tablet/desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.69-loan-app-harassment-planner',
    mode,
    owner: env('LOAN_APP_OWNER', 'Product/Safety'),
    controls,
    loanAppReadinessLanes,
    safetyPolicy: [
      'This workflow is guidance only and must not promise legal, financial or police outcomes.',
      'For physical threats, blackmail, privacy abuse, extortion or self-harm pressure, users should contact trusted people and official emergency/local authority/cybercrime channels quickly.',
      'Never ask for or store OTP, UPI PIN, CVV, passwords, remote screen access, full ID numbers, family contacts or private photos.',
      'Users should preserve original evidence and redact sensitive data before public sharing.',
      'Official complaint routes should be used for threats, privacy misuse, abusive recovery and fake legal/police threats.'
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
