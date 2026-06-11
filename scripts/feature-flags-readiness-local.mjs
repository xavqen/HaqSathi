import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function loadEnvFile(path) {
  if (!existsSync(path)) return
  const lines = readFileSync(path, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

const outputDir = process.env.FEATURE_FLAG_EVIDENCE_DIR || './artifacts/feature-flags-readiness'
mkdirSync(outputDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

function modeIsSafe(name, fallback = 'manual_review') {
  return ['manual_review', 'staged', 'production_guarded', 'frozen'].includes(env(name, fallback))
}

function killSwitchReady(name) {
  const value = env(name, 'false')
  return /^(true|false|0|1|enabled|disabled)$/i.test(value)
}

const controls = [
  ['flag-owner-assigned', 'P0', 'Feature flag owner assigned', configured('FEATURE_FLAG_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `FEATURE_FLAG_OWNER=${env('FEATURE_FLAG_OWNER') || 'empty'}`],
  ['flag-mode-safe', 'P0', 'Feature flag mode is safe', modeIsSafe('FEATURE_FLAG_MODE') ? 'READY_TO_TEST' : 'BLOCKED', `FEATURE_FLAG_MODE=${env('FEATURE_FLAG_MODE', 'manual_review')}`],
  ['p0-default-off-reviewed', 'P0', 'P0 default-off review completed', enabled('FEATURE_FLAG_P0_DEFAULT_OFF_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FEATURE_FLAG_P0_DEFAULT_OFF_REVIEWED=${env('FEATURE_FLAG_P0_DEFAULT_OFF_REVIEWED', 'false')}`],
  ['rollback-drill-reviewed', 'P0', 'Feature rollback drill reviewed', enabled('FEATURE_FLAG_ROLLBACK_DRILL_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FEATURE_FLAG_ROLLBACK_DRILL_REVIEWED=${env('FEATURE_FLAG_ROLLBACK_DRILL_REVIEWED', 'false')}`],
  ['flag-audit-reviewed', 'P0', 'Feature flag audit trail reviewed', enabled('FEATURE_FLAG_AUDIT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FEATURE_FLAG_AUDIT_REVIEWED=${env('FEATURE_FLAG_AUDIT_REVIEWED', 'false')}`],
  ['payment-kill-switch-ready', 'P0', 'Payment kill switch ready', killSwitchReady('FEATURE_PAYMENTS_ENABLED') && enabled('FEATURE_FLAG_PAYMENT_KILL_SWITCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FEATURE_PAYMENTS_ENABLED=${env('FEATURE_PAYMENTS_ENABLED', 'false')}`],
  ['ai-kill-switch-ready', 'P0', 'AI tool kill switch ready', killSwitchReady('FEATURE_AI_TOOLS_ENABLED') && enabled('FEATURE_FLAG_AI_KILL_SWITCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FEATURE_AI_TOOLS_ENABLED=${env('FEATURE_AI_TOOLS_ENABLED', 'true')}`],
  ['vault-kill-switch-ready', 'P0', 'Document vault upload kill switch ready', killSwitchReady('FEATURE_DOCUMENT_VAULT_UPLOADS_ENABLED') && enabled('FEATURE_FLAG_VAULT_KILL_SWITCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FEATURE_DOCUMENT_VAULT_UPLOADS_ENABLED=${env('FEATURE_DOCUMENT_VAULT_UPLOADS_ENABLED', 'false')}`],
  ['notification-dry-run-ready', 'P1', 'Notification dry-run fallback ready', killSwitchReady('NOTIFICATION_DRY_RUN') && enabled('FEATURE_FLAG_NOTIFICATION_KILL_SWITCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `NOTIFICATION_DRY_RUN=${env('NOTIFICATION_DRY_RUN', 'true')}`],
  ['admin-freeze-ready', 'P0', 'Admin write freeze ready', killSwitchReady('FEATURE_ADMIN_WRITES_ENABLED') && enabled('FEATURE_FLAG_ADMIN_FREEZE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FEATURE_ADMIN_WRITES_ENABLED=${env('FEATURE_ADMIN_WRITES_ENABLED', 'false')}`]
]

const lanes = [
  ['ai-tools-kill-switch', 'P0', 'AI tools kill switch', 'FEATURE_AI_TOOLS_ENABLED; FEATURE_AI_CHAT_ENABLED; FEATURE_AI_DRAFTS_ENABLED', 'Disable AI calls and show static templates/official links fallback'],
  ['payment-kill-switch', 'P0', 'Payment and subscription kill switch', 'FEATURE_PAYMENTS_ENABLED; FEATURE_SUBSCRIPTIONS_ENABLED; PAYMENT_LIFECYCLE_MODE', 'Disable checkout while preserving free tools and existing user access'],
  ['vault-upload-kill-switch', 'P0', 'Document vault upload kill switch', 'FEATURE_DOCUMENT_VAULT_UPLOADS_ENABLED; DOCUMENT_VAULT_SAFETY_MODE', 'Disable new uploads while preserving existing dashboard navigation'],
  ['notification-kill-switch', 'P1', 'Notification channel kill switch', 'FEATURE_PUSH_NOTIFICATIONS_ENABLED; FEATURE_EMAIL_REMINDERS_ENABLED; FEATURE_WHATSAPP_SMS_ENABLED; NOTIFICATION_DRY_RUN', 'Turn channels to dry-run and keep in-app reminders'],
  ['growth-feature-kill-switch', 'P1', 'Growth/referral/newsletter kill switch', 'FEATURE_REFERRALS_ENABLED; FEATURE_NEWSLETTER_ENABLED; FEATURE_ANALYTICS_EVENTS_ENABLED', 'Pause growth experiments without blocking core tools'],
  ['cron-background-kill-switch', 'P0', 'Cron/background job kill switch', 'FEATURE_CRON_LINK_CHECKS_ENABLED; FEATURE_CRON_PRIVACY_OPS_ENABLED; FEATURE_CRON_BACKUPS_ENABLED; CRON_SECRET', 'Disable affected cron job and run manual command if required'],
  ['admin-write-kill-switch', 'P0', 'Admin write-path kill switch', 'FEATURE_ADMIN_WRITES_ENABLED; FEATURE_CONTENT_EDITS_ENABLED; FEATURE_PAYMENT_ADMIN_WRITES_ENABLED', 'Freeze writes and keep read-only admin dashboards'],
  ['mobile-pwa-kill-switch', 'P2', 'Mobile/PWA experimental feature kill switch', 'FEATURE_PWA_INSTALL_PROMPT_ENABLED; FEATURE_OFFLINE_MODE_ENABLED; FEATURE_VOICE_INPUT_ENABLED', 'Disable experimental mobile prompts while keeping responsive web core']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.51-feature-flags-readiness',
  summary: { totalControls: controls.length, ready, manualRequired, blocked, lanes: lanes.length },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  featureFlagLanes: lanes.map(([id, priority, label, flags, rollback]) => ({ id, priority, label, flags, rollback })),
  outputDir,
  nextAction: blocked ? 'Fix blocked feature flag mode before deployment QA.' : manualRequired ? 'Complete P0 kill-switch evidence before public traffic.' : 'Feature flags are ready.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'feature-flags-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'feature-flag-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'kill-switch-matrix.csv'), csv([['id', 'priority', 'label', 'flags', 'rollback_action'], ...lanes]))
writeFileSync(join(outputDir, 'feature-flags-checklist.md'), `# Feature flags checklist\n\n- P0 flags have owners.\n- P0 flags are default-off or guarded until evidence passes.\n- Rollback drill is captured on staging.\n- Core complaint guidance works when AI/payments/growth/notifications are disabled.\n- Flag changes are audit logged with reason and owner.\n`)
writeFileSync(join(outputDir, 'feature-rollback-runbook.md'), `# Feature rollback runbook\n\n1. Identify failing lane.\n2. Switch lane to disabled/dry-run/frozen mode.\n3. Verify mobile and desktop fallback UX.\n4. Save masked screenshots and incident link.\n5. Notify support/admin owner.\n6. Re-enable gradually only after root cause and monitoring evidence pass.\n`)

console.log(`✅ Feature flags readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Lanes: ${lanes.length}`)
