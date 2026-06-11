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

const helper = exists('lib/seo/indexing-readiness.ts') ? read('lib/seo/indexing-readiness.ts') : ''
const adminPage = exists('app/admin/seo-indexing/page.tsx') ? read('app/admin/seo-indexing/page.tsx') : ''
const adminApi = exists('app/api/admin/seo-indexing-readiness/route.ts') ? read('app/api/admin/seo-indexing-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(/3\.0\.(3[6-9]|[4-9][0-9])/.test(pkg.version), 'package version must be v3.0.36+')
require(pkg.scripts['seo:indexing-readiness'] === 'node scripts/seo-indexing-readiness-local.mjs', 'seo:indexing-readiness script missing')
require(pkg.scripts['phase66:audit'] === 'node scripts/phase66-seo-indexing-audit.mjs', 'phase66:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase66:audit'), 'quality:release must include phase66 audit')
require(exists('lib/seo/indexing-readiness.ts'), 'SEO indexing helper missing')
for (const token of ['getSeoIndexingReadinessReport', 'SEARCH_CONSOLE_PROPERTY_VERIFIED', 'SEARCH_CONSOLE_SITEMAP_SUBMITTED', 'ROBOTS_TXT_REVIEWED', 'SEO_CANONICAL_REVIEWED', 'SEO_INDEXING_EVIDENCE_DIR']) {
  require(helper.includes(token), `helper missing ${token}`)
}
require(exists('app/admin/seo-indexing/page.tsx'), 'admin SEO indexing page missing')
require(adminPage.includes('SEO indexing readiness') && adminPage.includes('npm run seo:indexing-readiness') && adminPage.includes('/api/admin/seo-indexing-readiness') && adminPage.includes('/admin/seo-audit'), 'admin page must show title, command, API and SEO audit link')
require(exists('app/api/admin/seo-indexing-readiness/route.ts'), 'SEO indexing admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getSeoIndexingReadinessReport'), 'admin API must require admin and return SEO indexing report')
require(exists('scripts/seo-indexing-readiness-local.mjs'), 'SEO indexing local evidence script missing')
require(adminShell.includes('/admin/seo-indexing'), 'admin shell must link SEO indexing readiness')
for (const key of ['SEO_INDEXING_MODE', 'SEARCH_CONSOLE_PROPERTY_VERIFIED', 'SEARCH_CONSOLE_SITEMAP_SUBMITTED', 'ROBOTS_TXT_REVIEWED', 'SEO_CANONICAL_REVIEWED', 'SEO_INDEXING_CORE_ROUTES', 'SEO_INDEXING_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('SEO Indexing Readiness'), 'launch evidence gate missing SEO indexing readiness')
require(exists('PHASE_66_SEO_INDEXING.md'), 'Phase 66 notes missing')

console.log('\nHaqSathi Phase 66 SEO indexing audit')
console.log('Checks: 15')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 66 audit passed: SEO indexing helper, admin page, API, evidence script, envs and launch gate are installed.\n')
