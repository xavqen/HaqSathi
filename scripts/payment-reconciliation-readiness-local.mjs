import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (key, fallback = '') => process.env[key] || fallback
const enabled = (key) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(key))
const configured = (key) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const outputDir = env('PAYMENT_RECON_EVIDENCE_DIR', './artifacts/payment-reconciliation-readiness')
mkdirSync(outputDir, { recursive: true })

const mode = env('PAYMENT_RECONCILIATION_MODE', 'dry_run')
const controls = [
  ['owner-assigned', 'P0', 'Payment reconciliation owner assigned', configured('PAYMENT_RECONCILIATION_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `PAYMENT_RECONCILIATION_OWNER=${env('PAYMENT_RECONCILIATION_OWNER', 'empty')}`],
  ['mode-safe', 'P0', 'Payment reconciliation mode is safe', ['dry_run', 'manual_review', 'enabled', 'disabled'].includes(mode) ? 'READY_TO_TEST' : 'BLOCKED', `PAYMENT_RECONCILIATION_MODE=${mode}`],
  ['gateway-ready', 'P0', 'Razorpay gateway evidence can be tested', configured('RAZORPAY_KEY_ID') && configured('RAZORPAY_KEY_SECRET') && configured('RAZORPAY_WEBHOOK_SECRET') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `RAZORPAY=${configured('RAZORPAY_KEY_ID') ? 'key-present' : 'missing'}`],
  ['dashboard-reviewed', 'P0', 'Gateway dashboard export reviewed', enabled('PAYMENT_RECON_DASHBOARD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `PAYMENT_RECON_DASHBOARD_REVIEWED=${env('PAYMENT_RECON_DASHBOARD_REVIEWED', 'false')}`],
  ['db-match-reviewed', 'P0', 'Gateway payment matches database order', enabled('PAYMENT_RECON_DB_MATCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `PAYMENT_RECON_DB_MATCH_REVIEWED=${env('PAYMENT_RECON_DB_MATCH_REVIEWED', 'false')}`],
  ['invoice-match-reviewed', 'P0', 'Paid order matches receipt/invoice total', enabled('PAYMENT_RECON_INVOICE_MATCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `PAYMENT_RECON_INVOICE_MATCH_REVIEWED=${env('PAYMENT_RECON_INVOICE_MATCH_REVIEWED', 'false')}`],
  ['refund-match-reviewed', 'P1', 'Refund and credit/refund note match', enabled('PAYMENT_RECON_REFUND_MATCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `PAYMENT_RECON_REFUND_MATCH_REVIEWED=${env('PAYMENT_RECON_REFUND_MATCH_REVIEWED', 'false')}`],
  ['payout-match-reviewed', 'P1', 'Gateway payout/settlement match reviewed', enabled('PAYMENT_RECON_PAYOUT_MATCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `PAYMENT_RECON_PAYOUT_MATCH_REVIEWED=${env('PAYMENT_RECON_PAYOUT_MATCH_REVIEWED', 'false')}`],
  ['anomaly-reviewed', 'P1', 'Mismatch/anomaly review workflow ready', enabled('PAYMENT_RECON_ANOMALY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `PAYMENT_RECON_ANOMALY_REVIEWED=${env('PAYMENT_RECON_ANOMALY_REVIEWED', 'false')}`],
  ['evidence-reviewed', 'P2', 'Payment reconciliation evidence pack reviewed', enabled('PAYMENT_RECON_EVIDENCE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `PAYMENT_RECON_EVIDENCE_REVIEWED=${env('PAYMENT_RECON_EVIDENCE_REVIEWED', 'false')}`]
]

const lanes = [
  ['gateway-payment-to-db-order', 'P0', 'GATEWAY_TO_DB', 'Razorpay payment/order/webhook event', 'PaymentOrder and Subscription state in database', 'Finance + Engineering', 'Gateway payment ID, webhook event ID, DB payment row, masked user ID, amount, currency, status and processed timestamp.', 'Never trust frontend success alone. Reconcile only server-verified gateway status and webhook signature events.'],
  ['db-paid-to-invoice-receipt', 'P0', 'DB_TO_INVOICE', 'Paid DB order/subscription row', 'Receipt/invoice/tax document record', 'Finance', 'Paid order total, invoice/receipt number, tax/discount totals, customer-visible billing document and access/RBAC proof.', 'Receipt/invoice totals must match paid server-side amount; do not expose raw gateway payload or private identifiers.'],
  ['refund-to-refund-note', 'P1', 'REFUND_TO_CREDIT_NOTE', 'Gateway refund or manual refund approval', 'Refund note, credit note and entitlement downgrade history', 'Finance + Support', 'Refund reference, amount, reason, approval owner, credit/refund note ID and user notification copy.', 'Show refund as processing until gateway confirms; preserve billing history and audit trail after cancellation/refund.'],
  ['gateway-payout-to-bank', 'P1', 'PAYOUT_SETTLEMENT', 'Gateway settlement/payout report', 'Internal finance export and bank reconciliation note', 'Founder/Finance', 'Settlement date, payout ID, gross, fees, tax, refunds, disputes, net deposit and matched finance export row.', 'Store only masked finance evidence in app artifacts; keep bank statements outside public/admin screenshots unless redacted.'],
  ['anomaly-review', 'P1', 'ANOMALY_REVIEW', 'Mismatch between gateway, DB, invoice, refund, payout or entitlement data', 'Manual reconciliation exception queue', 'Finance + Engineering', 'Mismatch type, payment IDs, impacted user count, safe summary, assigned owner and resolution note.', 'Do not auto-refund, auto-upgrade or auto-delete records from anomaly checks without human approval.'],
  ['month-end-export', 'P2', 'MONTH_END_EXPORT', 'Billing, refund, invoice and payout data', 'Month-end finance export for records and tax review', 'Finance', 'CSV/JSON export totals, date range, currency, masked customer references and reviewer signoff.', 'Finance exports must exclude OTPs, passwords, UPI PINs, CVV, raw documents, support secrets and full bank/card data.']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length
const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.58-payment-reconciliation-readiness',
  mode,
  summary: { totalControls: controls.length, ready, manualRequired, blocked, reconciliationLanes: lanes.length },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  paymentReconciliationLanes: lanes.map(([id, priority, lane, source, target, owner, requiredEvidence, safetyRule]) => ({ id, priority, lane, source, target, owner, requiredEvidence, safetyRule })),
  outputDir,
  nextAction: blocked ? 'Fix blocked payment reconciliation mode.' : manualRequired ? 'Complete P0 gateway, DB and invoice reconciliation review.' : 'Payment reconciliation gates are ready.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'payment-reconciliation-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'payment-reconciliation-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'payment-reconciliation-lanes.csv'), csv([['id', 'priority', 'lane', 'source', 'target', 'owner', 'required_evidence', 'safety_rule'], ...lanes]))
writeFileSync(join(outputDir, 'gateway-db-match-checklist.md'), `# Gateway → DB match checklist\n\n- Payment/order ID matches PaymentOrder row.\n- Webhook event ID is stored or traceable.\n- Amount, currency and status match.\n- Entitlement changes only after server verification.\n`)
writeFileSync(join(outputDir, 'invoice-total-reconciliation.md'), `# Invoice total reconciliation\n\n- Paid amount matches receipt/invoice total.\n- Tax, discount and currency are reviewed.\n- Receipt/invoice number is unique and traceable.\n- Customer can access billing document without seeing other users' data.\n`)
writeFileSync(join(outputDir, 'refund-payout-anomaly-checklist.md'), `# Refund, payout and anomaly checklist\n\n- Refund status matches gateway and support timeline.\n- Payout gross, fees, tax, refunds and disputes are reviewed.\n- Anomalies are manual-review only.\n- Evidence is masked before saving screenshots or exports.\n`)
writeFileSync(join(outputDir, 'finance-export-template.csv'), csv([
  ['date', 'gateway_payment_id_masked', 'order_id', 'plan', 'gross_amount', 'fees', 'tax', 'refunds', 'net_amount', 'status', 'reviewer'],
  ['YYYY-MM-DD', 'pay_****1234', 'order_****5678', 'pro_monthly', '0', '0', '0', '0', '0', 'manual_review', 'owner']
]))

console.log(`✅ Payment reconciliation evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Lanes: ${lanes.length}`)
