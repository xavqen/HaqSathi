import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/warranty-claim-planner.ts')
const form = read('components/forms/warranty-claim-planner-form.tsx')
const page = read('app/tools/warranty-claim-planner/page.tsx')
const readiness = read('lib/productivity/warranty-claim-readiness.ts')
const adminPage = read('app/admin/warranty-claim-readiness/page.tsx')
const adminApi = read('app/api/admin/warranty-claim-readiness/route.ts')
const localScript = read('scripts/warranty-claim-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase90 = read('scripts/phase90-document-expiry-audit.mjs')
const phase91 = read('scripts/phase91-call-logbook-audit.mjs')
const phase92 = read('scripts/phase92-proof-file-organizer-audit.mjs')
const phase93 = read('scripts/phase93-deadline-appeal-audit.mjs')

requireCheck(pkg.version === '3.0.64-warranty-claim-planner' || pkg.version === '3.0.65-return-pickup-planner' || pkg.version === '3.0.66-utility-bill-dispute-planner' || pkg.version === '3.0.67-rent-deposit-dispute-planner' || ['3.0.68-insurance-claim-planner', '3.0.69-loan-app-harassment-planner', '3.0.70-job-salary-dispute-planner', '3.0.71-education-form-correction-planner', '3.0.72-travel-refund-cancellation-planner', '3.0.73-medical-bill-dispute-planner', '3.0.74-telecom-sim-complaint-planner', '3.0.75-courier-parcel-dispute-planner', '3.0.76-bank-account-freeze-planner', '3.0.77-vehicle-challan-dispute-planner', '3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version) || pkg.version === '3.0.69-loan-app-harassment-planner' || ['3.0.70-job-salary-dispute-planner', '3.0.71-education-form-correction-planner', '3.0.72-travel-refund-cancellation-planner', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.64-warranty-claim-planner or newer return pickup release')
requireCheck(pkg.scripts['warranty-claim:readiness'] === 'node scripts/warranty-claim-readiness-local.mjs', 'warranty-claim:readiness script missing')
requireCheck(pkg.scripts['phase94:audit'] === 'node scripts/phase94-warranty-claim-audit.mjs', 'phase94:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase94:audit'), 'quality:release must include phase94 audit')
requireCheck(exists('lib/productivity/warranty-claim-planner.ts'), 'warranty claim planner helper missing')
for (const token of ['warrantyClaimProductTypes', 'buildWarrantyClaimPlan', 'copyReadyClaim', 'proofChecklist', 'serviceVisitQuestions', 'privacyWarnings']) {
  requireCheck(helper.includes(token), `warranty helper missing ${token}`)
}
requireCheck(exists('components/forms/warranty-claim-planner-form.tsx'), 'warranty claim form missing')
for (const token of ['WarrantyClaimPlannerForm', 'Copy warranty claim', 'service center', 'buildWarrantyClaimPlan']) {
  requireCheck(form.includes(token), `warranty form missing ${token}`)
}
requireCheck(exists('app/tools/warranty-claim-planner/page.tsx'), 'warranty claim tool page missing')
requireCheck(page.includes('Warranty claim planner') && page.includes('WarrantyClaimPlannerForm'), 'tool page must include title and form')
requireCheck(catalog.includes('/tools/warranty-claim-planner') && catalog.includes('Warranty Claim Planner'), 'tools catalog missing warranty claim planner')
requireCheck(sitemap.includes('/tools/warranty-claim-planner'), 'sitemap missing warranty claim planner')
requireCheck(exists('lib/productivity/warranty-claim-readiness.ts'), 'warranty claim readiness helper missing')
for (const token of ['getWarrantyClaimReadinessReport', 'warrantyClaimReadinessLanes', 'WARRANTY_CLAIM_PLANNER_MODE', 'WARRANTY_CLAIM_COPY_REVIEWED', 'WARRANTY_CLAIM_PRIVACY_REVIEWED', 'WARRANTY_CLAIM_MOBILE_QA_REVIEWED']) {
  requireCheck(readiness.includes(token), `readiness helper missing ${token}`)
}
requireCheck(exists('app/admin/warranty-claim-readiness/page.tsx'), 'admin warranty claim page missing')
requireCheck(adminPage.includes('Warranty claim readiness') && adminPage.includes('Phase 94') && adminPage.includes('/api/admin/warranty-claim-readiness'), 'admin page must show title, phase and API')
requireCheck(exists('app/api/admin/warranty-claim-readiness/route.ts'), 'warranty claim admin API missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getWarrantyClaimReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/warranty-claim-readiness-local.mjs'), 'warranty claim local evidence script missing')
for (const token of ['warranty-claim-readiness.json', 'warranty-claim-controls.csv', 'warranty-claim-lanes.csv', 'service-center-visit-checklist.md', 'sample-warranty-claim.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/warranty-claim-readiness'), 'admin shell missing warranty claim readiness link')
for (const key of ['WARRANTY_CLAIM_PLANNER_MODE', 'WARRANTY_CLAIM_OWNER', 'WARRANTY_CLAIM_COPY_REVIEWED', 'WARRANTY_CLAIM_PRIVACY_REVIEWED', 'WARRANTY_CLAIM_MOBILE_QA_REVIEWED', 'WARRANTY_CLAIM_TRANSLATION_REVIEWED', 'WARRANTY_CLAIM_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Warranty Claim Planner Readiness') && launchEvidence.includes('npm run warranty-claim:readiness'), 'launch evidence gate missing warranty claim readiness')
requireCheck(phase90.includes('3.0.64-warranty-claim-planner') && phase90.includes('3.0.65-return-pickup-planner'), 'phase90 audit must accept v3.0.64 and v3.0.65')
requireCheck(phase91.includes('3.0.64-warranty-claim-planner') && phase91.includes('3.0.65-return-pickup-planner'), 'phase91 audit must accept v3.0.64 and v3.0.65')
requireCheck(phase92.includes('3.0.64-warranty-claim-planner') && phase92.includes('3.0.65-return-pickup-planner'), 'phase92 audit must accept v3.0.64 and v3.0.65')
requireCheck(phase93.includes('3.0.64-warranty-claim-planner') && phase93.includes('3.0.65-return-pickup-planner'), 'phase93 audit must accept v3.0.64 and v3.0.65')

console.log('\nPhase 94 warranty claim planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 94 warranty claim planner readiness checks passed.\n')
