import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.TELECOM_SIM_EVIDENCE_DIR || 'artifacts/telecom-sim-readiness'
mkdirSync(outDir, { recursive: true })

const controls = [
  ['mode', process.env.TELECOM_SIM_PLANNER_MODE || 'local_only', 'Keep local_only/dry_run until reviewed'],
  ['copy_reviewed', process.env.TELECOM_SIM_COPY_REVIEWED || 'false', 'Telecom complaint copy reviewed'],
  ['secret_safety_reviewed', process.env.TELECOM_SIM_SECRET_SAFETY_REVIEWED || 'false', 'OTP/SIM secret safety reviewed'],
  ['kyc_route_reviewed', process.env.TELECOM_SIM_KYC_ROUTE_REVIEWED || 'false', 'KYC misuse official route reviewed'],
  ['mobile_qa_reviewed', process.env.TELECOM_SIM_MOBILE_QA_REVIEWED || 'false', 'Mobile/tablet/desktop QA reviewed']
]

const lanes = [
  ['telecom-copy', 'P0', 'Telecom complaint copy', 'No refund/activation/regulator outcome guarantees'],
  ['otp-sim-safety', 'P0', 'OTP and SIM safety', 'Never request OTP, SIM swap OTP, porting OTP, UPI PIN, CVV or passwords'],
  ['kyc-misuse-route', 'P0', 'KYC misuse route', 'Official operator support/store and evidence preservation only'],
  ['mobile-qa', 'P1', 'Mobile UX', 'Long issue labels, copy block and forms must work on mobile']
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.74-telecom-sim-complaint-planner',
  owner: process.env.TELECOM_SIM_OWNER || 'Product/Telecom safety',
  controls: controls.map(([id, value, note]) => ({ id, value, note })),
  lanes: lanes.map(([id, priority, lane, safety]) => ({ id, priority, lane, safety })),
  sample: {
    route: '/tools/telecom-sim-complaint-planner',
    admin: '/admin/telecom-sim-readiness',
    api: '/api/admin/telecom-sim-readiness'
  }
}

writeFileSync(join(outDir, 'telecom-sim-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outDir, 'telecom-sim-controls.csv'), 'id,value,note\n' + controls.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'telecom-sim-lanes.csv'), 'id,priority,lane,safety\n' + lanes.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'telecom-sim-proof-checklist.md'), `# Telecom SIM complaint proof checklist\n\n- Masked mobile number/customer ID\n- Recharge receipt, bill PDF or transaction ID\n- Operator app/SMS screenshots\n- Complaint/service request ID\n- Customer-care/store visit notes\n- Porting/UPC details if relevant\n- Redacted sharing copy with OTP, SIM swap/porting OTP, UPI PIN, CVV, password and full ID details hidden\n`)
writeFileSync(join(outDir, 'sample-telecom-message.md'), `Subject: Telecom/SIM complaint - issue type _____\n\nDear Telecom Support Team,\n\nI request written resolution for my telecom/SIM issue. Masked mobile number/account: _____. Issue date: _____. Transaction/bill/recharge ID: _____. Existing complaint ID: _____. Please share official status, reason and expected resolution timeline in writing.\n\nRegards,\n`)

console.log('Telecom SIM complaint readiness evidence generated')
console.log(`Output: ${outDir}`)
