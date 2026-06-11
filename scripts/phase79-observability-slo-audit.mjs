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

const helper = exists('lib/operations/observability-slo-readiness.ts') ? read('lib/operations/observability-slo-readiness.ts') : ''
const adminPage = exists('app/admin/observability-slo/page.tsx') ? read('app/admin/observability-slo/page.tsx') : ''
const adminApi = exists('app/api/admin/observability-slo-readiness/route.ts') ? read('app/api/admin/observability-slo-readiness/route.ts') : ''
const localScript = exists('scripts/observability-slo-readiness-local.mjs') ? read('scripts/observability-slo-readiness-local.mjs') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const previousAudit = exists('scripts/phase78-incident-response-audit.mjs') ? read('scripts/phase78-incident-response-audit.mjs') : ''

require(pkg.version === '3.0.49-observability-slo-readiness' || /^3\.0\.(5[0-9]|[6-9][0-9])-/.test(pkg.version), 'package version must be 3.0.49-observability-slo-readiness or newer release')
require(pkg.scripts['observability:readiness'] === 'node scripts/observability-slo-readiness-local.mjs', 'observability:readiness script missing')
require(pkg.scripts['phase79:audit'] === 'node scripts/phase79-observability-slo-audit.mjs', 'phase79:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase79:audit'), 'quality:release must include phase79 audit')
require(exists('lib/operations/observability-slo-readiness.ts'), 'observability SLO readiness helper missing')
for (const token of ['getObservabilitySloReadinessReport', 'OBSERVABILITY_OWNER', 'OBSERVABILITY_MODE', 'OBSERVABILITY_UPTIME_URL', 'OBSERVABILITY_ALERT_WEBHOOK_URL', 'OBSERVABILITY_SLO_REVIEWED', 'SLO_AVAILABILITY_TARGET']) {
  require(helper.includes(token), `helper missing ${token}`)
}
for (const lane of ['public-availability', 'api-latency', 'error-rate', 'cron-health', 'business-flow-heartbeats']) {
  require(helper.includes(lane), `SLO lane missing ${lane}`)
}
require(exists('app/admin/observability-slo/page.tsx'), 'admin observability SLO page missing')
require(adminPage.includes('Observability &amp; SLO readiness') && adminPage.includes('/api/admin/observability-slo-readiness') && adminPage.includes('Phase 79'), 'admin page must show title, API and phase badge')
require(exists('app/api/admin/observability-slo-readiness/route.ts'), 'observability SLO API route missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getObservabilitySloReadinessReport'), 'admin API must require admin and return report')
require(exists('scripts/observability-slo-readiness-local.mjs'), 'observability readiness local evidence script missing')
for (const token of ['observability-slo-readiness.json', 'observability-controls.csv', 'observability-slo-lanes.csv', 'observability-dashboard-checklist.md']) {
  require(localScript.includes(token), `local script missing ${token}`)
}
require(adminShell.includes('/admin/observability-slo'), 'admin shell must link observability SLO page')
for (const key of ['OBSERVABILITY_OWNER', 'OBSERVABILITY_MODE', 'OBSERVABILITY_PROVIDER', 'OBSERVABILITY_UPTIME_URL', 'OBSERVABILITY_STATUS_PAGE_URL', 'OBSERVABILITY_ALERT_WEBHOOK_URL', 'OBSERVABILITY_ALERT_EMAIL', 'OBSERVABILITY_HEARTBEAT_REVIEWED', 'OBSERVABILITY_SLO_REVIEWED', 'OBSERVABILITY_DASHBOARD_REVIEWED', 'OBSERVABILITY_ALERT_DRILL_REVIEWED', 'OBSERVABILITY_ERROR_BUDGET_REVIEWED', 'OBSERVABILITY_EVIDENCE_DIR', 'SLO_AVAILABILITY_TARGET', 'SLO_API_P95_MS', 'SLO_ERROR_RATE_MAX']) {
  require(env.includes(key), `.env.example missing ${key}`)
}
require(evidence.includes('Observability SLO Readiness') && evidence.includes('npm run observability:readiness'), 'launch evidence gate missing observability SLO readiness')
require(previousAudit.includes('3.0.48') && previousAudit.includes('newer release'), 'phase78 audit must accept newer releases')

console.log('\nPhase 79 observability SLO readiness audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 79 observability SLO readiness checks passed.\n')
