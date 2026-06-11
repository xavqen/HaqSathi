import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (key, fallback = '') => process.env[key] || fallback
const enabled = (key) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(key))
const configured = (key) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`

const outputDir = env('WARRANTY_CLAIM_EVIDENCE_DIR', './artifacts/warranty-claim-readiness')
mkdirSync(outputDir, { recursive: true })

const mode = env('WARRANTY_CLAIM_PLANNER_MODE', 'local_only')
const controls = [
  ['mode-safe', 'P0', 'Planner mode is safe', ['local_only', 'dry_run', 'enabled', 'disabled'].includes(mode) ? 'READY_TO_TEST' : 'BLOCKED', `WARRANTY_CLAIM_PLANNER_MODE=${mode}`],
  ['owner-assigned', 'P1', 'Owner assigned', configured('WARRANTY_CLAIM_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `WARRANTY_CLAIM_OWNER=${env('WARRANTY_CLAIM_OWNER', 'empty')}`],
  ['copy-reviewed', 'P0', 'Warranty claim copy reviewed', enabled('WARRANTY_CLAIM_COPY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `WARRANTY_CLAIM_COPY_REVIEWED=${env('WARRANTY_CLAIM_COPY_REVIEWED', 'false')}`],
  ['privacy-reviewed', 'P0', 'Device/privacy safety reviewed', enabled('WARRANTY_CLAIM_PRIVACY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `WARRANTY_CLAIM_PRIVACY_REVIEWED=${env('WARRANTY_CLAIM_PRIVACY_REVIEWED', 'false')}`],
  ['mobile-qa-reviewed', 'P1', 'Mobile claim flow reviewed', enabled('WARRANTY_CLAIM_MOBILE_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `WARRANTY_CLAIM_MOBILE_QA_REVIEWED=${env('WARRANTY_CLAIM_MOBILE_QA_REVIEWED', 'false')}`],
  ['translation-reviewed', 'P2', 'Priority language reviewed', enabled('WARRANTY_CLAIM_TRANSLATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `WARRANTY_CLAIM_TRANSLATION_REVIEWED=${env('WARRANTY_CLAIM_TRANSLATION_REVIEWED', 'false')}`]
]

const lanes = [
  ['claim-copy', 'P0', 'Warranty claim copy', 'Claim copy is factual and polite.', 'No guaranteed outcome or unsafe private data request.'],
  ['proof-checklist', 'P0', 'Proof checklist', 'Invoice, warranty proof, photos/video and job sheet are covered.', 'Redaction reminder before public sharing.'],
  ['service-center-safety', 'P1', 'Service center safety', 'Handover questions and written job sheet are emphasized.', 'Backup/remove device data where possible.'],
  ['mobile-flow', 'P1', 'Mobile warranty flow', 'Form, plan and copy button fit Android Chrome.', 'No horizontal overflow or hidden warnings.']
]

const readiness = {
  version: '3.0.64-warranty-claim-planner',
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

writeFileSync(join(outputDir, 'warranty-claim-readiness.json'), JSON.stringify(readiness, null, 2))
writeFileSync(join(outputDir, 'warranty-claim-controls.csv'), ['id,priority,label,status,env_value', ...readiness.controls.map((item) => [item.id, item.priority, item.label, item.status, item.envValue].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'warranty-claim-lanes.csv'), ['id,priority,lane,review_rule,safety_rule', ...readiness.lanes.map((item) => [item.id, item.priority, item.lane, item.reviewRule, item.safetyRule].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'service-center-visit-checklist.md'), '# Service center visit checklist\n\n- Carry invoice and warranty proof.\n- Photograph product condition and serial/model label.\n- Ask for written job sheet and expected resolution date.\n- Back up/remove private data before phone/laptop handover.\n- Never share OTP, password, UPI PIN, CVV or screen lock PIN.\n')
writeFileSync(join(outputDir, 'sample-warranty-claim.md'), '# Sample warranty claim\n\nSubject: Warranty claim / service request - Product (Invoice REF)\n\nPlease register this warranty/service request, provide a written job sheet/ticket number, and confirm the expected resolution timeline.\n')

console.log('\nWarranty claim readiness evidence generated')
console.log(`Output: ${outputDir}`)
console.log(`Ready: ${readiness.summary.ready}/${readiness.summary.totalControls}`)
if (readiness.summary.blocked > 0) process.exitCode = 1
