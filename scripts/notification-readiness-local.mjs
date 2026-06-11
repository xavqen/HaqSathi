import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.NOTIFICATION_EVIDENCE_DIR || './artifacts/notification-readiness'
mkdirSync(outputDir, { recursive: true })

const env = (name) => process.env[name] || ''
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost-only|haqsathi\.local/i.test(env(name)))

const dryRun = enabled('NOTIFICATION_DRY_RUN') || !env('NOTIFICATION_DRY_RUN')
const pwaEnabled = enabled('NEXT_PUBLIC_ENABLE_PWA')
const vapidConfigured = configured('NEXT_PUBLIC_VAPID_PUBLIC_KEY') && configured('VAPID_PRIVATE_KEY') && configured('VAPID_SUBJECT')
const emailConfigured = configured('RESEND_API_KEY') && configured('RESEND_FROM_EMAIL')
const whatsappConfigured = configured('WHATSAPP_PROVIDER_API_KEY') && configured('WHATSAPP_PROVIDER_URL')
const smsConfigured = configured('SMS_PROVIDER_API_KEY') && configured('SMS_PROVIDER_URL')
const ownerConfigured = configured('NOTIFICATION_ALERT_OWNER')

const controls = [
  ['notification-dry-run-control', 'Dry-run launch control', dryRun ? 'MANUAL_REQUIRED' : 'READY_TO_TEST', `NOTIFICATION_DRY_RUN=${dryRun ? 'true' : 'false'}`],
  ['email-reminders', 'Email reminders', emailConfigured ? 'READY_TO_TEST' : 'BLOCKED', emailConfigured ? 'Resend is configured.' : 'Resend API key or sender is missing.'],
  ['pwa-web-push', 'PWA web push readiness', pwaEnabled && vapidConfigured ? 'READY_TO_TEST' : pwaEnabled ? 'MANUAL_REQUIRED' : 'BLOCKED', pwaEnabled ? (vapidConfigured ? 'PWA/VAPID configured.' : 'VAPID keys missing.') : 'PWA disabled.'],
  ['whatsapp-alerts', 'WhatsApp alert provider', whatsappConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', whatsappConfigured ? 'WhatsApp provider configured.' : 'WhatsApp provider envs missing.'],
  ['sms-alerts', 'SMS alert provider', smsConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', smsConfigured ? 'SMS provider configured.' : 'SMS provider envs missing.'],
  ['notification-owner', 'Notification operations owner', ownerConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', ownerConfigured ? `Owner: ${env('NOTIFICATION_ALERT_OWNER')}` : 'Owner missing.'],
  ['channel-consent-policy', 'Consent and privacy policy', 'MANUAL_REQUIRED', 'Verify opt-in and unsubscribe before WhatsApp/SMS launch.']
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.21-notification-readiness',
  dryRun,
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'PASS' || control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length
  },
  controls: controls.map(([id, label, status, note]) => ({ id, label, status, note })),
  minimumEvidence: [
    'Email reminder test received in real inbox',
    'PWA install + notification permission screenshot from mobile Chrome',
    'WhatsApp/SMS provider dry-run or sandbox response screenshot',
    'Failed-send monitoring screenshot from /admin/notifications',
    'Admin readiness screenshot from /admin/notification-readiness'
  ]
}

const csvRows = [
  ['control_id', 'label', 'status', 'note'],
  ...controls.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]

writeFileSync(join(outputDir, 'notification-readiness-local.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'notification-readiness-local.csv'), csvRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Notification readiness evidence written to ${outputDir}`)
console.log(`Controls: ${report.summary.totalControls} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
