import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.RENT_DEPOSIT_EVIDENCE_DIR || './artifacts/rent-deposit-readiness'
mkdirSync(outDir, { recursive: true })

const controls = [
  ['mode', 'P0', 'RENT_DEPOSIT_PLANNER_MODE', process.env.RENT_DEPOSIT_PLANNER_MODE || 'local_only', 'Planner mode must be selected before launch.'],
  ['copy-reviewed', 'P0', 'RENT_DEPOSIT_COPY_REVIEWED', process.env.RENT_DEPOSIT_COPY_REVIEWED || 'false', 'Review deposit, deduction, receipt, notice and maintenance copy.'],
  ['legal-reviewed', 'P0', 'RENT_DEPOSIT_LEGAL_REVIEWED', process.env.RENT_DEPOSIT_LEGAL_REVIEWED || 'false', 'Guidance-only disclaimer and high-risk route reviewed.'],
  ['privacy-reviewed', 'P0', 'RENT_DEPOSIT_PRIVACY_REVIEWED', process.env.RENT_DEPOSIT_PRIVACY_REVIEWED || 'false', 'Full address, phone, ID and account redaction reviewed.'],
  ['mobile-qa', 'P1', 'RENT_DEPOSIT_MOBILE_QA_REVIEWED', process.env.RENT_DEPOSIT_MOBILE_QA_REVIEWED || 'false', 'Mobile and desktop QA proof captured.']
]

const lanes = [
  ['legal-guidance-copy', 'P0', 'Guidance-only legal copy', 'No legal certainty claims; route high-risk disputes to local expert/authority.'],
  ['privacy-redaction', 'P0', 'Address/privacy redaction', 'Do not expose address, phone, family details, ID proof or payment details.'],
  ['proof-pack', 'P1', 'Agreement/payment/handover proof', 'Agreement, payment, handover photos and written requests must be clear.'],
  ['mobile-qa', 'P1', 'Mobile UX', 'Long copy and proof cards must work on small screens.']
]

const report = {
  version: '3.0.67-rent-deposit-dispute-planner',
  generatedAt: new Date().toISOString(),
  mode: process.env.RENT_DEPOSIT_PLANNER_MODE || 'local_only',
  owner: process.env.RENT_DEPOSIT_OWNER || 'Product/Support',
  controls: controls.map(([id, priority, envName, envValue, note]) => ({ id, priority, envName, envValue, note, status: envValue === 'true' || id === 'mode' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED' })),
  lanes: lanes.map(([id, priority, lane, rule]) => ({ id, priority, lane, rule }))
}

function csv(rows) {
  return rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
}

writeFileSync(join(outDir, 'rent-deposit-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outDir, 'rent-deposit-controls.csv'), csv([['id', 'priority', 'env', 'value', 'note'], ...controls]))
writeFileSync(join(outDir, 'rent-deposit-lanes.csv'), csv([['id', 'priority', 'lane', 'rule'], ...lanes]))
writeFileSync(join(outDir, 'rent-proof-checklist.md'), [
  '# Rent/deposit proof checklist',
  '',
  '- Rental agreement / written terms.',
  '- Deposit and rent payment proof.',
  '- Move-in and move-out photos/videos.',
  '- Keys/handover proof and inventory list.',
  '- Written request for deposit return / deduction breakup.',
  '- Repair bills or estimates if deductions are claimed.',
  '- Redacted sharing copy hiding address, phone, IDs and payment data.'
].join('\n'))
writeFileSync(join(outDir, 'sample-rent-dispute-message.md'), [
  'Subject: Request to resolve rent/deposit issue',
  '',
  'Dear Landlord/Property Manager,',
  '',
  'I am requesting written settlement of the rent/deposit issue with agreement/payment proof attached. Please share the pending amount calculation, reason for deductions if any, and expected resolution date.',
  '',
  'Regards,'
].join('\n'))

console.log('\nRent deposit dispute readiness evidence')
console.log(`Output: ${outDir}`)
console.log('Files: rent-deposit-readiness.json, rent-deposit-controls.csv, rent-deposit-lanes.csv, rent-proof-checklist.md, sample-rent-dispute-message.md')
console.log('✅ Rent deposit readiness evidence generated.\n')
