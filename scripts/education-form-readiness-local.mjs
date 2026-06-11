import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.EDUCATION_FORM_EVIDENCE_DIR || 'artifacts/education-form-readiness'
mkdirSync(outDir, { recursive: true })

const controls = [
  ['mode', process.env.EDUCATION_FORM_PLANNER_MODE || 'local_only', 'Keep local_only/dry_run until reviewed'],
  ['copy_reviewed', process.env.EDUCATION_FORM_COPY_REVIEWED || 'false', 'Correction request copy reviewed'],
  ['official_route_reviewed', process.env.EDUCATION_FORM_OFFICIAL_ROUTE_REVIEWED || 'false', 'Official route safety reviewed'],
  ['privacy_reviewed', process.env.EDUCATION_FORM_PRIVACY_REVIEWED || 'false', 'Student data privacy reviewed'],
  ['mobile_qa_reviewed', process.env.EDUCATION_FORM_MOBILE_QA_REVIEWED || 'false', 'Mobile/tablet/desktop QA reviewed']
]

const lanes = [
  ['official-route', 'P0', 'Official correction route', 'Official portal/email/institution first; no agent guarantees'],
  ['student-data-privacy', 'P0', 'Student data privacy', 'Redact OTP, passwords, Aadhaar/PAN, bank and login details'],
  ['deadline-safety', 'P1', 'Deadline and appeal safety', 'No correction guarantee; preserve appeal route'],
  ['mobile-qa', 'P1', 'Mobile UX', 'Long copy, selects, date inputs and proof cards work on mobile']
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.71-education-form-correction-planner',
  owner: process.env.EDUCATION_FORM_OWNER || 'Product/Student safety',
  controls: controls.map(([id, value, note]) => ({ id, value, note })),
  lanes: lanes.map(([id, priority, lane, safety]) => ({ id, priority, lane, safety })),
  sample: {
    route: '/tools/education-form-correction-planner',
    admin: '/admin/education-form-readiness',
    api: '/api/admin/education-form-readiness'
  }
}

writeFileSync(join(outDir, 'education-form-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outDir, 'education-form-controls.csv'), 'id,value,note\n' + controls.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'education-form-lanes.csv'), 'id,priority,lane,safety\n' + lanes.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'education-form-proof-checklist.md'), `# Education form correction proof checklist\n\n- Submitted form / acknowledgement / application number screenshot\n- Fee payment receipt / transaction ID if payment is involved\n- Official correction notice / deadline screenshot\n- Wrong field screenshot and correct document proof\n- Helpdesk email/ticket/call log proof\n- Redacted sharing copy with OTP/password/full ID/bank details hidden\n`)
writeFileSync(join(outDir, 'sample-education-form-message.md'), `Subject: Correction request for education form\n\nDear Official Support Team,\n\nI request correction in my submitted form. Application ID: _____. Mistake: _____. Correct value: _____. I can provide supporting proof and request the official correction process and timeline in writing.\n\nRegards,\n`)

console.log('Education form correction readiness evidence generated')
console.log(`Output: ${outDir}`)
