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

const helper = exists('lib/translation/review-readiness.ts') ? read('lib/translation/review-readiness.ts') : ''
const adminPage = exists('app/admin/translation-review/page.tsx') ? read('app/admin/translation-review/page.tsx') : ''
const adminApi = exists('app/api/admin/translation-review-readiness/route.ts') ? read('app/api/admin/translation-review-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(3[5-9]|[4-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.35+')
require(pkg.scripts['translation:readiness'] === 'node scripts/translation-review-readiness-local.mjs', 'translation:readiness script missing')
require(pkg.scripts['phase65:audit'] === 'node scripts/phase65-translation-review-audit.mjs', 'phase65:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase65:audit'), 'quality:release must include phase65 audit')
require(exists('lib/translation/review-readiness.ts'), 'translation review helper missing')
for (const token of ['getTranslationReviewReadinessReport', 'TRANSLATION_REVIEW_OWNER', 'TRANSLATION_PRIORITY_LANGUAGES', 'TRANSLATION_HUMAN_REVIEW_REQUIRED', 'TRANSLATION_RTL_REVIEW_PASSED', 'TRANSLATION_LEGAL_REVIEW_PASSED']) {
  require(helper.includes(token), `helper missing ${token}`)
}
require(exists('app/admin/translation-review/page.tsx'), 'admin translation review page missing')
require(adminPage.includes('Translation review readiness') && adminPage.includes('npm run translation:readiness') && adminPage.includes('/api/admin/translation-review-readiness') && adminPage.includes('/admin/localization'), 'admin page must show title, command, API and localization link')
require(exists('app/api/admin/translation-review-readiness/route.ts'), 'translation review admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getTranslationReviewReadinessReport'), 'admin API must require admin and return translation report')
require(exists('scripts/translation-review-readiness-local.mjs'), 'translation review local evidence script missing')
require(adminShell.includes('/admin/translation-review'), 'admin shell must link translation review')
for (const key of ['TRANSLATION_REVIEW_MODE', 'TRANSLATION_REVIEW_OWNER', 'TRANSLATION_PRIORITY_LANGUAGES', 'TRANSLATION_HUMAN_REVIEW_REQUIRED', 'TRANSLATION_RTL_REVIEW_PASSED', 'TRANSLATION_LEGAL_REVIEW_PASSED', 'TRANSLATION_REVIEW_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Translation Review Readiness'), 'launch evidence gate missing translation review readiness')
require(exists('PHASE_65_TRANSLATION_REVIEW.md'), 'Phase 65 notes missing')

console.log('\nHaqSathi Phase 65 translation review audit')
console.log('Checks: 15')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 65 audit passed: translation review helper, admin page, API, evidence script, envs and launch gate are installed.\n')
