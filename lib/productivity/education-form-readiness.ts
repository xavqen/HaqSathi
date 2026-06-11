export type EducationFormReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export const educationFormReadinessLanes = [
  {
    id: 'official-route',
    priority: 'P0',
    lane: 'Official correction route',
    reviewRule: 'Tool must direct users to official portal, official email, institution office or verified helpdesk first.',
    safetyRule: 'No agent guarantees, unofficial payment requests or secret-sharing flows should be promoted.'
  },
  {
    id: 'student-data-privacy',
    priority: 'P0',
    lane: 'Student data privacy',
    reviewRule: 'Copy and proof checklist must warn against OTP, passwords, full Aadhaar/PAN, full bank details and login access.',
    safetyRule: 'Sensitive minor/student data must be redacted before screenshots or attachments are shared.'
  },
  {
    id: 'deadline-safety',
    priority: 'P1',
    lane: 'Deadline and appeal safety',
    reviewRule: 'Urgency logic must not guarantee correction after the deadline and must suggest polite written exception/appeal route.',
    safetyRule: 'Avoid duplicate form submission advice unless official instructions allow it.'
  },
  {
    id: 'mobile-qa',
    priority: 'P1',
    lane: 'Mobile UX',
    reviewRule: 'Date fields, long copy block, proof cards and select fields must work on low-width mobile screens.',
    safetyRule: 'Safety warning should stay visible before copy/send actions.'
  }
]

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function boolStatus(name: string): EducationFormReadinessStatus {
  return process.env[name] === 'true' ? 'PASS' : 'MANUAL_REQUIRED'
}

export function getEducationFormReadinessReport() {
  const mode = env('EDUCATION_FORM_PLANNER_MODE', 'local_only')
  const controls = [
    {
      id: 'mode',
      priority: 'P0',
      label: 'Education form planner mode selected',
      status: ['local_only', 'dry_run', 'manual_review', 'enabled'].includes(mode) ? 'READY_TO_TEST' as EducationFormReadinessStatus : 'BLOCKED' as EducationFormReadinessStatus,
      envValue: `EDUCATION_FORM_PLANNER_MODE=${mode}`,
      note: 'Keep local_only/dry_run until copy, deadline rules, privacy warnings and mobile QA are reviewed.'
    },
    {
      id: 'copy-reviewed',
      priority: 'P0',
      label: 'Correction request copy reviewed',
      status: boolStatus('EDUCATION_FORM_COPY_REVIEWED'),
      envValue: `EDUCATION_FORM_COPY_REVIEWED=${env('EDUCATION_FORM_COPY_REVIEWED', 'false')}`,
      note: 'Review exam, scholarship, admission, certificate, university and government education form correction copy.'
    },
    {
      id: 'official-route-reviewed',
      priority: 'P0',
      label: 'Official route safety reviewed',
      status: boolStatus('EDUCATION_FORM_OFFICIAL_ROUTE_REVIEWED'),
      envValue: `EDUCATION_FORM_OFFICIAL_ROUTE_REVIEWED=${env('EDUCATION_FORM_OFFICIAL_ROUTE_REVIEWED', 'false')}`,
      note: 'Review official-portal-first guidance, correction window wording, appeal wording and no-agent-guarantee warnings.'
    },
    {
      id: 'privacy-reviewed',
      priority: 'P0',
      label: 'Student data privacy reviewed',
      status: boolStatus('EDUCATION_FORM_PRIVACY_REVIEWED'),
      envValue: `EDUCATION_FORM_PRIVACY_REVIEWED=${env('EDUCATION_FORM_PRIVACY_REVIEWED', 'false')}`,
      note: 'Review redaction guidance for Aadhaar/PAN, bank, contact, login, marksheets, category/caste and minor/student data.'
    },
    {
      id: 'mobile-qa',
      priority: 'P1',
      label: 'Mobile QA completed',
      status: boolStatus('EDUCATION_FORM_MOBILE_QA_REVIEWED'),
      envValue: `EDUCATION_FORM_MOBILE_QA_REVIEWED=${env('EDUCATION_FORM_MOBILE_QA_REVIEWED', 'false')}`,
      note: 'Test select fields, date input, proof checklist, long copy block and copy button on mobile/tablet/desktop.'
    }
  ]

  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length

  return {
    version: '3.0.71-education-form-correction-planner',
    mode,
    owner: env('EDUCATION_FORM_OWNER', 'Product/Student safety'),
    controls,
    educationFormReadinessLanes,
    safetyPolicy: [
      'This workflow is guidance only and does not guarantee correction, admission, scholarship, admit card, certificate approval or deadline extension.',
      'Users must verify instructions on the official portal, official notice, school/college office, exam authority or verified helpdesk before action.',
      'Never ask for or store OTP, passwords, UPI PIN, CVV, screen access, full Aadhaar/PAN, full bank details or portal login details.',
      'Users should use truthful documents only and avoid false category, DOB, marks, bank or identity claims.',
      'If deadline is over, request written exception/appeal route politely and preserve all acknowledgements.'
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
