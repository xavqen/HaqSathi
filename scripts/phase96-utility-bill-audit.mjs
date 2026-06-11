import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/utility-bill-dispute-planner.ts')
const form = read('components/forms/utility-bill-dispute-planner-form.tsx')
const page = read('app/tools/utility-bill-dispute-planner/page.tsx')
const readiness = read('lib/productivity/utility-bill-dispute-readiness.ts')
const adminPage = read('app/admin/utility-bill-readiness/page.tsx')
const adminApi = read('app/api/admin/utility-bill-readiness/route.ts')
const localScript = read('scripts/utility-bill-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase95 = read('scripts/phase95-return-pickup-audit.mjs')

requireCheck(['3.0.66-utility-bill-dispute-planner', '3.0.67-rent-deposit-dispute-planner', '3.0.68-insurance-claim-planner', '3.0.69-loan-app-harassment-planner', '3.0.70-job-salary-dispute-planner', '3.0.71-education-form-correction-planner', '3.0.72-travel-refund-cancellation-planner', '3.0.73-medical-bill-dispute-planner', '3.0.74-telecom-sim-complaint-planner', '3.0.75-courier-parcel-dispute-planner', '3.0.76-bank-account-freeze-planner', '3.0.77-vehicle-challan-dispute-planner', '3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.66-utility-bill-dispute-planner')
requireCheck(pkg.scripts['utility-bill:readiness'] === 'node scripts/utility-bill-readiness-local.mjs', 'utility-bill:readiness script missing')
requireCheck(pkg.scripts['phase96:audit'] === 'node scripts/phase96-utility-bill-audit.mjs', 'phase96:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase96:audit'), 'quality:release must include phase96 audit')
requireCheck(exists('lib/productivity/utility-bill-dispute-planner.ts'), 'utility bill planner helper missing')
for (const token of ['utilityBillIssueTypes', 'utilityBillTypes', 'buildUtilityBillDisputePlan', 'copyReadyMessage', 'proofChecklist', 'safetyWarnings']) {
  requireCheck(helper.includes(token), `utility bill helper missing ${token}`)
}
requireCheck(exists('components/forms/utility-bill-dispute-planner-form.tsx'), 'utility bill form missing')
for (const token of ['UtilityBillDisputePlannerForm', 'Copy bill dispute message', 'buildUtilityBillDisputePlan', 'Secret-safe complaint']) {
  requireCheck(form.includes(token), `utility bill form missing ${token}`)
}
requireCheck(exists('app/tools/utility-bill-dispute-planner/page.tsx'), 'utility bill tool page missing')
requireCheck(page.includes('Utility bill dispute planner') && page.includes('UtilityBillDisputePlannerForm'), 'tool page must include title and form')
requireCheck(catalog.includes('/tools/utility-bill-dispute-planner') && catalog.includes('Utility Bill Dispute Planner'), 'tools catalog missing utility bill planner')
requireCheck(sitemap.includes('/tools/utility-bill-dispute-planner'), 'sitemap missing utility bill planner')
requireCheck(exists('lib/productivity/utility-bill-dispute-readiness.ts'), 'utility bill readiness helper missing')
for (const token of ['getUtilityBillDisputeReadinessReport', 'utilityBillReadinessLanes', 'UTILITY_BILL_DISPUTE_MODE', 'UTILITY_BILL_COPY_REVIEWED', 'UTILITY_BILL_SECRET_WARNING_REVIEWED', 'UTILITY_BILL_MOBILE_QA_REVIEWED']) {
  requireCheck(readiness.includes(token), `readiness helper missing ${token}`)
}
requireCheck(exists('app/admin/utility-bill-readiness/page.tsx'), 'admin utility bill page missing')
requireCheck(adminPage.includes('Utility bill readiness') && adminPage.includes('Phase 96') && adminPage.includes('/api/admin/utility-bill-readiness'), 'admin page must show title, phase and API')
requireCheck(exists('app/api/admin/utility-bill-readiness/route.ts'), 'utility bill admin API missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getUtilityBillDisputeReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/utility-bill-readiness-local.mjs'), 'utility bill local evidence script missing')
for (const token of ['utility-bill-readiness.json', 'utility-bill-controls.csv', 'utility-bill-lanes.csv', 'bill-proof-checklist.md', 'sample-bill-dispute-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/utility-bill-readiness'), 'admin shell missing utility bill readiness link')
for (const key of ['UTILITY_BILL_DISPUTE_MODE', 'UTILITY_BILL_OWNER', 'UTILITY_BILL_COPY_REVIEWED', 'UTILITY_BILL_SECRET_WARNING_REVIEWED', 'UTILITY_BILL_OFFICIAL_ROUTE_REVIEWED', 'UTILITY_BILL_MOBILE_QA_REVIEWED', 'UTILITY_BILL_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Utility Bill Dispute Planner Readiness') && launchEvidence.includes('npm run utility-bill:readiness'), 'launch evidence gate missing utility bill readiness')
requireCheck(phase95.includes('3.0.66-utility-bill-dispute-planner'), 'phase95 audit must accept v3.0.66')

console.log('\nPhase 96 utility bill dispute planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 96 utility bill dispute planner readiness checks passed.\n')
