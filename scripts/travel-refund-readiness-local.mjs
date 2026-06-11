import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.TRAVEL_REFUND_EVIDENCE_DIR || 'artifacts/travel-refund-readiness'
mkdirSync(outDir, { recursive: true })

const controls = [
  ['mode', process.env.TRAVEL_REFUND_PLANNER_MODE || 'local_only', 'Keep local_only/dry_run until reviewed'],
  ['copy_reviewed', process.env.TRAVEL_REFUND_COPY_REVIEWED || 'false', 'Refund/cancellation copy reviewed'],
  ['secret_safety_reviewed', process.env.TRAVEL_REFUND_SECRET_SAFETY_REVIEWED || 'false', 'Payment secret safety reviewed'],
  ['policy_reviewed', process.env.TRAVEL_REFUND_POLICY_REVIEWED || 'false', 'Provider policy wording reviewed'],
  ['mobile_qa_reviewed', process.env.TRAVEL_REFUND_MOBILE_QA_REVIEWED || 'false', 'Mobile/tablet/desktop QA reviewed']
]

const lanes = [
  ['refund-policy-copy', 'P0', 'Refund policy copy', 'No refund guarantees; deductions are estimates'],
  ['payment-secret-safety', 'P0', 'Payment secret safety', 'Never request OTP, CVV, UPI PIN, card PIN or password'],
  ['travel-document-privacy', 'P1', 'Travel document privacy', 'Redact passport/visa/private IDs where possible'],
  ['mobile-qa', 'P1', 'Mobile UX', 'Amount/date/select/copy sections work on mobile']
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.72-travel-refund-cancellation-planner',
  owner: process.env.TRAVEL_REFUND_OWNER || 'Product/Payments safety',
  controls: controls.map(([id, value, note]) => ({ id, value, note })),
  lanes: lanes.map(([id, priority, lane, safety]) => ({ id, priority, lane, safety })),
  sample: {
    route: '/tools/travel-refund-cancellation-planner',
    admin: '/admin/travel-refund-readiness',
    api: '/api/admin/travel-refund-readiness'
  }
}

writeFileSync(join(outDir, 'travel-refund-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outDir, 'travel-refund-controls.csv'), 'id,value,note\n' + controls.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'travel-refund-lanes.csv'), 'id,priority,lane,safety\n' + lanes.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'travel-refund-proof-checklist.md'), `# Travel refund proof checklist\n\n- Booking/PNR/trip ID and ticket/voucher\n- Payment receipt and transaction proof\n- Cancellation/refund status screenshot\n- Provider policy/fare rule/cancellation rule screenshot\n- Support chat/email/ticket/call log\n- Redacted sharing copy with OTP/CVV/UPI PIN/password/full IDs hidden\n`)
writeFileSync(join(outDir, 'sample-travel-refund-message.md'), `Subject: Refund/cancellation follow-up for booking ID _____\n\nDear Support Team,\n\nI request a written update for my refund/cancellation issue. Amount paid: ₹_____. Refund received: ₹_____. Pending/disputed amount: ₹_____. Please share refund status, deduction breakup and expected credit date in writing.\n\nRegards,\n`)

console.log('Travel refund cancellation readiness evidence generated')
console.log(`Output: ${outDir}`)
