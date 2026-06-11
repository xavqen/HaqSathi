import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.EMAIL_DELIVERY_EVIDENCE_DIR || './artifacts/email-delivery'
mkdirSync(outputDir, { recursive: true })

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost|haqsathi\.local|PROJECT_REF/i.test(env(name)))
const httpsOrEmpty = (name) => !env(name) || /^https:\/\//i.test(env(name))
const domainFromSender = (sender) => sender.match(/@([^>\s]+)>?$/)?.[1]?.toLowerCase() || ''
const productionSender = (sender) => Boolean(domainFromSender(sender) && !/haqsathi\.local|localhost|example|gmail\.com|yahoo\.com|outlook\.com/i.test(domainFromSender(sender)))
const validPercent = (name, fallback) => {
  const value = Number(env(name, fallback))
  return Number.isFinite(value) && value >= 0 && value <= 100
}

const sender = env('RESEND_FROM_EMAIL', 'HaqSathi AI <noreply@haqsathi.local>')
const templateLanes = [
  ['email-verification', 'Email verification', 'EMAIL_VERIFICATION', 'critical', 'Signup and resend verification', 'Real inbox screenshot | One-time link success | Expired/used token rejection | EmailLog SENT row'],
  ['password-reset', 'Forgot password reset', 'PASSWORD_RESET', 'critical', 'Forgot password form', 'Real inbox screenshot | Reset token expiry proof | No account-enumeration proof | EmailLog SENT/FAILED proof'],
  ['payment-receipt', 'Payment receipt and failed-payment notices', 'PAYMENT_RECEIPT', 'high', 'Paid checkout, failed payment and refund/cancel workflow', 'Receipt sender proof | Failed payment email proof | Amount/plan match review | Support escalation path'],
  ['reminders', 'Complaint follow-up reminders', 'REMINDER', 'medium', 'Reminder scheduler and notification settings', 'Reminder opt-in proof | Email delivered proof | Unsubscribe/preferences proof'],
  ['support-replies', 'Support replies and ticket updates', 'SUPPORT_REPLY', 'medium', 'Support ticket admin reply', 'Masked user email proof | Reply template review | No OTP/password collection warning'],
  ['newsletter-double-opt-in', 'Newsletter double opt-in', 'NEWSLETTER_CONFIRMATION', 'medium', 'Newsletter subscribe form', 'Double opt-in inbox proof | Suppression/unsubscribe proof | Seed-list test']
]

const controls = [
  ['delivery-mode', 'Safe delivery launch mode', env('EMAIL_DELIVERY_MODE', 'readiness') === 'live' && env('EMAIL_DELIVERY_DRY_RUN', 'true') !== 'false' ? 'BLOCKED' : 'READY_TO_TEST', `EMAIL_DELIVERY_MODE=${env('EMAIL_DELIVERY_MODE', 'readiness')}; EMAIL_DELIVERY_DRY_RUN=${env('EMAIL_DELIVERY_DRY_RUN', 'true')}`],
  ['resend-provider', 'Resend provider credentials', configured('RESEND_API_KEY') ? 'READY_TO_TEST' : 'BLOCKED', `RESEND_API_KEY=${configured('RESEND_API_KEY') ? 'configured' : 'empty'}`],
  ['verified-sender', 'Verified sender identity', configured('RESEND_FROM_EMAIL') && productionSender(sender) ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `RESEND_FROM_EMAIL=${sender}`],
  ['domain-auth', 'Domain DNS authentication', (configured('EMAIL_DELIVERY_DOMAIN') || productionSender(sender)) && enabled('EMAIL_DELIVERY_DKIM_VERIFIED') && enabled('EMAIL_DELIVERY_SPF_VERIFIED') && enabled('EMAIL_DELIVERY_DMARC_VERIFIED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `domain=${env('EMAIL_DELIVERY_DOMAIN') || domainFromSender(sender) || 'empty'}; SPF=${env('EMAIL_DELIVERY_SPF_VERIFIED', 'false')}; DKIM=${env('EMAIL_DELIVERY_DKIM_VERIFIED', 'false')}; DMARC=${env('EMAIL_DELIVERY_DMARC_VERIFIED', 'false')}`],
  ['test-inbox', 'Real inbox test recipient', configured('EMAIL_DELIVERY_TEST_TO') || configured('RESEND_TEST_TO_EMAIL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `EMAIL_DELIVERY_TEST_TO=${env('EMAIL_DELIVERY_TEST_TO') || env('RESEND_TEST_TO_EMAIL') || 'empty'}`],
  ['bounce-complaint-webhooks', 'Bounce and complaint webhooks', httpsOrEmpty('EMAIL_BOUNCE_WEBHOOK_URL') && httpsOrEmpty('EMAIL_COMPLAINT_WEBHOOK_URL') && (configured('EMAIL_BOUNCE_WEBHOOK_URL') || configured('EMAIL_COMPLAINT_WEBHOOK_URL')) ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `bounce=${env('EMAIL_BOUNCE_WEBHOOK_URL') || 'empty'}; complaint=${env('EMAIL_COMPLAINT_WEBHOOK_URL') || 'empty'}`],
  ['suppression-list', 'Suppression and unsubscribe safety', enabled('EMAIL_SUPPRESSION_LIST_ENABLED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `EMAIL_SUPPRESSION_LIST_ENABLED=${env('EMAIL_SUPPRESSION_LIST_ENABLED', 'false')}; NEXT_PUBLIC_UNSUBSCRIBE_URL=${env('NEXT_PUBLIC_UNSUBSCRIBE_URL') || 'empty'}`],
  ['failure-alerting', 'Email failure alert threshold', validPercent('EMAIL_FAILURE_ALERT_THRESHOLD_PERCENT', '5') && (configured('EMAIL_DELIVERY_OWNER') || configured('SUPPORT_AGENT_OWNER')) ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `EMAIL_FAILURE_ALERT_THRESHOLD_PERCENT=${env('EMAIL_FAILURE_ALERT_THRESHOLD_PERCENT', '5')}; EMAIL_DELIVERY_OWNER=${env('EMAIL_DELIVERY_OWNER') || 'empty'}`],
  ['evidence-output', 'Email delivery evidence output', 'PASS', `EMAIL_DELIVERY_EVIDENCE_DIR=${outputDir}`]
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.32-email-delivery-readiness',
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'PASS' || control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length,
    templateLanes: templateLanes.length,
    highRiskTemplates: templateLanes.filter((lane) => lane[3] === 'critical' || lane[3] === 'high').length
  },
  controls: controls.map(([id, label, status, adminValue]) => ({ id, label, status, adminValue })),
  templateLanes: templateLanes.map(([id, label, template, risk, trigger, evidenceRequired]) => ({ id, label, template, risk, trigger, evidenceRequired: evidenceRequired.split(' | ') }))
}

const controlRows = [['id', 'label', 'status', 'admin_value'], ...controls].map((row) => row.map((value) => String(value).replaceAll(',', ';')))
const laneRows = [['id', 'label', 'template', 'risk', 'trigger', 'evidence_required'], ...templateLanes].map((row) => row.map((value) => String(value).replaceAll(',', ';')))

writeFileSync(join(outputDir, 'email-delivery-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'email-delivery-controls.csv'), controlRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'email-delivery-template-lanes.csv'), laneRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Email delivery readiness evidence written to ${outputDir}`)
console.log(`Templates: ${report.summary.templateLanes} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
