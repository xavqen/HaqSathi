import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (key, fallback = '') => process.env[key] || fallback
const enabled = (key) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(key))
const configured = (key) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`

const outputDir = env('CALL_LOGBOOK_EVIDENCE_DIR', './artifacts/call-logbook-readiness')
mkdirSync(outputDir, { recursive: true })

const mode = env('CALL_LOGBOOK_MODE', 'local_only')
const controls = [
  ['mode-safe', 'P0', 'Logbook mode is safe', ['local_only', 'dry_run', 'enabled', 'disabled'].includes(mode) ? 'READY_TO_TEST' : 'BLOCKED', `CALL_LOGBOOK_MODE=${mode}`],
  ['owner-assigned', 'P1', 'Ops/support owner assigned', configured('CALL_LOGBOOK_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `CALL_LOGBOOK_OWNER=${env('CALL_LOGBOOK_OWNER', 'empty')}`],
  ['privacy-copy-reviewed', 'P0', 'Secret-data warning reviewed', enabled('CALL_LOGBOOK_PRIVACY_COPY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `CALL_LOGBOOK_PRIVACY_COPY_REVIEWED=${env('CALL_LOGBOOK_PRIVACY_COPY_REVIEWED', 'false')}`],
  ['mobile-qa-reviewed', 'P1', 'Mobile UX reviewed', enabled('CALL_LOGBOOK_MOBILE_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `CALL_LOGBOOK_MOBILE_QA_REVIEWED=${env('CALL_LOGBOOK_MOBILE_QA_REVIEWED', 'false')}`],
  ['export-reviewed', 'P1', 'Export/copy safety reviewed', enabled('CALL_LOGBOOK_EXPORT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `CALL_LOGBOOK_EXPORT_REVIEWED=${env('CALL_LOGBOOK_EXPORT_REVIEWED', 'false')}`],
  ['translation-reviewed', 'P2', 'Key-language translation reviewed', enabled('CALL_LOGBOOK_TRANSLATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `CALL_LOGBOOK_TRANSLATION_REVIEWED=${env('CALL_LOGBOOK_TRANSLATION_REVIEWED', 'false')}`],
  ['escalation-copy-reviewed', 'P1', 'Escalation copy reviewed', enabled('CALL_LOGBOOK_ESCALATION_COPY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `CALL_LOGBOOK_ESCALATION_COPY_REVIEWED=${env('CALL_LOGBOOK_ESCALATION_COPY_REVIEWED', 'false')}`]
]

const lanes = [
  ['customer-care-call', 'P0', 'Helpline/customer care calls', 'Date, time, ticket ID, agent name if shared and written follow-up.', 'No OTP, password, UPI PIN, CVV or remote access details.'],
  ['office-counter-visit', 'P0', 'Office/government counter visits', 'Office, counter, token/acknowledgement and promised date.', 'Do not publish staff names/private photos without review.'],
  ['service-center-visit', 'P1', 'Service center visits', 'Job sheet, invoice, item photo, promised delivery and warranty status.', 'Hide serial numbers/IMEI/account IDs before sharing.'],
  ['bank-branch-visit', 'P0', 'Bank branch/payment desk visits', 'Branch name, complaint number, transaction reference and acknowledgement.', 'Banks never need OTP, UPI PIN, CVV or passwords for complaint tracking.']
]

const readiness = {
  version: '3.0.61-call-visit-logbook',
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
  lanes: lanes.map(([id, priority, lane, captureRule, safetyRule]) => ({ id, priority, lane, captureRule, safetyRule }))
}

writeFileSync(join(outputDir, 'call-logbook-readiness.json'), JSON.stringify(readiness, null, 2))
writeFileSync(join(outputDir, 'call-logbook-controls.csv'), ['id,priority,label,status,env_value', ...readiness.controls.map((item) => [item.id, item.priority, item.label, item.status, item.envValue].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'call-logbook-lanes.csv'), ['id,priority,lane,capture_rule,safety_rule', ...readiness.lanes.map((item) => [item.id, item.priority, item.lane, item.captureRule, item.safetyRule].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'privacy-redaction-checklist.md'), '# Call logbook privacy checklist\n\n- Do not store OTP, password, UPI PIN, CVV, full card/bank details, full Aadhaar/PAN or private addresses.\n- Redact phone numbers, email IDs, addresses, account IDs, ticket IDs where sensitive, staff names and private photos before public sharing.\n- Keep logs factual: date, time, channel, reference, promise/refusal and official route.\n')
writeFileSync(join(outputDir, 'mobile-qa-checklist.md'), '# Mobile QA checklist\n\n- Form fits 360px width.\n- Date input, textarea and copy button are usable on Android Chrome and iPhone Safari.\n- Result cards do not overflow horizontally.\n- Safety warning is visible before generated follow-up message.\n')
writeFileSync(join(outputDir, 'sample-follow-up-message.md'), '# Sample follow-up message\n\nHello, I am following up about my pending issue. I contacted via phone call on YYYY-MM-DD. Reference/Complaint ID: _____. The person/contact was support staff. Outcome noted: _____. Please provide a written update and clear resolution timeline.\n')

console.log('\nCall & visit logbook readiness evidence generated')
console.log(`Output: ${outputDir}`)
console.log(`Ready: ${readiness.summary.ready}/${readiness.summary.totalControls}`)
if (readiness.summary.blocked > 0) process.exitCode = 1
