export type StatusTrackingReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type StatusTrackingControl = {
  id: string
  label: string
  status: StatusTrackingReadinessStatus
  userValue: string
  adminValue: string
  launchNote: string
}

export type StatusTrackingPortal = {
  id: string
  label: string
  category: string
  referenceExamples: string[]
  safeStatusChecks: string[]
  neverAskFor: string[]
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled)$/i.test(process.env[name] || '')
}

function configured(name: string) {
  const value = process.env[name]
  return Boolean(value && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(value))
}

export const statusTrackingPortals: StatusTrackingPortal[] = [
  {
    id: 'consumerhelpline',
    label: 'Consumer complaint / NCH',
    category: 'consumer',
    referenceExamples: ['Docket number', 'Complaint ID', 'Acknowledgement number'],
    safeStatusChecks: ['Open official portal manually', 'Match docket/reference number', 'Record status text and checked date', 'Save screenshot/evidence note'],
    neverAskFor: ['Password', 'OTP', 'full card number', 'payment PIN']
  },
  {
    id: 'cybercrime',
    label: 'Cyber crime / financial fraud report',
    category: 'cyber',
    referenceExamples: ['Acknowledgement number', 'Complaint number', 'Helpline reference'],
    safeStatusChecks: ['Verify only on official cyber portal/helpline', 'Record reporting date and authority response', 'Set urgent bank follow-up if money movement is involved'],
    neverAskFor: ['OTP', 'UPI PIN', 'netbanking password', 'full debit card number']
  },
  {
    id: 'banking',
    label: 'Bank / RBI escalation',
    category: 'banking',
    referenceExamples: ['SR number', 'Ticket ID', 'RBI CMS complaint number'],
    safeStatusChecks: ['Track bank SR timeline', 'Record written response', 'Escalate only after bank/RBI waiting-period rules are satisfied'],
    neverAskFor: ['CVV', 'PIN', 'OTP', 'full account password']
  },
  {
    id: 'upi',
    label: 'UPI app / NPCI style dispute',
    category: 'upi',
    referenceExamples: ['UPI transaction ID', 'UTR/RRN', 'Dispute ID'],
    safeStatusChecks: ['Use payment app dispute screen or official support path', 'Track UTR/RRN carefully', 'Do not expose sensitive screenshot details publicly'],
    neverAskFor: ['UPI PIN', 'OTP', 'full bank login', 'screen-share access']
  },
  {
    id: 'service',
    label: 'Company / service center ticket',
    category: 'service',
    referenceExamples: ['Ticket ID', 'Job sheet number', 'Order ID', 'Return ID'],
    safeStatusChecks: ['Record last response date', 'Save repair/return proof', 'Set next follow-up date based on promised timeline'],
    neverAskFor: ['Password', 'OTP', 'private login codes']
  },
  {
    id: 'scheme',
    label: 'Scheme / form application',
    category: 'scheme',
    referenceExamples: ['Application number', 'Registration ID', 'Enrollment ID'],
    safeStatusChecks: ['Check only official state/national portal', 'Record stage exactly as shown', 'Verify missing-document message before uploading anything'],
    neverAskFor: ['Aadhaar OTP', 'portal password', 'bank PIN']
  }
]

export function getStatusTrackingControls(): StatusTrackingControl[] {
  const mode = env('STATUS_TRACKING_MODE', 'readiness')
  const dryRun = enabled('STATUS_TRACKING_DRY_RUN') || !process.env.STATUS_TRACKING_DRY_RUN
  const cronReady = enabled('STATUS_TRACKING_CRON_ENABLED') || configured('CRON_SECRET')
  const ownerReady = configured('STATUS_TRACKING_REVIEW_OWNER') || configured('SUPPORT_AGENT_OWNER') || configured('OFFICIAL_LINK_REVIEWER')
  const notifyReady = !enabled('STATUS_TRACKING_NOTIFY_ON_CHANGE') || configured('RESEND_API_KEY') || configured('NEXT_PUBLIC_VAPID_PUBLIC_KEY') || configured('WHATSAPP_PROVIDER_API_KEY') || configured('SMS_PROVIDER_API_KEY')
  const webhookReady = !configured('STATUS_TRACKING_WEBHOOK_URL') || /^https:\/\//i.test(env('STATUS_TRACKING_WEBHOOK_URL'))
  const allowedPortals = env('STATUS_TRACKING_ALLOWED_PORTALS', 'consumerhelpline,cybercrime,banking,upi,service,scheme')

  return [
    {
      id: 'mode',
      label: 'Status tracking mode',
      status: mode === 'readiness' || mode === 'manual' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Users can organize complaint, bank, UPI, cyber and scheme tracking without sharing passwords or OTPs.',
      adminValue: `STATUS_TRACKING_MODE=${mode}; STATUS_TRACKING_DRY_RUN=${env('STATUS_TRACKING_DRY_RUN', 'true')}`,
      launchNote: 'Keep readiness/manual mode for MVP. Connect external portal APIs only when an official API or written integration approval exists.'
    },
    {
      id: 'safe-reference-rules',
      label: 'Safe reference number rules',
      status: 'READY_TO_TEST',
      userValue: 'Track only docket IDs, complaint numbers, SR IDs, application IDs and UTR/RRN values needed for status lookup.',
      adminValue: 'Sensitive values are explicitly blocked from status-tracking guidance.',
      launchNote: 'Never ask for OTP, password, UPI PIN, CVV, full card number, screen-share access or remote control permission.'
    },
    {
      id: 'allowed-portals',
      label: 'Allowed portal category map',
      status: allowedPortals.trim() ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: 'Tracking categories are limited to consumer, cyber, banking, UPI, service and scheme/form status flows.',
      adminValue: `STATUS_TRACKING_ALLOWED_PORTALS=${allowedPortals}`,
      launchNote: 'Add new categories only after official-source verification and privacy review.'
    },
    {
      id: 'cron-polling',
      label: 'Polling / reminder automation readiness',
      status: cronReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'The app can prepare follow-up reminders and evidence checks without silently scraping private portals.',
      adminValue: `STATUS_TRACKING_CRON_ENABLED=${env('STATUS_TRACKING_CRON_ENABLED', 'false')}; STATUS_TRACKING_POLL_INTERVAL_HOURS=${env('STATUS_TRACKING_POLL_INTERVAL_HOURS', '24')}; CRON_SECRET=${configured('CRON_SECRET') ? 'configured' : 'empty'}`,
      launchNote: 'Do not auto-scrape login-protected portals. Prefer user-confirmed manual checks plus reminder automation.'
    },
    {
      id: 'notification-on-change',
      label: 'Notify on status change readiness',
      status: notifyReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Notifications are allowed only when the user has opted in and provider credentials are tested.',
      adminValue: `STATUS_TRACKING_NOTIFY_ON_CHANGE=${env('STATUS_TRACKING_NOTIFY_ON_CHANGE', 'false')}`,
      launchNote: 'Keep notification-on-change disabled until email/push/WhatsApp/SMS provider evidence passes.'
    },
    {
      id: 'review-owner',
      label: 'Tracking review owner',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'A human owner reviews risky statuses, failed status checks and escalation mistakes.',
      adminValue: `STATUS_TRACKING_REVIEW_OWNER=${env('STATUS_TRACKING_REVIEW_OWNER', '')}`,
      launchNote: 'Assign an owner before public launch so bad portal paths and outdated status instructions are fixed quickly.'
    },
    {
      id: 'webhook-safety',
      label: 'External webhook safety',
      status: webhookReady ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: 'External webhooks must be HTTPS and should receive only redacted status metadata.',
      adminValue: `STATUS_TRACKING_WEBHOOK_URL=${configured('STATUS_TRACKING_WEBHOOK_URL') ? 'configured' : 'empty'}`,
      launchNote: 'Never send complaint text, documents, phone/email, bank/UPI secrets or ID scans to third-party webhooks.'
    }
  ]
}

export function getStatusTrackingReadinessReport() {
  const controls = getStatusTrackingControls()
  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.28-status-tracking-readiness',
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length
    },
    controls,
    portals: statusTrackingPortals,
    publicUserFlow: [
      'Choose tracking category',
      'Add only safe reference number and current visible status',
      'Save last checked date and next follow-up date',
      'Attach evidence through the private document vault only when needed',
      'Use reminders/escalation tools for next action'
    ],
    privacyRules: [
      'No OTP, password, UPI PIN, CVV, full card number or screen-share request',
      'No automatic login to user portals without explicit official API approval',
      'No public indexing of status references, complaint text or evidence files',
      'Redact phone, email, bank, UPI and identity details in admin screenshots',
      'Use manual review for cyber, bank and legal escalation statuses'
    ],
    launchEvidence: [
      'Dashboard status-tracker screenshot on mobile and desktop',
      'Admin readiness page screenshot',
      'Local readiness JSON/CSV evidence',
      'Proof that OTP/password/UPI PIN warnings are visible',
      'One consumer/bank/UPI/scheme manual status-check dry run',
      'Notification-on-change disabled or provider evidence attached'
    ]
  }
}
