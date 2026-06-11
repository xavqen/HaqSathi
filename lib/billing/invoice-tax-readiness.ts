export type InvoiceTaxStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type InvoiceTaxPriority = 'P0' | 'P1' | 'P2'

export type InvoiceTaxControl = {
  id: string
  priority: InvoiceTaxPriority
  label: string
  status: InvoiceTaxStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type InvoiceTaxLane = {
  id: string
  priority: InvoiceTaxPriority
  documentType: 'RECEIPT' | 'TAX_INVOICE' | 'REFUND_NOTE' | 'CREDIT_NOTE' | 'EXPORT'
  trigger: string
  requiredFields: string
  safetyRule: string
}

const truthy = (value?: string) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(value || '')
const env = (key: string, fallback = '') => process.env[key] || fallback
const configured = (key: string) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

const allowedModes = ['dry_run', 'manual_review', 'issue', 'disabled']

export const invoiceTaxLanes: InvoiceTaxLane[] = [
  {
    id: 'payment-receipt',
    priority: 'P0',
    documentType: 'RECEIPT',
    trigger: 'Successful paid checkout or subscription renewal after verified server-side payment state.',
    requiredFields: 'masked user identifier, plan name, amount, currency, payment reference, receipt number and support contact.',
    safetyRule: 'Never expose full card/bank data, OTP, UPI PIN, payment tokens, webhook payload secrets or raw gateway signatures.'
  },
  {
    id: 'tax-invoice',
    priority: 'P0',
    documentType: 'TAX_INVOICE',
    trigger: 'Paid customer requests invoice or business/GST details are collected through a reviewed billing profile flow.',
    requiredFields: 'seller legal name, billing address, invoice number, date, plan, taxable value, tax component, total, buyer name and optional GSTIN if valid.',
    safetyRule: 'GSTIN, address and business details must be user-provided, editable and visible only to the account/billing owner and admins with finance permission.'
  },
  {
    id: 'refund-note',
    priority: 'P0',
    documentType: 'REFUND_NOTE',
    trigger: 'Refund approved through manual or gateway-backed flow.',
    requiredFields: 'original receipt/invoice reference, refund amount, refund reason, gateway reference, approval owner and expected settlement timeline.',
    safetyRule: 'Refund notes must not promise settlement before gateway confirmation; show status as pending until payment provider confirms.'
  },
  {
    id: 'credit-note',
    priority: 'P1',
    documentType: 'CREDIT_NOTE',
    trigger: 'Tax invoice correction, downgrade adjustment or partial refund where a credit note is required by finance policy.',
    requiredFields: 'original invoice reference, corrected amount, reason, date, tax adjustment and finance reviewer signoff.',
    safetyRule: 'Credit notes need audit trail and finance review before being sent to users or used for accounting evidence.'
  },
  {
    id: 'billing-export',
    priority: 'P1',
    documentType: 'EXPORT',
    trigger: 'Admin/finance export for reconciliation, support dispute review or monthly accounting close.',
    requiredFields: 'date range, masked user reference, plan, payment/refund status, invoice/receipt IDs and redacted gateway references.',
    safetyRule: 'Exports must redact personal details by default and remain limited to finance/admin roles with audit trail coverage.'
  }
]

export function getInvoiceTaxReadinessReport() {
  const mode = env('INVOICE_TAX_MODE', 'dry_run')
  const modeSafe = allowedModes.includes(mode)
  const ownerReady = configured('INVOICE_TAX_OWNER')
  const sellerReviewed = truthy(env('INVOICE_TAX_SELLER_PROFILE_REVIEWED'))
  const numberingReviewed = truthy(env('INVOICE_TAX_NUMBERING_REVIEWED'))
  const receiptReviewed = truthy(env('INVOICE_TAX_RECEIPT_TEMPLATE_REVIEWED'))
  const refundReviewed = truthy(env('INVOICE_TAX_REFUND_NOTE_REVIEWED'))
  const gstReviewed = truthy(env('INVOICE_TAX_GST_REVIEWED'))
  const accessReviewed = truthy(env('INVOICE_TAX_ACCESS_REVIEWED'))
  const evidenceReviewed = truthy(env('INVOICE_TAX_EVIDENCE_REVIEWED'))

  const controls: InvoiceTaxControl[] = [
    {
      id: 'owner-assigned',
      priority: 'P0',
      label: 'Finance/billing owner assigned',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `INVOICE_TAX_OWNER=${env('INVOICE_TAX_OWNER') || 'empty'}`,
      passCondition: 'A finance/product owner is responsible for invoice, receipt, refund note and tax evidence before launch.',
      evidenceRequired: 'Owner/team recorded in env, launch notes or admin screenshot.',
      riskIfSkipped: 'Users may pay successfully but support cannot issue consistent receipts, invoices or refund evidence.'
    },
    {
      id: 'mode-safe',
      priority: 'P0',
      label: 'Invoice/tax mode is safe',
      status: modeSafe ? 'READY_TO_TEST' : 'BLOCKED',
      envValue: `INVOICE_TAX_MODE=${mode}`,
      passCondition: 'Mode is dry_run, manual_review, issue or disabled. Keep dry_run/manual_review until legal/finance review is complete.',
      evidenceRequired: 'Masked env screenshot or release evidence showing selected mode.',
      riskIfSkipped: 'Unsafe mode can generate wrong invoices or expose billing data before review.'
    },
    {
      id: 'seller-profile-reviewed',
      priority: 'P0',
      label: 'Seller/legal billing profile reviewed',
      status: sellerReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `INVOICE_TAX_SELLER_PROFILE_REVIEWED=${env('INVOICE_TAX_SELLER_PROFILE_REVIEWED', 'false')}`,
      passCondition: 'Seller legal name, billing address, support email and tax registration policy are reviewed.',
      evidenceRequired: 'Finance/legal signoff or masked seller profile screenshot.',
      riskIfSkipped: 'Receipts and invoices can contain incorrect legal details, creating support and compliance risk.'
    },
    {
      id: 'numbering-reviewed',
      priority: 'P0',
      label: 'Receipt/invoice numbering reviewed',
      status: numberingReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `INVOICE_TAX_NUMBERING_REVIEWED=${env('INVOICE_TAX_NUMBERING_REVIEWED', 'false')}`,
      passCondition: 'Receipt, invoice, refund and credit-note IDs are unique, monotonic enough for support, and not guessable as private data.',
      evidenceRequired: 'Sample generated IDs plus collision/retry behavior proof.',
      riskIfSkipped: 'Duplicate invoice numbers or unclear refund references can break reconciliation and user trust.'
    },
    {
      id: 'receipt-template-reviewed',
      priority: 'P0',
      label: 'Receipt template reviewed',
      status: receiptReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `INVOICE_TAX_RECEIPT_TEMPLATE_REVIEWED=${env('INVOICE_TAX_RECEIPT_TEMPLATE_REVIEWED', 'false')}`,
      passCondition: 'Payment receipt template shows plan, amount, currency, date, masked references and support path without sensitive data.',
      evidenceRequired: 'Mobile/desktop receipt preview and email/PDF screenshot.',
      riskIfSkipped: 'Paid users may not receive enough proof for support, refund or accounting questions.'
    },
    {
      id: 'refund-note-reviewed',
      priority: 'P1',
      label: 'Refund/credit note flow reviewed',
      status: refundReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `INVOICE_TAX_REFUND_NOTE_REVIEWED=${env('INVOICE_TAX_REFUND_NOTE_REVIEWED', 'false')}`,
      passCondition: 'Refund note, credit note and failed-payment communication are reviewed with payment lifecycle evidence.',
      evidenceRequired: 'Refund test case, gateway reference, support macro and user-facing status screenshot.',
      riskIfSkipped: 'Refund disputes can become confusing and support may promise incorrect settlement timelines.'
    },
    {
      id: 'gst-policy-reviewed',
      priority: 'P1',
      label: 'GST/tax policy reviewed',
      status: gstReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `INVOICE_TAX_GST_REVIEWED=${env('INVOICE_TAX_GST_REVIEWED', 'false')}`,
      passCondition: 'GST/tax collection, invoice wording and buyer GSTIN handling are reviewed by a qualified person before production issue mode.',
      evidenceRequired: 'Legal/finance note, sample tax invoice and GSTIN validation proof if enabled.',
      riskIfSkipped: 'Tax invoices can be misleading or unusable for business customers.'
    },
    {
      id: 'access-reviewed',
      priority: 'P1',
      label: 'Billing document access reviewed',
      status: accessReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `INVOICE_TAX_ACCESS_REVIEWED=${env('INVOICE_TAX_ACCESS_REVIEWED', 'false')}`,
      passCondition: 'Only account owner and finance/admin roles can view billing documents; exports are redacted and audited.',
      evidenceRequired: 'RBAC/admin screenshot, masked export and audit trail proof.',
      riskIfSkipped: 'Billing address, GSTIN or payment references can leak to support/growth/admin users unnecessarily.'
    },
    {
      id: 'evidence-reviewed',
      priority: 'P2',
      label: 'Invoice/tax evidence pack reviewed',
      status: evidenceReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `INVOICE_TAX_EVIDENCE_REVIEWED=${env('INVOICE_TAX_EVIDENCE_REVIEWED', 'false')}`,
      passCondition: 'Evidence generated by npm run invoice-tax:readiness is saved with release QA artifacts.',
      evidenceRequired: 'JSON/CSV/MD artifacts plus /admin/invoice-tax-readiness screenshot.',
      riskIfSkipped: 'Launch team cannot prove billing document readiness before taking paid traffic.'
    }
  ]

  const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((control) => control.status === 'BLOCKED').length

  return {
    version: '3.0.56-invoice-tax-readiness',
    generatedAt: new Date().toISOString(),
    mode,
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      invoiceTaxLanes: invoiceTaxLanes.length
    },
    controls,
    invoiceTaxLanes,
    launchPolicy: [
      'Keep INVOICE_TAX_MODE=dry_run or manual_review until receipt, refund, GST/tax and access-control evidence is saved.',
      'Receipt/invoice generation must use verified server-side payment state, not client-side plan flags.',
      'Never store or show OTPs, UPI PINs, CVV, full card/bank data, webhook signatures or provider private tokens in billing documents.',
      'GST/tax invoice wording should be reviewed by a qualified finance/legal person before production issue mode.',
      'Billing exports need RBAC, redaction and audit trail coverage before real customer data is exported.'
    ]
  }
}
