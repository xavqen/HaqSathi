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

const helper = exists('lib/privacy/operations.ts') ? read('lib/privacy/operations.ts') : ''
const route = exists('app/api/cron/privacy-ops/route.ts') ? read('app/api/cron/privacy-ops/route.ts') : ''
const adminPage = exists('app/admin/privacy-ops/page.tsx') ? read('app/admin/privacy-ops/page.tsx') : ''
const privacyForm = exists('components/forms/privacy-center-form.tsx') ? read('components/forms/privacy-center-form.tsx') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(17|1[8-9]|[2-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.17+')
require(pkg.scripts['privacy:readiness'] === 'node scripts/privacy-ops-readiness-local.mjs', 'privacy:readiness script missing')
require(pkg.scripts['phase47:audit'] === 'node scripts/phase47-privacy-operations-audit.mjs', 'phase47:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase47:audit'), 'quality:release must include phase47 audit')
require(exists('lib/privacy/operations.ts'), 'privacy operations helper missing')
require(helper.includes('collectPrivacyOperationsReadiness') && helper.includes('privacyOpsMinimumEvidence') && helper.includes('PRIVACY_DELETION_SLA_DAYS'), 'privacy helper must collect readiness and evidence requirements')
require(exists('app/api/cron/privacy-ops/route.ts'), 'privacy ops cron route missing')
require(route.includes('CRON_SECRET') && route.includes('collectPrivacyOperationsReadiness') && route.includes('X-HaqSathi-Privacy-Ops'), 'privacy cron route must be protected and return readiness header')
require(exists('app/admin/privacy-ops/page.tsx'), 'admin privacy ops page missing')
require(adminPage.includes('npm run privacy:readiness') && adminPage.includes('/api/cron/privacy-ops') && adminPage.includes('Minimum launch evidence'), 'admin privacy ops page must show workflow, cron and evidence')
require(privacyForm.includes('/api/dashboard/export/data') && privacyForm.includes('Download my data'), 'Privacy Center must expose user data export')
require(adminShell.includes('/admin/privacy-ops'), 'admin shell must link privacy ops page')
for (const key of ['PRIVACY_EXPORT_SLA_DAYS', 'PRIVACY_DELETION_SLA_DAYS', 'PRIVACY_EVIDENCE_DIR', 'PRIVACY_REVIEW_OWNER']) require(env.includes(`${key}=`), `.env.example missing ${key}`)
require(evidence.includes('Data Export + Deletion Readiness'), 'launch evidence gate missing privacy operations')
require(exists('scripts/privacy-ops-readiness-local.mjs'), 'privacy local evidence script missing')
require(exists('PHASE_47_PRIVACY_OPERATIONS.md'), 'Phase 47 notes missing')

console.log('\nHaqSathi Phase 47 privacy operations audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 47 audit passed: privacy operations helper, cron route, admin page, user export UX, envs and launch gate are installed.\n')
