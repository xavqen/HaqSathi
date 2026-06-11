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

const helper = exists('lib/performance/readiness.ts') ? read('lib/performance/readiness.ts') : ''
const adminPage = exists('app/admin/performance-readiness/page.tsx') ? read('app/admin/performance-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/performance-readiness/route.ts') ? read('app/api/admin/performance-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(/3\.0\.(3[7-9]|[4-9][0-9])/.test(pkg.version), 'package version must be v3.0.37+')
require(pkg.scripts['performance:readiness'] === 'node scripts/performance-readiness-local.mjs', 'performance:readiness script missing')
require(pkg.scripts['phase67:audit'] === 'node scripts/phase67-performance-readiness-audit.mjs', 'phase67:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase67:audit'), 'quality:release must include phase67 audit')
require(exists('lib/performance/readiness.ts'), 'performance readiness helper missing')
for (const token of ['getPerformanceReadinessReport', 'WEB_VITALS_LCP_TARGET_MS', 'WEB_VITALS_CLS_TARGET', 'WEB_VITALS_INP_TARGET_MS', 'PERFORMANCE_EVIDENCE_DIR']) {
  require(helper.includes(token), `helper missing ${token}`)
}
require(exists('app/admin/performance-readiness/page.tsx'), 'admin performance readiness page missing')
require(adminPage.includes('Performance readiness') && adminPage.includes('npm run performance:readiness') && adminPage.includes('/api/admin/performance-readiness') && adminPage.includes('/admin/deployment-qa'), 'admin page must show title, command, API and deployment QA link')
require(exists('app/api/admin/performance-readiness/route.ts'), 'performance admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getPerformanceReadinessReport'), 'admin API must require admin and return performance report')
require(exists('scripts/performance-readiness-local.mjs'), 'performance local evidence script missing')
require(adminShell.includes('/admin/performance-readiness'), 'admin shell must link performance readiness')
for (const key of ['PERFORMANCE_QA_MODE', 'PERFORMANCE_ROUTE_TARGETS', 'PERFORMANCE_EVIDENCE_DIR', 'LIGHTHOUSE_MIN_PERFORMANCE', 'LIGHTHOUSE_MIN_ACCESSIBILITY', 'LIGHTHOUSE_MIN_BEST_PRACTICES', 'LIGHTHOUSE_MIN_SEO', 'WEB_VITALS_LCP_TARGET_MS', 'WEB_VITALS_CLS_TARGET', 'WEB_VITALS_INP_TARGET_MS', 'PERFORMANCE_BUNDLE_REVIEWED', 'PERFORMANCE_IMAGE_REVIEWED', 'PERFORMANCE_FONT_REVIEWED', 'PERFORMANCE_MOBILE_THROTTLE_REVIEWED']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Performance Readiness'), 'launch evidence gate missing Performance Readiness')
require(exists('PHASE_67_PERFORMANCE_READINESS.md'), 'Phase 67 notes missing')

console.log('\nHaqSathi Phase 67 performance readiness audit')
console.log('Checks: 15')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 67 audit passed: performance helper, admin page, API, evidence script, envs and launch gate are installed.\n')
