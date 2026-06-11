import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/billing/refund-dispute-readiness.ts')
const adminPage = read('app/admin/refund-dispute-readiness/page.tsx')
const adminApi = read('app/api/admin/refund-dispute-readiness/route.ts')
const localScript = read('scripts/refund-dispute-readiness-local.mjs')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const previousAudit = read('scripts/phase86-invoice-tax-readiness-audit.mjs')

requireCheck(pkg.version === '3.0.57-refund-dispute-readiness' || /^3\.0\.(5[8-9]|[6-9][0-9])-/.test(pkg.version), 'package version must be 3.0.57 or newer release')
requireCheck(pkg.scripts['refund-dispute:readiness'] === 'node scripts/refund-dispute-readiness-local.mjs', 'refund-dispute:readiness script missing')
requireCheck(pkg.scripts['phase87:audit'] === 'node scripts/phase87-refund-dispute-audit.mjs', 'phase87:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase87:audit'), 'quality:release must include phase87 audit')
requireCheck(exists('lib/billing/refund-dispute-readiness.ts'), 'refund dispute readiness helper missing')
for (const token of ['getRefundDisputeReadinessReport', 'refundDisputeLanes', 'REFUND_DISPUTE_OWNER', 'REFUND_DISPUTE_MODE', 'REFUND_POLICY_REVIEWED', 'CANCELLATION_FLOW_REVIEWED', 'FAILED_PAYMENT_FLOW_REVIEWED', 'CHARGEBACK_RESPONSE_REVIEWED']) {
  requireCheck(helper.includes(token), `helper missing ${token}`)
}
for (const lane of ['subscription-cancel', 'approved-refund', 'failed-payment-no-access', 'duplicate-payment', 'chargeback-response', 'billing-support-dispute']) {
  requireCheck(helper.includes(lane), `refund/dispute lane missing ${lane}`)
}
requireCheck(exists('app/admin/refund-dispute-readiness/page.tsx'), 'admin refund dispute readiness page missing')
requireCheck(adminPage.includes('Refund/dispute readiness') && adminPage.includes('/api/admin/refund-dispute-readiness') && adminPage.includes('Phase 87'), 'admin page must show title, API and phase badge')
requireCheck(exists('app/api/admin/refund-dispute-readiness/route.ts'), 'refund dispute readiness API route missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getRefundDisputeReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/refund-dispute-readiness-local.mjs'), 'refund dispute readiness local evidence script missing')
for (const token of ['refund-dispute-readiness.json', 'refund-dispute-controls.csv', 'refund-dispute-lanes.csv', 'refund-policy-review.md', 'cancellation-flow-checklist.md', 'chargeback-response-template.md', 'billing-support-macros.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/refund-dispute-readiness'), 'admin shell must link refund/dispute readiness page')
for (const key of ['REFUND_DISPUTE_MODE', 'REFUND_DISPUTE_OWNER', 'REFUND_POLICY_REVIEWED', 'CANCELLATION_FLOW_REVIEWED', 'FAILED_PAYMENT_FLOW_REVIEWED', 'DUPLICATE_PAYMENT_REVIEWED', 'CHARGEBACK_RESPONSE_REVIEWED', 'BILLING_SUPPORT_MACROS_REVIEWED', 'REFUND_DISPUTE_EVIDENCE_REVIEWED', 'REFUND_DISPUTE_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(evidence.includes('Refund Dispute Readiness') && evidence.includes('npm run refund-dispute:readiness'), 'launch evidence gate missing refund dispute readiness')
requireCheck(previousAudit.includes('3.0.56') && (previousAudit.includes('5[7-9]') || previousAudit.includes('3.0.57')), 'phase86 audit must accept newer release')

console.log('\nPhase 87 refund/dispute readiness audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 87 refund/dispute readiness checks passed.\n')
