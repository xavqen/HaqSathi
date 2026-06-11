import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const evidenceDir = process.env.IDENTITY_DOCUMENT_EVIDENCE_DIR || 'artifacts/identity-document-readiness'
mkdirSync(evidenceDir, { recursive: true })

const controls = [
  ['mode', 'P0', 'Identity document planner mode selected', process.env.IDENTITY_DOCUMENT_PLANNER_MODE || 'local_only'],
  ['copy-reviewed', 'P0', 'Correction request copy reviewed', process.env.IDENTITY_DOCUMENT_COPY_REVIEWED || 'false'],
  ['official-route-reviewed', 'P0', 'Official correction route reviewed', process.env.IDENTITY_DOCUMENT_OFFICIAL_ROUTE_REVIEWED || 'false'],
  ['identity-safety-reviewed', 'P0', 'Identity data safety reviewed', process.env.IDENTITY_DOCUMENT_SAFETY_REVIEWED || 'false'],
  ['mobile-qa', 'P1', 'Mobile/tablet/desktop QA completed', process.env.IDENTITY_DOCUMENT_MOBILE_QA_REVIEWED || 'false']
]

const lanes = [
  ['official-route', 'P0', 'Official correction route', 'Use official issuing authority route only.'],
  ['identity-safety', 'P0', 'Identity data safety', 'Never request OTP/password/full ID/QR/barcode/CVV/UPI PIN/remote access.'],
  ['proof-consistency', 'P1', 'Proof consistency', 'Compare current value, correct value and proof before submission.'],
  ['mobile-qa', 'P1', 'Mobile UX', 'No horizontal overflow or hidden copy actions.']
]

const report = {
  version: '3.0.78-identity-document-correction-planner',
  generatedAt: new Date().toISOString(),
  owner: process.env.IDENTITY_DOCUMENT_OWNER || 'Product/Document safety',
  mode: process.env.IDENTITY_DOCUMENT_PLANNER_MODE || 'local_only',
  controls: controls.map(([id, priority, label, value]) => ({ id, priority, label, value, status: value === 'true' ? 'PASS' : id === 'mode' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED' })),
  lanes: lanes.map(([id, priority, lane, safetyRule]) => ({ id, priority, lane, safetyRule }))
}

function csv(rows) {
  return rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n') + '\n'
}

writeFileSync(join(evidenceDir, 'identity-document-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(evidenceDir, 'identity-document-controls.csv'), csv([['id', 'priority', 'label', 'value'], ...controls]))
writeFileSync(join(evidenceDir, 'identity-document-lanes.csv'), csv([['id', 'priority', 'lane', 'safetyRule'], ...lanes]))
writeFileSync(join(evidenceDir, 'identity-document-proof-checklist.md'), [
  '# Identity Document Correction Proof Checklist',
  '',
  '- Current document showing wrong value, with full ID/QR/barcode redacted for non-official sharing.',
  '- Correct proof document showing exact requested spelling/date/address/detail.',
  '- Application/reference ID, payment receipt and status/rejection screenshot if already submitted.',
  '- Official helpdesk/centre/branch communication proof.',
  '- No OTP, password, full Aadhaar/PAN/passport/account/card number, CVV, UPI PIN or remote access details.'
].join('\n'))
writeFileSync(join(evidenceDir, 'sample-identity-correction-message.md'), [
  'Subject: Request for identity document correction/update',
  '',
  'Dear Support/Helpdesk Team,',
  '',
  'Please verify my correction request and share the written status, missing requirement if any, and expected resolution timeline. I will submit redacted proof documents only through the official channel.',
  '',
  'Regards,'
].join('\n'))

console.log(`Identity document correction readiness evidence written to ${evidenceDir}`)
