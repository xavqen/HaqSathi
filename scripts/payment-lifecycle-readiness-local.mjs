import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.PAYMENT_EVIDENCE_DIR || './artifacts/payment-lifecycle'
mkdirSync(outputDir, { recursive: true })

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(env(name)))
const httpsOrEmpty = (name) => !env(name) || /^https:\/\//i.test(env(name))
const positive = (name, fallback) => {
  const value = Number(env(name, fallback))
  return Number.isFinite(value) && value > 0
}

const controls = [
  ['payment-mode', 'Safe payment launch mode', env('PAYMENT_LIFECYCLE_MODE', 'readiness') === 'live' && env('PAYMENT_DRY_RUN', 'true') !== 'false' ? 'BLOCKED' : 'READY_TO_TEST', `PAYMENT_LIFECYCLE_MODE=${env('PAYMENT_LIFECYCLE_MODE', 'readiness')}; PAYMENT_DRY_RUN=${env('PAYMENT_DRY_RUN', 'true')}`],
  ['razorpay-credentials', 'Razorpay credentials', configured('RAZORPAY_KEY_ID') && configured('RAZORPAY_KEY_SECRET') && configured('RAZORPAY_WEBHOOK_SECRET') ? 'READY_TO_TEST' : 'BLOCKED', `key=${configured('RAZORPAY_KEY_ID') ? 'configured' : 'empty'}; secret=${configured('RAZORPAY_KEY_SECRET') ? 'configured' : 'empty'}; webhook=${configured('RAZORPAY_WEBHOOK_SECRET') ? 'configured' : 'empty'}`],
  ['webhook-signature', 'Webhook signature enforcement', env('PAYMENT_WEBHOOK_MODE', 'verify') === 'verify' && configured('RAZORPAY_WEBHOOK_SECRET') ? 'READY_TO_TEST' : 'BLOCKED', `PAYMENT_WEBHOOK_MODE=${env('PAYMENT_WEBHOOK_MODE', 'verify')}`],
  ['retry-grace', 'Failed payment retry and grace policy', positive('PAYMENT_RETRY_LIMIT', '3') && positive('PAYMENT_GRACE_PERIOD_DAYS', '3') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `retry=${env('PAYMENT_RETRY_LIMIT', '3')}; grace=${env('PAYMENT_GRACE_PERIOD_DAYS', '3')}`],
  ['refund-cancel', 'Refund/cancel review mode', env('PAYMENT_REFUND_MODE', 'manual_review') === 'auto' ? 'MANUAL_REQUIRED' : 'READY_TO_TEST', `PAYMENT_REFUND_MODE=${env('PAYMENT_REFUND_MODE', 'manual_review')}`],
  ['invoice-receipt', 'Receipt and invoice sender', configured('PAYMENT_RECEIPT_FROM_EMAIL') || configured('RESEND_FROM_EMAIL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', env('PAYMENT_RECEIPT_FROM_EMAIL') || env('RESEND_FROM_EMAIL') || 'empty'],
  ['finance-owner', 'Finance/support owner', configured('PAYMENT_LIFECYCLE_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', env('PAYMENT_LIFECYCLE_OWNER') || 'empty'],
  ['alert-webhook', 'Payment failure alert webhook safety', httpsOrEmpty('PAYMENT_FAILURE_WEBHOOK_URL') ? 'READY_TO_TEST' : 'BLOCKED', configured('PAYMENT_FAILURE_WEBHOOK_URL') ? 'configured' : 'empty']
]

const lifecycleLanes = [
  ['checkout-create', 'Checkout order creation', 'critical', 'Razorpay test order ID; amount/plan match; rate-limit test'],
  ['payment-verify', 'Client verification after payment', 'critical', 'Valid signature success; invalid signature rejection; plan upgrade DB proof'],
  ['webhook-activation', 'Webhook activation and failure updates', 'critical', 'Webhook event ID; PAID/FAILED order proof; replay behavior'],
  ['refund-cancel', 'Cancellation/refund handling', 'high', 'Policy screenshot; manual refund runbook; downgrade proof'],
  ['renewal-failure', 'Renewal failure and retry policy', 'high', 'Retry policy; failed payment notice; grace period proof'],
  ['invoice-tax', 'Invoice, GST and receipt readiness', 'medium', 'Receipt email; finance approval; invoice/GST note']
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.31-payment-lifecycle-readiness',
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length,
    lifecycleLanes: lifecycleLanes.length,
    highRiskLanes: lifecycleLanes.filter((lane) => lane[2] === 'critical' || lane[2] === 'high').length
  },
  controls: controls.map(([id, label, status, note]) => ({ id, label, status, note })),
  lifecycleLanes: lifecycleLanes.map(([id, label, impact, evidence]) => ({ id, label, impact, evidence })),
  billingSafetyRules: ['Verified signature before plan upgrade', 'Idempotent webhook handling', 'No secret exposure to client', 'Manual refunds/cancellations for MVP', 'Save evidence for success/failure/invalid signatures'],
  launchEvidence: ['Admin screenshot', 'JSON/CSV evidence', 'Razorpay sandbox success proof', 'Failed payment proof', 'Invalid signature 401 proof']
}

const controlRows = [
  ['control_id', 'label', 'status', 'note'],
  ...controls.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]
const laneRows = [
  ['lane_id', 'label', 'impact', 'required_evidence'],
  ...lifecycleLanes.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]

writeFileSync(join(outputDir, 'payment-lifecycle-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'payment-lifecycle-controls.csv'), controlRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'payment-lifecycle-lanes.csv'), laneRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Payment lifecycle readiness evidence written to ${outputDir}`)
console.log(`Lanes: ${report.summary.lifecycleLanes} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
