export type PaymentReconciliationStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type PaymentReconciliationPriority = 'P0' | 'P1' | 'P2'

export type PaymentReconciliationControl = {
  id: string
  priority: PaymentReconciliationPriority
  label: string
  status: PaymentReconciliationStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type PaymentReconciliationLane = {
  id: string
  priority: PaymentReconciliationPriority
  lane: 'GATEWAY_TO_DB' | 'DB_TO_INVOICE' | 'REFUND_TO_CREDIT_NOTE' | 'PAYOUT_SETTLEMENT' | 'ANOMALY_REVIEW' | 'MONTH_END_EXPORT'
  source: string
  target: string
  owner: string
  requiredEvidence: string
  safetyRule: string
}

const truthy = (value?: string) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(value || '')
const env = (key: string, fallback = '') => process.env[key] || fallback
const configured = (key: string) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

const allowedModes = ['dry_run', 'manual_review', 'enabled', 'disabled']

export const paymentReconciliationLanes: PaymentReconciliationLane[] = [
  {
    id: 'gateway-payment-to-db-order',
    priority: 'P0',
    lane: 'GATEWAY_TO_DB',
    source: 'Razorpay payment/order/webhook event',
    target: 'PaymentOrder and Subscription state in database',
    owner: 'Finance + Engineering',
    requiredEvidence: 'Gateway payment ID, webhook event ID, DB payment row, masked user ID, amount, currency, status and processed timestamp.',
    safetyRule: 'Never trust frontend success alone. Reconcile only server-verified gateway status and webhook signature events.'
  },
  {
    id: 'db-paid-to-invoice-receipt',
    priority: 'P0',
    lane: 'DB_TO_INVOICE',
    source: 'Paid DB order/subscription row',
    target: 'Receipt/invoice/tax document record',
    owner: 'Finance',
    requiredEvidence: 'Paid order total, invoice/receipt number, tax/discount totals, customer-visible billing document and access/RBAC proof.',
    safetyRule: 'Receipt/invoice totals must match paid server-side amount; do not expose raw gateway payload or private identifiers.'
  },
  {
    id: 'refund-to-refund-note',
    priority: 'P1',
    lane: 'REFUND_TO_CREDIT_NOTE',
    source: 'Gateway refund or manual refund approval',
    target: 'Refund note, credit note and entitlement downgrade history',
    owner: 'Finance + Support',
    requiredEvidence: 'Refund reference, amount, reason, approval owner, credit/refund note ID and user notification copy.',
    safetyRule: 'Show refund as processing until gateway confirms; preserve billing history and audit trail after cancellation/refund.'
  },
  {
    id: 'gateway-payout-to-bank',
    priority: 'P1',
    lane: 'PAYOUT_SETTLEMENT',
    source: 'Gateway settlement/payout report',
    target: 'Internal finance export and bank reconciliation note',
    owner: 'Founder/Finance',
    requiredEvidence: 'Settlement date, payout ID, gross, fees, tax, refunds, disputes, net deposit and matched finance export row.',
    safetyRule: 'Store only masked finance evidence in app artifacts; keep bank statements outside public/admin screenshots unless redacted.'
  },
  {
    id: 'anomaly-review',
    priority: 'P1',
    lane: 'ANOMALY_REVIEW',
    source: 'Mismatch between gateway, DB, invoice, refund, payout or entitlement data',
    target: 'Manual reconciliation exception queue',
    owner: 'Finance + Engineering',
    requiredEvidence: 'Mismatch type, payment IDs, impacted user count, safe summary, assigned owner and resolution note.',
    safetyRule: 'Do not auto-refund, auto-upgrade or auto-delete records from anomaly checks without human approval.'
  },
  {
    id: 'month-end-export',
    priority: 'P2',
    lane: 'MONTH_END_EXPORT',
    source: 'Billing, refund, invoice and payout data',
    target: 'Month-end finance export for records and tax review',
    owner: 'Finance',
    requiredEvidence: 'CSV/JSON export totals, date range, currency, masked customer references and reviewer signoff.',
    safetyRule: 'Finance exports must exclude OTPs, passwords, UPI PINs, CVV, raw documents, support secrets and full bank/card data.'
  }
]

export function getPaymentReconciliationReadinessReport() {
  const mode = env('PAYMENT_RECONCILIATION_MODE', 'dry_run')
  const modeSafe = allowedModes.includes(mode)
  const ownerReady = configured('PAYMENT_RECONCILIATION_OWNER')
  const dashboardReviewed = truthy(env('PAYMENT_RECON_DASHBOARD_REVIEWED'))
  const dbMatchReviewed = truthy(env('PAYMENT_RECON_DB_MATCH_REVIEWED'))
  const invoiceMatchReviewed = truthy(env('PAYMENT_RECON_INVOICE_MATCH_REVIEWED'))
  const refundMatchReviewed = truthy(env('PAYMENT_RECON_REFUND_MATCH_REVIEWED'))
  const payoutMatchReviewed = truthy(env('PAYMENT_RECON_PAYOUT_MATCH_REVIEWED'))
  const anomalyReviewed = truthy(env('PAYMENT_RECON_ANOMALY_REVIEWED'))
  const evidenceReviewed = truthy(env('PAYMENT_RECON_EVIDENCE_REVIEWED'))
  const razorpayConfigured = configured('RAZORPAY_KEY_ID') && configured('RAZORPAY_KEY_SECRET') && configured('RAZORPAY_WEBHOOK_SECRET')

  const controls: PaymentReconciliationControl[] = [
    {
      id: 'owner-assigned',
      priority: 'P0',
      label: 'Payment reconciliation owner assigned',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `PAYMENT_RECONCILIATION_OWNER=${env('PAYMENT_RECONCILIATION_OWNER') || 'empty'}`,
      passCondition: 'A finance/engineering owner is responsible for payment, invoice, refund, payout and anomaly reconciliation.',
      evidenceRequired: 'Owner/team recorded in env, release notes or admin screenshot.',
      riskIfSkipped: 'Paid launch can create money mismatches without a clear owner to resolve them.'
    },
    {
      id: 'mode-safe',
      priority: 'P0',
      label: 'Payment reconciliation mode is safe',
      status: modeSafe ? 'READY_TO_TEST' : 'BLOCKED',
      envValue: `PAYMENT_RECONCILIATION_MODE=${mode}`,
      passCondition: 'Mode is dry_run, manual_review, enabled or disabled. Keep dry_run/manual_review until real gateway, DB and billing evidence is saved.',
      evidenceRequired: 'Masked env screenshot or release evidence showing mode.',
      riskIfSkipped: 'Unsafe mode can create wrong finance decisions from incomplete reconciliation data.'
    },
    {
      id: 'gateway-ready',
      priority: 'P0',
      label: 'Razorpay gateway evidence can be tested',
      status: razorpayConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `RAZORPAY=${razorpayConfigured ? 'configured' : 'missing'}`,
      passCondition: 'Razorpay keys and webhook secret exist so test payments, refunds, failures and settlements can be matched.',
      evidenceRequired: 'Masked Razorpay test dashboard screenshot plus webhook config proof.',
      riskIfSkipped: 'Reconciliation cannot prove gateway truth against database and billing records.'
    },
    {
      id: 'dashboard-reviewed',
      priority: 'P0',
      label: 'Gateway dashboard export reviewed',
      status: dashboardReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `PAYMENT_RECON_DASHBOARD_REVIEWED=${env('PAYMENT_RECON_DASHBOARD_REVIEWED', 'false')}`,
      passCondition: 'Razorpay dashboard/export fields needed for payment, refund, dispute and payout matching are reviewed.',
      evidenceRequired: 'Masked dashboard/export screenshot and reviewer signoff.',
      riskIfSkipped: 'Finance cannot trace provider truth when user support or tax questions appear.'
    },
    {
      id: 'db-match-reviewed',
      priority: 'P0',
      label: 'Gateway payment matches database order',
      status: dbMatchReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `PAYMENT_RECON_DB_MATCH_REVIEWED=${env('PAYMENT_RECON_DB_MATCH_REVIEWED', 'false')}`,
      passCondition: 'At least one paid, failed and duplicate/webhook-retry event matches DB state without granting unverified access.',
      evidenceRequired: 'PaymentOrder/Subscription rows and masked gateway references.',
      riskIfSkipped: 'Users can get incorrect paid access or support can see mismatched payment state.'
    },
    {
      id: 'invoice-match-reviewed',
      priority: 'P0',
      label: 'Paid order matches receipt/invoice total',
      status: invoiceMatchReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `PAYMENT_RECON_INVOICE_MATCH_REVIEWED=${env('PAYMENT_RECON_INVOICE_MATCH_REVIEWED', 'false')}`,
      passCondition: 'Receipt/invoice total, currency, discount, tax and customer-visible plan match the paid DB order.',
      evidenceRequired: 'Sample paid order, receipt/invoice screenshot and total comparison.',
      riskIfSkipped: 'Wrong receipts, tax errors or user billing confusion can occur.'
    },
    {
      id: 'refund-match-reviewed',
      priority: 'P1',
      label: 'Refund and credit/refund note match',
      status: refundMatchReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `PAYMENT_RECON_REFUND_MATCH_REVIEWED=${env('PAYMENT_RECON_REFUND_MATCH_REVIEWED', 'false')}`,
      passCondition: 'Refund amount and status match refund note, support timeline and entitlement state.',
      evidenceRequired: 'Masked refund proof, refund note, support macro and entitlement downgrade behavior.',
      riskIfSkipped: 'Refund promises, support replies and finance records can disagree.'
    },
    {
      id: 'payout-match-reviewed',
      priority: 'P1',
      label: 'Gateway payout/settlement match reviewed',
      status: payoutMatchReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `PAYMENT_RECON_PAYOUT_MATCH_REVIEWED=${env('PAYMENT_RECON_PAYOUT_MATCH_REVIEWED', 'false')}`,
      passCondition: 'Gross payments, gateway fees, refunds/disputes and net payout have a review/export path.',
      evidenceRequired: 'Masked payout/settlement report and internal finance export sample.',
      riskIfSkipped: 'Revenue, fees, refunds and payout totals can drift without detection.'
    },
    {
      id: 'anomaly-reviewed',
      priority: 'P1',
      label: 'Mismatch/anomaly review workflow ready',
      status: anomalyReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `PAYMENT_RECON_ANOMALY_REVIEWED=${env('PAYMENT_RECON_ANOMALY_REVIEWED', 'false')}`,
      passCondition: 'Mismatch cases create manual review evidence without auto-refunding, auto-upgrading or deleting data.',
      evidenceRequired: 'Anomaly queue/template and escalation owner proof.',
      riskIfSkipped: 'The app can hide money mismatches until users or payment provider report them.'
    },
    {
      id: 'evidence-reviewed',
      priority: 'P2',
      label: 'Payment reconciliation evidence pack reviewed',
      status: evidenceReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `PAYMENT_RECON_EVIDENCE_REVIEWED=${env('PAYMENT_RECON_EVIDENCE_REVIEWED', 'false')}`,
      passCondition: 'Evidence generated by npm run payment-reconciliation:readiness is saved with launch QA artifacts.',
      evidenceRequired: 'JSON/CSV/MD artifacts plus /admin/payment-reconciliation screenshot.',
      riskIfSkipped: 'Launch team cannot prove money-flow readiness before paid public traffic.'
    }
  ]

  const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((control) => control.status === 'BLOCKED').length

  return {
    version: '3.0.58-payment-reconciliation-readiness',
    generatedAt: new Date().toISOString(),
    mode,
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      reconciliationLanes: paymentReconciliationLanes.length
    },
    controls,
    paymentReconciliationLanes,
    launchPolicy: [
      'Keep PAYMENT_RECONCILIATION_MODE=dry_run or manual_review until real gateway, DB, invoice, refund and payout evidence is saved.',
      'Every paid/failed/refunded payment must reconcile from gateway truth to database state before support or entitlement decisions.',
      'Never expose OTPs, UPI PINs, CVV, passwords, webhook signatures, raw gateway payloads, full card/bank data or signed vault URLs in reconciliation artifacts.',
      'Anomalies must create a manual review item; do not auto-refund, auto-upgrade or delete records from mismatch checks.',
      'Month-end exports must be masked, date-scoped and reviewed by finance before tax/accounting use.'
    ]
  }
}
