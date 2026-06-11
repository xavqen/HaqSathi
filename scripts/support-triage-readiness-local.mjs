import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.SUPPORT_TRIAGE_EVIDENCE_DIR || './artifacts/support-triage'
mkdirSync(outputDir, { recursive: true })

const env = (name) => process.env[name] || ''
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost-only|haqsathi\.local/i.test(env(name)))
const numberEnv = (name, fallback) => {
  const parsed = Number(env(name))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const supportMode = env('SUPPORT_CHAT_MODE') || 'ticket'
const slaHours = numberEnv('SUPPORT_SLA_HOURS', 24)
const liveProviderConfigured = configured('LIVE_CHAT_PROVIDER') && configured('LIVE_CHAT_WIDGET_URL')
const ownerConfigured = configured('SUPPORT_AGENT_OWNER')
const escalationEmailConfigured = configured('SUPPORT_ESCALATION_EMAIL') || configured('SUPPORT_EMAIL')
const webhookConfigured = configured('SUPPORT_WEBHOOK_URL')
const macroReviewEnabled = enabled('SUPPORT_MACRO_REVIEW_REQUIRED') || !env('SUPPORT_MACRO_REVIEW_REQUIRED')
const privacySafeMode = enabled('SUPPORT_PRIVACY_SAFE_MODE') || !env('SUPPORT_PRIVACY_SAFE_MODE')

const controls = [
  ['ticket-intake-flow', 'Ticket intake flow', 'PASS', 'Existing support ticket API and admin support page are present.'],
  ['support-agent-owner', 'Human support owner', ownerConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', ownerConfigured ? `Owner: ${env('SUPPORT_AGENT_OWNER')}` : 'SUPPORT_AGENT_OWNER is empty.'],
  ['support-sla-policy', 'Support SLA policy', slaHours <= 24 ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `SUPPORT_SLA_HOURS=${slaHours}`],
  ['live-chat-provider', 'Live chat widget provider', supportMode === 'live' ? (liveProviderConfigured ? 'READY_TO_TEST' : 'BLOCKED') : 'MANUAL_REQUIRED', liveProviderConfigured ? `Provider: ${env('LIVE_CHAT_PROVIDER')}` : 'Live provider not configured; ticket mode recommended for MVP.'],
  ['support-escalation-route', 'Escalation email route', escalationEmailConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', escalationEmailConfigured ? `Email: ${env('SUPPORT_ESCALATION_EMAIL') || env('SUPPORT_EMAIL')}` : 'Escalation email missing.'],
  ['support-alert-webhook', 'Support alert webhook', webhookConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', webhookConfigured ? 'Webhook configured.' : 'SUPPORT_WEBHOOK_URL is empty.'],
  ['support-macro-review', 'Macro safety review', macroReviewEnabled ? 'MANUAL_REQUIRED' : 'READY_TO_TEST', `SUPPORT_MACRO_REVIEW_REQUIRED=${macroReviewEnabled ? 'true' : 'false'}`],
  ['support-privacy-safe-mode', 'Privacy-safe support mode', privacySafeMode ? 'READY_TO_TEST' : 'BLOCKED', `SUPPORT_PRIVACY_SAFE_MODE=${privacySafeMode ? 'true' : 'false'}`]
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.22-support-triage-readiness',
  supportMode,
  slaHours,
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'PASS' || control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length
  },
  controls: controls.map(([id, label, status, note]) => ({ id, label, status, note })),
  minimumEvidence: [
    'Guest support ticket screenshot',
    'Logged-in support ticket screenshot',
    '/admin/support-triage screenshot',
    'Support macro safety review screenshot',
    'Escalation email or webhook test proof',
    'Live chat privacy review proof if enabled'
  ]
}

const csvRows = [
  ['control_id', 'label', 'status', 'note'],
  ...controls.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]

writeFileSync(join(outputDir, 'support-triage-readiness-local.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'support-triage-readiness-local.csv'), csvRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Support triage readiness evidence written to ${outputDir}`)
console.log(`Controls: ${report.summary.totalControls} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
