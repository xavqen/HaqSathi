import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const outDir = process.env.LAUNCH_QA_OUTPUT_DIR || process.env.LAUNCH_EVIDENCE_DIR || './artifacts/live-launch-qa'
mkdirSync(outDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return env(name).toLowerCase() === 'true'
}

function clean(value) {
  return String(value || '').trim()
}

function configured(name) {
  const value = clean(env(name))
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|PROJECT_REF|YOUR-PASSWORD|\[.*\]/i.test(value))
}

function looksLikeHttpsUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !/localhost|127\.0\.0\.1|example|your-domain/i.test(url.hostname)
  } catch {
    return false
  }
}

const secretPattern = /(AUTH_SECRET|DATABASE_URL|DIRECT_URL|SUPABASE_SERVICE_ROLE_KEY|RAZORPAY_KEY_SECRET|RAZORPAY_WEBHOOK_SECRET|UPSTASH_REDIS_REST_TOKEN|OPENAI_API_KEY|GEMINI_API_KEY|RESEND_API_KEY|postgresql:\/\/|sk_live_|sk_test_|rzp_live_|rzp_test_|eyJ[A-Za-z0-9_-]+\.)/i

const checks = []
function check(id, area, ok, status, evidence, nextStep, hardBlock = false) {
  const safeEvidence = String(evidence || '')
  checks.push({
    id,
    area,
    ok,
    status: ok ? 'PASS' : hardBlock ? 'BLOCKED' : status,
    evidence: secretPattern.test(safeEvidence) ? '[redacted secret-like evidence]' : safeEvidence,
    nextStep
  })
}

const productionUrl = clean(env('VERCEL_PRODUCTION_URL') || env('LAUNCH_QA_BASE_URL') || env('NEXT_PUBLIC_APP_URL'))
const lastGoodUrl = clean(env('LAUNCH_LAST_GOOD_DEPLOYMENT_URL'))
const maintenanceUrl = clean(env('LAUNCH_MAINTENANCE_STATUS_URL'))

check(
  'production-url',
  'Production domain',
  looksLikeHttpsUrl(productionUrl),
  'BLOCKED',
  productionUrl || 'missing',
  'Set LAUNCH_QA_BASE_URL or VERCEL_PRODUCTION_URL to https://haqsathi.site before the drill.',
  true
)

check(
  'last-good-deployment',
  'Rollback target',
  looksLikeHttpsUrl(lastGoodUrl),
  'MANUAL_REQUIRED',
  lastGoodUrl || 'missing',
  'Save the previous known-good Vercel production deployment URL in LAUNCH_LAST_GOOD_DEPLOYMENT_URL.'
)

check(
  'rollback-owner',
  'Rollback owner',
  configured('LAUNCH_ROLLBACK_OWNER'),
  'MANUAL_REQUIRED',
  configured('LAUNCH_ROLLBACK_OWNER') ? 'owner configured' : 'missing',
  'Set LAUNCH_ROLLBACK_OWNER to a real responsible person/contact.'
)

check(
  'incident-owner',
  'Incident commander',
  configured('LAUNCH_INCIDENT_OWNER'),
  'MANUAL_REQUIRED',
  configured('LAUNCH_INCIDENT_OWNER') ? 'owner configured' : 'missing',
  'Set LAUNCH_INCIDENT_OWNER to the person watching launch for the first 24 hours.'
)

check(
  'backup-confirmed',
  'Database backup',
  enabled('LAUNCH_BACKUP_CONFIRMED'),
  'MANUAL_REQUIRED',
  `LAUNCH_BACKUP_CONFIRMED=${env('LAUNCH_BACKUP_CONFIRMED', 'false')}`,
  'Confirm a fresh Supabase/Postgres backup or restore point, then set LAUNCH_BACKUP_CONFIRMED=true.'
)

check(
  'rollback-tested',
  'Rollback drill',
  enabled('LAUNCH_ROLLBACK_TESTED'),
  'MANUAL_REQUIRED',
  `LAUNCH_ROLLBACK_TESTED=${env('LAUNCH_ROLLBACK_TESTED', 'false')}`,
  'Perform a dry-run rollback plan review or Vercel alias rollback rehearsal, then set LAUNCH_ROLLBACK_TESTED=true.'
)

check(
  'maintenance-notice-ready',
  'Maintenance communication',
  enabled('LAUNCH_MAINTENANCE_NOTICE_READY'),
  'MANUAL_REQUIRED',
  `LAUNCH_MAINTENANCE_NOTICE_READY=${env('LAUNCH_MAINTENANCE_NOTICE_READY', 'false')}`,
  'Prepare user-facing maintenance/fallback message for status page/social/support, then set LAUNCH_MAINTENANCE_NOTICE_READY=true.'
)

check(
  'status-url-ready',
  'Status/communication URL',
  !maintenanceUrl || looksLikeHttpsUrl(maintenanceUrl),
  'MANUAL_REQUIRED',
  maintenanceUrl || 'optional not set',
  'Optionally set LAUNCH_MAINTENANCE_STATUS_URL to a public status/update URL.'
)

const blocked = checks.filter((item) => item.status === 'BLOCKED').length
const manualRequired = checks.filter((item) => item.status === 'MANUAL_REQUIRED').length
const pass = checks.filter((item) => item.status === 'PASS').length
const decision = blocked > 0 ? 'ROLLBACK_DRILL_BLOCKED' : manualRequired > 0 ? 'ROLLBACK_DRILL_MANUAL_REQUIRED' : 'ROLLBACK_DRILL_READY'

const report = {
  version: '3.0.105-motion-hydration-stability',
  generatedAt: new Date().toISOString(),
  strict: enabled('STRICT_ROLLBACK_DRILL') || enabled('LAUNCH_STRICT_EVIDENCE_GATE'),
  decision,
  summary: { total: checks.length, pass, manualRequired, blocked },
  checks,
  runbook: [
    'Before deploy: confirm latest database backup/restore point and note LAUNCH_LAST_GOOD_DEPLOYMENT_URL.',
    'Deploy: keep final release in soft launch until /api/ready, launch QA, payments/storage, Lighthouse and Playwright pass.',
    'If severe issue happens: pause marketing, set maintenance notice, capture incident time, rollback Vercel alias to the last known-good deployment, then re-run launch:ops-snapshot.',
    'After rollback: preserve final-evidence-gate.json, rollback-drill.json, ops snapshot and incident notes for postmortem.'
  ]
}

const jsonPath = path.join(outDir, 'rollback-drill.json')
const csvPath = path.join(outDir, 'rollback-drill.csv')
writeFileSync(jsonPath, JSON.stringify(report, null, 2))
writeFileSync(csvPath, ['id,area,status,evidence,next_step', ...checks.map((item) => [item.id, item.area, item.status, item.evidence, item.nextStep].map((value) => `"${String(value).replaceAll('"', "'")}"`).join(','))].join('\n'))

for (const item of checks) console.log(`${item.status === 'PASS' ? '✅' : item.status === 'BLOCKED' ? '❌' : '⚠️'} ${item.area}: ${item.status}`)
console.log(`\nRollback drill: ${decision}`)
console.log(`Report saved to ${jsonPath}`)

if ((enabled('STRICT_ROLLBACK_DRILL') || enabled('LAUNCH_STRICT_EVIDENCE_GATE')) && decision !== 'ROLLBACK_DRILL_READY') process.exit(1)
