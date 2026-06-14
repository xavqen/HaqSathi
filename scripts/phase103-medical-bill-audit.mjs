// compatibility ladder: 3.0.60-document-expiry-planner 3.0.61-call-visit-logbook 3.0.62-proof-file-organizer 3.0.63-deadline-appeal-planner 3.0.64-warranty-claim-planner 3.0.65-return-pickup-planner 3.0.66-utility-bill-dispute-planner 3.0.67-rent-deposit-dispute-planner 3.0.68-insurance-claim-planner 3.0.69-loan-app-harassment-planner 3.0.70-job-salary-dispute-planner 3.0.71-education-form-correction-planner 3.0.72-travel-refund-cancellation-planner 3.0.73-medical-bill-dispute-planner 3.0.74-telecom-sim-complaint-planner 3.0.75-courier-parcel-dispute-planner 3.0.76-bank-account-freeze-planner 3.0.77-vehicle-challan-dispute-planner 3.0.78-identity-document-correction-planner 3.0.79-lost-document-report-planner 3.0.80-smooth-motion-ui 3.0.81-motion-reveal-polish 3.0.82-motion-loading-interactions 3.0.83-premium-motion-spotlight 3.0.84-final-stabilization 3.0.85-performance-production-pass newer compatible phase new performance release
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/medical-bill-dispute-planner.ts')
const form = read('components/forms/medical-bill-dispute-planner-form.tsx')
const page = read('app/tools/medical-bill-dispute-planner/page.tsx')
const readiness = read('lib/productivity/medical-bill-readiness.ts')
const adminPage = read('app/admin/medical-bill-readiness/page.tsx')
const adminApi = read('app/api/admin/medical-bill-readiness/route.ts')
const localScript = read('scripts/medical-bill-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase102 = read('scripts/phase102-travel-refund-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.scripts['medical-bill:readiness'] === 'node scripts/medical-bill-readiness-local.mjs', 'medical-bill:readiness script missing')
requireCheck(pkg.scripts['phase103:audit'] === 'node scripts/phase103-medical-bill-audit.mjs', 'phase103:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase103:audit'), 'quality:release must include phase103 audit')
for (const file of [
  'lib/productivity/medical-bill-dispute-planner.ts',
  'components/forms/medical-bill-dispute-planner-form.tsx',
  'app/tools/medical-bill-dispute-planner/page.tsx',
  'lib/productivity/medical-bill-readiness.ts',
  'app/admin/medical-bill-readiness/page.tsx',
  'app/api/admin/medical-bill-readiness/route.ts',
  'scripts/medical-bill-readiness-local.mjs'
]) requireCheck(exists(file), `${file} missing`)
for (const token of ['medicalProviderTypes', 'medicalBillIssueTypes', 'buildMedicalBillDisputePlan', 'disputedAmount', 'proofChecklist', 'safetyWarnings', 'copyReadyMessage']) {
  requireCheck(helper.includes(token), `medical bill helper missing ${token}`)
}
for (const token of ['MedicalBillDisputePlannerForm', 'Copy billing message', 'Health + billing safety', 'buildMedicalBillDisputePlan']) {
  requireCheck(form.includes(token), `medical bill form missing ${token}`)
}
requireCheck(page.includes('Medical bill dispute planner') && page.includes('MedicalBillDisputePlannerForm') && page.includes('Safety note'), 'tool page must include title, form and safety note')
for (const token of ['getMedicalBillReadinessReport', 'medicalBillReadinessLanes', 'MEDICAL_BILL_PLANNER_MODE', 'MEDICAL_BILL_COPY_REVIEWED', 'MEDICAL_BILL_PRIVACY_REVIEWED']) {
  requireCheck(readiness.includes(token), `medical bill readiness helper missing ${token}`)
}
requireCheck(adminPage.includes('Medical bill planner readiness') && adminPage.includes('Phase 103') && adminPage.includes('/api/admin/medical-bill-readiness'), 'admin page must show title, phase and API')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getMedicalBillReadinessReport'), 'admin API must require admin and return report')
for (const token of ['medical-bill-readiness.json', 'medical-bill-controls.csv', 'medical-bill-lanes.csv', 'medical-bill-proof-checklist.md', 'sample-medical-bill-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(catalog.includes('/tools/medical-bill-dispute-planner') && catalog.includes('Medical Bill Dispute Planner'), 'tools catalog missing medical bill planner')
requireCheck(sitemap.includes('/tools/medical-bill-dispute-planner'), 'sitemap missing medical bill planner')
requireCheck(adminShell.includes('/admin/medical-bill-readiness'), 'admin shell missing medical bill readiness link')
for (const key of ['MEDICAL_BILL_PLANNER_MODE', 'MEDICAL_BILL_OWNER', 'MEDICAL_BILL_COPY_REVIEWED', 'MEDICAL_BILL_DISCLAIMER_REVIEWED', 'MEDICAL_BILL_PRIVACY_REVIEWED', 'MEDICAL_BILL_MOBILE_QA_REVIEWED', 'MEDICAL_BILL_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Medical Bill Dispute Planner Readiness') && launchEvidence.includes('npm run medical-bill:readiness'), 'launch evidence gate missing medical bill readiness')
requireCheck(phase102.includes('3.0.73-medical-bill-dispute-planner'), 'phase102 audit must accept v3.0.73')

console.log('\nPhase 103 medical bill dispute planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 103 medical bill dispute readiness checks passed.\n')
