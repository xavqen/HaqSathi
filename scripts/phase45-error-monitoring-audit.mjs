import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const exists = (file) => existsSync(join(root, file))
const read = (file) => readFileSync(join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))

function require(condition, message) {
  if (!condition) issues.push(message)
}

const helper = exists('lib/monitoring/error-events.ts') ? read('lib/monitoring/error-events.ts') : ''
const route = exists('app/api/system/client-error/route.ts') ? read('app/api/system/client-error/route.ts') : ''
const heartbeat = exists('app/api/system/heartbeat/route.ts') ? read('app/api/system/heartbeat/route.ts') : ''
const listener = exists('components/layout/client-error-listener.tsx') ? read('components/layout/client-error-listener.tsx') : ''
const adminPage = exists('app/admin/error-monitoring/page.tsx') ? read('app/admin/error-monitoring/page.tsx') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(15|1[6-9]|[2-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.15+')
require(pkg.scripts['error-monitor:local'] === 'node scripts/error-monitoring-local.mjs', 'error-monitor:local script missing')
require(pkg.scripts['phase45:audit'] === 'node scripts/phase45-error-monitoring-audit.mjs', 'phase45:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase45:audit'), 'quality:release must include phase45 audit')
require(exists('lib/monitoring/error-events.ts'), 'error event helper missing')
require(helper.includes('maskSensitiveText') && helper.includes('normalizeClientErrorPayload') && helper.includes('buildErrorFingerprint'), 'helper must redact, normalize and fingerprint events')
require(helper.includes('ERROR_ALERT_WEBHOOK_URL') && helper.includes('ERROR_AUTO_INCIDENTS'), 'helper must support webhook alerts and auto incidents')
require(exists('app/api/system/client-error/route.ts'), 'client error capture route missing')
require(route.includes('rateLimit') && route.includes('CLIENT_ERROR') && route.includes('MonitoringEvent'), 'client error route must rate-limit and store monitoring events')
require(route.includes('incidentReport.create') && route.includes('sendErrorAlert'), 'client error route must support incident creation and alert sending')
require(exists('app/api/system/heartbeat/route.ts'), 'system heartbeat route missing')
require(heartbeat.includes('errorMonitoring') && heartbeat.includes('autoIncidents') && heartbeat.includes('webhookAlerts'), 'heartbeat route must expose monitoring readiness')
require(listener.includes('unhandledrejection') && listener.includes('keepalive') && listener.includes('sentFingerprints'), 'client listener must capture, dedupe and keepalive-send errors')
require(exists('app/admin/error-monitoring/page.tsx'), 'admin error monitoring page missing')
require(adminPage.includes('Error monitoring center') && adminPage.includes('Latest captured events'), 'admin error monitoring page incomplete')
require(adminShell.includes('/admin/error-monitoring'), 'admin shell missing error monitoring nav link')
require(env.includes('ERROR_MONITORING_ENABLED') && env.includes('ERROR_ALERT_WEBHOOK_URL') && env.includes('ERROR_AUTO_INCIDENTS'), '.env.example missing monitoring controls')
require(evidence.includes('Error Monitoring + Incident Triage'), 'launch evidence gate missing error monitoring')
require(exists('scripts/error-monitoring-local.mjs'), 'local error monitoring evidence script missing')
require(exists('PHASE_45_ERROR_MONITORING.md'), 'Phase 45 notes missing')

console.log('\nHaqSathi Phase 45 error monitoring audit')
console.log('Checks: 20')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 45 audit passed: client capture, server normalization, heartbeat, admin monitoring, local evidence and launch gate are installed.\n')
