import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.REFUND_DISPUTE_EVIDENCE_DIR || './artifacts/refund-dispute-readiness'
mkdirSync(outputDir, { recursive: true })

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
const configured = (name) => {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const allowedModes = ['dry_run', 'manual_review', 'enabled', 'disabled']
const mode = env('REFUND_DISPUTE_MODE', 'dry_run')

const controls = [
  ['owner-assigned', 'P0', 'Refund/dispute owner assigned', configured('REFUND_DISPUTE_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `REFUND_DISPUTE_OWNER=${env('REFUND_DISPUTE_OWNER') || 'empty'}`],
  ['mode-safe', 'P0', 'Refund/dispute mode is safe', allowedModes.includes(mode) ? 'READY_TO_TEST' : 'BLOCKED', `REFUND_DISPUTE_MODE=${mode}`],
  ['refund-policy-reviewed', 'P0', 'Refund policy reviewed', enabled('REFUND_POLICY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `REFUND_POLICY_REVIEWED=${env('REFUND_POLICY_REVIEWED', 'false')}`],
  ['cancellation-reviewed', 'P0', 'Cancellation flow reviewed', enabled('CANCELLATION_FLOW_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `CANCELLATION_FLOW_REVIEWED=${env('CANCELLATION_FLOW_REVIEWED', 'false')}`],
  ['failed-payment-reviewed', 'P0', 'Failed payment flow reviewed', enabled('FAILED_PAYMENT_FLOW_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FAILED_PAYMENT_FLOW_REVIEWED=${env('FAILED_PAYMENT_FLOW_REVIEWED', 'false')}`],
  ['duplicate-payment-reviewed', 'P1', 'Duplicate payment handling reviewed', enabled('DUPLICATE_PAYMENT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DUPLICATE_PAYMENT_REVIEWED=${env('DUPLICATE_PAYMENT_REVIEWED', 'false')}`],
  ['chargeback-reviewed', 'P1', 'Chargeback response reviewed', enabled('CHARGEBACK_RESPONSE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `CHARGEBACK_RESPONSE_REVIEWED=${env('CHARGEBACK_RESPONSE_REVIEWED', 'false')}`],
  ['support-macros-reviewed', 'P1', 'Billing support macros reviewed', enabled('BILLING_SUPPORT_MACROS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `BILLING_SUPPORT_MACROS_REVIEWED=${env('BILLING_SUPPORT_MACROS_REVIEWED', 'false')}`],
  ['evidence-reviewed', 'P2', 'Refund/dispute evidence pack reviewed', enabled('REFUND_DISPUTE_EVIDENCE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `REFUND_DISPUTE_EVIDENCE_REVIEWED=${env('REFUND_DISPUTE_EVIDENCE_REVIEWED', 'false')}`]
]

const lanes = [
  ['subscription-cancel', 'P0', 'CANCEL', 'User cancels paid plan, admin disables renewal, or payment lifecycle marks subscription as cancelled.', 'Finance + Support', 'User ID, plan, cancellation timestamp, renewal-stop proof, entitlement downgrade behavior and support confirmation.', 'Do not delete billing history during cancellation; keep receipts, refund notes and audit trail visible to account owner.'],
  ['approved-refund', 'P0', 'REFUND', 'Support/finance approves full or partial refund after verifying server-side payment and entitlement state.', 'Finance', 'Payment reference, refund reason, amount, approval owner, gateway refund status, receipt/invoice reference and user notice.', 'Never promise settled refund before payment provider confirms; show pending/processing status until provider evidence exists.'],
  ['failed-payment-no-access', 'P0', 'FAILED_PAYMENT', 'Checkout, renewal or webhook marks payment as failed, expired or signature-invalid.', 'Product + Support', 'Failure reason, masked gateway reference, entitlement remains free/previous state, retry link behavior and user-safe message.', 'Do not grant paid entitlement from client-side success screens or unverified webhook payloads.'],
  ['duplicate-payment', 'P1', 'DUPLICATE_PAYMENT', 'Same user pays twice for same plan window or gateway sends duplicate success/webhook event.', 'Finance + Engineering', 'Idempotency key, duplicate reference, original receipt, duplicate receipt/refund path and reconciliation note.', 'Use idempotent payment processing and audit trail before issuing duplicate refund or extra entitlement.'],
  ['chargeback-response', 'P1', 'CHARGEBACK', 'Bank, card network or payment provider opens a payment dispute/chargeback.', 'Finance + Support', 'Receipt, masked user/account activity, delivery/access proof, support communication, refund history and response deadline.', 'Only submit privacy-safe evidence; never expose raw documents, OTPs, UPI PINs, CVV, passwords or private complaint drafts.'],
  ['billing-support-dispute', 'P2', 'DISPUTE', 'User says billing amount, tax invoice, refund timeline or plan access is wrong.', 'Support', 'Ticket ID, masked billing references, timeline, current plan state, invoice/receipt IDs and next support action.', 'Support macros must avoid blame, false guarantees and unverified legal/tax statements.']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length
const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.57-refund-dispute-readiness',
  mode,
  summary: { totalControls: controls.length, ready, manualRequired, blocked, refundDisputeLanes: lanes.length },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  refundDisputeLanes: lanes.map(([id, priority, lane, trigger, owner, requiredEvidence, safetyRule]) => ({ id, priority, lane, trigger, owner, requiredEvidence, safetyRule })),
  outputDir,
  nextAction: blocked ? 'Fix blocked refund/dispute mode.' : manualRequired ? 'Complete P0 refund, cancellation and failed-payment review.' : 'Refund/dispute gates are ready.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'refund-dispute-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'refund-dispute-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'refund-dispute-lanes.csv'), csv([['id', 'priority', 'lane', 'trigger', 'owner', 'required_evidence', 'safety_rule'], ...lanes]))
writeFileSync(join(outputDir, 'refund-policy-review.md'), `# Refund policy review\n\n- Eligibility and partial-refund rules reviewed.\n- Duplicate-payment and failed-payment paths reviewed.\n- Refund status language avoids false settlement promises.\n- Finance/support owner is assigned.\n`)
writeFileSync(join(outputDir, 'cancellation-flow-checklist.md'), `# Cancellation flow checklist\n\n- Renewal stops correctly.\n- Current billing period behavior is clear.\n- Entitlement downgrade behavior is tested.\n- Receipt/invoice history remains visible to account owner.\n`)
writeFileSync(join(outputDir, 'chargeback-response-template.md'), `# Chargeback response template\n\n- Masked receipt/payment reference.\n- Access/delivery proof.\n- Support communication timeline.\n- Refund/cancellation history.\n- No OTPs; UPI PINs; CVV; passwords; raw documents; or full card/bank details.\n`)
writeFileSync(join(outputDir, 'billing-support-macros.md'), `# Billing support macros\n\n## Refund processing\nWe have received your refund request and will verify the payment status before confirming the refund timeline. Please do not share OTP; UPI PIN; CVV; passwords; or full card/bank details.\n\n## Failed payment\nIf money was debited but access was not upgraded, share only the masked payment reference or screenshot with personal details hidden.\n`)

console.log(`✅ Refund/dispute evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Lanes: ${lanes.length}`)
