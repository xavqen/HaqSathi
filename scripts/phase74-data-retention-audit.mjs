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

const helper = exists('lib/data-retention/readiness.ts') ? read('lib/data-retention/readiness.ts') : ''
const adminPage = exists('app/admin/data-retention/page.tsx') ? read('app/admin/data-retention/page.tsx') : ''
const adminApi = exists('app/api/admin/data-retention-readiness/route.ts') ? read('app/api/admin/data-retention-readiness/route.ts') : ''
const localScript = exists('scripts/data-retention-readiness-local.mjs') ? read('scripts/data-retention-readiness-local.mjs') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(pkg.version.startsWith('3.0.'), 'package version must remain in the 3.0 release line')
require(pkg.scripts['retention:readiness'] === 'node scripts/data-retention-readiness-local.mjs', 'retention:readiness script missing')
require(pkg.scripts['phase74:audit'] === 'node scripts/phase74-data-retention-audit.mjs', 'phase74:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase74:audit'), 'quality:release must include phase74 audit')
require(exists('lib/data-retention/readiness.ts'), 'data retention readiness helper missing')
for (const token of ['getDataRetentionReadinessReport', 'RETENTION_ACCOUNT_PROFILE_DAYS', 'DATA_RETENTION_PURGE_MODE', 'DATA_RETENTION_HOLDS_REVIEWED', 'DATA_RETENTION_EXPORT_DELETE_TESTED', 'RETENTION_AUDIT_LOG_DAYS']) {
  require(helper.includes(token), `helper missing ${token}`)
}
require(exists('app/admin/data-retention/page.tsx'), 'admin data retention page missing')
require(adminPage.includes('Data retention readiness') && adminPage.includes('/api/admin/data-retention-readiness') && adminPage.includes('Phase 74'), 'admin page must show title, API and phase badge')
require(exists('app/api/admin/data-retention-readiness/route.ts'), 'data retention admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getDataRetentionReadinessReport'), 'admin API must require admin and return data retention readiness report')
require(exists('scripts/data-retention-readiness-local.mjs'), 'data retention local evidence script missing')
require(localScript.includes('data-retention-controls.csv') && localScript.includes('data-retention-datasets.csv') && localScript.includes('data-retention-runbook.csv'), 'local evidence script must write controls, dataset and runbook CSV files')
require(adminShell.includes('/admin/data-retention'), 'admin shell must link data retention readiness')
for (const key of ['DATA_RETENTION_OWNER', 'DATA_RETENTION_POLICY_REVIEWED', 'DATA_RETENTION_HOLDS_REVIEWED', 'DATA_RETENTION_PURGE_MODE', 'DATA_RETENTION_AUDIT_REDACTION_REVIEWED', 'DATA_RETENTION_EXPORT_DELETE_TESTED', 'DATA_RETENTION_BACKUP_ALIGNMENT_REVIEWED', 'DATA_RETENTION_EVIDENCE_DIR', 'RETENTION_ACCOUNT_PROFILE_DAYS', 'RETENTION_COMPLAINT_DRAFT_DAYS', 'RETENTION_DOCUMENT_VAULT_DAYS', 'RETENTION_PAYMENT_RECORD_DAYS', 'RETENTION_SUPPORT_TICKET_DAYS', 'RETENTION_AUDIT_LOG_DAYS', 'RETENTION_MARKETING_RECORD_DAYS']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Data Retention Readiness'), 'launch evidence gate missing Data Retention Readiness')
require(exists('PHASE_74_DATA_RETENTION_READINESS.md'), 'Phase 74 notes missing')

console.log('\nHaqSathi Phase 74 data retention readiness audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 74 audit passed: data retention helper, admin page, API, envs, evidence script and launch gate are installed.\n')
