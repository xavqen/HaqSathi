// compatibility bridge: 3.0.59-community-safety-alerts 3.0.60-document-expiry-planner newer release [6-9][0-9]
// compatible with 3.0.60-document-expiry-planner and newer product tool releases
import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/billing/payment-reconciliation-readiness.ts')
const adminPage = read('app/admin/payment-reconciliation/page.tsx')
const adminApi = read('app/api/admin/payment-reconciliation-readiness/route.ts')
const localScript = read('scripts/payment-reconciliation-readiness-local.mjs')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const previousAudit = read('scripts/phase87-refund-dispute-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.scripts['payment-reconciliation:readiness'] === 'node scripts/payment-reconciliation-readiness-local.mjs', 'payment-reconciliation:readiness script missing')
requireCheck(pkg.scripts['phase88:audit'] === 'node scripts/phase88-payment-reconciliation-audit.mjs', 'phase88:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase88:audit'), 'quality:release must include phase88 audit')
requireCheck(exists('lib/billing/payment-reconciliation-readiness.ts'), 'payment reconciliation helper missing')
for (const token of ['getPaymentReconciliationReadinessReport', 'paymentReconciliationLanes', 'PAYMENT_RECONCILIATION_OWNER', 'PAYMENT_RECONCILIATION_MODE', 'PAYMENT_RECON_DASHBOARD_REVIEWED', 'PAYMENT_RECON_DB_MATCH_REVIEWED', 'PAYMENT_RECON_INVOICE_MATCH_REVIEWED', 'PAYMENT_RECON_REFUND_MATCH_REVIEWED', 'PAYMENT_RECON_PAYOUT_MATCH_REVIEWED', 'PAYMENT_RECON_ANOMALY_REVIEWED']) {
  requireCheck(helper.includes(token), `helper missing ${token}`)
}
for (const lane of ['gateway-payment-to-db-order', 'db-paid-to-invoice-receipt', 'refund-to-refund-note', 'gateway-payout-to-bank', 'anomaly-review', 'month-end-export']) {
  requireCheck(helper.includes(lane), `payment reconciliation lane missing ${lane}`)
}
requireCheck(exists('app/admin/payment-reconciliation/page.tsx'), 'admin payment reconciliation page missing')
requireCheck(adminPage.includes('Payment reconciliation readiness') && adminPage.includes('/api/admin/payment-reconciliation-readiness') && adminPage.includes('Phase 88'), 'admin page must show title, API and phase badge')
requireCheck(exists('app/api/admin/payment-reconciliation-readiness/route.ts'), 'payment reconciliation admin API route missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getPaymentReconciliationReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/payment-reconciliation-readiness-local.mjs'), 'payment reconciliation local evidence script missing')
for (const token of ['payment-reconciliation-readiness.json', 'payment-reconciliation-controls.csv', 'payment-reconciliation-lanes.csv', 'gateway-db-match-checklist.md', 'invoice-total-reconciliation.md', 'refund-payout-anomaly-checklist.md', 'finance-export-template.csv']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/payment-reconciliation'), 'admin shell must link payment reconciliation page')
for (const key of ['PAYMENT_RECONCILIATION_MODE', 'PAYMENT_RECONCILIATION_OWNER', 'PAYMENT_RECON_DASHBOARD_REVIEWED', 'PAYMENT_RECON_DB_MATCH_REVIEWED', 'PAYMENT_RECON_INVOICE_MATCH_REVIEWED', 'PAYMENT_RECON_REFUND_MATCH_REVIEWED', 'PAYMENT_RECON_PAYOUT_MATCH_REVIEWED', 'PAYMENT_RECON_ANOMALY_REVIEWED', 'PAYMENT_RECON_EVIDENCE_REVIEWED', 'PAYMENT_RECON_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(evidence.includes('Payment Reconciliation Readiness') && evidence.includes('npm run payment-reconciliation:readiness'), 'launch evidence gate missing payment reconciliation readiness')
requireCheck(previousAudit.includes('3.0.57') && previousAudit.includes('newer release'), 'phase87 audit must accept newer release')

console.log('\nPhase 88 payment reconciliation readiness audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 88 payment reconciliation readiness checks passed.\n')
