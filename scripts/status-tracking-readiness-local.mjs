import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.STATUS_TRACKING_EVIDENCE_DIR || './artifacts/status-tracking'
mkdirSync(outputDir, { recursive: true })

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(env(name)))
const webhookSafe = !configured('STATUS_TRACKING_WEBHOOK_URL') || /^https:\/\//i.test(env('STATUS_TRACKING_WEBHOOK_URL'))
const notifyReady = !enabled('STATUS_TRACKING_NOTIFY_ON_CHANGE') || configured('RESEND_API_KEY') || configured('NEXT_PUBLIC_VAPID_PUBLIC_KEY') || configured('WHATSAPP_PROVIDER_API_KEY') || configured('SMS_PROVIDER_API_KEY')

const controls = [
  ['mode', 'Status tracking mode', env('STATUS_TRACKING_MODE', 'readiness') === 'readiness' || env('STATUS_TRACKING_MODE', 'readiness') === 'manual' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `STATUS_TRACKING_MODE=${env('STATUS_TRACKING_MODE', 'readiness')}; STATUS_TRACKING_DRY_RUN=${env('STATUS_TRACKING_DRY_RUN', 'true')}`],
  ['safe-reference-rules', 'Safe reference number rules', 'READY_TO_TEST', 'Track docket IDs, SR IDs, application IDs and UTR/RRN only. Never ask for OTP/password/PIN/CVV.'],
  ['allowed-portals', 'Allowed portal category map', env('STATUS_TRACKING_ALLOWED_PORTALS', 'consumerhelpline,cybercrime,banking,upi,service,scheme').trim() ? 'READY_TO_TEST' : 'BLOCKED', `STATUS_TRACKING_ALLOWED_PORTALS=${env('STATUS_TRACKING_ALLOWED_PORTALS', 'consumerhelpline,cybercrime,banking,upi,service,scheme')}`],
  ['cron-polling', 'Polling / reminder automation readiness', enabled('STATUS_TRACKING_CRON_ENABLED') || configured('CRON_SECRET') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `STATUS_TRACKING_CRON_ENABLED=${env('STATUS_TRACKING_CRON_ENABLED', 'false')}; CRON_SECRET=${configured('CRON_SECRET') ? 'configured' : 'empty'}`],
  ['notification-on-change', 'Notify on status change readiness', notifyReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `STATUS_TRACKING_NOTIFY_ON_CHANGE=${env('STATUS_TRACKING_NOTIFY_ON_CHANGE', 'false')}`],
  ['review-owner', 'Tracking review owner', configured('STATUS_TRACKING_REVIEW_OWNER') || configured('SUPPORT_AGENT_OWNER') || configured('OFFICIAL_LINK_REVIEWER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `STATUS_TRACKING_REVIEW_OWNER=${env('STATUS_TRACKING_REVIEW_OWNER') || 'empty'}`],
  ['webhook-safety', 'External webhook safety', webhookSafe ? 'READY_TO_TEST' : 'BLOCKED', `STATUS_TRACKING_WEBHOOK_URL=${configured('STATUS_TRACKING_WEBHOOK_URL') ? 'configured' : 'empty'}`]
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.28-status-tracking-readiness',
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'PASS' || control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length
  },
  controls: controls.map(([id, label, status, note]) => ({ id, label, status, note })),
  portals: ['consumerhelpline', 'cybercrime', 'banking', 'upi', 'service', 'scheme'],
  privacyRules: ['No OTP/password/UPI PIN/CVV/full-card collection', 'No automatic login-protected scraping', 'No public indexing of status references', 'Redact screenshots before admin sharing'],
  launchEvidence: ['Dashboard screenshot', 'Admin screenshot', 'JSON/CSV evidence', 'Manual dry-run status check', 'Notification disabled or tested proof']
}

const csvRows = [
  ['control_id', 'label', 'status', 'note'],
  ...controls.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]

writeFileSync(join(outputDir, 'status-tracking-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'status-tracking-readiness.csv'), csvRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Status tracking readiness evidence written to ${outputDir}`)
console.log(`Controls: ${report.summary.totalControls} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
