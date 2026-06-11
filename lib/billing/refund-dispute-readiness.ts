export type RefundDisputeStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type RefundDisputePriority = 'P0' | 'P1' | 'P2'

export type RefundDisputeControl = {
  id: string
  priority: RefundDisputePriority
  label: string
  status: RefundDisputeStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type RefundDisputeLane = {
  id: string
  priority: RefundDisputePriority
  lane: 'CANCEL' | 'REFUND' | 'FAILED_PAYMENT' | 'DUPLICATE_PAYMENT' | 'CHARGEBACK' | 'DISPUTE'
  trigger: string
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

export const refundDisputeLanes: RefundDisputeLane[] = [
  {
    id: 'subscription-cancel',
    priority: 'P0',
    lane: 'CANCEL',
    trigger: 'User cancels paid plan, admin disables renewal, or payment lifecycle marks subscription as cancelled.',
    owner: 'Finance + Support',
    requiredEvidence: 'User ID, plan, cancellation timestamp, renewal-stop proof, entitlement downgrade behavior and support confirmation.',
    safetyRule: 'Do not delete billing history during cancellation; keep receipts, refund notes and audit trail visible to the account owner.'
  },
  {
    id: 'approved-refund',
    priority: 'P0',
    lane: 'REFUND',
    trigger: 'Support/finance approves full or partial refund after verifying server-side payment and entitlement state.',
    owner: 'Finance',
    requiredEvidence: 'Payment reference, refund reason, amount, approval owner, gateway refund status, receipt/invoice reference and user notice.',
    safetyRule: 'Never promise settled refund before payment provider confirms; show pending/processing status until provider evidence exists.'
  },
  {
    id: 'failed-payment-no-access',
    priority: 'P0',
    lane: 'FAILED_PAYMENT',
    trigger: 'Checkout, renewal or webhook marks payment as failed, expired or signature-invalid.',
    owner: 'Product + Support',
    requiredEvidence: 'Failure reason, masked gateway reference, entitlement remains free/previous state, retry link behavior and user-safe message.',
    safetyRule: 'Do not grant paid entitlement from client-side success screens or unverified webhook payloads.'
  },
  {
    id: 'duplicate-payment',
    priority: 'P1',
    lane: 'DUPLICATE_PAYMENT',
    trigger: 'Same user pays twice for same plan window or gateway sends duplicate success/webhook event.',
    owner: 'Finance + Engineering',
    requiredEvidence: 'Idempotency key, duplicate reference, original receipt, duplicate receipt/refund path and reconciliation note.',
    safetyRule: 'Use idempotent payment processing and audit trail before issuing duplicate refund or extra entitlement.'
  },
  {
    id: 'chargeback-response',
    priority: 'P1',
    lane: 'CHARGEBACK',
    trigger: 'Bank, card network or payment provider opens a payment dispute/chargeback.',
    owner: 'Finance + Support',
    requiredEvidence: 'Receipt, masked user/account activity, delivery/access proof, support communication, refund history and response deadline.',
    safetyRule: 'Only submit privacy-safe evidence; never expose raw documents, OTPs, UPI PINs, CVV, passwords or private complaint drafts.'
  },
  {
    id: 'billing-support-dispute',
    priority: 'P2',
    lane: 'DISPUTE',
    trigger: 'User says billing amount, tax invoice, refund timeline or plan access is wrong.',
    owner: 'Support',
    requiredEvidence: 'Ticket ID, masked billing references, timeline, current plan state, invoice/receipt IDs and next support action.',
    safetyRule: 'Support macros must avoid blame, false guarantees and unverified legal/tax statements.'
  }
]

export function getRefundDisputeReadinessReport() {
  const mode = env('REFUND_DISPUTE_MODE', 'dry_run')
  const modeSafe = allowedModes.includes(mode)
  const ownerReady = configured('REFUND_DISPUTE_OWNER')
  const refundPolicyReviewed = truthy(env('REFUND_POLICY_REVIEWED'))
  const cancellationReviewed = truthy(env('CANCELLATION_FLOW_REVIEWED'))
  const failedPaymentReviewed = truthy(env('FAILED_PAYMENT_FLOW_REVIEWED'))
  const duplicateReviewed = truthy(env('DUPLICATE_PAYMENT_REVIEWED'))
  const chargebackReviewed = truthy(env('CHARGEBACK_RESPONSE_REVIEWED'))
  const supportMacrosReviewed = truthy(env('BILLING_SUPPORT_MACROS_REVIEWED'))
  const evidenceReviewed = truthy(env('REFUND_DISPUTE_EVIDENCE_REVIEWED'))

  const controls: RefundDisputeControl[] = [
    {
      id: 'owner-assigned',
      priority: 'P0',
      label: 'Refund/dispute owner assigned',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `REFUND_DISPUTE_OWNER=${env('REFUND_DISPUTE_OWNER') || 'empty'}`,
      passCondition: 'A finance/support owner is responsible for refund, cancellation, duplicate payment and chargeback decisions.',
      evidenceRequired: 'Owner/team recorded in env, release notes or admin screenshot.',
      riskIfSkipped: 'Paid users can raise urgent billing problems without a clear owner, causing trust and payment disputes.'
    },
    {
      id: 'mode-safe',
      priority: 'P0',
      label: 'Refund/dispute mode is safe',
      status: modeSafe ? 'READY_TO_TEST' : 'BLOCKED',
      envValue: `REFUND_DISPUTE_MODE=${mode}`,
      passCondition: 'Mode is dry_run, manual_review, enabled or disabled. Keep dry_run/manual_review until payment and support evidence is saved.',
      evidenceRequired: 'Masked env screenshot or release evidence showing mode.',
      riskIfSkipped: 'Unsafe mode can trigger wrong refunds, cancellation messages or user entitlement changes.'
    },
    {
      id: 'refund-policy-reviewed',
      priority: 'P0',
      label: 'Refund policy reviewed',
      status: refundPolicyReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `REFUND_POLICY_REVIEWED=${env('REFUND_POLICY_REVIEWED', 'false')}`,
      passCondition: 'Refund eligibility, partial refund, duplicate payment and manual review policy are reviewed before paid traffic.',
      evidenceRequired: 'Refund policy screenshot, support macro and finance/legal signoff.',
      riskIfSkipped: 'Users may get inconsistent refund promises or payment provider disputes.'
    },
    {
      id: 'cancellation-reviewed',
      priority: 'P0',
      label: 'Cancellation flow reviewed',
      status: cancellationReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `CANCELLATION_FLOW_REVIEWED=${env('CANCELLATION_FLOW_REVIEWED', 'false')}`,
      passCondition: 'Cancel flow stops renewal, preserves billing history and downgrades entitlements safely.',
      evidenceRequired: 'Cancel screenshot, entitlement state proof and user notification sample.',
      riskIfSkipped: 'Users can be charged unexpectedly or lose access/history incorrectly.'
    },
    {
      id: 'failed-payment-reviewed',
      priority: 'P0',
      label: 'Failed payment flow reviewed',
      status: failedPaymentReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `FAILED_PAYMENT_FLOW_REVIEWED=${env('FAILED_PAYMENT_FLOW_REVIEWED', 'false')}`,
      passCondition: 'Failed/expired/signature-invalid payments do not unlock premium and show safe retry guidance.',
      evidenceRequired: 'Failed payment screenshot, webhook log and entitlement proof.',
      riskIfSkipped: 'Fraud or webhook errors can grant unpaid premium access or confuse paid users.'
    },
    {
      id: 'duplicate-payment-reviewed',
      priority: 'P1',
      label: 'Duplicate payment handling reviewed',
      status: duplicateReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `DUPLICATE_PAYMENT_REVIEWED=${env('DUPLICATE_PAYMENT_REVIEWED', 'false')}`,
      passCondition: 'Duplicate webhook/payment events are idempotent and have a clear refund/support path.',
      evidenceRequired: 'Duplicate event dry-run, idempotency proof and support note.',
      riskIfSkipped: 'Duplicate payments can create double entitlement, wrong refunds or reconciliation mismatch.'
    },
    {
      id: 'chargeback-reviewed',
      priority: 'P1',
      label: 'Chargeback response reviewed',
      status: chargebackReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `CHARGEBACK_RESPONSE_REVIEWED=${env('CHARGEBACK_RESPONSE_REVIEWED', 'false')}`,
      passCondition: 'Chargeback evidence pack is privacy-safe and response deadlines have owner coverage.',
      evidenceRequired: 'Sample chargeback response pack with redacted data.',
      riskIfSkipped: 'Payment disputes can be lost or private user data can leak in evidence.'
    },
    {
      id: 'support-macros-reviewed',
      priority: 'P1',
      label: 'Billing support macros reviewed',
      status: supportMacrosReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `BILLING_SUPPORT_MACROS_REVIEWED=${env('BILLING_SUPPORT_MACROS_REVIEWED', 'false')}`,
      passCondition: 'Support macros explain refund/cancel/failed payment timelines without false guarantees or sensitive data requests.',
      evidenceRequired: 'Support macro samples and reviewer signoff.',
      riskIfSkipped: 'Support can accidentally ask for OTP/UPI PIN/CVV or promise wrong settlement timelines.'
    },
    {
      id: 'evidence-reviewed',
      priority: 'P2',
      label: 'Refund/dispute evidence pack reviewed',
      status: evidenceReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `REFUND_DISPUTE_EVIDENCE_REVIEWED=${env('REFUND_DISPUTE_EVIDENCE_REVIEWED', 'false')}`,
      passCondition: 'Evidence generated by npm run refund-dispute:readiness is saved with launch QA artifacts.',
      evidenceRequired: 'JSON/CSV/MD artifacts plus /admin/refund-dispute-readiness screenshot.',
      riskIfSkipped: 'Launch team cannot prove billing dispute readiness before enabling paid production traffic.'
    }
  ]

  const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((control) => control.status === 'BLOCKED').length

  return {
    version: '3.0.57-refund-dispute-readiness',
    generatedAt: new Date().toISOString(),
    mode,
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      refundDisputeLanes: refundDisputeLanes.length
    },
    controls,
    refundDisputeLanes,
    launchPolicy: [
      'Keep REFUND_DISPUTE_MODE=dry_run or manual_review until refund, cancellation, failed-payment and support evidence is saved.',
      'Refund/cancel decisions must be based on verified server-side payment and subscription state, not client-side UI state.',
      'Never ask users for OTPs, UPI PINs, CVV, passwords, full card numbers or raw bank details during billing support.',
      'Chargeback evidence must be redacted, privacy-safe and limited to receipt, access, support and payment proof.',
      'Refund notes, credit notes and entitlement changes need audit trail coverage before production use.'
    ]
  }
}
