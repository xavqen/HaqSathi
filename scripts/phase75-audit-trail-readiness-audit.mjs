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

const helper = exists('lib/audit-trail/readiness.ts') ? read('lib/audit-trail/readiness.ts') : ''
const adminPage = exists('app/admin/audit-trail-readiness/page.tsx') ? read('app/admin/audit-trail-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/audit-trail-readiness/route.ts') ? read('app/api/admin/audit-trail-readiness/route.ts') : ''
const localScript = exists('scripts/audit-trail-readiness-local.mjs') ? read('scripts/audit-trail-readiness-local.mjs') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(pkg.version.startsWith('3.0.'), 'package version must remain in the 3.0 release line')
require(pkg.scripts['audit-trail:readiness'] === 'node scripts/audit-trail-readiness-local.mjs', 'audit-trail:readiness script missing')
require(pkg.scripts['phase75:audit'] === 'node scripts/phase75-audit-trail-readiness-audit.mjs', 'phase75:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase75:audit'), 'quality:release must include phase75 audit')
require(exists('lib/audit-trail/readiness.ts'), 'audit trail readiness helper missing')
for (const token of ['getAuditTrailReadinessReport', 'AUDIT_TRAIL_MODE', 'AUDIT_TRAIL_P0_EVENTS_REVIEWED', 'AUDIT_TRAIL_REDACTION_REVIEWED', 'AUDIT_TRAIL_RETENTION_DAYS', 'payment.verify', 'privacy.delete.decision']) {
  require(helper.includes(token), `helper missing ${token}`)
}
require(exists('app/admin/audit-trail-readiness/page.tsx'), 'admin audit trail readiness page missing')
require(adminPage.includes('Audit trail readiness') && adminPage.includes('/api/admin/audit-trail-readiness') && adminPage.includes('Phase 75'), 'admin page must show title, API and phase badge')
require(exists('app/api/admin/audit-trail-readiness/route.ts'), 'audit trail admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getAuditTrailReadinessReport'), 'admin API must require admin and return audit trail readiness report')
require(exists('scripts/audit-trail-readiness-local.mjs'), 'audit trail local evidence script missing')
require(localScript.includes('audit-trail-controls.csv') && localScript.includes('audit-trail-event-groups.csv') && localScript.includes('audit-trail-runbook.csv'), 'local evidence script must write controls, event groups and runbook CSV files')
require(adminShell.includes('/admin/audit-trail-readiness'), 'admin shell must link audit trail readiness')
for (const key of ['AUDIT_TRAIL_OWNER', 'AUDIT_TRAIL_MODE', 'AUDIT_TRAIL_P0_EVENTS_REVIEWED', 'AUDIT_TRAIL_WRITE_PATH_REVIEWED', 'AUDIT_TRAIL_REDACTION_REVIEWED', 'AUDIT_TRAIL_RETENTION_DAYS', 'AUDIT_TRAIL_TAMPER_REVIEWED', 'AUDIT_TRAIL_ALERT_WEBHOOK_URL', 'AUDIT_TRAIL_EXPORT_REVIEWED', 'AUDIT_TRAIL_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Audit Trail Readiness'), 'launch evidence gate missing Audit Trail Readiness')
require(exists('PHASE_75_AUDIT_TRAIL_READINESS.md'), 'Phase 75 notes missing')

console.log('\nHaqSathi Phase 75 audit trail readiness audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 75 audit passed: audit trail helper, admin page, API, envs, evidence script and launch gate are installed.\n')
