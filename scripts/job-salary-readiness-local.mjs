import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.JOB_SALARY_EVIDENCE_DIR || './artifacts/job-salary-readiness'
mkdirSync(outDir, { recursive: true })

const controls = [
  ['mode', 'P0', 'JOB_SALARY_PLANNER_MODE', process.env.JOB_SALARY_PLANNER_MODE || 'local_only', 'Planner mode must be selected before launch.'],
  ['copy-reviewed', 'P0', 'JOB_SALARY_COPY_REVIEWED', process.env.JOB_SALARY_COPY_REVIEWED || 'false', 'Review unpaid salary, deductions, fake offer, job fee scam, experience letter and freelance payment copy.'],
  ['scam-reviewed', 'P0', 'JOB_SALARY_SCAM_SAFETY_REVIEWED', process.env.JOB_SALARY_SCAM_SAFETY_REVIEWED || 'false', 'Review warnings against registration/security/training/kit fees and fake HR domains.'],
  ['privacy-reviewed', 'P0', 'JOB_SALARY_PRIVACY_REVIEWED', process.env.JOB_SALARY_PRIVACY_REVIEWED || 'false', 'Review redaction for salary account, Aadhaar/PAN, home address, phone and private documents.'],
  ['mobile-qa', 'P1', 'JOB_SALARY_MOBILE_QA_REVIEWED', process.env.JOB_SALARY_MOBILE_QA_REVIEWED || 'false', 'Mobile and desktop QA proof captured.']
]

const lanes = [
  ['salary-copy', 'P0', 'Salary/payment copy safety', 'No promise of legal/labour/police/refund outcome; keep copy factual and calm.'],
  ['job-scam-fee', 'P0', 'Job scam fee safety', 'Warn against registration, security, training, kit, verification and interview fee traps.'],
  ['proof-preservation', 'P1', 'Proof preservation', 'Offer/appointment proof, work proof, salary/payment proof, invoice and communication trail must be clear.'],
  ['mobile-qa', 'P1', 'Mobile UX', 'Warning note, form, proof checklist and copy block must work on small screens.']
]

const report = {
  version: '3.0.70-job-salary-dispute-planner',
  generatedAt: new Date().toISOString(),
  mode: process.env.JOB_SALARY_PLANNER_MODE || 'local_only',
  owner: process.env.JOB_SALARY_OWNER || 'Product/Safety',
  controls: controls.map(([id, priority, envName, envValue, note]) => ({ id, priority, envName, envValue, note, status: envValue === 'true' || id === 'mode' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED' })),
  lanes: lanes.map(([id, priority, lane, rule]) => ({ id, priority, lane, rule }))
}

function csv(rows) {
  return rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
}

writeFileSync(join(outDir, 'job-salary-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outDir, 'job-salary-controls.csv'), csv([['id', 'priority', 'env', 'value', 'note'], ...controls]))
writeFileSync(join(outDir, 'job-salary-lanes.csv'), csv([['id', 'priority', 'lane', 'rule'], ...lanes]))
writeFileSync(join(outDir, 'job-salary-proof-checklist.md'), [
  '# Job salary dispute proof checklist',
  '',
  '- Offer letter, appointment letter, contract, joining proof or project scope.',
  '- Salary slip, invoice, payment promise, due date proof and pending amount calculation.',
  '- Attendance, task delivery, work screenshots, approvals, Git/support-ticket proof or timesheets.',
  '- HR/recruiter/client email, WhatsApp, portal ticket and call log trail.',
  '- Job scam proof: ad, recruiter profile, payment demand, payment receipt, website/domain and phone/email details.',
  '- Redacted copy hiding Aadhaar/PAN, full bank details, salary account, home address, phone and private documents.'
].join('\n'))
writeFileSync(join(outDir, 'sample-job-salary-message.md'), [
  'Subject: Request for written salary/payment resolution',
  '',
  'Dear Employer / HR / Client Team,',
  '',
  'Please share a written payment/status update, pending amount breakup, reason for delay/deduction if any, and expected resolution date.',
  '',
  'Regards,'
].join('\n'))

console.log('\nJob salary dispute readiness evidence')
console.log(`Output: ${outDir}`)
console.log('Files: job-salary-readiness.json, job-salary-controls.csv, job-salary-lanes.csv, job-salary-proof-checklist.md, sample-job-salary-message.md')
console.log('✅ Job salary dispute readiness evidence generated.\n')
