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

const helper = exists('lib/status-tracking-readiness.ts') ? read('lib/status-tracking-readiness.ts') : ''
const adminPage = exists('app/admin/status-tracking/page.tsx') ? read('app/admin/status-tracking/page.tsx') : ''
const adminApi = exists('app/api/admin/status-tracking-readiness/route.ts') ? read('app/api/admin/status-tracking-readiness/route.ts') : ''
const dashboardPage = exists('app/dashboard/status-tracker/page.tsx') ? read('app/dashboard/status-tracker/page.tsx') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const dashboardShell = exists('components/dashboard/dashboard-shell.tsx') ? read('components/dashboard/dashboard-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(2[8-9]|[3-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.28+')
require(pkg.scripts['status-tracking:readiness'] === 'node scripts/status-tracking-readiness-local.mjs', 'status-tracking:readiness script missing')
require(pkg.scripts['phase58:audit'] === 'node scripts/phase58-status-tracking-audit.mjs', 'phase58:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase58:audit'), 'quality:release must include phase58 audit')
require(exists('lib/status-tracking-readiness.ts'), 'status tracking readiness helper missing')
for (const token of ['getStatusTrackingReadinessReport', 'statusTrackingPortals', 'STATUS_TRACKING_MODE', 'STATUS_TRACKING_ALLOWED_PORTALS', 'neverAskFor', 'privacyRules']) {
  require(helper.includes(token), `status tracking helper missing ${token}`)
}
require(exists('app/admin/status-tracking/page.tsx'), 'admin status tracking page missing')
require(adminPage.includes('Application status tracking readiness') && adminPage.includes('npm run status-tracking:readiness') && adminPage.includes('/api/admin/status-tracking-readiness'), 'admin status tracking page must show title, command and API')
require(exists('app/api/admin/status-tracking-readiness/route.ts'), 'admin status tracking API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getStatusTrackingReadinessReport'), 'admin status tracking API must require admin and return report')
require(exists('app/dashboard/status-tracker/page.tsx'), 'dashboard status tracker page missing')
require(dashboardPage.includes('Status tracker') && dashboardPage.includes('statusTrackingPortals') && dashboardPage.includes('Never share'), 'dashboard status tracker must show safe portal guidance')
require(exists('scripts/status-tracking-readiness-local.mjs'), 'status tracking readiness local script missing')
require(adminShell.includes('/admin/status-tracking'), 'admin shell must link status tracking page')
require(dashboardShell.includes('/dashboard/status-tracker'), 'dashboard shell must link status tracker page')
for (const key of ['STATUS_TRACKING_MODE', 'STATUS_TRACKING_DRY_RUN', 'STATUS_TRACKING_EVIDENCE_DIR', 'STATUS_TRACKING_REVIEW_OWNER', 'STATUS_TRACKING_CRON_ENABLED', 'STATUS_TRACKING_POLL_INTERVAL_HOURS', 'STATUS_TRACKING_ALLOWED_PORTALS', 'STATUS_TRACKING_WEBHOOK_URL', 'STATUS_TRACKING_NOTIFY_ON_CHANGE']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Application Status Tracking Readiness'), 'launch evidence gate missing status tracking readiness')
require(exists('PHASE_58_STATUS_TRACKING.md'), 'Phase 58 notes missing')

console.log('\nHaqSathi Phase 58 status tracking audit')
console.log('Checks: 18')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 58 audit passed: status tracking readiness, dashboard page, admin page, API, evidence script, envs and launch gate are installed.\n')
