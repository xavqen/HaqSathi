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

const helper = exists('lib/mobile-app/readiness.ts') ? read('lib/mobile-app/readiness.ts') : ''
const adminPage = exists('app/admin/mobile-app-readiness/page.tsx') ? read('app/admin/mobile-app-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/mobile-app-readiness/route.ts') ? read('app/api/admin/mobile-app-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(/3\.0\.(39|[4-9][0-9])/.test(pkg.version), 'package version must be v3.0.39+')
require(pkg.scripts['mobile-app:readiness'] === 'node scripts/mobile-app-readiness-local.mjs', 'mobile-app:readiness script missing')
require(pkg.scripts['phase69:audit'] === 'node scripts/phase69-mobile-app-readiness-audit.mjs', 'phase69:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase69:audit'), 'quality:release must include phase69 audit')
require(exists('lib/mobile-app/readiness.ts'), 'mobile app readiness helper missing')
for (const token of ['getMobileAppReadinessReport', 'NATIVE_APP_STRATEGY', 'ANDROID_PACKAGE_NAME', 'IOS_BUNDLE_ID', 'MOBILE_APP_EVIDENCE_DIR']) {
  require(helper.includes(token), `helper missing ${token}`)
}
require(exists('app/admin/mobile-app-readiness/page.tsx'), 'admin mobile app readiness page missing')
require(adminPage.includes('Mobile app readiness') && adminPage.includes('/api/admin/mobile-app-readiness') && adminPage.includes('/admin/pwa-readiness') && adminPage.includes('Phase 69'), 'admin page must show title, API, PWA link and phase badge')
require(exists('app/api/admin/mobile-app-readiness/route.ts'), 'mobile app admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getMobileAppReadinessReport'), 'admin API must require admin and return mobile app report')
require(exists('scripts/mobile-app-readiness-local.mjs'), 'mobile app local evidence script missing')
require(adminShell.includes('/admin/mobile-app-readiness'), 'admin shell must link mobile app readiness')
for (const key of ['NATIVE_APP_STRATEGY', 'NATIVE_APP_NAME', 'ANDROID_PACKAGE_NAME', 'IOS_BUNDLE_ID', 'NATIVE_APP_SUPPORT_URL', 'NATIVE_APP_PRIVACY_URL', 'MOBILE_APP_EVIDENCE_DIR', 'MOBILE_APP_ROUTE_TARGETS', 'PLAY_STORE_READINESS_REVIEWED', 'APP_STORE_READINESS_REVIEWED', 'TWA_ASSET_LINKS_REVIEWED', 'CAPACITOR_SYNC_REVIEWED', 'MOBILE_APP_PERMISSION_REVIEWED', 'MOBILE_APP_STORE_ASSETS_REVIEWED', 'MOBILE_APP_PAYMENT_POLICY_REVIEWED']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Mobile App Readiness'), 'launch evidence gate missing Mobile App Readiness')
require(exists('PHASE_69_MOBILE_APP_READINESS.md'), 'Phase 69 notes missing')

console.log('\nHaqSathi Phase 69 mobile app readiness audit')
console.log('Checks: 15')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 69 audit passed: mobile app readiness helper, admin page, API, envs, evidence script and launch gate are installed.\n')
