import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const outputDir = process.env.BACKUP_EVIDENCE_DIR || './artifacts/backup-readiness'
const resolvedOutput = join(root, outputDir)
mkdirSync(resolvedOutput, { recursive: true })

function read(file) {
  return readFileSync(join(root, file), 'utf8')
}

function exists(file) {
  return existsSync(join(root, file))
}

function hasEnvLine(env, name) {
  return new RegExp(`^${name}=`, 'm').test(env)
}

const envExample = read('.env.example')
const packageJson = JSON.parse(read('package.json'))
const requiredEnv = [
  'DATABASE_URL',
  'DIRECT_URL',
  'ADMIN_BACKUP_SECRET',
  'CRON_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_STORAGE_BUCKET',
  'BACKUP_EVIDENCE_DIR',
  'BACKUP_RETENTION_DAYS',
  'BACKUP_RESTORE_TEST_OWNER'
]

const checks = [
  { name: 'Admin full export endpoint exists', ok: exists('app/api/admin/export/full/route.ts') },
  { name: 'Backup readiness cron route exists', ok: exists('app/api/cron/backup-readiness/route.ts') },
  { name: 'Backup readiness helper exists', ok: exists('lib/backups/readiness.ts') },
  { name: 'Admin backups page exists', ok: exists('app/admin/backups/page.tsx') },
  { name: 'Backup restore runbook exists', ok: exists('app/admin/backup-restore/page.tsx') },
  { name: 'Phase 46 audit exists', ok: exists('scripts/phase46-backup-recovery-audit.mjs') },
  { name: 'Package script backups:readiness exists', ok: packageJson.scripts?.['backups:readiness'] === 'node scripts/backup-readiness-local.mjs' },
  ...requiredEnv.map((name) => ({ name: `.env.example contains ${name}`, ok: hasEnvLine(envExample, name) }))
]

const report = {
  ok: checks.every((check) => check.ok),
  generatedAt: new Date().toISOString(),
  appVersion: packageJson.version,
  outputDir,
  backupExportEndpoint: '/api/admin/export/full?secret=ADMIN_BACKUP_SECRET',
  backupReadinessCronEndpoint: '/api/cron/backup-readiness',
  checks,
  manualEvidenceStillRequired: [
    'Download a real admin backup from the deployed admin account.',
    'Run a restore drill on staging or a temporary Supabase project.',
    'Confirm private storage files are restored and owner-only access still works.',
    'Save screenshots and JSON response under artifacts/backup-readiness.'
  ]
}

const jsonPath = join(resolvedOutput, 'backup-readiness-local.json')
const csvPath = join(resolvedOutput, 'backup-readiness-local.csv')
writeFileSync(jsonPath, JSON.stringify(report, null, 2))
writeFileSync(csvPath, ['check,ok', ...checks.map((check) => `"${check.name.replaceAll('"', '""')}",${check.ok}`)].join('\n'))

console.log('\nHaqSathi backup readiness local evidence')
console.log(`Checks: ${checks.length}`)
console.log(`Issues found: ${checks.filter((check) => !check.ok).length}`)
console.log(`JSON: ${jsonPath}`)
console.log(`CSV: ${csvPath}`)
if (!report.ok) {
  for (const check of checks.filter((item) => !item.ok)) console.error('❌ ' + check.name)
  process.exit(1)
}
console.log('✅ Backup readiness evidence generated. Real restore drill is still required before public launch.\n')
