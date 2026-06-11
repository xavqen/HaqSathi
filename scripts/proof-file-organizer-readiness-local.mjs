import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (key, fallback = '') => process.env[key] || fallback
const enabled = (key) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(key))
const configured = (key) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`

const outputDir = env('PROOF_FILE_ORGANIZER_EVIDENCE_DIR', './artifacts/proof-file-organizer-readiness')
mkdirSync(outputDir, { recursive: true })

const mode = env('PROOF_FILE_ORGANIZER_MODE', 'local_only')
const controls = [
  ['mode-safe', 'P0', 'Organizer mode is safe', ['local_only', 'dry_run', 'enabled', 'disabled'].includes(mode) ? 'READY_TO_TEST' : 'BLOCKED', `PROOF_FILE_ORGANIZER_MODE=${mode}`],
  ['owner-assigned', 'P1', 'Product/support owner assigned', configured('PROOF_FILE_ORGANIZER_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `PROOF_FILE_ORGANIZER_OWNER=${env('PROOF_FILE_ORGANIZER_OWNER', 'empty')}`],
  ['naming-reviewed', 'P1', 'Safe file naming reviewed', enabled('PROOF_FILE_NAMING_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `PROOF_FILE_NAMING_REVIEWED=${env('PROOF_FILE_NAMING_REVIEWED', 'false')}`],
  ['redaction-reviewed', 'P0', 'Redaction warnings reviewed', enabled('PROOF_FILE_REDACTION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `PROOF_FILE_REDACTION_REVIEWED=${env('PROOF_FILE_REDACTION_REVIEWED', 'false')}`],
  ['mobile-qa-reviewed', 'P1', 'Mobile organizer QA reviewed', enabled('PROOF_FILE_MOBILE_QA_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `PROOF_FILE_MOBILE_QA_REVIEWED=${env('PROOF_FILE_MOBILE_QA_REVIEWED', 'false')}`],
  ['translation-reviewed', 'P2', 'Key-language copy reviewed', enabled('PROOF_FILE_TRANSLATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `PROOF_FILE_TRANSLATION_REVIEWED=${env('PROOF_FILE_TRANSLATION_REVIEWED', 'false')}`],
  ['export-copy-reviewed', 'P1', 'Copy proof index reviewed', enabled('PROOF_FILE_EXPORT_COPY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `PROOF_FILE_EXPORT_COPY_REVIEWED=${env('PROOF_FILE_EXPORT_COPY_REVIEWED', 'false')}`]
]

const lanes = [
  ['originals-archive', 'P0', 'Original proof archive', 'Originals stay in a private folder and are never renamed with secrets.', 'Originals are not shared publicly; use official verified portals only when required.'],
  ['redacted-sharing-pack', 'P0', 'Redacted sharing pack', 'Shareable copies use date, company and proof type only.', 'Mask OTP, UPI PIN, CVV, passwords, full card/bank details, full Aadhaar/PAN and private addresses.'],
  ['payment-invoice-proof', 'P1', 'Payment and invoice proof', 'Payment screenshots and invoices use sequence numbers and safe reference IDs.', 'Hide balance, full account/card numbers and unrelated transactions.'],
  ['submission-index', 'P1', 'Submission index', 'Final pack includes proof index and attachments sorted by date/sequence.', 'Index confirms sensitive data has been redacted.']
]

const readiness = {
  version: '3.0.62-proof-file-organizer',
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
  lanes: lanes.map(([id, priority, lane, namingRule, redactionRule]) => ({ id, priority, lane, namingRule, redactionRule }))
}

writeFileSync(join(outputDir, 'proof-file-organizer-readiness.json'), JSON.stringify(readiness, null, 2))
writeFileSync(join(outputDir, 'proof-file-organizer-controls.csv'), ['id,priority,label,status,env_value', ...readiness.controls.map((item) => [item.id, item.priority, item.label, item.status, item.envValue].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'proof-file-organizer-lanes.csv'), ['id,priority,lane,naming_rule,redaction_rule', ...readiness.lanes.map((item) => [item.id, item.priority, item.lane, item.namingRule, item.redactionRule].map(quote).join(','))].join('\n') + '\n')
writeFileSync(join(outputDir, 'safe-file-naming-guide.md'), '# Safe proof file naming guide\n\n- Use date + company + proof type + sequence number.\n- Do not put OTP, password, UPI PIN, CVV, full card/bank number, full Aadhaar/PAN, phone number or private address in file names.\n- Keep originals in `01_originals_keep_safe` and share redacted copies from `02_redacted_for_sharing`.\n')
writeFileSync(join(outputDir, 'redacted-sharing-checklist.md'), '# Redacted sharing checklist\n\n- Blur OTP/password/UPI PIN/CVV/full account or card number.\n- Mask full Aadhaar/PAN except last 4 characters unless official portal requires full document.\n- Hide unrelated faces, address, phone, email and unrelated transactions.\n- Include a short proof index before attachments.\n')
writeFileSync(join(outputDir, 'sample-proof-index.md'), '# Sample proof index\n\n1. 20260609_company_01_invoice-or-application.pdf\n2. 20260609_company_02_payment-proof-redacted.png\n3. 20260609_company_03_support-chat-screenshot-redacted.png\n4. 20260609_company_04_complaint-acknowledgement.pdf\n\nSafety: Sensitive data has been redacted before sharing.\n')

console.log('\nProof file organizer readiness evidence generated')
console.log(`Output: ${outputDir}`)
console.log(`Ready: ${readiness.summary.ready}/${readiness.summary.totalControls}`)
if (readiness.summary.blocked > 0) process.exitCode = 1
