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

const helper = exists('lib/pwa/readiness.ts') ? read('lib/pwa/readiness.ts') : ''
const adminPage = exists('app/admin/pwa-readiness/page.tsx') ? read('app/admin/pwa-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/pwa-readiness/route.ts') ? read('app/api/admin/pwa-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const sw = exists('public/sw.js') ? read('public/sw.js') : ''
const pwaRegister = exists('components/layout/pwa-register.tsx') ? read('components/layout/pwa-register.tsx') : ''

require(/3\.0\.(3[8-9]|[4-9][0-9])/.test(pkg.version), 'package version must be v3.0.38+')
require(pkg.scripts['pwa:readiness'] === 'node scripts/pwa-readiness-local.mjs', 'pwa:readiness script missing')
require(pkg.scripts['phase68:audit'] === 'node scripts/phase68-pwa-readiness-audit.mjs', 'phase68:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase68:audit'), 'quality:release must include phase68 audit')
require(exists('lib/pwa/readiness.ts'), 'PWA readiness helper missing')
for (const token of ['getPwaReadinessReport', 'PWA_OFFLINE_ROUTE_TARGETS', 'PWA_INSTALL_FLOW_REVIEWED', 'PWA_UPDATE_FLOW_REVIEWED', 'PWA_EVIDENCE_DIR']) {
  require(helper.includes(token), `helper missing ${token}`)
}
require(exists('app/admin/pwa-readiness/page.tsx'), 'admin PWA readiness page missing')
require(adminPage.includes('PWA & offline readiness') && adminPage.includes('npm run pwa:readiness') && adminPage.includes('/api/admin/pwa-readiness') && adminPage.includes('/offline.html'), 'admin page must show title, command, API and offline link')
require(exists('app/api/admin/pwa-readiness/route.ts'), 'PWA admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getPwaReadinessReport'), 'admin API must require admin and return PWA report')
require(exists('scripts/pwa-readiness-local.mjs'), 'PWA local evidence script missing')
require(adminShell.includes('/admin/pwa-readiness'), 'admin shell must link PWA readiness')
require(exists('public/sw.js'), 'service worker missing')
require((sw.includes('haqsathi-ai-v3-0-38') || sw.includes('haqsathi-ai-v3-0-84')) && sw.includes('navigationPreload') && sw.includes('OFFLINE_URL') && sw.includes('/api/'), 'service worker must have v38/v84 cache, navigation preload, offline fallback and API cache guard')
require(pwaRegister.includes('controllerchange') && pwaRegister.includes('serviceWorker.register'), 'PWA register must handle service worker registration/update')
for (const key of ['NEXT_PUBLIC_ENABLE_PWA', 'PWA_EVIDENCE_DIR', 'PWA_OFFLINE_ROUTE_TARGETS', 'PWA_MANIFEST_REVIEWED', 'PWA_ICON_REVIEWED', 'PWA_OFFLINE_FALLBACK_REVIEWED', 'PWA_INSTALL_FLOW_REVIEWED', 'PWA_UPDATE_FLOW_REVIEWED', 'PWA_PUSH_PERMISSION_REVIEWED']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('PWA Offline Readiness'), 'launch evidence gate missing PWA Offline Readiness')
require(exists('PHASE_68_PWA_OFFLINE_READINESS.md'), 'Phase 68 notes missing')

console.log('\nHaqSathi Phase 68 PWA/offline readiness audit')
console.log('Checks: 16')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 68 audit passed: PWA helper, admin page, API, service worker, envs, evidence script and launch gate are installed.\n')
