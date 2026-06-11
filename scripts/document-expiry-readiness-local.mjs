import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (key, fallback = '') => process.env[key] || fallback
const enabled = (key) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(key))
const configured = (key) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`

const outputDir = env('DOCUMENT_EXPIRY_EVIDENCE_DIR', './artifacts/document-expiry-readiness')
mkdirSync(outputDir, { recursive: true })

const mode = env('DOCUMENT_EXPIRY_PLANNER_MODE', 'local_only')
const controls = [
  ['mode-safe', 'P0', 'Planner mode is safe', ['local_only', 'dry_run', 'enabled', 'disabled'].includes(mode) ? 'READY_TO_TEST' : 'BLOCKED', `DOCUMENT_EXPIRY_PLANNER_MODE=${mode}`],
  ['owner-assigned', 'P1', 'Document renewal owner assigned', configured('DOCUMENT_EXPIRY_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `DOCUMENT_EXPIRY_OWNER=${env('DOCUMENT_EXPIRY_OWNER', 'empty')}`],
  ['official-routes-reviewed', 'P0', 'Official renewal routes reviewed', enabled('DOCUMENT_EXPIRY_OFFICIAL_LINKS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DOCUMENT_EXPIRY_OFFICIAL_LINKS_REVIEWED=${env('DOCUMENT_EXPIRY_OFFICIAL_LINKS_REVIEWED', 'false')}`],
  ['privacy-copy-reviewed', 'P0', 'Sensitive-data warning reviewed', enabled('DOCUMENT_EXPIRY_PRIVACY_COPY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DOCUMENT_EXPIRY_PRIVACY_COPY_REVIEWED=${env('DOCUMENT_EXPIRY_PRIVACY_COPY_REVIEWED', 'false')}`],
  ['translation-reviewed', 'P1', 'Key-language translation reviewed', enabled('DOCUMENT_EXPIRY_TRANSLATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DOCUMENT_EXPIRY_TRANSLATION_REVIEWED=${env('DOCUMENT_EXPIRY_TRANSLATION_REVIEWED', 'false')}`],
  ['reminder-delivery-reviewed', 'P1', 'Reminder delivery reviewed', enabled('DOCUMENT_EXPIRY_REMINDER_DELIVERY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DOCUMENT_EXPIRY_REMINDER_DELIVERY_REVIEWED=${env('DOCUMENT_EXPIRY_REMINDER_DELIVERY_REVIEWED', 'false')}`],
  ['mobile-qa-reviewed', 'P1', 'Mobile UX reviewed', enabled('DOCUMENT_EXPIRY_MOBILE_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DOCUMENT_EXPIRY_MOBILE_QA_REVIEWED=${env('DOCUMENT_EXPIRY_MOBILE_QA_REVIEWED', 'false')}`]
]

const lanes = [
  ['identity-renewal', 'P0', 'Passport, driving license and identity document renewal', 'Start 180-270 days before expiry where applicable.', 'Official passport/Parivahan/state department route only.'],
  ['vehicle-renewal', 'P1', 'Vehicle insurance and PUC reminders', 'Start 15-30 days before expiry.', 'Insurer, authorized PUC center or official transport system.'],
  ['student-certificates', 'P0', 'Income, caste, domicile and scholarship documents', 'Start 45-90 days before form deadlines.', 'State e-district, scholarship portal or official scheme page.'],
  ['bank-kyc-review', 'P0', 'Bank KYC review reminders', 'Act only after official bank notice or branch/app prompt.', 'Bank branch, official bank app or bank website.']
]

const readiness = {
  version: '3.0.60-document-expiry-planner',
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
  lanes: lanes.map(([id, priority, document, renewalWindow, officialRoute]) => ({ id, priority, document, renewalWindow, officialRoute }))
}

writeFileSync(join(outputDir, 'document-expiry-readiness.json'), JSON.stringify(readiness, null, 2))
writeFileSync(join(outputDir, 'document-expiry-controls.csv'), ['id,priority,label,status,env_value', ...readiness.controls.map((item) => [item.id, item.priority, item.label, item.status, item.envValue].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'document-expiry-lanes.csv'), ['id,priority,document,renewal_window,official_route', ...readiness.lanes.map((item) => [item.id, item.priority, item.document, item.renewalWindow, item.officialRoute].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'privacy-warning-review.md'), '# Document expiry privacy review\n\n- Planner must work with document type + expiry date only.\n- Do not ask for Aadhaar/PAN numbers, OTP, password, UPI PIN, CVV, full card/bank data or raw document scans.\n- If reminders are stored later, ask user consent and keep reminder text privacy-safe.\n')
writeFileSync(join(outputDir, 'official-route-checklist.md'), '# Official route checklist\n\n- Passport: Passport Seva / official passport portal.\n- Driving License: Parivahan / state transport.\n- Certificates: state e-district / ServicePlus / official local portal.\n- Bank KYC: bank branch, official app or bank website.\n- Scholarship: official scheme portal or school/college notice.\n')
writeFileSync(join(outputDir, 'mobile-qa-checklist.md'), '# Mobile QA checklist\n\n- Form fields fit 360px width.\n- Date input is usable on Android Chrome and iPhone Safari.\n- Result cards do not overflow horizontally.\n- Warning copy remains visible before generated plan.\n')

console.log('\nDocument expiry planner readiness evidence generated')
console.log(`Output: ${outputDir}`)
console.log(`Ready: ${readiness.summary.ready}/${readiness.summary.totalControls}`)
if (readiness.summary.blocked > 0) process.exitCode = 1
