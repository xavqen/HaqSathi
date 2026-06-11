import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.INVOICE_TAX_EVIDENCE_DIR || './artifacts/invoice-tax-readiness'
mkdirSync(outputDir, { recursive: true })

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
const configured = (name) => {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const allowedModes = ['dry_run', 'manual_review', 'issue', 'disabled']
const mode = env('INVOICE_TAX_MODE', 'dry_run')

const controls = [
  ['owner-assigned', 'P0', 'Finance/billing owner assigned', configured('INVOICE_TAX_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `INVOICE_TAX_OWNER=${env('INVOICE_TAX_OWNER') || 'empty'}`],
  ['mode-safe', 'P0', 'Invoice/tax mode is safe', allowedModes.includes(mode) ? 'READY_TO_TEST' : 'BLOCKED', `INVOICE_TAX_MODE=${mode}`],
  ['seller-profile-reviewed', 'P0', 'Seller/legal billing profile reviewed', enabled('INVOICE_TAX_SELLER_PROFILE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `INVOICE_TAX_SELLER_PROFILE_REVIEWED=${env('INVOICE_TAX_SELLER_PROFILE_REVIEWED', 'false')}`],
  ['numbering-reviewed', 'P0', 'Receipt/invoice numbering reviewed', enabled('INVOICE_TAX_NUMBERING_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `INVOICE_TAX_NUMBERING_REVIEWED=${env('INVOICE_TAX_NUMBERING_REVIEWED', 'false')}`],
  ['receipt-template-reviewed', 'P0', 'Receipt template reviewed', enabled('INVOICE_TAX_RECEIPT_TEMPLATE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `INVOICE_TAX_RECEIPT_TEMPLATE_REVIEWED=${env('INVOICE_TAX_RECEIPT_TEMPLATE_REVIEWED', 'false')}`],
  ['refund-note-reviewed', 'P1', 'Refund/credit note flow reviewed', enabled('INVOICE_TAX_REFUND_NOTE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `INVOICE_TAX_REFUND_NOTE_REVIEWED=${env('INVOICE_TAX_REFUND_NOTE_REVIEWED', 'false')}`],
  ['gst-policy-reviewed', 'P1', 'GST/tax policy reviewed', enabled('INVOICE_TAX_GST_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `INVOICE_TAX_GST_REVIEWED=${env('INVOICE_TAX_GST_REVIEWED', 'false')}`],
  ['access-reviewed', 'P1', 'Billing document access reviewed', enabled('INVOICE_TAX_ACCESS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `INVOICE_TAX_ACCESS_REVIEWED=${env('INVOICE_TAX_ACCESS_REVIEWED', 'false')}`],
  ['evidence-reviewed', 'P2', 'Invoice/tax evidence pack reviewed', enabled('INVOICE_TAX_EVIDENCE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `INVOICE_TAX_EVIDENCE_REVIEWED=${env('INVOICE_TAX_EVIDENCE_REVIEWED', 'false')}`]
]

const lanes = [
  ['payment-receipt', 'P0', 'RECEIPT', 'Successful paid checkout or renewal after verified server-side payment state', 'masked user identifier; plan name; amount; currency; payment reference; receipt number; support contact', 'Never expose full card/bank data, OTP, UPI PIN, CVV, tokens or gateway signatures'],
  ['tax-invoice', 'P0', 'TAX_INVOICE', 'Customer requests invoice or business/GST details are collected through billing profile flow', 'seller legal name; billing address; invoice number; date; plan; taxable value; tax component; total; buyer details', 'GSTIN/address/business details must stay limited to billing owner and finance/admin permissions'],
  ['refund-note', 'P0', 'REFUND_NOTE', 'Refund approved through manual or gateway-backed flow', 'original receipt/invoice reference; refund amount; reason; gateway reference; approval owner; expected timeline', 'Do not promise settlement before gateway confirmation'],
  ['credit-note', 'P1', 'CREDIT_NOTE', 'Tax invoice correction, downgrade adjustment or partial refund', 'original invoice reference; corrected amount; reason; date; tax adjustment; finance reviewer signoff', 'Require audit trail and finance review before sending'],
  ['billing-export', 'P1', 'EXPORT', 'Finance/admin export for reconciliation or dispute review', 'date range; masked user reference; plan; status; invoice/receipt IDs; redacted gateway references', 'Redact personal details by default and restrict exports to finance/admin roles']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length
const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.56-invoice-tax-readiness',
  mode,
  summary: { totalControls: controls.length, ready, manualRequired, blocked, invoiceTaxLanes: lanes.length },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  invoiceTaxLanes: lanes.map(([id, priority, documentType, trigger, requiredFields, safetyRule]) => ({ id, priority, documentType, trigger, requiredFields, safetyRule })),
  outputDir,
  nextAction: blocked ? 'Fix blocked invoice/tax mode.' : manualRequired ? 'Complete P0 seller profile, numbering and receipt template review.' : 'Invoice/tax gates are ready.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'invoice-tax-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'invoice-tax-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'invoice-tax-lanes.csv'), csv([['id', 'priority', 'document_type', 'trigger', 'required_fields', 'safety_rule'], ...lanes]))
writeFileSync(join(outputDir, 'receipt-template-checklist.md'), `# Receipt template checklist\n\n- Plan name, amount, currency and date are visible.\n- Payment/reference IDs are masked and support-safe.\n- No OTP, UPI PIN, CVV, full card/bank data or raw gateway payload appears.\n- Support, cancellation and refund help links are visible.\n`)
writeFileSync(join(outputDir, 'gst-tax-review-checklist.md'), `# GST/tax review checklist\n\n- Seller legal profile reviewed.\n- Invoice numbering policy reviewed.\n- GSTIN/buyer business fields are optional and access-controlled.\n- Tax wording is reviewed by finance/legal before production issue mode.\n`)
writeFileSync(join(outputDir, 'refund-credit-note-matrix.md'), `# Refund and credit-note matrix\n\n- Full refund after successful payment.\n- Partial refund after plan downgrade.\n- Failed payment with no receipt issued.\n- Duplicate payment support case.\n- Credit note for corrected invoice.\n`)
writeFileSync(join(outputDir, 'billing-export-safety.md'), `# Billing export safety\n\n- Exports use masked user references by default.\n- Finance/admin RBAC required.\n- Audit trail records export owner, reason and date range.\n- Raw provider payloads and private tokens are never exported.\n`)

console.log(`✅ Invoice/tax evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Lanes: ${lanes.length}`)
