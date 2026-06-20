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

const helper = exists('lib/backups/readiness.ts') ? read('lib/backups/readiness.ts') : ''
const route = exists('app/api/cron/backup-readiness/route.ts') ? read('app/api/cron/backup-readiness/route.ts') : ''
const adminBackups = exists('app/admin/backups/page.tsx') ? read('app/admin/backups/page.tsx') : ''
const runbook = exists('app/admin/backup-restore/page.tsx') ? read('app/admin/backup-restore/page.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(16|1[7-9]|[2-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.16+')
require(pkg.scripts['backups:readiness'] === 'node scripts/backup-readiness-local.mjs', 'backups:readiness script missing')
require(pkg.scripts['phase46:audit'] === 'node scripts/phase46-backup-recovery-audit.mjs', 'phase46:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase46:audit'), 'quality:release must include phase46 audit')
require(exists('lib/backups/readiness.ts'), 'backup readiness helper missing')
require(helper.includes('collectBackupReadiness') && helper.includes('restoreDrillMinimumEvidence') && helper.includes('BACKUP_RETENTION_DAYS'), 'backup helper must collect readiness and restore evidence requirements')
require(exists('app/api/cron/backup-readiness/route.ts'), 'backup readiness cron route missing')
require(route.includes('CRON_SECRET') && route.includes('collectBackupReadiness') && route.includes('X-HaqSathi-Backup-Readiness'), 'backup cron route must be protected and return readiness header')
require(exists('scripts/backup-readiness-local.mjs'), 'backup readiness local evidence script missing')
require(adminBackups.includes('/api/cron/backup-readiness') && adminBackups.includes('npm run backups:readiness'), 'admin backups page must show readiness workflow')
require(runbook.includes('Restore drill') && runbook.includes('monthly'), 'backup restore runbook must include restore drill guidance')
for (const key of ['BACKUP_EVIDENCE_DIR', 'BACKUP_RETENTION_DAYS', 'BACKUP_RESTORE_TEST_OWNER']) require(env.includes(`${key}=`), `.env.example missing ${key}`)
require(evidence.includes('Backup + Restore Readiness'), 'launch evidence gate missing backup readiness')
require(exists('PHASE_46_BACKUP_RECOVERY.md'), 'Phase 46 notes missing')

console.log('\nHaqSathi Phase 46 backup recovery audit')
console.log('Checks: 15')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 46 audit passed: backup readiness helper, cron route, admin workflow, local evidence, envs and launch gate are installed.\n')
