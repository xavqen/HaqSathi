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

const helper = exists('lib/payment-lifecycle-readiness.ts') ? read('lib/payment-lifecycle-readiness.ts') : ''
const adminPage = exists('app/admin/payment-lifecycle/page.tsx') ? read('app/admin/payment-lifecycle/page.tsx') : ''
const adminApi = exists('app/api/admin/payment-lifecycle-readiness/route.ts') ? read('app/api/admin/payment-lifecycle-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(3[1-9]|[4-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.31+')
require(pkg.scripts['payment:readiness'] === 'node scripts/payment-lifecycle-readiness-local.mjs', 'payment:readiness script missing')
require(pkg.scripts['phase61:audit'] === 'node scripts/phase61-payment-lifecycle-audit.mjs', 'phase61:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase61:audit'), 'quality:release must include phase61 audit')
require(exists('lib/payment-lifecycle-readiness.ts'), 'payment lifecycle readiness helper missing')
for (const token of ['getPaymentLifecycleReadinessReport', 'paymentLifecycleLanes', 'PAYMENT_LIFECYCLE_MODE', 'PAYMENT_REFUND_MODE', 'PAYMENT_WEBHOOK_MODE', 'RAZORPAY_WEBHOOK_SECRET', 'critical']) {
  require(helper.includes(token), `payment helper missing ${token}`)
}
require(exists('app/admin/payment-lifecycle/page.tsx'), 'admin payment lifecycle page missing')
require(adminPage.includes('Payment lifecycle readiness') && adminPage.includes('npm run payment:readiness') && adminPage.includes('/api/admin/payment-lifecycle-readiness'), 'admin page must show title, command and API')
require(exists('app/api/admin/payment-lifecycle-readiness/route.ts'), 'payment lifecycle admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getPaymentLifecycleReadinessReport'), 'admin API must require admin and return report')
require(exists('scripts/payment-lifecycle-readiness-local.mjs'), 'payment readiness local evidence script missing')
require(adminShell.includes('/admin/payment-lifecycle'), 'admin shell must link payment lifecycle page')
for (const key of ['PAYMENT_LIFECYCLE_MODE', 'PAYMENT_DRY_RUN', 'PAYMENT_WEBHOOK_MODE', 'PAYMENT_REFUND_MODE', 'PAYMENT_RETRY_LIMIT', 'PAYMENT_GRACE_PERIOD_DAYS', 'PAYMENT_LIFECYCLE_OWNER', 'PAYMENT_RECEIPT_FROM_EMAIL', 'PAYMENT_FAILURE_WEBHOOK_URL', 'PAYMENT_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Payment Lifecycle Readiness'), 'launch evidence gate missing payment lifecycle readiness')
require(exists('PHASE_61_PAYMENT_LIFECYCLE.md'), 'Phase 61 notes missing')

console.log('\nHaqSathi Phase 61 payment lifecycle audit')
console.log('Checks: 15')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 61 audit passed: payment lifecycle helper, admin page, API, evidence script, envs and launch gate are installed.\n')
