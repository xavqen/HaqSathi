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

const helper = exists('lib/notifications/readiness.ts') ? read('lib/notifications/readiness.ts') : ''
const adminPage = exists('app/admin/notification-readiness/page.tsx') ? read('app/admin/notification-readiness/page.tsx') : ''
const apiRoute = exists('app/api/admin/notification-readiness/route.ts') ? read('app/api/admin/notification-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const sw = exists('public/sw.js') ? read('public/sw.js') : ''

require((/3\.0\.(2[1-9]|[3-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.21+')
require(pkg.scripts['notification:readiness'] === 'node scripts/notification-readiness-local.mjs', 'notification:readiness script missing')
require(pkg.scripts['phase51:audit'] === 'node scripts/phase51-notification-readiness-audit.mjs', 'phase51:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase51:audit'), 'quality:release must include phase51 audit')
require(exists('lib/notifications/readiness.ts'), 'notification readiness helper missing')
for (const token of ['getNotificationReadinessReport', 'getNotificationReadinessChannels', 'PWA web push readiness', 'WhatsApp alert provider', 'SMS alert provider', 'NOTIFICATION_DRY_RUN']) {
  require(helper.includes(token), `notification helper missing ${token}`)
}
require(exists('app/admin/notification-readiness/page.tsx'), 'admin notification readiness page missing')
require(adminPage.includes('npm run notification:readiness') && adminPage.includes('/api/admin/notification-readiness') && adminPage.includes('Minimum launch evidence'), 'admin notification readiness page must show command, API path and evidence')
require(exists('app/api/admin/notification-readiness/route.ts'), 'notification readiness admin API missing')
require(apiRoute.includes('requireAdmin') && apiRoute.includes('getNotificationReadinessReport'), 'notification readiness API must require admin and return report')
require(adminShell.includes('/admin/notification-readiness'), 'admin shell must link notification readiness page')
for (const key of ['NOTIFICATION_EVIDENCE_DIR', 'NOTIFICATION_ALERT_OWNER', 'NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT', 'WHATSAPP_PROVIDER_URL', 'SMS_PROVIDER_URL', 'REMINDER_PUSH_ENABLED', 'REMINDER_WHATSAPP_ENABLED', 'REMINDER_SMS_ENABLED']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Notification Readiness'), 'launch evidence gate missing notification readiness')
require(exists('scripts/notification-readiness-local.mjs'), 'notification readiness local evidence script missing')
require(exists('PHASE_51_NOTIFICATION_READINESS.md'), 'Phase 51 notes missing')
require(sw.includes('fetch'), 'service worker must remain present for PWA readiness')

console.log('\nHaqSathi Phase 51 notification readiness audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 51 audit passed: notification readiness helper, admin page, API, evidence script, envs and launch gate are installed.\n')
