import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.INSURANCE_CLAIM_EVIDENCE_DIR || './artifacts/insurance-claim-readiness'
mkdirSync(outDir, { recursive: true })

const controls = [
  ['mode', 'P0', 'INSURANCE_CLAIM_PLANNER_MODE', process.env.INSURANCE_CLAIM_PLANNER_MODE || 'local_only', 'Planner mode must be selected before launch.'],
  ['copy-reviewed', 'P0', 'INSURANCE_CLAIM_COPY_REVIEWED', process.env.INSURANCE_CLAIM_COPY_REVIEWED || 'false', 'Review vehicle, health, travel, device, appliance, life, crop and other claim copy.'],
  ['secret-warning-reviewed', 'P0', 'INSURANCE_CLAIM_SECRET_WARNING_REVIEWED', process.env.INSURANCE_CLAIM_SECRET_WARNING_REVIEWED || 'false', 'Review OTP, UPI PIN, CVV, password, remote screen access and fake settlement call warnings.'],
  ['privacy-reviewed', 'P0', 'INSURANCE_CLAIM_PRIVACY_REVIEWED', process.env.INSURANCE_CLAIM_PRIVACY_REVIEWED || 'false', 'Review policy, ID, medical, bank and address redaction guidance.'],
  ['mobile-qa', 'P1', 'INSURANCE_CLAIM_MOBILE_QA_REVIEWED', process.env.INSURANCE_CLAIM_MOBILE_QA_REVIEWED || 'false', 'Mobile and desktop QA proof captured.']
]

const lanes = [
  ['claim-copy-safety', 'P0', 'Claim copy safety', 'No guaranteed claim approval, payout, medical or legal certainty.'],
  ['secret-redaction', 'P0', 'Secret and document redaction', 'Never ask users to share OTP, PIN, CVV, passwords, screen access or public medical/ID data.'],
  ['proof-checklist', 'P1', 'Policy/claim proof checklist', 'Policy, claim ID, bills, incident proof and insurer communication must be clear.'],
  ['mobile-qa', 'P1', 'Mobile UX', 'Long copy and proof cards must work on small screens.']
]

const report = {
  version: '3.0.68-insurance-claim-planner',
  generatedAt: new Date().toISOString(),
  mode: process.env.INSURANCE_CLAIM_PLANNER_MODE || 'local_only',
  owner: process.env.INSURANCE_CLAIM_OWNER || 'Product/Support',
  controls: controls.map(([id, priority, envName, envValue, note]) => ({ id, priority, envName, envValue, note, status: envValue === 'true' || id === 'mode' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED' })),
  lanes: lanes.map(([id, priority, lane, rule]) => ({ id, priority, lane, rule }))
}

function csv(rows) {
  return rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
}

writeFileSync(join(outDir, 'insurance-claim-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outDir, 'insurance-claim-controls.csv'), csv([['id', 'priority', 'env', 'value', 'note'], ...controls]))
writeFileSync(join(outDir, 'insurance-claim-lanes.csv'), csv([['id', 'priority', 'lane', 'rule'], ...lanes]))
writeFileSync(join(outDir, 'insurance-claim-proof-checklist.md'), [
  '# Insurance claim proof checklist',
  '',
  '- Policy document/certificate and policy period.',
  '- Claim reference number and intimation proof.',
  '- Bills, invoices, estimates, receipts and payment proof.',
  '- Incident photos/videos/reports/discharge summary/service report as applicable.',
  '- Written rejection, short-settlement or delay reason if available.',
  '- Redacted public-sharing copy hiding policy, ID, address, medical and bank data.'
].join('\n'))
writeFileSync(join(outDir, 'sample-insurance-claim-message.md'), [
  'Subject: Request for insurance claim status / review',
  '',
  'Dear Insurance Support Team,',
  '',
  'I am requesting a written update for my insurance claim. Please share the current claim status, pending documents if any, reason for delay/rejection/short settlement, and expected resolution timeline.',
  '',
  'Regards,'
].join('\n'))

console.log('\nInsurance claim readiness evidence')
console.log(`Output: ${outDir}`)
console.log('Files: insurance-claim-readiness.json, insurance-claim-controls.csv, insurance-claim-lanes.csv, insurance-claim-proof-checklist.md, sample-insurance-claim-message.md')
console.log('✅ Insurance claim readiness evidence generated.\n')
