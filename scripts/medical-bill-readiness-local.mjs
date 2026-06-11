import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.MEDICAL_BILL_EVIDENCE_DIR || 'artifacts/medical-bill-readiness'
mkdirSync(outDir, { recursive: true })

const controls = [
  ['mode', process.env.MEDICAL_BILL_PLANNER_MODE || 'local_only', 'Keep local_only/dry_run until reviewed'],
  ['copy_reviewed', process.env.MEDICAL_BILL_COPY_REVIEWED || 'false', 'Billing dispute copy reviewed'],
  ['disclaimer_reviewed', process.env.MEDICAL_BILL_DISCLAIMER_REVIEWED || 'false', 'Medical/legal disclaimer reviewed'],
  ['privacy_reviewed', process.env.MEDICAL_BILL_PRIVACY_REVIEWED || 'false', 'Health/payment privacy reviewed'],
  ['mobile_qa_reviewed', process.env.MEDICAL_BILL_MOBILE_QA_REVIEWED || 'false', 'Mobile/tablet/desktop QA reviewed']
]

const lanes = [
  ['billing-copy', 'P0', 'Billing dispute copy', 'No refund/insurance/legal success guarantees'],
  ['medical-disclaimer', 'P0', 'Medical disclaimer', 'No medical, legal, insurance or financial advice'],
  ['secret-privacy-safety', 'P0', 'Secret and health privacy safety', 'Never request OTP, CVV, UPI PIN, full policy number or excessive health details'],
  ['mobile-qa', 'P1', 'Mobile UX', 'Amount/date/select/copy sections work on mobile']
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.73-medical-bill-dispute-planner',
  owner: process.env.MEDICAL_BILL_OWNER || 'Product/Healthcare billing safety',
  controls: controls.map(([id, value, note]) => ({ id, value, note })),
  lanes: lanes.map(([id, priority, lane, safety]) => ({ id, priority, lane, safety })),
  sample: {
    route: '/tools/medical-bill-dispute-planner',
    admin: '/admin/medical-bill-readiness',
    api: '/api/admin/medical-bill-readiness'
  }
}

writeFileSync(join(outDir, 'medical-bill-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outDir, 'medical-bill-controls.csv'), 'id,value,note\n' + controls.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'medical-bill-lanes.csv'), 'id,priority,lane,safety\n' + lanes.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'medical-bill-proof-checklist.md'), `# Medical bill dispute proof checklist\n\n- Final bill and itemized bill breakup\n- Estimate/package quote/rate card if available\n- Payment receipt, deposit receipt and transaction proof\n- Discharge/test/service proof or prescription where relevant\n- Insurance/TPA pre-auth, denial, deduction or claim status proof\n- Billing desk/support communication trail\n- Redacted sharing copy with OTP/CVV/UPI PIN/password/full health ID/full policy number hidden\n`)
writeFileSync(join(outDir, 'sample-medical-bill-message.md'), `Subject: Medical bill dispute / clarification request - bill number _____\n\nDear Billing Team,\n\nI request item-wise billing clarification and written resolution for bill number _____. Total bill: ₹_____. Amount paid: ₹_____. Disputed/unclear amount: ₹_____. Please share the itemized breakup, reason for disputed charges/deductions and expected resolution timeline in writing.\n\nRegards,\n`)

console.log('Medical bill dispute readiness evidence generated')
console.log(`Output: ${outDir}`)
