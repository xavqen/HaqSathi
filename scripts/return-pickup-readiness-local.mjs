import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (key, fallback = '') => process.env[key] || fallback
const enabled = (key) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(key))
const configured = (key) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`

const outputDir = env('RETURN_PICKUP_EVIDENCE_DIR', './artifacts/return-pickup-readiness')
mkdirSync(outputDir, { recursive: true })

const mode = env('RETURN_PICKUP_PLANNER_MODE', 'local_only')
const controls = [
  ['mode-safe', 'P0', 'Planner mode is safe', ['local_only', 'dry_run', 'enabled', 'disabled'].includes(mode) ? 'READY_TO_TEST' : 'BLOCKED', `RETURN_PICKUP_PLANNER_MODE=${mode}`],
  ['owner-assigned', 'P1', 'Owner assigned', configured('RETURN_PICKUP_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `RETURN_PICKUP_OWNER=${env('RETURN_PICKUP_OWNER', 'empty')}`],
  ['copy-reviewed', 'P0', 'Return/refund copy reviewed', enabled('RETURN_PICKUP_COPY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `RETURN_PICKUP_COPY_REVIEWED=${env('RETURN_PICKUP_COPY_REVIEWED', 'false')}`],
  ['scam-warning-reviewed', 'P0', 'Refund scam warning reviewed', enabled('RETURN_PICKUP_SCAM_WARNING_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `RETURN_PICKUP_SCAM_WARNING_REVIEWED=${env('RETURN_PICKUP_SCAM_WARNING_REVIEWED', 'false')}`],
  ['mobile-qa-reviewed', 'P1', 'Mobile return flow reviewed', enabled('RETURN_PICKUP_MOBILE_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `RETURN_PICKUP_MOBILE_QA_REVIEWED=${env('RETURN_PICKUP_MOBILE_QA_REVIEWED', 'false')}`],
  ['translation-reviewed', 'P2', 'Priority language reviewed', enabled('RETURN_PICKUP_TRANSLATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `RETURN_PICKUP_TRANSLATION_REVIEWED=${env('RETURN_PICKUP_TRANSLATION_REVIEWED', 'false')}`]
]

const lanes = [
  ['return-window', 'P0', 'Return window calculation', 'Deadline estimate is planning help, not a guaranteed policy.', 'Verify exact return window in official marketplace app.'],
  ['pickup-proof', 'P0', 'Pickup proof checklist', 'Order proof, product photos, packaging, pickup receipt and timeline are covered.', 'Do not hand over product without official pickup proof.'],
  ['refund-scam-safety', 'P0', 'Refund scam safety', 'OTP, UPI PIN, CVV, password and screen-sharing warnings are visible.', 'Never ask for secret payment credentials.'],
  ['mobile-shopping-flow', 'P1', 'Mobile return flow', 'Form and generated text fit Android Chrome.', 'No horizontal overflow or clipped warnings.']
]

const readiness = {
  version: '3.0.65-return-pickup-planner',
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

writeFileSync(join(outputDir, 'return-pickup-readiness.json'), JSON.stringify(readiness, null, 2))
writeFileSync(join(outputDir, 'return-pickup-controls.csv'), ['id,priority,label,status,env_value', ...readiness.controls.map((item) => [item.id, item.priority, item.label, item.status, item.envValue].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'return-pickup-lanes.csv'), ['id,priority,lane,review_rule,safety_rule', ...readiness.lanes.map((item) => [item.id, item.priority, item.lane, item.reviewRule, item.safetyRule].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'pickup-proof-checklist.md'), '# Return pickup proof checklist\n\n- Save order/invoice screenshot.\n- Take product, packaging and label photos before pickup.\n- Save pickup receipt/tracking ID inside official app.\n- Save support chat/call log and refund timeline proof.\n- Never share OTP, UPI PIN, card CVV, password or screen-sharing access.\n')
writeFileSync(join(outputDir, 'sample-return-message.md'), '# Sample return/refund message\n\nSubject: Return / pickup / refund help needed - Product (Order ID)\n\nPlease register this issue, confirm the pickup/refund timeline in writing, and share the official ticket/reference number.\n')

console.log('\nReturn pickup readiness evidence generated')
console.log(`Output: ${outputDir}`)
console.log(`Ready: ${readiness.summary.ready}/${readiness.summary.totalControls}`)
if (readiness.summary.blocked > 0) process.exitCode = 1
