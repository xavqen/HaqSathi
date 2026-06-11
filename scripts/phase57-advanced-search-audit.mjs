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

const helper = exists('lib/search-readiness.ts') ? read('lib/search-readiness.ts') : ''
const adminPage = exists('app/admin/search-readiness/page.tsx') ? read('app/admin/search-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/search-readiness/route.ts') ? read('app/api/admin/search-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const searchPage = read('app/search/page.tsx')

require(/3\.0\.(2[7-9]|[3-9][0-9])/.test(pkg.version), 'package version must be v3.0.27+')
require(pkg.scripts['search:readiness'] === 'node scripts/search-readiness-local.mjs', 'search:readiness script missing')
require(pkg.scripts['phase57:audit'] === 'node scripts/phase57-advanced-search-audit.mjs', 'phase57:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase57:audit'), 'quality:release must include phase57 audit')
require(exists('lib/search-readiness.ts'), 'search readiness helper missing')
for (const token of ['getSearchReadinessReport', 'SEARCH_PROVIDER', 'SEARCH_PII_GUARD_ENABLED', 'recommendedSynonyms', 'neverIndex', 'launchEvidence']) {
  require(helper.includes(token), `search helper missing ${token}`)
}
require(exists('app/admin/search-readiness/page.tsx'), 'admin search readiness page missing')
require(adminPage.includes('Advanced search readiness') && adminPage.includes('npm run search:readiness') && adminPage.includes('/api/admin/search-readiness'), 'admin search page must show title, command and API')
require(exists('app/api/admin/search-readiness/route.ts'), 'admin search readiness API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getSearchReadinessReport'), 'admin search API must require admin and return report')
require(exists('scripts/search-readiness-local.mjs'), 'search readiness local script missing')
require(adminShell.includes('/admin/search-readiness'), 'admin shell must link search readiness page')
for (const key of ['SEARCH_PROVIDER', 'SEARCH_INDEX_DRY_RUN', 'SEARCH_PII_GUARD_ENABLED', 'SEARCH_SYNONYMS_ENABLED', 'SEARCH_TYPO_TOLERANCE_ENABLED', 'SEARCH_REINDEX_CRON_ENABLED', 'SEARCH_INDEX_EVIDENCE_DIR', 'SEARCH_REVIEW_OWNER', 'ALGOLIA_APP_ID', 'ALGOLIA_ADMIN_API_KEY', 'ALGOLIA_SEARCH_INDEX', 'MEILISEARCH_HOST', 'MEILISEARCH_API_KEY', 'MEILISEARCH_INDEX']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Advanced Search Readiness'), 'launch evidence gate missing advanced search readiness')
require(searchPage.includes('GlobalSearchForm') && searchPage.includes('searchEverything'), 'existing search page must remain wired to global search form and searchEverything')
require(exists('PHASE_57_ADVANCED_SEARCH.md'), 'Phase 57 notes missing')

console.log('\nHaqSathi Phase 57 advanced search audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 57 audit passed: advanced search readiness, admin page, API, evidence script, envs and launch gate are installed.\n')
