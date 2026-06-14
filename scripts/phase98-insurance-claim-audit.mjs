// compatibility ladder: 3.0.60-document-expiry-planner 3.0.61-call-visit-logbook 3.0.62-proof-file-organizer 3.0.63-deadline-appeal-planner 3.0.64-warranty-claim-planner 3.0.65-return-pickup-planner 3.0.66-utility-bill-dispute-planner 3.0.67-rent-deposit-dispute-planner 3.0.68-insurance-claim-planner 3.0.69-loan-app-harassment-planner 3.0.70-job-salary-dispute-planner 3.0.71-education-form-correction-planner 3.0.72-travel-refund-cancellation-planner 3.0.73-medical-bill-dispute-planner 3.0.74-telecom-sim-complaint-planner 3.0.75-courier-parcel-dispute-planner 3.0.76-bank-account-freeze-planner 3.0.77-vehicle-challan-dispute-planner 3.0.78-identity-document-correction-planner 3.0.79-lost-document-report-planner 3.0.80-smooth-motion-ui 3.0.81-motion-reveal-polish 3.0.82-motion-loading-interactions 3.0.83-premium-motion-spotlight 3.0.84-final-stabilization 3.0.85-performance-production-pass newer compatible phase new performance release
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/insurance-claim-planner.ts')
const form = read('components/forms/insurance-claim-planner-form.tsx')
const page = read('app/tools/insurance-claim-planner/page.tsx')
const readiness = read('lib/productivity/insurance-claim-readiness.ts')
const adminPage = read('app/admin/insurance-claim-readiness/page.tsx')
const adminApi = read('app/api/admin/insurance-claim-readiness/route.ts')
const localScript = read('scripts/insurance-claim-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase97 = read('scripts/phase97-rent-deposit-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.scripts['insurance-claim:readiness'] === 'node scripts/insurance-claim-readiness-local.mjs', 'insurance-claim:readiness script missing')
requireCheck(pkg.scripts['phase98:audit'] === 'node scripts/phase98-insurance-claim-audit.mjs', 'phase98:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase98:audit'), 'quality:release must include phase98 audit')
requireCheck(exists('lib/productivity/insurance-claim-planner.ts'), 'insurance claim planner helper missing')
for (const token of ['insuranceClaimTypes', 'buildInsuranceClaimPlan', 'copyReadyMessage', 'proofChecklist', 'safetyWarnings']) {
  requireCheck(helper.includes(token), `insurance claim helper missing ${token}`)
}
requireCheck(exists('components/forms/insurance-claim-planner-form.tsx'), 'insurance claim form missing')
for (const token of ['InsuranceClaimPlannerForm', 'Copy insurance claim message', 'buildInsuranceClaimPlan', 'Secret safety']) {
  requireCheck(form.includes(token), `insurance claim form missing ${token}`)
}
requireCheck(exists('app/tools/insurance-claim-planner/page.tsx'), 'insurance claim tool page missing')
requireCheck(page.includes('Insurance claim planner') && page.includes('InsuranceClaimPlannerForm') && page.includes('Guidance only'), 'tool page must include title, form and guidance disclaimer')
requireCheck(catalog.includes('/tools/insurance-claim-planner') && catalog.includes('Insurance Claim Planner'), 'tools catalog missing insurance claim planner')
requireCheck(sitemap.includes('/tools/insurance-claim-planner'), 'sitemap missing insurance claim planner')
requireCheck(exists('lib/productivity/insurance-claim-readiness.ts'), 'insurance claim readiness helper missing')
for (const token of ['getInsuranceClaimReadinessReport', 'insuranceClaimReadinessLanes', 'INSURANCE_CLAIM_PLANNER_MODE', 'INSURANCE_CLAIM_COPY_REVIEWED', 'INSURANCE_CLAIM_SECRET_WARNING_REVIEWED', 'INSURANCE_CLAIM_PRIVACY_REVIEWED']) {
  requireCheck(readiness.includes(token), `readiness helper missing ${token}`)
}
requireCheck(exists('app/admin/insurance-claim-readiness/page.tsx'), 'admin insurance claim page missing')
requireCheck(adminPage.includes('Insurance claim readiness') && adminPage.includes('Phase 98') && adminPage.includes('/api/admin/insurance-claim-readiness'), 'admin page must show title, phase and API')
requireCheck(exists('app/api/admin/insurance-claim-readiness/route.ts'), 'insurance claim admin API missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getInsuranceClaimReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/insurance-claim-readiness-local.mjs'), 'insurance claim local evidence script missing')
for (const token of ['insurance-claim-readiness.json', 'insurance-claim-controls.csv', 'insurance-claim-lanes.csv', 'insurance-claim-proof-checklist.md', 'sample-insurance-claim-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/insurance-claim-readiness'), 'admin shell missing insurance claim readiness link')
for (const key of ['INSURANCE_CLAIM_PLANNER_MODE', 'INSURANCE_CLAIM_OWNER', 'INSURANCE_CLAIM_COPY_REVIEWED', 'INSURANCE_CLAIM_SECRET_WARNING_REVIEWED', 'INSURANCE_CLAIM_PRIVACY_REVIEWED', 'INSURANCE_CLAIM_MOBILE_QA_REVIEWED', 'INSURANCE_CLAIM_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Insurance Claim Planner Readiness') && launchEvidence.includes('npm run insurance-claim:readiness'), 'launch evidence gate missing insurance claim readiness')
requireCheck(phase97.includes('3.0.68-insurance-claim-planner'), 'phase97 audit must accept current product versions')

console.log('\nPhase 98 insurance claim planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 98 insurance claim planner readiness checks passed.\n')
