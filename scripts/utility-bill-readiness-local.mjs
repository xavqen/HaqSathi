import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (name, fallback = '') => process.env[name] || fallback
const outputDir = env('UTILITY_BILL_EVIDENCE_DIR', './artifacts/utility-bill-readiness')
mkdirSync(outputDir, { recursive: true })

const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
const controls = [
  ['mode', 'P0', 'Utility bill planner mode selected', env('UTILITY_BILL_DISPUTE_MODE', 'local_only')],
  ['copy-reviewed', 'P0', 'Bill dispute copy reviewed', env('UTILITY_BILL_COPY_REVIEWED', 'false')],
  ['secret-warning-reviewed', 'P0', 'Secret/payment safety warning reviewed', env('UTILITY_BILL_SECRET_WARNING_REVIEWED', 'false')],
  ['official-route-reviewed', 'P1', 'Official provider route copy reviewed', env('UTILITY_BILL_OFFICIAL_ROUTE_REVIEWED', 'false')],
  ['mobile-qa', 'P1', 'Mobile QA completed', env('UTILITY_BILL_MOBILE_QA_REVIEWED', 'false')]
]

const lanes = [
  ['bill-copy', 'P0', 'Bill dispute copy', 'Factual bill correction copy reviewed', 'No OTP/PIN/CVV/password/screen-sharing request'],
  ['meter-payment-proof', 'P0', 'Meter/payment proof', 'Meter, previous bill and payment proof guidance reviewed', 'Redact consumer ID/address/payment details'],
  ['provider-route', 'P1', 'Official provider route', 'Provider route and regulator escalation wording reviewed', 'No unofficial agents/random WhatsApp numbers'],
  ['mobile-qa', 'P1', 'Mobile UX', 'Form and copy message reviewed on mobile', 'Warnings visible before copy/share']
]

const readiness = {
  version: '3.0.66-utility-bill-dispute-planner',
  generatedAt: new Date().toISOString(),
  owner: env('UTILITY_BILL_OWNER', 'Product/Support'),
  mode: env('UTILITY_BILL_DISPUTE_MODE', 'local_only'),
  controls: controls.map(([id, priority, label, value]) => ({ id, priority, label, envValue: value, status: value === 'true' || id === 'mode' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED' })),
  lanes: lanes.map(([id, priority, lane, reviewRule, safetyRule]) => ({ id, priority, lane, reviewRule, safetyRule })),
  evidenceRequired: [
    '/tools/utility-bill-dispute-planner mobile screenshot',
    '/tools/utility-bill-dispute-planner desktop screenshot',
    'sample generated bill dispute message',
    '/admin/utility-bill-readiness screenshot',
    'provider route/copy reviewer signoff'
  ]
}

writeFileSync(join(outputDir, 'utility-bill-readiness.json'), JSON.stringify(readiness, null, 2))
writeFileSync(join(outputDir, 'utility-bill-controls.csv'), ['id,priority,label,status,env_value', ...readiness.controls.map((item) => [item.id, item.priority, item.label, item.status, item.envValue].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'utility-bill-lanes.csv'), ['id,priority,lane,review_rule,safety_rule', ...readiness.lanes.map((item) => [item.id, item.priority, item.lane, item.reviewRule, item.safetyRule].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'bill-proof-checklist.md'), `# Utility bill proof checklist\n\n- Current bill PDF/screenshot with provider, consumer ID, billing period, amount and due date.\n- Previous 2-3 bills or usage history.\n- Meter photo/video with date/time proof if reading is disputed.\n- Payment receipt/UTR/reference ID if payment is not updated.\n- Complaint/ticket ID and support reply screenshots.\n- Redacted public copy with address, phone, consumer ID and payment details hidden.\n`)
writeFileSync(join(outputDir, 'sample-bill-dispute-message.md'), `# Sample utility bill dispute message\n\nDear Provider,\n\nI am raising a billing dispute for my utility bill. Please verify the bill amount, meter/payment details and share the official ticket number with a written correction timeline.\n\nI will share bill and payment proof through the official provider channel only.\n`)

console.log(`Utility bill readiness evidence written to ${outputDir}`)
