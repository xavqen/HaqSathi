export type EmailDeliveryStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type EmailDeliveryControl = {
  id: string
  label: string
  status: EmailDeliveryStatus
  userValue: string
  adminValue: string
  launchNote: string
}

export type EmailTemplateLane = {
  id: string
  label: string
  template: string
  risk: 'low' | 'medium' | 'high' | 'critical'
  trigger: string
  evidenceRequired: string[]
}

export type EmailDeliveryReport = {
  generatedAt: string
  version: string
  summary: {
    totalControls: number
    ready: number
    manualRequired: number
    blocked: number
    templateLanes: number
    highRiskTemplates: number
  }
  controls: EmailDeliveryControl[]
  templateLanes: EmailTemplateLane[]
  deliverabilityRules: string[]
  suppressionRules: string[]
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
  return Boolean(value && !/change-this|example|todo|your-|localhost|haqsathi\.local|PROJECT_REF/i.test(value))
}

function httpsOrEmpty(name: string) {
  const value = env(name)
  return !value || /^https:\/\//i.test(value)
}

function domainFromSender(sender: string) {
  const match = sender.match(/@([^>\s]+)>?$/)
  return match?.[1]?.toLowerCase() || ''
}

function isProductionSender(sender: string) {
  const domain = domainFromSender(sender)
  return Boolean(domain && !/haqsathi\.local|localhost|example|gmail\.com|yahoo\.com|outlook\.com/i.test(domain))
}

function isValidPercent(name: string, fallback: string) {
  const value = Number(env(name, fallback))
  return Number.isFinite(value) && value >= 0 && value <= 100
}

export const emailTemplateLanes: EmailTemplateLane[] = [
  {
    id: 'email-verification',
    label: 'Email verification',
    template: 'EMAIL_VERIFICATION',
    risk: 'critical',
    trigger: 'Signup and resend verification',
    evidenceRequired: ['Real inbox screenshot', 'One-time link success', 'Expired/used token rejection', 'EmailLog SENT row']
  },
  {
    id: 'password-reset',
    label: 'Forgot password reset',
    template: 'PASSWORD_RESET',
    risk: 'critical',
    trigger: 'Forgot password form',
    evidenceRequired: ['Real inbox screenshot', 'Reset token expiry proof', 'No account-enumeration proof', 'EmailLog SENT/FAILED proof']
  },
  {
    id: 'payment-receipt',
    label: 'Payment receipt and failed-payment notices',
    template: 'PAYMENT_RECEIPT',
    risk: 'high',
    trigger: 'Paid checkout, failed payment and refund/cancel workflow',
    evidenceRequired: ['Receipt sender proof', 'Failed payment email proof', 'Amount/plan match review', 'Support escalation path']
  },
  {
    id: 'reminders',
    label: 'Complaint follow-up reminders',
    template: 'REMINDER',
    risk: 'medium',
    trigger: 'Reminder scheduler and notification settings',
    evidenceRequired: ['Reminder opt-in proof', 'Email delivered proof', 'Unsubscribe/preferences proof']
  },
  {
    id: 'support-replies',
    label: 'Support replies and ticket updates',
    template: 'SUPPORT_REPLY',
    risk: 'medium',
    trigger: 'Support ticket admin reply',
    evidenceRequired: ['Masked user email proof', 'Reply template review', 'No OTP/password collection warning']
  },
  {
    id: 'newsletter-double-opt-in',
    label: 'Newsletter double opt-in',
    template: 'NEWSLETTER_CONFIRMATION',
    risk: 'medium',
    trigger: 'Newsletter subscribe form',
    evidenceRequired: ['Double opt-in inbox proof', 'Suppression/unsubscribe proof', 'Seed-list test']
  }
]

export function getEmailDeliveryReadinessReport(): EmailDeliveryReport {
  const mode = env('EMAIL_DELIVERY_MODE', 'readiness')
  const dryRun = env('EMAIL_DELIVERY_DRY_RUN', 'true')
  const sender = env('RESEND_FROM_EMAIL', 'HaqSathi AI <noreply@haqsathi.local>')
  const hasResendKey = configured('RESEND_API_KEY')
  const senderReady = configured('RESEND_FROM_EMAIL') && isProductionSender(sender)
  const testInboxReady = configured('EMAIL_DELIVERY_TEST_TO') || configured('RESEND_TEST_TO_EMAIL')
  const domainReady = configured('EMAIL_DELIVERY_DOMAIN') || senderReady
  const dkimReady = enabled('EMAIL_DELIVERY_DKIM_VERIFIED')
  const spfReady = enabled('EMAIL_DELIVERY_SPF_VERIFIED')
  const dmarcReady = enabled('EMAIL_DELIVERY_DMARC_VERIFIED')
  const bounceWebhookSafe = httpsOrEmpty('EMAIL_BOUNCE_WEBHOOK_URL')
  const complaintWebhookSafe = httpsOrEmpty('EMAIL_COMPLAINT_WEBHOOK_URL')
  const suppressionReady = enabled('EMAIL_SUPPRESSION_LIST_ENABLED')
  const ownerReady = configured('EMAIL_DELIVERY_OWNER') || configured('SUPPORT_AGENT_OWNER')
  const failureThresholdReady = isValidPercent('EMAIL_FAILURE_ALERT_THRESHOLD_PERCENT', '5')
  const unsafeLive = mode === 'live' && dryRun !== 'false'

  const controls: EmailDeliveryControl[] = [
    {
      id: 'delivery-mode',
      label: 'Safe delivery launch mode',
      status: unsafeLive ? 'BLOCKED' : 'READY_TO_TEST',
      userValue: 'Transactional email must stay in readiness/dry-run until inbox, domain and bounce evidence is saved.',
      adminValue: `EMAIL_DELIVERY_MODE=${mode}; EMAIL_DELIVERY_DRY_RUN=${dryRun}`,
      launchNote: 'Switch to live only after deployed-domain email QA passes.'
    },
    {
      id: 'resend-provider',
      label: 'Resend provider credentials',
      status: hasResendKey ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: hasResendKey ? 'Resend API key is configured for delivery testing.' : 'Resend API key is missing.',
      adminValue: `RESEND_API_KEY=${hasResendKey ? 'configured' : 'empty'}`,
      launchNote: 'Without provider credentials, verification/reset emails are skipped or dev-only.'
    },
    {
      id: 'verified-sender',
      label: 'Verified sender identity',
      status: senderReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: senderReady ? 'Sender uses a production-style domain.' : 'Sender still appears local/personal/unverified.',
      adminValue: `RESEND_FROM_EMAIL=${sender}`,
      launchNote: 'Use a domain you control, not gmail/yahoo/personal inboxes.'
    },
    {
      id: 'domain-auth',
      label: 'Domain DNS authentication',
      status: domainReady && dkimReady && spfReady && dmarcReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'SPF, DKIM and DMARC protect inbox placement and stop spoofing.',
      adminValue: `domain=${env('EMAIL_DELIVERY_DOMAIN') || domainFromSender(sender) || 'empty'}; SPF=${env('EMAIL_DELIVERY_SPF_VERIFIED', 'false')}; DKIM=${env('EMAIL_DELIVERY_DKIM_VERIFIED', 'false')}; DMARC=${env('EMAIL_DELIVERY_DMARC_VERIFIED', 'false')}`,
      launchNote: 'Save Resend domain verification screenshot and DNS records before public traffic.'
    },
    {
      id: 'test-inbox',
      label: 'Real inbox test recipient',
      status: testInboxReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: testInboxReady ? 'A test recipient is configured for delivery QA.' : 'No test inbox is configured.',
      adminValue: `EMAIL_DELIVERY_TEST_TO=${env('EMAIL_DELIVERY_TEST_TO') || env('RESEND_TEST_TO_EMAIL') || 'empty'}`,
      launchNote: 'Test Gmail, Outlook and a mobile inbox if possible.'
    },
    {
      id: 'bounce-complaint-webhooks',
      label: 'Bounce and complaint webhooks',
      status: bounceWebhookSafe && complaintWebhookSafe && (configured('EMAIL_BOUNCE_WEBHOOK_URL') || configured('EMAIL_COMPLAINT_WEBHOOK_URL')) ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Provider webhooks should record bounces, complaints and blocked recipients.',
      adminValue: `bounce=${env('EMAIL_BOUNCE_WEBHOOK_URL') || 'empty'}; complaint=${env('EMAIL_COMPLAINT_WEBHOOK_URL') || 'empty'}`,
      launchNote: 'Use HTTPS URLs only. Keep webhooks disabled until signature validation is reviewed.'
    },
    {
      id: 'suppression-list',
      label: 'Suppression and unsubscribe safety',
      status: suppressionReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: suppressionReady ? 'Suppression list controls are enabled.' : 'Suppression list controls need review.',
      adminValue: `EMAIL_SUPPRESSION_LIST_ENABLED=${env('EMAIL_SUPPRESSION_LIST_ENABLED', 'false')}; NEXT_PUBLIC_UNSUBSCRIBE_URL=${env('NEXT_PUBLIC_UNSUBSCRIBE_URL') || 'empty'}`,
      launchNote: 'Never send marketing or reminders to unsubscribed, bounced or complained recipients.'
    },
    {
      id: 'failure-alerting',
      label: 'Email failure alert threshold',
      status: failureThresholdReady && ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Admins should be alerted when delivery failures cross threshold.',
      adminValue: `EMAIL_FAILURE_ALERT_THRESHOLD_PERCENT=${env('EMAIL_FAILURE_ALERT_THRESHOLD_PERCENT', '5')}; EMAIL_DELIVERY_OWNER=${env('EMAIL_DELIVERY_OWNER') || 'empty'}`,
      launchNote: 'Assign an owner and check EmailLog failure rate daily after launch.'
    },
    {
      id: 'evidence-output',
      label: 'Email delivery evidence output',
      status: 'PASS',
      userValue: 'Local JSON/CSV evidence can be generated without sending real email.',
      adminValue: `EMAIL_DELIVERY_EVIDENCE_DIR=${env('EMAIL_DELIVERY_EVIDENCE_DIR', './artifacts/email-delivery')}`,
      launchNote: 'Attach generated evidence to final launch QA before public release.'
    }
  ]

  const highRiskTemplates = emailTemplateLanes.filter((lane) => lane.risk === 'critical' || lane.risk === 'high').length

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.32-email-delivery-readiness',
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length,
      templateLanes: emailTemplateLanes.length,
      highRiskTemplates
    },
    controls,
    templateLanes: emailTemplateLanes,
    deliverabilityRules: [
      'Use a verified sender domain with SPF, DKIM and DMARC before production launch.',
      'Keep verification/reset/payment emails transactional and do not mix marketing copy in them.',
      'Save inbox screenshots for Gmail, Outlook and mobile before marking email launch-ready.',
      'Monitor EmailLog SENT, FAILED and SKIPPED counts daily after launch.',
      'Never include complaint text, uploaded document content, UPI ID, bank details, OTP or passwords in subject lines.'
    ],
    suppressionRules: [
      'Suppress hard-bounced addresses immediately.',
      'Respect unsubscribe/preference settings for reminders, newsletters and promotional email.',
      'Do not suppress critical security emails such as password reset unless account is blocked for abuse.',
      'Rate-limit resend verification and forgot-password requests to reduce abuse.',
      'Keep complaint/spam reports visible in admin review before any future campaigns.'
    ],
    launchEvidence: [
      'Run npm run email:readiness and save JSON/CSV evidence',
      'Send /api/email/test to a real inbox from deployed domain',
      'Test signup email verification and forgot-password reset without dev links',
      'Verify SPF, DKIM and DMARC screenshots from Resend/domain DNS',
      'Capture EmailLog SENT, FAILED and SKIPPED examples for admin review',
      'Verify suppression/unsubscribe behavior before newsletters or reminders go live'
    ]
  }
}
