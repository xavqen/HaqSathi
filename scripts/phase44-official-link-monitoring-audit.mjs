import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (file) => readFileSync(join(root, file), 'utf8')
const exists = (file) => existsSync(join(root, file))
const pkg = JSON.parse(read('package.json'))

function require(condition, message) {
  if (!condition) issues.push(message)
}

const checker = exists('lib/link-checks/checker.ts') ? read('lib/link-checks/checker.ts') : ''
const cronRoute = exists('app/api/cron/link-checks/route.ts') ? read('app/api/cron/link-checks/route.ts') : ''
const adminPage = exists('app/admin/link-checks/page.tsx') ? read('app/admin/link-checks/page.tsx') : ''
const localScript = exists('scripts/official-link-check-local.mjs') ? read('scripts/official-link-check-local.mjs') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(/3\.0\.(14|1[5-9]|[2-9][0-9])/.test(pkg.version), 'package version must be v3.0.14+')
require(pkg.scripts['link-checks:local'] === 'node scripts/official-link-check-local.mjs', 'link-checks:local script missing')
require(pkg.scripts['phase44:audit'] === 'node scripts/phase44-official-link-monitoring-audit.mjs', 'phase44:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase44:audit'), 'quality:release must include phase44 audit')
require(exists('lib/link-checks/checker.ts'), 'DB-backed official link checker missing')
require(checker.includes('runOfficialLinkChecks') && checker.includes('summarizeOfficialLinkChecks'), 'checker must expose run and summary helpers')
require(checker.includes('HEAD') && checker.includes('GET'), 'checker must use HEAD with GET fallback')
require(checker.includes('LINK_CHECK_TIMEOUT_MS') && checker.includes('LINK_CHECK_BATCH_LIMIT'), 'checker must use timeout and batch env controls')
require(exists('app/api/cron/link-checks/route.ts'), 'cron link-check route missing')
require(cronRoute.includes('CRON_SECRET') && cronRoute.includes('Bearer ${secret}'), 'cron route must be secret protected')
require(exists('scripts/official-link-check-local.mjs'), 'local seed link checker missing')
require(localScript.includes('artifacts/link-checks') && localScript.includes('official-link-check'), 'local checker must write evidence files')
require(adminPage.includes('Official source safety') && adminPage.includes('Run automated checks'), 'admin link checks command center missing')
require(adminPage.includes('npm run link-checks:local') && adminPage.includes('/api/cron/link-checks'), 'admin page must show local and cron commands')
require(env.includes('LINK_CHECK_TIMEOUT_MS') && env.includes('LINK_CHECK_BATCH_LIMIT'), '.env.example link check controls missing')
require(evidence.includes('Automated Official Link Monitor'), 'launch evidence gate for automated link monitoring missing')
require(exists('PHASE_44_OFFICIAL_LINK_MONITORING.md'), 'Phase 44 notes missing')

console.log('\nHaqSathi Phase 44 official link monitoring audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 44 audit passed: DB cron, local evidence checker, admin monitoring UI and launch gate are installed.\n')
