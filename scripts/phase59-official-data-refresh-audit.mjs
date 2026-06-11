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

const helper = exists('lib/official-data-refresh-readiness.ts') ? read('lib/official-data-refresh-readiness.ts') : ''
const adminPage = exists('app/admin/official-data-refresh/page.tsx') ? read('app/admin/official-data-refresh/page.tsx') : ''
const adminApi = exists('app/api/admin/official-data-refresh-readiness/route.ts') ? read('app/api/admin/official-data-refresh-readiness/route.ts') : ''
const cronApi = exists('app/api/cron/official-data-refresh/route.ts') ? read('app/api/cron/official-data-refresh/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(/3\.0\.(2[9]|[3-9][0-9])/.test(pkg.version), 'package version must be v3.0.29+')
require(pkg.scripts['official-data:readiness'] === 'node scripts/official-data-refresh-readiness-local.mjs', 'official-data:readiness script missing')
require(pkg.scripts['phase59:audit'] === 'node scripts/phase59-official-data-refresh-audit.mjs', 'phase59:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase59:audit'), 'quality:release must include phase59 audit')
require(exists('lib/official-data-refresh-readiness.ts'), 'official data refresh readiness helper missing')
for (const token of ['getOfficialDataRefreshReadinessReport', 'officialDataRefreshDatasets', 'OFFICIAL_DATA_SYNC_MODE', 'OFFICIAL_DATA_ALLOWED_DOMAINS', 'freshnessSlaDays', 'ingestionRules']) {
  require(helper.includes(token), `official data helper missing ${token}`)
}
require(exists('app/admin/official-data-refresh/page.tsx'), 'admin official data refresh page missing')
require(adminPage.includes('Official data refresh readiness') && adminPage.includes('npm run official-data:readiness') && adminPage.includes('/api/admin/official-data-refresh-readiness'), 'admin page must show title, command and API')
require(exists('app/api/admin/official-data-refresh-readiness/route.ts'), 'admin official data refresh API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getOfficialDataRefreshReadinessReport'), 'admin API must require admin and return report')
require(exists('app/api/cron/official-data-refresh/route.ts'), 'official data refresh cron route missing')
require(cronApi.includes('CRON_SECRET') && cronApi.includes('getOfficialDataRefreshReadinessReport') && cronApi.includes('OFFICIAL_DATA_SYNC_DRY_RUN'), 'cron route must be protected and dry-run aware')
require(exists('scripts/official-data-refresh-readiness-local.mjs'), 'official data refresh local evidence script missing')
require(adminShell.includes('/admin/official-data-refresh'), 'admin shell must link official data refresh page')
for (const key of ['OFFICIAL_DATA_SYNC_MODE', 'OFFICIAL_DATA_SYNC_DRY_RUN', 'OFFICIAL_DATA_ALLOWED_DOMAINS', 'OFFICIAL_DATA_STALE_AFTER_DAYS', 'OFFICIAL_DATA_REVIEW_OWNER', 'OFFICIAL_DATA_CONTENT_OWNER', 'OFFICIAL_DATA_SYNC_CRON_ENABLED', 'OFFICIAL_DATA_CHANGE_WEBHOOK_URL', 'OFFICIAL_DATA_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Official Data Refresh Readiness'), 'launch evidence gate missing official data refresh readiness')
require(exists('PHASE_59_OFFICIAL_DATA_REFRESH.md'), 'Phase 59 notes missing')

console.log('\nHaqSathi Phase 59 official data refresh audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 59 audit passed: official data refresh readiness, admin page, API, cron, evidence script, envs and launch gate are installed.\n')
