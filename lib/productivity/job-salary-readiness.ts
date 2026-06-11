export type JobSalaryReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const jobSalaryReadinessLanes = [
  {
    id: 'salary-copy',
    priority: 'P0',
    lane: 'Salary/payment copy safety',
    reviewRule: 'Copy must stay factual, calm and should not promise legal, labour, police or refund outcomes.',
    safetyRule: 'Do not encourage public shaming, threats or sharing private HR/recruiter/employee data.'
  },
  {
    id: 'job-scam-fee',
    priority: 'P0',
    lane: 'Job scam fee safety',
    reviewRule: 'Tool must warn against registration, security, training, kit, verification and interview fee traps.',
    safetyRule: 'Never ask users to pay or verify by sharing OTP, UPI PIN, CVV, screen access or full ID documents.'
  },
  {
    id: 'proof-preservation',
    priority: 'P1',
    lane: 'Proof preservation',
    reviewRule: 'Proof checklist must include offer/appointment proof, work proof, salary/payment proof, invoice and communication trail.',
    safetyRule: 'Warn users to redact salary account, Aadhaar/PAN, home address, phone and private documents before public sharing.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Long copy block, date fields, proof cards and safety warnings must work smoothly on low-width mobile screens.',
    safetyRule: 'Job scam warnings must remain visible and readable on mobile.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): JobSalaryReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getJobSalaryReadinessReport() {
  const mode = env('JOB_SALARY_PLANNER_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Job salary planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as JobSalaryReadinessStatus : 'BLOCKED' as JobSalaryReadinessStatus,
      envValue: `JOB_SALARY_PLANNER_MODE=${mode}`,
      note: 'Keep local_only/dry_run until salary copy, scam warnings, privacy redaction and mobile QA are reviewed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Job/salary copy reviewed',
      status: boolStatus('JOB_SALARY_COPY_REVIEWED'),
      envValue: `JOB_SALARY_COPY_REVIEWED=${env('JOB_SALARY_COPY_REVIEWED', 'false')}`,
      note: 'Review unpaid salary, deductions, fake offer, job fee scam, experience letter and freelance payment copy.'
    },
    {
      id: 'scam-reviewed',
      priority: 'P0',
      label: 'Job scam safety reviewed',
      status: boolStatus('JOB_SALARY_SCAM_SAFETY_REVIEWED'),
      envValue: `JOB_SALARY_SCAM_SAFETY_REVIEWED=${env('JOB_SALARY_SCAM_SAFETY_REVIEWED', 'false')}`,
      note: 'Review warnings against registration/security/training/kit fees, OTP, UPI PIN, CVV, screen access and fake HR domains.'
    },
    {
      id: 'privacy-reviewed',
      priority: 'P0',
      label: 'Sensitive employment data redaction reviewed',
      status: boolStatus('JOB_SALARY_PRIVACY_REVIEWED'),
      envValue: `JOB_SALARY_PRIVACY_REVIEWED=${env('JOB_SALARY_PRIVACY_REVIEWED', 'false')}`,
      note: 'Review redaction for salary account, home address, Aadhaar/PAN, phone, private documents and manager/employee personal data.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('JOB_SALARY_MOBILE_QA_REVIEWED'),
      envValue: `JOB_SALARY_MOBILE_QA_REVIEWED=${env('JOB_SALARY_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test form fields, date inputs, safety cards, proof checklist and copy action on mobile/tablet/desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.70-job-salary-dispute-planner',
    mode,
    owner: env('JOB_SALARY_OWNER', 'Product/Safety'),
    controls,
    jobSalaryReadinessLanes,
    safetyPolicy: [
      'This workflow is guidance only and must not promise salary recovery, job placement, refund, labour, police or legal outcomes.',
      'Users must verify employer/recruiter identity through official company website/domain and avoid paying job fees without official verification.',
      'Never ask for or store OTP, UPI PIN, CVV, passwords, screen access, full ID numbers, full bank details or private documents.',
      'Users should preserve original proof and redact salary account, Aadhaar/PAN, home address, phone and private documents before public sharing.',
      'Fraud, threats, identity misuse, fake job fees or blackmail should be escalated through trusted people and official channels quickly.'
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
