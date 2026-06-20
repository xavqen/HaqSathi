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

const helper = exists('lib/operations/incident-response-readiness.ts') ? read('lib/operations/incident-response-readiness.ts') : ''
const adminPage = exists('app/admin/incident-response/page.tsx') ? read('app/admin/incident-response/page.tsx') : ''
const adminApi = exists('app/api/admin/incident-response-readiness/route.ts') ? read('app/api/admin/incident-response-readiness/route.ts') : ''
const localScript = exists('scripts/incident-response-readiness-local.mjs') ? read('scripts/incident-response-readiness-local.mjs') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(pkg.version === '3.0.48-incident-response-readiness' || (/^3\.0\.(4[9]|[5-9][0-9])-/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be 3.0.48 incident response or newer release')
require(pkg.scripts['incident:readiness'] === 'node scripts/incident-response-readiness-local.mjs', 'incident:readiness script missing')
require(pkg.scripts['phase78:audit'] === 'node scripts/phase78-incident-response-audit.mjs', 'phase78:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase78:audit'), 'quality:release must include phase78 audit')
require(exists('lib/operations/incident-response-readiness.ts'), 'incident response readiness helper missing')
for (const token of ['getIncidentResponseReadinessReport', 'INCIDENT_COMMANDER', 'INCIDENT_RESPONSE_MODE', 'INCIDENT_ALERT_WEBHOOK_URL', 'INCIDENT_ROLLBACK_DRILL_REVIEWED', 'INCIDENT_EVIDENCE_PRESERVATION_REVIEWED']) {
  require(helper.includes(token), `helper missing ${token}`)
}
for (const lane of ['sev0-security-privacy', 'sev1-money-auth', 'sev2-critical-flow', 'sev3-content-data', 'sev4-polish-observability']) {
  require(helper.includes(lane), `severity lane missing ${lane}`)
}
require(exists('app/admin/incident-response/page.tsx'), 'admin incident response page missing')
require(adminPage.includes('Incident response readiness') && adminPage.includes('/api/admin/incident-response-readiness') && adminPage.includes('Phase 78'), 'admin page must show title, API and phase badge')
require(exists('app/api/admin/incident-response-readiness/route.ts'), 'incident response API route missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getIncidentResponseReadinessReport'), 'admin API must require admin and return report')
require(exists('scripts/incident-response-readiness-local.mjs'), 'incident readiness local evidence script missing')
for (const token of ['incident-response-readiness.json', 'incident-controls.csv', 'incident-severity-map.csv', 'incident-runbook.csv', 'incident-postmortem-template.md']) {
  require(localScript.includes(token), `local script missing ${token}`)
}
require(adminShell.includes('/admin/incident-response'), 'admin shell must link incident response page')
for (const key of ['INCIDENT_COMMANDER', 'INCIDENT_RESPONSE_MODE', 'INCIDENT_ALERT_WEBHOOK_URL', 'INCIDENT_ALERT_EMAIL', 'INCIDENT_STATUS_PAGE_REVIEWED', 'INCIDENT_ROLLBACK_DRILL_REVIEWED', 'INCIDENT_POSTMORTEM_TEMPLATE_REVIEWED', 'INCIDENT_SUPPORT_ESCALATION_REVIEWED', 'INCIDENT_EVIDENCE_PRESERVATION_REVIEWED', 'INCIDENT_EVIDENCE_DIR']) {
  require(env.includes(key), `.env.example missing ${key}`)
}
require(evidence.includes('Incident Response Readiness') && evidence.includes('npm run incident:readiness'), 'launch evidence gate missing incident response readiness')

console.log('\nPhase 78 incident response readiness audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 78 incident response readiness checks passed.\n')
