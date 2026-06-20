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

const helper = exists('lib/deployment/qa-readiness.ts') ? read('lib/deployment/qa-readiness.ts') : ''
const adminPage = exists('app/admin/deployment-qa/page.tsx') ? read('app/admin/deployment-qa/page.tsx') : ''
const adminApi = exists('app/api/admin/deployment-qa-readiness/route.ts') ? read('app/api/admin/deployment-qa-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(3[3-9]|[4-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.33+')
require(pkg.scripts['deployment:qa-readiness'] === 'node scripts/live-deployment-qa-readiness-local.mjs', 'deployment:qa-readiness script missing')
require(pkg.scripts['phase63:audit'] === 'node scripts/phase63-deployment-qa-audit.mjs', 'phase63:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase63:audit'), 'quality:release must include phase63 audit')
require(exists('lib/deployment/qa-readiness.ts'), 'deployment QA readiness helper missing')
for (const token of ['getDeploymentQaReadinessReport', 'VERCEL_PRODUCTION_URL', 'PLAYWRIGHT_PRODUCTION_PASSED', 'LIGHTHOUSE_PRODUCTION_PASSED', 'MOBILE_VIEWPORT_QA_PASSED', 'SEO_INDEXING_REVIEWED']) {
  require(helper.includes(token), `deployment helper missing ${token}`)
}
require(exists('app/admin/deployment-qa/page.tsx'), 'admin deployment QA page missing')
require(adminPage.includes('Live deployment QA readiness') && adminPage.includes('npm run deployment:qa-readiness') && adminPage.includes('/api/admin/deployment-qa-readiness') && adminPage.includes('/admin/production-qa'), 'admin page must show title, command, API and production QA link')
require(exists('app/api/admin/deployment-qa-readiness/route.ts'), 'deployment QA admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getDeploymentQaReadinessReport'), 'admin API must require admin and return deployment QA report')
require(exists('scripts/live-deployment-qa-readiness-local.mjs'), 'deployment QA local evidence script missing')
require(adminShell.includes('/admin/deployment-qa'), 'admin shell must link deployment QA page')
for (const key of ['DEPLOYMENT_QA_MODE', 'DEPLOYMENT_QA_EVIDENCE_DIR', 'VERCEL_PREVIEW_URL', 'VERCEL_DEPLOYMENT_ID', 'VERCEL_BUILD_LOG_REVIEWED', 'VERCEL_ERROR_LOGS_REVIEWED', 'VERCEL_CRON_JOBS_CONFIGURED', 'PLAYWRIGHT_PRODUCTION_PASSED', 'LIGHTHOUSE_PRODUCTION_PASSED', 'LIGHTHOUSE_MIN_PERFORMANCE', 'MOBILE_VIEWPORT_QA_PASSED', 'DESKTOP_VIEWPORT_QA_PASSED', 'SEO_INDEXING_REVIEWED']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Live Deployment QA Readiness'), 'launch evidence gate missing live deployment QA readiness')
require(exists('PHASE_63_DEPLOYMENT_QA.md'), 'Phase 63 notes missing')

console.log('\nHaqSathi Phase 63 deployment QA audit')
console.log('Checks: 15')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 63 audit passed: deployment QA helper, admin page, API, evidence script, envs and launch gate are installed.\n')
