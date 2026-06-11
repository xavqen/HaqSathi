export type PaymentLifecycleStatus = 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type PaymentLifecycleControl = {
  id: string
  label: string
  status: PaymentLifecycleStatus
  adminValue: string
  userValue: string
  launchNote: string
}

export type PaymentLifecycleLane = {
  id: string
  label: string
  userImpact: 'low' | 'medium' | 'high' | 'critical'
  owner: string
  requiredEvidence: string[]
  failureMode: string
}

export type PaymentLifecycleReport = {
  generatedAt: string
  version: string
  summary: {
    totalControls: number
    ready: number
    manualRequired: number
    blocked: number
    lifecycleLanes: number
    highRiskLanes: number
  }
  controls: PaymentLifecycleControl[]
  lifecycleLanes: PaymentLifecycleLane[]
  billingSafetyRules: string[]
  launchEvidence: string[]
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(value))
}

function httpsOrEmpty(name: string) {
  const value = env(name)
  return !value || /^https:\/\//i.test(value)
}

function isPositiveNumber(name: string, fallback: string) {
  const value = Number(env(name, fallback))
  return Number.isFinite(value) && value > 0
}

export const paymentLifecycleLanes: PaymentLifecycleLane[] = [
  {
    id: 'checkout-create',
    label: 'Checkout order creation',
    userImpact: 'critical',
    owner: env('PAYMENT_LIFECYCLE_OWNER', 'Founder/Finance'),
    requiredEvidence: ['Razorpay test order ID', 'Local PaymentOrder ID', 'Amount/plan match screenshot', 'Rate-limit test'],
    failureMode: 'User pays wrong plan/amount or checkout creates duplicate pending orders.'
  },
  {
    id: 'payment-verify',
    label: 'Client verification after payment',
    userImpact: 'critical',
    owner: env('PAYMENT_LIFECYCLE_OWNER', 'Founder/Finance'),
    requiredEvidence: ['Valid signature success proof', 'Invalid signature rejection proof', 'Plan upgrade DB proof'],
    failureMode: 'Plan upgrades without valid signature or legitimate payment is not activated.'
  },
  {
    id: 'webhook-activation',
    label: 'Webhook activation and failure updates',
    userImpact: 'critical',
    owner: env('PAYMENT_LIFECYCLE_OWNER', 'Founder/Finance'),
    requiredEvidence: ['Webhook event ID', 'Signature verification proof', 'PAID and FAILED order screenshots'],
    failureMode: 'Async payment status changes are missed, causing locked plans or false active subscriptions.'
  },
  {
    id: 'refund-cancel',
    label: 'Cancellation/refund handling',
    userImpact: 'high',
    owner: env('PAYMENT_LIFECYCLE_OWNER', 'Founder/Finance'),
    requiredEvidence: ['Refund/cancel policy page screenshot', 'Manual refund runbook', 'Subscription downgrade proof'],
    failureMode: 'User asks for refund/cancel but support has no safe workflow or evidence trail.'
  },
  {
    id: 'renewal-failure',
    label: 'Renewal failure and retry policy',
    userImpact: 'high',
    owner: env('PAYMENT_LIFECYCLE_OWNER', 'Founder/Finance'),
    requiredEvidence: ['Retry policy config', 'Failed payment email proof', 'Grace period decision proof'],
    failureMode: 'Paid users lose access without notice or failed payments stay active indefinitely.'
  },
  {
    id: 'invoice-tax',
    label: 'Invoice, GST and receipt readiness',
    userImpact: 'medium',
    owner: env('PAYMENT_LIFECYCLE_OWNER', 'Founder/Finance'),
    requiredEvidence: ['Receipt email screenshot', 'Invoice/GST policy note', 'Finance owner approval'],
    failureMode: 'Users cannot get payment proof or tax/GST copy when requested.'
  }
]

export function getPaymentLifecycleReadinessReport(): PaymentLifecycleReport {
  const paymentMode = env('PAYMENT_LIFECYCLE_MODE', 'readiness')
  const dryRun = env('PAYMENT_DRY_RUN', 'true')
  const webhookMode = env('PAYMENT_WEBHOOK_MODE', 'verify')
  const refundMode = env('PAYMENT_REFUND_MODE', 'manual_review')
  const ownerReady = configured('PAYMENT_LIFECYCLE_OWNER')
  const razorpayReady = configured('RAZORPAY_KEY_ID') && configured('RAZORPAY_KEY_SECRET') && configured('RAZORPAY_WEBHOOK_SECRET')
  const publicKeyReady = configured('NEXT_PUBLIC_RAZORPAY_KEY_ID') || configured('RAZORPAY_KEY_ID')
  const webhookUrlSafe = httpsOrEmpty('PAYMENT_FAILURE_WEBHOOK_URL')
  const retryLimitReady = isPositiveNumber('PAYMENT_RETRY_LIMIT', '3')
  const graceReady = isPositiveNumber('PAYMENT_GRACE_PERIOD_DAYS', '3')
  const invoiceReady = configured('PAYMENT_RECEIPT_FROM_EMAIL') || configured('RESEND_FROM_EMAIL')
  const strictWebhook = webhookMode === 'verify'
  const unsafeLive = paymentMode === 'live' && dryRun !== 'false'

  const controls: PaymentLifecycleControl[] = [
    {
      id: 'payment-mode',
      label: 'Safe payment launch mode',
      status: unsafeLive ? 'BLOCKED' : 'READY_TO_TEST',
      adminValue: `PAYMENT_LIFECYCLE_MODE=${paymentMode}; PAYMENT_DRY_RUN=${dryRun}`,
      userValue: 'Payments should remain in readiness/test mode until Razorpay keys, webhook, receipt and cancellation evidence are saved.',
      launchNote: 'Use live only after sandbox payment, failed payment, webhook replay and cancellation runbook pass.'
    },
    {
      id: 'razorpay-credentials',
      label: 'Razorpay credentials and public key',
      status: razorpayReady && publicKeyReady ? 'READY_TO_TEST' : 'BLOCKED',
      adminValue: `key=${configured('RAZORPAY_KEY_ID') ? 'configured' : 'empty'}; public=${publicKeyReady ? 'configured' : 'empty'}; webhook=${configured('RAZORPAY_WEBHOOK_SECRET') ? 'configured' : 'empty'}`,
      userValue: 'Checkout, verification and webhook activation need real Razorpay test/live keys before public payments.',
      launchNote: 'Set test keys first. Never expose secret keys in NEXT_PUBLIC variables.'
    },
    {
      id: 'webhook-signature',
      label: 'Webhook signature enforcement',
      status: strictWebhook && configured('RAZORPAY_WEBHOOK_SECRET') ? 'READY_TO_TEST' : 'BLOCKED',
      adminValue: `PAYMENT_WEBHOOK_MODE=${webhookMode}; RAZORPAY_WEBHOOK_SECRET=${configured('RAZORPAY_WEBHOOK_SECRET') ? 'configured' : 'empty'}`,
      userValue: 'Subscription state must change only after Razorpay webhook signature verification or verified payment signature.',
      launchNote: 'Save a valid webhook event ID and an invalid signature rejection proof.'
    },
    {
      id: 'retry-grace',
      label: 'Failed payment retry and grace policy',
      status: retryLimitReady && graceReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      adminValue: `PAYMENT_RETRY_LIMIT=${env('PAYMENT_RETRY_LIMIT', '3')}; PAYMENT_GRACE_PERIOD_DAYS=${env('PAYMENT_GRACE_PERIOD_DAYS', '3')}`,
      userValue: 'Failed payments need a clear retry/grace rule so users are not surprised by access changes.',
      launchNote: 'Document whether failed renewal keeps access temporarily or downgrades immediately.'
    },
    {
      id: 'refund-cancel',
      label: 'Refund/cancel review mode',
      status: refundMode === 'auto' ? 'MANUAL_REQUIRED' : 'READY_TO_TEST',
      adminValue: `PAYMENT_REFUND_MODE=${refundMode}`,
      userValue: 'Refunds and cancellations should start as manual review until finance/support process is proven.',
      launchNote: 'Keep manual_review for MVP. Add evidence notes for every refund/cancel request.'
    },
    {
      id: 'invoice-receipt',
      label: 'Receipt and invoice sender',
      status: invoiceReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      adminValue: env('PAYMENT_RECEIPT_FROM_EMAIL') || env('RESEND_FROM_EMAIL') || 'empty',
      userValue: 'Users should receive or request a receipt/invoice after successful payment.',
      launchNote: 'Test inbox delivery and confirm GST/tax wording before paid launch.'
    },
    {
      id: 'finance-owner',
      label: 'Finance/support owner',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      adminValue: env('PAYMENT_LIFECYCLE_OWNER') || 'empty',
      userValue: 'A real owner must handle failed payments, refunds, disputes, chargebacks and invoice questions.',
      launchNote: 'Assign this before accepting real money.'
    },
    {
      id: 'alert-webhook',
      label: 'Payment failure alert webhook safety',
      status: webhookUrlSafe ? 'READY_TO_TEST' : 'BLOCKED',
      adminValue: configured('PAYMENT_FAILURE_WEBHOOK_URL') ? 'configured' : 'empty',
      userValue: 'Payment incident alerts should use HTTPS-only internal webhook or remain disabled.',
      launchNote: 'Optional. Use only after webhook recipient privacy review.'
    }
  ]

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.31-payment-lifecycle-readiness',
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length,
      lifecycleLanes: paymentLifecycleLanes.length,
      highRiskLanes: paymentLifecycleLanes.filter((lane) => lane.userImpact === 'critical' || lane.userImpact === 'high').length
    },
    controls,
    lifecycleLanes: paymentLifecycleLanes,
    billingSafetyRules: [
      'Never upgrade a user plan without valid Razorpay payment signature or verified webhook signature.',
      'Keep webhook idempotent: replaying the same event must not create duplicate upgrades or charges.',
      'Never expose Razorpay key secret, webhook secret, payment signature or service-role tokens in client responses.',
      'Use manual review for refunds, cancellations, chargebacks and invoice disputes until finance workflow is proven.',
      'Save launch evidence for successful payment, failed payment, invalid signature and webhook replay before public launch.'
    ],
    launchEvidence: [
      'Run npm run payment:readiness and save JSON/CSV outputs.',
      'Open /admin/payment-lifecycle and save screenshot.',
      'Create Razorpay sandbox checkout and save appOrderId/providerOrderId proof.',
      'Verify successful payment upgrades plan only after valid signature.',
      'Replay invalid webhook signature and save 401 rejection proof.',
      'Trigger failed payment/refund/cancel scenario and save manual support runbook evidence.'
    ]
  }
}
