import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.VEHICLE_CHALLAN_EVIDENCE_DIR || 'artifacts/vehicle-challan-readiness'
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const controls = [
  ['mode', process.env.VEHICLE_CHALLAN_PLANNER_MODE || 'local_only', 'Use local_only/dry_run until reviewed'],
  ['copy-reviewed', process.env.VEHICLE_CHALLAN_COPY_REVIEWED || 'false', 'Wrong/duplicate/paid/towing challan copy reviewed'],
  ['official-route', process.env.VEHICLE_CHALLAN_OFFICIAL_ROUTE_REVIEWED || 'false', 'Official traffic/e-challan route reviewed'],
  ['payment-safety', process.env.VEHICLE_CHALLAN_PAYMENT_SAFETY_REVIEWED || 'false', 'Random link/OTP/PIN/CVV/password safety reviewed'],
  ['mobile-qa', process.env.VEHICLE_CHALLAN_MOBILE_QA_REVIEWED || 'false', 'Mobile/tablet/desktop QA reviewed']
]

const lanes = [
  ['copy-safety', 'P0', 'Challan dispute copy', 'No cancellation/refund guarantee'],
  ['payment-safety', 'P0', 'Payment/link safety', 'Official portal only, no random links/agents'],
  ['privacy-redaction', 'P0', 'Vehicle/privacy redaction', 'No public full ID/address/engine/chassis details'],
  ['mobile-qa', 'P1', 'Mobile UX', 'No overflow and copy button visible']
]

const report = {
  version: '3.0.77-vehicle-challan-dispute-planner',
  generatedAt: new Date().toISOString(),
  route: '/tools/vehicle-challan-dispute-planner',
  admin: '/admin/vehicle-challan-readiness',
  api: '/api/admin/vehicle-challan-readiness',
  controls,
  lanes
}

writeFileSync(join(outDir, 'vehicle-challan-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outDir, 'vehicle-challan-controls.csv'), 'id,value,note\n' + controls.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'vehicle-challan-lanes.csv'), 'id,priority,lane,safety\n' + lanes.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'vehicle-challan-proof-checklist.md'), `# Vehicle challan dispute proof checklist\n\n- Official challan screenshot with challan number, date, vehicle number, violation and amount\n- RC/ownership/transfer proof with sensitive details redacted\n- Payment receipt/UTR/bank debit proof if paid\n- Portal still-pending/duplicate/wrong-vehicle screenshot\n- Location/time proof such as GPS, toll, parking, dashcam or CCTV if available\n- Traffic helpline/portal complaint ID and visit/email notes\n- Redacted copy with OTP, PIN, CVV, password, full ID/address/engine/chassis number hidden\n`)
writeFileSync(join(outDir, 'sample-vehicle-challan-message.md'), `Subject: Request for review/correction of traffic challan\n\nDear Traffic/E-Challan Support Team,\n\nI request review of challan number ______ dated ______ for vehicle ______. Issue: ______. Amount: ₹______. Payment/status: ______. Evidence available: challan screenshot, RC/ownership proof, payment receipt/location proof as applicable. Please verify and provide written status, pending action and expected resolution timeline.\n`)
console.log(`Vehicle challan readiness evidence written to ${outDir}`)
