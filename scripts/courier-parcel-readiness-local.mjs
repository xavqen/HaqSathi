import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.COURIER_PARCEL_EVIDENCE_DIR || 'artifacts/courier-parcel-readiness'
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const controls = [
  ['mode', process.env.COURIER_PARCEL_PLANNER_MODE || 'local_only', 'Use local_only/dry_run until reviewed'],
  ['copy-reviewed', process.env.COURIER_PARCEL_COPY_REVIEWED || 'false', 'Lost/damaged/delivered/pickup/scam copy reviewed'],
  ['privacy-reviewed', process.env.COURIER_PARCEL_PRIVACY_REVIEWED || 'false', 'Full address/phone/OTP/payment/ID privacy warnings reviewed'],
  ['scam-route-reviewed', process.env.COURIER_PARCEL_SCAM_ROUTE_REVIEWED || 'false', 'Fake courier/customs/refund link safety reviewed'],
  ['mobile-qa', process.env.COURIER_PARCEL_MOBILE_QA_REVIEWED || 'false', 'Mobile/tablet/desktop QA reviewed']
]

const lanes = [
  ['parcel-copy', 'P0', 'Courier dispute copy', 'No refund/delivery/compensation guarantee'],
  ['proof-privacy', 'P0', 'Proof privacy', 'No OTP/full address/full ID/payment secret collection'],
  ['scam-link-safety', 'P0', 'Fake courier/customs scam', 'Official app/site route only'],
  ['mobile-qa', 'P1', 'Mobile UX', 'No overflow and copy button visible']
]

const report = {
  version: '3.0.75-courier-parcel-dispute-planner',
  generatedAt: new Date().toISOString(),
  route: '/tools/courier-parcel-dispute-planner',
  admin: '/admin/courier-parcel-readiness',
  api: '/api/admin/courier-parcel-readiness',
  controls,
  lanes
}

writeFileSync(join(outDir, 'courier-parcel-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outDir, 'courier-parcel-controls.csv'), 'id,value,note\n' + controls.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'courier-parcel-lanes.csv'), 'id,priority,lane,safety\n' + lanes.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'courier-parcel-proof-checklist.md'), `# Courier parcel dispute proof checklist\n\n- Tracking/AWB ID and screenshots\n- Invoice/order ID and item value proof\n- Package/AWB label photos\n- Unboxing/damage/wrong item photos or video\n- Delivery proof/POD request screenshot\n- Support ticket/chat/email/call log\n- Redacted sharing copy with full address, phone, OTP, UPI PIN, CVV, password and full ID hidden\n`)
writeFileSync(join(outDir, 'sample-courier-message.md'), `Subject: Courier/parcel complaint - marked delivered but not received\n\nDear Support Team,\n\nI request written resolution for my parcel issue. Tracking/AWB ID: ______. Order ID: ______. Current status shows delivered, but I have not received the parcel. Please share delivery proof/POD, investigation result and resolution timeline in writing.\n`)
console.log(`Courier parcel readiness evidence written to ${outDir}`)
