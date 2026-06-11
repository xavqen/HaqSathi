import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/billing/invoice-tax-readiness.ts')
const adminPage = read('app/admin/invoice-tax-readiness/page.tsx')
const adminApi = read('app/api/admin/invoice-tax-readiness/route.ts')
const localScript = read('scripts/invoice-tax-readiness-local.mjs')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const previousAudit = read('scripts/phase85-entitlement-readiness-audit.mjs')

requireCheck(pkg.version === '3.0.56-invoice-tax-readiness' || /^3\.0\.(5[7-9]|[6-9][0-9])-/.test(pkg.version) || pkg.version.includes('newer release'), 'package version must be 3.0.56-invoice-tax-readiness or newer release')
requireCheck(pkg.scripts['invoice-tax:readiness'] === 'node scripts/invoice-tax-readiness-local.mjs', 'invoice-tax:readiness script missing')
requireCheck(pkg.scripts['phase86:audit'] === 'node scripts/phase86-invoice-tax-readiness-audit.mjs', 'phase86:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase86:audit'), 'quality:release must include phase86 audit')
requireCheck(exists('lib/billing/invoice-tax-readiness.ts'), 'invoice tax readiness helper missing')
for (const token of ['getInvoiceTaxReadinessReport', 'invoiceTaxLanes', 'INVOICE_TAX_OWNER', 'INVOICE_TAX_MODE', 'INVOICE_TAX_SELLER_PROFILE_REVIEWED', 'INVOICE_TAX_NUMBERING_REVIEWED', 'INVOICE_TAX_RECEIPT_TEMPLATE_REVIEWED', 'INVOICE_TAX_GST_REVIEWED']) {
  requireCheck(helper.includes(token), `helper missing ${token}`)
}
for (const lane of ['payment-receipt', 'tax-invoice', 'refund-note', 'credit-note', 'billing-export']) {
  requireCheck(helper.includes(lane), `invoice/tax lane missing ${lane}`)
}
requireCheck(exists('app/admin/invoice-tax-readiness/page.tsx'), 'admin invoice tax readiness page missing')
requireCheck(adminPage.includes('Invoice/tax readiness') && adminPage.includes('/api/admin/invoice-tax-readiness') && adminPage.includes('Phase 86'), 'admin page must show title, API and phase badge')
requireCheck(exists('app/api/admin/invoice-tax-readiness/route.ts'), 'invoice tax readiness API route missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getInvoiceTaxReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/invoice-tax-readiness-local.mjs'), 'invoice tax readiness local evidence script missing')
for (const token of ['invoice-tax-readiness.json', 'invoice-tax-controls.csv', 'invoice-tax-lanes.csv', 'receipt-template-checklist.md', 'gst-tax-review-checklist.md', 'refund-credit-note-matrix.md', 'billing-export-safety.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/invoice-tax-readiness'), 'admin shell must link invoice/tax readiness page')
for (const key of ['INVOICE_TAX_OWNER', 'INVOICE_TAX_MODE', 'INVOICE_TAX_SELLER_PROFILE_REVIEWED', 'INVOICE_TAX_NUMBERING_REVIEWED', 'INVOICE_TAX_RECEIPT_TEMPLATE_REVIEWED', 'INVOICE_TAX_REFUND_NOTE_REVIEWED', 'INVOICE_TAX_GST_REVIEWED', 'INVOICE_TAX_ACCESS_REVIEWED', 'INVOICE_TAX_EVIDENCE_REVIEWED', 'INVOICE_TAX_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(evidence.includes('Invoice Tax Readiness') && evidence.includes('npm run invoice-tax:readiness'), 'launch evidence gate missing invoice tax readiness')
requireCheck(previousAudit.includes('3.0.55') && previousAudit.includes('3.0.56'), 'phase85 audit must accept newer release')

console.log('\nPhase 86 invoice/tax readiness audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 86 invoice/tax readiness checks passed.\n')
