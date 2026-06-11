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

const helper = exists('lib/device-qa/readiness.ts') ? read('lib/device-qa/readiness.ts') : ''
const adminPage = exists('app/admin/real-device-qa/page.tsx') ? read('app/admin/real-device-qa/page.tsx') : ''
const adminApi = exists('app/api/admin/real-device-qa-readiness/route.ts') ? read('app/api/admin/real-device-qa-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(/3\.0\.([4-9][0-9]|40)/.test(pkg.version), 'package version must be v3.0.40+')
require(pkg.scripts['device-qa:readiness'] === 'node scripts/real-device-qa-readiness-local.mjs', 'device-qa:readiness script missing')
require(pkg.scripts['phase70:audit'] === 'node scripts/phase70-real-device-qa-audit.mjs', 'phase70:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase70:audit'), 'quality:release must include phase70 audit')
require(exists('lib/device-qa/readiness.ts'), 'real device QA helper missing')
for (const token of ['getRealDeviceQaReadinessReport', 'REAL_DEVICE_QA_ROUTES', 'ANDROID_CHROME_QA_REVIEWED', 'IOS_SAFARI_QA_REVIEWED', 'TABLET_QA_REVIEWED', 'DESKTOP_QA_REVIEWED', 'REAL_DEVICE_BUG_INBOX']) {
  require(helper.includes(token), `helper missing ${token}`)
}
require(exists('app/admin/real-device-qa/page.tsx'), 'admin real device QA page missing')
require(adminPage.includes('Real device QA readiness') && adminPage.includes('/api/admin/real-device-qa-readiness') && adminPage.includes('/admin/mobile-app-readiness') && adminPage.includes('Phase 70'), 'admin page must show title, API, mobile app link and phase badge')
require(exists('app/api/admin/real-device-qa-readiness/route.ts'), 'real device QA admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getRealDeviceQaReadinessReport'), 'admin API must require admin and return real-device QA report')
require(exists('scripts/real-device-qa-readiness-local.mjs'), 'real device QA local evidence script missing')
require(adminShell.includes('/admin/real-device-qa'), 'admin shell must link real device QA')
for (const key of ['REAL_DEVICE_QA_OWNER', 'REAL_DEVICE_QA_ROUTES', 'REAL_DEVICE_QA_EVIDENCE_DIR', 'REAL_DEVICE_BUG_INBOX', 'ANDROID_CHROME_QA_REVIEWED', 'IOS_SAFARI_QA_REVIEWED', 'TABLET_QA_REVIEWED', 'DESKTOP_QA_REVIEWED']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Real Device QA Readiness'), 'launch evidence gate missing Real Device QA Readiness')
require(exists('PHASE_70_REAL_DEVICE_QA_READINESS.md'), 'Phase 70 notes missing')

console.log('\nHaqSathi Phase 70 real device QA audit')
console.log('Checks: 16')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 70 audit passed: real-device QA helper, admin page, API, envs, evidence script and launch gate are installed.\n')
