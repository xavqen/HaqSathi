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

const helper = exists('lib/accessibility/readiness.ts') ? read('lib/accessibility/readiness.ts') : ''
const adminPage = exists('app/admin/accessibility-readiness/page.tsx') ? read('app/admin/accessibility-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/accessibility-readiness/route.ts') ? read('app/api/admin/accessibility-readiness/route.ts') : ''
const localScript = exists('scripts/accessibility-readiness-local.mjs') ? read('scripts/accessibility-readiness-local.mjs') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(/3\.0\.([4-9][1-9]|[5-9][0-9])/.test(pkg.version) || pkg.version.includes('3.0.41'), 'package version must be v3.0.41+')
require(pkg.scripts['accessibility:readiness'] === 'node scripts/accessibility-readiness-local.mjs', 'accessibility:readiness script missing')
require(pkg.scripts['phase71:audit'] === 'node scripts/phase71-accessibility-readiness-audit.mjs', 'phase71:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase71:audit'), 'quality:release must include phase71 audit')
require(exists('lib/accessibility/readiness.ts'), 'accessibility readiness helper missing')
for (const token of ['getAccessibilityReadinessReport', 'ACCESSIBILITY_ROUTE_TARGETS', 'ACCESSIBILITY_KEYBOARD_REVIEWED', 'ACCESSIBILITY_FOCUS_REVIEWED', 'ACCESSIBILITY_FORM_REVIEWED', 'ACCESSIBILITY_CONTRAST_REVIEWED', 'ACCESSIBILITY_SCREEN_READER_REVIEWED']) {
  require(helper.includes(token), `helper missing ${token}`)
}
require(exists('app/admin/accessibility-readiness/page.tsx'), 'admin accessibility readiness page missing')
require(adminPage.includes('Accessibility readiness') && adminPage.includes('/api/admin/accessibility-readiness') && adminPage.includes('Phase 71'), 'admin page must show title, API and phase badge')
require(exists('app/api/admin/accessibility-readiness/route.ts'), 'accessibility readiness admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getAccessibilityReadinessReport'), 'admin API must require admin and return accessibility readiness report')
require(exists('scripts/accessibility-readiness-local.mjs'), 'accessibility readiness local evidence script missing')
require(localScript.includes('accessibility-controls.csv') && localScript.includes('accessibility-routes.csv'), 'local evidence script must write controls and routes CSV files')
require(adminShell.includes('/admin/accessibility-readiness'), 'admin shell must link accessibility readiness')
for (const key of ['ACCESSIBILITY_QA_OWNER', 'ACCESSIBILITY_ROUTE_TARGETS', 'ACCESSIBILITY_EVIDENCE_DIR', 'ACCESSIBILITY_KEYBOARD_REVIEWED', 'ACCESSIBILITY_FOCUS_REVIEWED', 'ACCESSIBILITY_FORM_REVIEWED', 'ACCESSIBILITY_CONTRAST_REVIEWED', 'ACCESSIBILITY_SCREEN_READER_REVIEWED', 'ACCESSIBILITY_REDUCED_MOTION_REVIEWED']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Accessibility Readiness'), 'launch evidence gate missing Accessibility Readiness')
require(exists('PHASE_71_ACCESSIBILITY_READINESS.md'), 'Phase 71 notes missing')

console.log('\nHaqSathi Phase 71 accessibility readiness audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 71 audit passed: accessibility helper, admin page, API, envs, evidence script and launch gate are installed.\n')
