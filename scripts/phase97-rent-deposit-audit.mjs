import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/rent-deposit-dispute-planner.ts')
const form = read('components/forms/rent-deposit-dispute-planner-form.tsx')
const page = read('app/tools/rent-deposit-dispute-planner/page.tsx')
const readiness = read('lib/productivity/rent-deposit-readiness.ts')
const adminPage = read('app/admin/rent-deposit-readiness/page.tsx')
const adminApi = read('app/api/admin/rent-deposit-readiness/route.ts')
const localScript = read('scripts/rent-deposit-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase96 = read('scripts/phase96-utility-bill-audit.mjs')

requireCheck(['3.0.67-rent-deposit-dispute-planner', '3.0.68-insurance-claim-planner', '3.0.69-loan-app-harassment-planner', '3.0.70-job-salary-dispute-planner', '3.0.71-education-form-correction-planner', '3.0.72-travel-refund-cancellation-planner', '3.0.73-medical-bill-dispute-planner', '3.0.74-telecom-sim-complaint-planner', '3.0.75-courier-parcel-dispute-planner', '3.0.76-bank-account-freeze-planner', '3.0.77-vehicle-challan-dispute-planner', '3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.67-rent-deposit-dispute-planner or 3.0.68-insurance-claim-planner')
requireCheck(pkg.scripts['rent-deposit:readiness'] === 'node scripts/rent-deposit-readiness-local.mjs', 'rent-deposit:readiness script missing')
requireCheck(pkg.scripts['phase97:audit'] === 'node scripts/phase97-rent-deposit-audit.mjs', 'phase97:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase97:audit'), 'quality:release must include phase97 audit')
requireCheck(exists('lib/productivity/rent-deposit-dispute-planner.ts'), 'rent deposit planner helper missing')
for (const token of ['rentDepositIssueTypes', 'agreementStatuses', 'buildRentDepositDisputePlan', 'copyReadyMessage', 'proofChecklist', 'safetyWarnings']) {
  requireCheck(helper.includes(token), `rent deposit helper missing ${token}`)
}
requireCheck(exists('components/forms/rent-deposit-dispute-planner-form.tsx'), 'rent deposit form missing')
for (const token of ['RentDepositDisputePlannerForm', 'Copy rent dispute message', 'buildRentDepositDisputePlan', 'Safety warnings']) {
  requireCheck(form.includes(token), `rent deposit form missing ${token}`)
}
requireCheck(exists('app/tools/rent-deposit-dispute-planner/page.tsx'), 'rent deposit tool page missing')
requireCheck(page.includes('Rent deposit dispute planner') && page.includes('RentDepositDisputePlannerForm') && page.includes('Guidance only'), 'tool page must include title, form and guidance disclaimer')
requireCheck(catalog.includes('/tools/rent-deposit-dispute-planner') && catalog.includes('Rent Deposit Dispute Planner'), 'tools catalog missing rent deposit planner')
requireCheck(sitemap.includes('/tools/rent-deposit-dispute-planner'), 'sitemap missing rent deposit planner')
requireCheck(exists('lib/productivity/rent-deposit-readiness.ts'), 'rent deposit readiness helper missing')
for (const token of ['getRentDepositReadinessReport', 'rentDepositReadinessLanes', 'RENT_DEPOSIT_PLANNER_MODE', 'RENT_DEPOSIT_COPY_REVIEWED', 'RENT_DEPOSIT_LEGAL_REVIEWED', 'RENT_DEPOSIT_PRIVACY_REVIEWED']) {
  requireCheck(readiness.includes(token), `readiness helper missing ${token}`)
}
requireCheck(exists('app/admin/rent-deposit-readiness/page.tsx'), 'admin rent deposit page missing')
requireCheck(adminPage.includes('Rent deposit readiness') && adminPage.includes('Phase 97') && adminPage.includes('/api/admin/rent-deposit-readiness'), 'admin page must show title, phase and API')
requireCheck(exists('app/api/admin/rent-deposit-readiness/route.ts'), 'rent deposit admin API missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getRentDepositReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/rent-deposit-readiness-local.mjs'), 'rent deposit local evidence script missing')
for (const token of ['rent-deposit-readiness.json', 'rent-deposit-controls.csv', 'rent-deposit-lanes.csv', 'rent-proof-checklist.md', 'sample-rent-dispute-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/rent-deposit-readiness'), 'admin shell missing rent deposit readiness link')
for (const key of ['RENT_DEPOSIT_PLANNER_MODE', 'RENT_DEPOSIT_OWNER', 'RENT_DEPOSIT_COPY_REVIEWED', 'RENT_DEPOSIT_LEGAL_REVIEWED', 'RENT_DEPOSIT_PRIVACY_REVIEWED', 'RENT_DEPOSIT_MOBILE_QA_REVIEWED', 'RENT_DEPOSIT_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Rent Deposit Dispute Planner Readiness') && launchEvidence.includes('npm run rent-deposit:readiness'), 'launch evidence gate missing rent deposit readiness')
requireCheck(phase96.includes('3.0.67-rent-deposit-dispute-planner'), 'phase96 audit must accept v3.0.67')

console.log('\nPhase 97 rent deposit dispute planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 97 rent deposit dispute planner readiness checks passed.\n')
