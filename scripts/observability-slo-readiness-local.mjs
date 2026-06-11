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

const outputDir = process.env.OBSERVABILITY_EVIDENCE_DIR || './artifacts/observability-slo'
mkdirSync(outputDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|owner@example|YOUR_|none/i.test(value))
}

function validMode(name, fallback = 'manual_review') {
  return ['dry_run', 'manual_review', 'active', 'enforced'].includes(env(name, fallback))
}

const controls = [
  ['observability-owner-assigned', 'P0', 'Observability owner assigned', configured('OBSERVABILITY_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `OBSERVABILITY_OWNER=${env('OBSERVABILITY_OWNER') || 'empty'}`],
  ['observability-mode-safe', 'P0', 'Observability mode is safe', validMode('OBSERVABILITY_MODE') ? 'READY_TO_TEST' : 'BLOCKED', `OBSERVABILITY_MODE=${env('OBSERVABILITY_MODE', 'manual_review')}`],
  ['provider-configured', 'P1', 'Monitoring provider or manual dashboard path selected', configured('OBSERVABILITY_PROVIDER') || configured('NEXT_PUBLIC_GA_ID') || configured('NEXT_PUBLIC_PLAUSIBLE_DOMAIN') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `OBSERVABILITY_PROVIDER=${env('OBSERVABILITY_PROVIDER', 'none')}`],
  ['uptime-target-configured', 'P0', 'Production uptime target configured', configured('OBSERVABILITY_UPTIME_URL') || configured('VERCEL_PRODUCTION_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `OBSERVABILITY_UPTIME_URL=${configured('OBSERVABILITY_UPTIME_URL') ? 'configured' : 'empty'}; VERCEL_PRODUCTION_URL=${configured('VERCEL_PRODUCTION_URL') ? 'configured' : 'empty'}`],
  ['heartbeat-reviewed', 'P1', 'Heartbeat endpoint reviewed', enabled('OBSERVABILITY_HEARTBEAT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `OBSERVABILITY_HEARTBEAT_REVIEWED=${env('OBSERVABILITY_HEARTBEAT_REVIEWED', 'false')}`],
  ['slo-reviewed', 'P0', 'SLO targets reviewed', enabled('OBSERVABILITY_SLO_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `OBSERVABILITY_SLO_REVIEWED=${env('OBSERVABILITY_SLO_REVIEWED', 'false')}`],
  ['dashboard-reviewed', 'P1', 'Monitoring dashboard reviewed', enabled('OBSERVABILITY_DASHBOARD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `OBSERVABILITY_DASHBOARD_REVIEWED=${env('OBSERVABILITY_DASHBOARD_REVIEWED', 'false')}`],
  ['alert-drill-reviewed', 'P0', 'Alert drill reviewed', configured('OBSERVABILITY_ALERT_WEBHOOK_URL') || configured('OBSERVABILITY_ALERT_EMAIL') || enabled('OBSERVABILITY_ALERT_DRILL_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `OBSERVABILITY_ALERT_WEBHOOK_URL=${configured('OBSERVABILITY_ALERT_WEBHOOK_URL') ? 'configured' : 'empty'}; OBSERVABILITY_ALERT_EMAIL=${configured('OBSERVABILITY_ALERT_EMAIL') ? 'configured' : 'empty'}; OBSERVABILITY_ALERT_DRILL_REVIEWED=${env('OBSERVABILITY_ALERT_DRILL_REVIEWED', 'false')}`],
  ['error-budget-reviewed', 'P2', 'Error budget reviewed', enabled('OBSERVABILITY_ERROR_BUDGET_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `OBSERVABILITY_ERROR_BUDGET_REVIEWED=${env('OBSERVABILITY_ERROR_BUDGET_REVIEWED', 'false')}`]
]

const sloLanes = [
  ['public-availability', 'P0', 'Public availability SLO', `${env('SLO_AVAILABILITY_TARGET', '99.5')}% monthly uptime for public P0 routes`, 'Home, complaint, UPI help, login and pricing route uptime probes'],
  ['api-latency', 'P1', 'API latency SLO', `P95 below ${env('SLO_API_P95_MS', '1500')}ms for non-AI APIs`, 'Heartbeat, auth, analytics, newsletter, vault metadata and readiness APIs'],
  ['error-rate', 'P0', 'Error rate SLO', `Server/client error rate below ${env('SLO_ERROR_RATE_MAX', '1')}% on P0 flows`, 'Client error capture, API non-2xx rate and Vercel runtime errors'],
  ['cron-health', 'P1', 'Cron and background job health', 'Every protected cron route has last-run status and failure owner', 'Link checks, official data refresh, privacy ops, backups and notification dry-runs'],
  ['business-flow-heartbeats', 'P0', 'Business flow heartbeats', 'Auth, email, payment, vault and complaint generator smoke checks are observable', 'Synthetic checks or manual smoke evidence on deployed Vercel URL']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.49-observability-slo-readiness',
  summary: {
    totalControls: controls.length,
    ready,
    manualRequired,
    blocked,
    sloLanes: sloLanes.length
  },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  sloLanes: sloLanes.map(([id, priority, label, target, signal]) => ({ id, priority, label, target, signal })),
  dashboards: ['Vercel runtime errors', 'Client error monitoring', 'Uptime probes', 'Heartbeat API', 'Cron evidence'],
  outputDir,
  nextAction: blocked ? 'Fix blocked observability configuration.' : manualRequired ? 'Complete owner, uptime, heartbeat, dashboard, alert and SLO evidence.' : 'Observability readiness gates are complete.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'observability-slo-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'observability-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'observability-slo-lanes.csv'), csv([['id', 'priority', 'label', 'target', 'signal'], ...sloLanes]))
writeFileSync(join(outputDir, 'observability-dashboard-checklist.md'), `# Observability dashboard checklist\n\n- Production uptime probe\n- Heartbeat endpoint\n- Client/server error dashboard\n- API latency panel\n- Cron/job run history\n- Alert drill proof\n- Error budget review\n`)

console.log(`✅ Observability SLO readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · SLO lanes: ${sloLanes.length}`)
