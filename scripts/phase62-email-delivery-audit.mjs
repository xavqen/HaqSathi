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

const helper = exists('lib/email/delivery-readiness.ts') ? read('lib/email/delivery-readiness.ts') : ''
const adminPage = exists('app/admin/email-delivery-readiness/page.tsx') ? read('app/admin/email-delivery-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/email-delivery-readiness/route.ts') ? read('app/api/admin/email-delivery-readiness/route.ts') : ''
const emailTestApi = exists('app/api/email/test/route.ts') ? read('app/api/email/test/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(3[2-9]|[4-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.32+')
require(pkg.scripts['email:readiness'] === 'node scripts/email-delivery-readiness-local.mjs', 'email:readiness script missing')
require(pkg.scripts['phase62:audit'] === 'node scripts/phase62-email-delivery-audit.mjs', 'phase62:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase62:audit'), 'quality:release must include phase62 audit')
require(exists('lib/email/delivery-readiness.ts'), 'email delivery readiness helper missing')
for (const token of ['getEmailDeliveryReadinessReport', 'emailTemplateLanes', 'EMAIL_DELIVERY_MODE', 'EMAIL_DELIVERY_DKIM_VERIFIED', 'EMAIL_SUPPRESSION_LIST_ENABLED', 'PASSWORD_RESET', 'PAYMENT_RECEIPT']) {
  require(helper.includes(token), `email helper missing ${token}`)
}
require(exists('app/admin/email-delivery-readiness/page.tsx'), 'admin email delivery readiness page missing')
require(adminPage.includes('Email delivery readiness') && adminPage.includes('npm run email:readiness') && adminPage.includes('/api/admin/email-delivery-readiness') && adminPage.includes('/api/email/test'), 'admin page must show title, command, API and test endpoint')
require(exists('app/api/admin/email-delivery-readiness/route.ts'), 'email delivery admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getEmailDeliveryReadinessReport') && adminApi.includes('emailLog') && adminApi.includes('maskEmail'), 'admin API must require admin, return report, include EmailLog metrics and mask emails')
require(exists('app/api/email/test/route.ts'), 'email test API missing')
require(emailTestApi.includes('requireAdmin') && emailTestApi.includes('sendTransactionalEmail'), 'email test API must require admin and use transactional email service')
require(exists('scripts/email-delivery-readiness-local.mjs'), 'email readiness local evidence script missing')
require(adminShell.includes('/admin/email-delivery-readiness'), 'admin shell must link email delivery readiness page')
for (const key of ['EMAIL_DELIVERY_MODE', 'EMAIL_DELIVERY_DRY_RUN', 'EMAIL_DELIVERY_DOMAIN', 'EMAIL_DELIVERY_DKIM_VERIFIED', 'EMAIL_DELIVERY_SPF_VERIFIED', 'EMAIL_DELIVERY_DMARC_VERIFIED', 'EMAIL_DELIVERY_TEST_TO', 'EMAIL_BOUNCE_WEBHOOK_URL', 'EMAIL_COMPLAINT_WEBHOOK_URL', 'EMAIL_SUPPRESSION_LIST_ENABLED', 'EMAIL_FAILURE_ALERT_THRESHOLD_PERCENT', 'EMAIL_DELIVERY_OWNER', 'EMAIL_DELIVERY_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Email Delivery Readiness'), 'launch evidence gate missing email delivery readiness')
require(exists('PHASE_62_EMAIL_DELIVERY.md'), 'Phase 62 notes missing')

console.log('\nHaqSathi Phase 62 email delivery audit')
console.log('Checks: 16')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 62 audit passed: email delivery helper, admin page, API, evidence script, envs and launch gate are installed.\n')
