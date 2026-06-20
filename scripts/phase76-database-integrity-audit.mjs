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

const helper = exists('lib/database/integrity-readiness.ts') ? read('lib/database/integrity-readiness.ts') : ''
const adminPage = exists('app/admin/database-integrity/page.tsx') ? read('app/admin/database-integrity/page.tsx') : ''
const adminApi = exists('app/api/admin/database-integrity-readiness/route.ts') ? read('app/api/admin/database-integrity-readiness/route.ts') : ''
const localScript = exists('scripts/database-integrity-readiness-local.mjs') ? read('scripts/database-integrity-readiness-local.mjs') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(pkg.version === '3.0.46-database-integrity-readiness' || (/^3\.0\.(4[7-9]|[5-9][0-9])-/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be 3.0.46 database integrity or newer release')
require(pkg.scripts['database:integrity-readiness'] === 'node scripts/database-integrity-readiness-local.mjs', 'database:integrity-readiness script missing')
require(pkg.scripts['phase76:audit'] === 'node scripts/phase76-database-integrity-audit.mjs', 'phase76:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase76:audit'), 'quality:release must include phase76 audit')
require(exists('lib/database/integrity-readiness.ts'), 'database integrity readiness helper missing')
for (const token of ['getDatabaseIntegrityReadinessReport', 'DATABASE_URL', 'DIRECT_URL', 'DATABASE_SCHEMA_VALIDATE_REVIEWED', 'DATABASE_MIGRATION_REVIEWED', 'DATABASE_SEED_IDEMPOTENCY_REVIEWED', 'DATABASE_BACKUP_RESTORE_REVIEWED', 'DATABASE_RLS_POLICY_REVIEWED']) {
  require(helper.includes(token), `helper missing ${token}`)
}
for (const model of ['User', 'Complaint', 'PaymentOrder', 'DocumentVaultItem', 'OfficialLinkCheck', 'SupportTicket']) {
  require(helper.includes(model), `dataset map missing ${model}`)
}
require(exists('app/admin/database-integrity/page.tsx'), 'admin database integrity page missing')
require(adminPage.includes('Database integrity readiness') && adminPage.includes('/api/admin/database-integrity-readiness') && adminPage.includes('Phase 76'), 'admin page must show title, API and phase badge')
require(exists('app/api/admin/database-integrity-readiness/route.ts'), 'database integrity admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getDatabaseIntegrityReadinessReport'), 'admin API must require admin and return database integrity report')
require(exists('scripts/database-integrity-readiness-local.mjs'), 'database integrity local evidence script missing')
require(localScript.includes('database-integrity-controls.csv') && localScript.includes('database-integrity-datasets.csv') && localScript.includes('database-integrity-runbook.csv'), 'local evidence script must write controls, datasets and runbook CSV files')
require(adminShell.includes('/admin/database-integrity'), 'admin shell must link database integrity page')
for (const key of ['DATABASE_INTEGRITY_OWNER', 'DATABASE_INTEGRITY_MODE', 'DATABASE_SCHEMA_VALIDATE_REVIEWED', 'DATABASE_MIGRATION_REVIEWED', 'DATABASE_INDEX_REVIEWED', 'DATABASE_BACKUP_RESTORE_REVIEWED', 'DATABASE_SEED_IDEMPOTENCY_REVIEWED', 'DATABASE_POOLING_REVIEWED', 'DATABASE_RLS_POLICY_REVIEWED', 'DATABASE_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Database Integrity Readiness'), 'launch evidence gate missing Database Integrity Readiness')
require(exists('PHASE_76_DATABASE_INTEGRITY_READINESS.md'), 'Phase 76 notes missing')

console.log('\nHaqSathi Phase 76 database integrity readiness audit')
console.log('Checks: 18')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 76 audit passed: database integrity helper, admin page, API, envs, evidence script and launch gate are installed.\n')
