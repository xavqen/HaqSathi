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

const outputDir = process.env.SECRETS_EVIDENCE_DIR || './artifacts/secrets-readiness'
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

function secretConfigured(name) {
  const value = env(name)
  return Boolean(value && value.length >= 16 && !/change-this|secret|password|example|YOUR_|placeholder|test_test_test/i.test(value))
}

function validMode(name, fallback = 'manual_review') {
  return ['dry_run', 'manual_review', 'active', 'enforced'].includes(env(name, fallback))
}

const controls = [
  ['secrets-owner-assigned', 'P0', 'Secrets owner assigned', configured('SECRETS_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `SECRETS_OWNER=${env('SECRETS_OWNER') || 'empty'}`],
  ['secrets-mode-safe', 'P0', 'Secrets readiness mode is safe', validMode('SECRETS_ROTATION_MODE') ? 'READY_TO_TEST' : 'BLOCKED', `SECRETS_ROTATION_MODE=${env('SECRETS_ROTATION_MODE', 'manual_review')}`],
  ['auth-secret-strong', 'P0', 'Auth/session secret is configured', secretConfigured('AUTH_SECRET') || secretConfigured('NEXTAUTH_SECRET') ? 'READY_TO_TEST' : 'BLOCKED', `AUTH_SECRET=${secretConfigured('AUTH_SECRET') ? 'configured' : 'empty'}; NEXTAUTH_SECRET=${secretConfigured('NEXTAUTH_SECRET') ? 'configured' : 'empty'}`],
  ['database-secrets-server-only', 'P0', 'Database/service role secrets are server-only', configured('DATABASE_URL') && configured('DIRECT_URL') && configured('SUPABASE_SERVICE_ROLE_KEY') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `DATABASE_URL=${configured('DATABASE_URL') ? 'configured' : 'empty'}; DIRECT_URL=${configured('DIRECT_URL') ? 'configured' : 'empty'}; SUPABASE_SERVICE_ROLE_KEY=${configured('SUPABASE_SERVICE_ROLE_KEY') ? 'configured' : 'empty'}`],
  ['payment-secret-reviewed', 'P0', 'Payment secrets reviewed', configured('RAZORPAY_KEY_SECRET') && configured('RAZORPAY_WEBHOOK_SECRET') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `RAZORPAY_KEY_SECRET=${configured('RAZORPAY_KEY_SECRET') ? 'configured' : 'empty'}; RAZORPAY_WEBHOOK_SECRET=${configured('RAZORPAY_WEBHOOK_SECRET') ? 'configured' : 'empty'}`],
  ['cron-secrets-reviewed', 'P1', 'Cron/admin operation secrets reviewed', configured('CRON_SECRET') || configured('ADMIN_BACKUP_SECRET') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `CRON_SECRET=${configured('CRON_SECRET') ? 'configured' : 'empty'}; ADMIN_BACKUP_SECRET=${configured('ADMIN_BACKUP_SECRET') ? 'configured' : 'empty'}`],
  ['public-env-boundary-reviewed', 'P0', 'NEXT_PUBLIC boundary reviewed', enabled('SECRETS_PUBLIC_ENV_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `SECRETS_PUBLIC_ENV_REVIEWED=${env('SECRETS_PUBLIC_ENV_REVIEWED', 'false')}`],
  ['rotation-runbook-reviewed', 'P0', 'Rotation runbook reviewed', enabled('SECRETS_ROTATION_RUNBOOK_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `SECRETS_ROTATION_RUNBOOK_REVIEWED=${env('SECRETS_ROTATION_RUNBOOK_REVIEWED', 'false')}`],
  ['least-privilege-reviewed', 'P1', 'Least privilege reviewed', enabled('SECRETS_LEAST_PRIVILEGE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `SECRETS_LEAST_PRIVILEGE_REVIEWED=${env('SECRETS_LEAST_PRIVILEGE_REVIEWED', 'false')}`],
  ['leak-response-reviewed', 'P0', 'Secret leak response reviewed', enabled('SECRETS_LEAK_RESPONSE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `SECRETS_LEAK_RESPONSE_REVIEWED=${env('SECRETS_LEAK_RESPONSE_REVIEWED', 'false')}`]
]

const secretLanes = [
  ['auth-session-secrets', 'P0', 'Auth and session secrets', 'AUTH_SECRET; NEXTAUTH_SECRET; JWT_SECRET if used', 'Rotate before public launch and after suspected leaks'],
  ['database-secrets', 'P0', 'Database and Supabase service secrets', 'DATABASE_URL; DIRECT_URL; SUPABASE_SERVICE_ROLE_KEY', 'Rotate on access/team/data-stage changes'],
  ['payment-webhook-secrets', 'P0', 'Payment and webhook secrets', 'RAZORPAY_KEY_SECRET; RAZORPAY_WEBHOOK_SECRET', 'Rotate when switching test/live mode and after webhook incidents'],
  ['email-notification-secrets', 'P1', 'Email and notification provider secrets', 'RESEND_API_KEY; WHATSAPP_PROVIDER_API_KEY; SMS_PROVIDER_API_KEY; VAPID_PRIVATE_KEY', 'Rotate after provider/domain/team changes'],
  ['cron-admin-secrets', 'P0', 'Cron, admin and internal operation secrets', 'CRON_SECRET; ADMIN_BACKUP_SECRET; alert webhooks', 'Rotate before launch and after unauthorized attempt'],
  ['public-env-boundary', 'P0', 'Public environment variable boundary', 'No secret under NEXT_PUBLIC_*', 'Review on every new env variable']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.50-secrets-rotation-readiness',
  summary: { totalControls: controls.length, ready, manualRequired, blocked, secretLanes: secretLanes.length },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  secretLanes: secretLanes.map(([id, priority, label, secrets, rotationCadence]) => ({ id, priority, label, secrets, rotationCadence })),
  publicEnvRules: [
    'Never expose server secrets under NEXT_PUBLIC_*.',
    'Keep service role, database URLs, auth secrets, webhook secrets, provider private keys and alert webhooks server-only.',
    'Save only masked screenshots and never paste keys into AI prompts or support tickets.'
  ],
  outputDir,
  nextAction: blocked ? 'Fix blocked P0 secrets before public auth/payment/storage tests.' : manualRequired ? 'Complete rotation, NEXT_PUBLIC boundary and leak-response evidence.' : 'Secrets readiness gates are complete.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'secrets-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'secrets-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'secret-lanes.csv'), csv([['id', 'priority', 'label', 'secrets', 'rotation_cadence'], ...secretLanes]))
writeFileSync(join(outputDir, 'secrets-rotation-runbook.md'), `# Secrets rotation runbook\n\n1. Inventory secrets and owners.\n2. Generate new provider secret without deleting old one first.\n3. Update Vercel/Supabase envs and deploy.\n4. Run quality:release and smoke P0 flows.\n5. Revoke old secret only after evidence passes.\n6. Save masked screenshots and incident notes if rotation was leak-driven.\n`)
writeFileSync(join(outputDir, 'public-env-boundary-checklist.md'), `# Public env boundary checklist\n\n- NEXT_PUBLIC values are browser-safe only.\n- SUPABASE_SERVICE_ROLE_KEY is never public.\n- DATABASE_URL and DIRECT_URL are never public.\n- AUTH_SECRET/NEXTAUTH_SECRET are never public.\n- Payment/email/webhook private secrets are never public.\n`)

console.log(`✅ Secrets readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Secret lanes: ${secretLanes.length}`)
