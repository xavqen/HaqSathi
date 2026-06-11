import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.LOAN_APP_EVIDENCE_DIR || './artifacts/loan-app-readiness'
mkdirSync(outDir, { recursive: true })

const controls = [
  ['mode', 'P0', 'LOAN_APP_PLANNER_MODE', process.env.LOAN_APP_PLANNER_MODE || 'local_only', 'Planner mode must be selected before launch.'],
  ['copy-reviewed', 'P0', 'LOAN_APP_COPY_REVIEWED', process.env.LOAN_APP_COPY_REVIEWED || 'false', 'Review harassment calls, contact-list threats, fake legal threats, overcharging and privacy misuse copy.'],
  ['safety-reviewed', 'P0', 'LOAN_APP_SAFETY_REVIEWED', process.env.LOAN_APP_SAFETY_REVIEWED || 'false', 'Review immediate threat, blackmail, privacy abuse and emergency safety guidance.'],
  ['privacy-reviewed', 'P0', 'LOAN_APP_PRIVACY_REVIEWED', process.env.LOAN_APP_PRIVACY_REVIEWED || 'false', 'Review redaction for phone, address, ID, bank, UPI, family contacts and private photos.'],
  ['mobile-qa', 'P1', 'LOAN_APP_MOBILE_QA_REVIEWED', process.env.LOAN_APP_MOBILE_QA_REVIEWED || 'false', 'Mobile and desktop QA proof captured.']
]

const lanes = [
  ['threat-safety', 'P0', 'Threat and harassment safety', 'No promises of legal/police outcome; urgent threats route to trusted people and official channels.'],
  ['secret-redaction', 'P0', 'Secret redaction', 'Never ask users to share OTP, UPI PIN, CVV, passwords, screen access, full ID numbers or family contacts.'],
  ['proof-preservation', 'P1', 'Proof preservation', 'Call logs, screenshots, app details, payment proof, permission screenshots and timeline must be clear.'],
  ['mobile-qa', 'P1', 'Mobile UX', 'Emergency note, form, proof checklist and copy block must work on small screens.']
]

const report = {
  version: '3.0.69-loan-app-harassment-planner',
  generatedAt: new Date().toISOString(),
  mode: process.env.LOAN_APP_PLANNER_MODE || 'local_only',
  owner: process.env.LOAN_APP_OWNER || 'Product/Safety',
  controls: controls.map(([id, priority, envName, envValue, note]) => ({ id, priority, envName, envValue, note, status: envValue === 'true' || id === 'mode' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED' })),
  lanes: lanes.map(([id, priority, lane, rule]) => ({ id, priority, lane, rule }))
}

function csv(rows) {
  return rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
}

writeFileSync(join(outDir, 'loan-app-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outDir, 'loan-app-controls.csv'), csv([['id', 'priority', 'env', 'value', 'note'], ...controls]))
writeFileSync(join(outDir, 'loan-app-lanes.csv'), csv([['id', 'priority', 'lane', 'rule'], ...lanes]))
writeFileSync(join(outDir, 'loan-app-proof-checklist.md'), [
  '# Loan app harassment proof checklist',
  '',
  '- App/lender name, loan ID/reference if safe, disbursal amount and repayment demand screenshot.',
  '- Call logs with dates, times and numbers.',
  '- SMS/WhatsApp/chat screenshots showing threats, abuse, fake legal warnings or contact-list harassment.',
  '- Payment proof and receipt if already paid.',
  '- App permission screenshots if contact/photo/storage misuse is suspected.',
  '- Redacted public-sharing copy hiding phone, address, ID, UPI, bank, family contact and private image details.'
].join('\n'))
writeFileSync(join(outDir, 'sample-loan-app-message.md'), [
  'Subject: Request to stop harassment and provide written loan/payment clarification',
  '',
  'Dear Loan App / Lender Support Team,',
  '',
  'Please share a written breakup of principal, fees/charges, payment history, pending amount if any, and confirm that abusive calls/messages/contact-list harassment will stop immediately.',
  '',
  'Regards,'
].join('\n'))

console.log('\nLoan app harassment readiness evidence')
console.log(`Output: ${outDir}`)
console.log('Files: loan-app-readiness.json, loan-app-controls.csv, loan-app-lanes.csv, loan-app-proof-checklist.md, sample-loan-app-message.md')
console.log('✅ Loan app harassment readiness evidence generated.\n')
