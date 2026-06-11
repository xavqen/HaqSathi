import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.BANK_FREEZE_EVIDENCE_DIR || 'artifacts/bank-freeze-readiness'
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const controls = [
  ['mode', process.env.BANK_FREEZE_PLANNER_MODE || 'local_only', 'Use local_only/dry_run until reviewed'],
  ['copy-reviewed', process.env.BANK_FREEZE_COPY_REVIEWED || 'false', 'Freeze/lien/KYC/UPI/wrong debit copy reviewed'],
  ['secret-safety', process.env.BANK_FREEZE_SECRET_SAFETY_REVIEWED || 'false', 'OTP/PIN/CVV/password/account/card safety reviewed'],
  ['official-route', process.env.BANK_FREEZE_OFFICIAL_ROUTE_REVIEWED || 'false', 'Official bank/cyber/regulator route reviewed'],
  ['mobile-qa', process.env.BANK_FREEZE_MOBILE_QA_REVIEWED || 'false', 'Mobile/tablet/desktop QA reviewed']
]

const lanes = [
  ['bank-copy', 'P0', 'Bank freeze/lien copy', 'No unfreeze/refund/reversal guarantee'],
  ['secret-safety', 'P0', 'Banking secret safety', 'No OTP/PIN/CVV/password/full account collection'],
  ['official-route', 'P0', 'Official route safety', 'No random agents/unfreeze fees/suspicious links'],
  ['mobile-qa', 'P1', 'Mobile UX', 'No overflow and copy button visible']
]

const report = {
  version: '3.0.76-bank-account-freeze-planner',
  generatedAt: new Date().toISOString(),
  route: '/tools/bank-account-freeze-planner',
  admin: '/admin/bank-freeze-readiness',
  api: '/api/admin/bank-freeze-readiness',
  controls,
  lanes
}

writeFileSync(join(outDir, 'bank-freeze-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outDir, 'bank-freeze-controls.csv'), 'id,value,note\n' + controls.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'bank-freeze-lanes.csv'), 'id,priority,lane,safety\n' + lanes.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'))
writeFileSync(join(outDir, 'bank-freeze-proof-checklist.md'), `# Bank account freeze/lien proof checklist\n\n- Bank freeze/lien/hold SMS, email, app notification or branch note\n- Redacted statement with relevant transaction/hold visible\n- UTR/reference ID and complaint/ticket number\n- Branch/support call notes and escalation emails\n- KYC/submission acknowledgement if relevant\n- Urgency proof if salary, pension, benefit, rent, EMI, medical or fee money is blocked\n- Redacted copy with OTP, UPI PIN, CVV, password, full account/card number and full ID hidden\n`)
writeFileSync(join(outDir, 'sample-bank-freeze-message.md'), `Subject: Request for written status and resolution - Bank account freeze/lien\n\nDear Bank Support Team,\n\nI request written clarification and resolution for my bank account issue. Amount affected: ₹______. Freeze/hold noticed on: ______. Transaction/reference ID: ______. Existing complaint ID: ______. Please provide the official reason/reference, pending action required from my side, and expected resolution timeline in writing.\n`)
console.log(`Bank freeze readiness evidence written to ${outDir}`)
