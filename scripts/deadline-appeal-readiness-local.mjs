import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (key, fallback = '') => process.env[key] || fallback
const enabled = (key) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(key))
const configured = (key) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`

const outputDir = env('DEADLINE_APPEAL_EVIDENCE_DIR', './artifacts/deadline-appeal-readiness')
mkdirSync(outputDir, { recursive: true })

const mode = env('DEADLINE_APPEAL_PLANNER_MODE', 'local_only')
const controls = [
  ['mode-safe', 'P0', 'Planner mode is safe', ['local_only', 'dry_run', 'enabled', 'disabled'].includes(mode) ? 'READY_TO_TEST' : 'BLOCKED', `DEADLINE_APPEAL_PLANNER_MODE=${mode}`],
  ['owner-assigned', 'P1', 'Owner assigned', configured('DEADLINE_APPEAL_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `DEADLINE_APPEAL_OWNER=${env('DEADLINE_APPEAL_OWNER', 'empty')}`],
  ['deadline-copy-reviewed', 'P0', 'Deadline estimate copy reviewed', enabled('DEADLINE_APPEAL_COPY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DEADLINE_APPEAL_COPY_REVIEWED=${env('DEADLINE_APPEAL_COPY_REVIEWED', 'false')}`],
  ['legal-disclaimer-reviewed', 'P0', 'Legal/guidance disclaimer reviewed', enabled('DEADLINE_APPEAL_LEGAL_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DEADLINE_APPEAL_LEGAL_REVIEWED=${env('DEADLINE_APPEAL_LEGAL_REVIEWED', 'false')}`],
  ['mobile-qa-reviewed', 'P1', 'Mobile flow reviewed', enabled('DEADLINE_APPEAL_MOBILE_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DEADLINE_APPEAL_MOBILE_QA_REVIEWED=${env('DEADLINE_APPEAL_MOBILE_QA_REVIEWED', 'false')}`],
  ['translation-reviewed', 'P2', 'Priority language reviewed', enabled('DEADLINE_APPEAL_TRANSLATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DEADLINE_APPEAL_TRANSLATION_REVIEWED=${env('DEADLINE_APPEAL_TRANSLATION_REVIEWED', 'false')}`]
]

const lanes = [
  ['deadline-calculation', 'P0', 'Deadline calculation', 'Date estimates are labelled clearly.', 'Exact deadline must be verified from official portal/notice/order.'],
  ['appeal-copy', 'P0', 'Appeal copy generation', 'Appeal note stays factual, polite and proof-based.', 'No OTP, password, UPI PIN, CVV or full private ID/bank data.'],
  ['proof-readiness', 'P1', 'Proof checklist', 'Required proof list covers acknowledgement, reply, payment and follow-ups.', 'Redaction reminder is visible before sharing.'],
  ['mobile-usability', 'P1', 'Mobile deadline flow', 'Date fields, timeline and copy button are mobile-safe.', 'No horizontal overflow or hidden action controls.']
]

const readiness = {
  version: '3.0.63-deadline-appeal-planner',
  generatedAt: new Date().toISOString(),
  mode,
  summary: {
    totalControls: controls.length,
    ready: controls.filter((item) => item[3] === 'PASS' || item[3] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((item) => item[3] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((item) => item[3] === 'BLOCKED').length,
    lanes: lanes.length
  },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  lanes: lanes.map(([id, priority, lane, reviewRule, safetyRule]) => ({ id, priority, lane, reviewRule, safetyRule }))
}

writeFileSync(join(outputDir, 'deadline-appeal-readiness.json'), JSON.stringify(readiness, null, 2))
writeFileSync(join(outputDir, 'deadline-appeal-controls.csv'), ['id,priority,label,status,env_value', ...readiness.controls.map((item) => [item.id, item.priority, item.label, item.status, item.envValue].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'deadline-appeal-lanes.csv'), ['id,priority,lane,review_rule,safety_rule', ...readiness.lanes.map((item) => [item.id, item.priority, item.lane, item.reviewRule, item.safetyRule].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'deadline-appeal-mobile-qa.md'), '# Deadline appeal mobile QA\n\n- Test date inputs on Android Chrome.\n- Verify no horizontal overflow.\n- Verify copy appeal button works.\n- Verify warning text is visible before generated plan.\n')
writeFileSync(join(outputDir, 'deadline-copy-review-checklist.md'), '# Deadline copy review checklist\n\n- Dates are estimates unless official date is entered.\n- Exact deadline verification is clearly required.\n- Appeal copy is polite and factual.\n- Tool does not claim to provide legal advice.\n- Sensitive data warning is visible.\n')
writeFileSync(join(outputDir, 'sample-appeal-note.md'), '# Sample appeal note\n\nSubject: Request for status/review/appeal - Case title (REF-123)\n\nDear Support/Authority Team,\n\nPlease check the attached proof and provide resolution, corrected status, or the proper appeal/escalation route in writing.\n\nRegards,\n')

console.log('\nDeadline appeal readiness evidence generated')
console.log(`Output: ${outputDir}`)
console.log(`Ready: ${readiness.summary.ready}/${readiness.summary.totalControls}`)
if (readiness.summary.blocked > 0) process.exitCode = 1
