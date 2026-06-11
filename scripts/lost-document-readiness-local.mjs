import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const evidenceDir = process.env.LOST_DOCUMENT_EVIDENCE_DIR || 'artifacts/lost-document-readiness'
mkdirSync(evidenceDir, { recursive: true })

const controls = [
  ['mode', 'P0', 'Lost document planner mode selected', process.env.LOST_DOCUMENT_PLANNER_MODE || 'local_only'],
  ['copy-reviewed', 'P0', 'Lost report and duplicate/reissue copy reviewed', process.env.LOST_DOCUMENT_COPY_REVIEWED || 'false'],
  ['official-route-reviewed', 'P0', 'Police/official authority route reviewed', process.env.LOST_DOCUMENT_OFFICIAL_ROUTE_REVIEWED || 'false'],
  ['identity-safety-reviewed', 'P0', 'Identity misuse safety reviewed', process.env.LOST_DOCUMENT_IDENTITY_SAFETY_REVIEWED || 'false'],
  ['mobile-qa', 'P1', 'Mobile/tablet/desktop QA completed', process.env.LOST_DOCUMENT_MOBILE_QA_REVIEWED || 'false']
]

const lanes = [
  ['misuse-blocking', 'P0', 'Misuse blocking', 'Block SIM/card/bank/UPI/device access through official provider routes first when risk exists.'],
  ['official-report', 'P0', 'Official lost report', 'Use official police/e-FIR/NC/GD/lost-report wording without guaranteeing report acceptance.'],
  ['duplicate-reissue', 'P1', 'Duplicate/reissue', 'Use only official issuer/provider channels and avoid agents/random payment links.'],
  ['privacy', 'P1', 'Identity privacy', 'Mask full IDs, QR/barcodes, address, phone/email, account/card numbers and family data.']
]

const report = {
  version: '3.0.79-lost-document-report-planner',
  generatedAt: new Date().toISOString(),
  owner: process.env.LOST_DOCUMENT_OWNER || 'Product/Identity safety',
  mode: process.env.LOST_DOCUMENT_PLANNER_MODE || 'local_only',
  controls: controls.map(([id, priority, label, value]) => ({ id, priority, label, value, status: value === 'true' ? 'PASS' : id === 'mode' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED' })),
  lanes: lanes.map(([id, priority, lane, safetyRule]) => ({ id, priority, lane, safetyRule }))
}

function csv(rows) {
  return rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n') + '\n'
}

writeFileSync(join(evidenceDir, 'lost-document-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(evidenceDir, 'lost-document-controls.csv'), csv([['id', 'priority', 'label', 'value'], ...controls]))
writeFileSync(join(evidenceDir, 'lost-document-lanes.csv'), csv([['id', 'priority', 'lane', 'safetyRule'], ...lanes]))
writeFileSync(join(evidenceDir, 'lost-document-proof-checklist.md'), [
  '# Lost Document Report Proof Checklist',
  '',
  '- Alternate identity proof and masked copy/photo of lost document if available.',
  '- Lost date, approximate time, place, route travelled, wallet/bag/phone details and witness/helpdesk note if any.',
  '- Police e-FIR/NC/GD/lost-report acknowledgement if required by the issuing authority.',
  '- SIM/card/bank/UPI/device block request ID if misuse risk exists.',
  '- Duplicate/reissue application number, payment receipt and appointment/status screenshot.',
  '- No OTP, password, full ID number, QR/barcode, CVV, UPI PIN, account/card number or remote access details.'
].join('\n'))
writeFileSync(join(evidenceDir, 'sample-lost-document-message.md'), [
  'Subject: Lost document report and duplicate/reissue request',
  '',
  'Dear Support/Helpdesk Team,',
  '',
  'Please guide me with the official duplicate/reissue process for my lost document. I can share redacted proof, lost-report acknowledgement and application details only through the official channel.',
  '',
  'Regards,'
].join('\n'))

console.log(`Lost document report readiness evidence written to ${evidenceDir}`)
