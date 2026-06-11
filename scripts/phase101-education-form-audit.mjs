import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/education-form-correction-planner.ts')
const form = read('components/forms/education-form-correction-planner-form.tsx')
const page = read('app/tools/education-form-correction-planner/page.tsx')
const readiness = read('lib/productivity/education-form-readiness.ts')
const adminPage = read('app/admin/education-form-readiness/page.tsx')
const adminApi = read('app/api/admin/education-form-readiness/route.ts')
const localScript = read('scripts/education-form-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase100 = read('scripts/phase100-job-salary-audit.mjs')

requireCheck(['3.0.71-education-form-correction-planner', '3.0.72-travel-refund-cancellation-planner', '3.0.73-medical-bill-dispute-planner', '3.0.74-telecom-sim-complaint-planner', '3.0.75-courier-parcel-dispute-planner', '3.0.76-bank-account-freeze-planner', '3.0.77-vehicle-challan-dispute-planner', '3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.71-education-form-correction-planner')
requireCheck(pkg.scripts['education-form:readiness'] === 'node scripts/education-form-readiness-local.mjs', 'education-form:readiness script missing')
requireCheck(pkg.scripts['phase101:audit'] === 'node scripts/phase101-education-form-audit.mjs', 'phase101:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase101:audit'), 'quality:release must include phase101 audit')
requireCheck(exists('lib/productivity/education-form-correction-planner.ts'), 'education form planner helper missing')
for (const token of ['educationFormTypes', 'educationMistakeTypes', 'buildEducationFormCorrectionPlan', 'copyReadyMessage', 'proofChecklist', 'safetyWarnings']) {
  requireCheck(helper.includes(token), `education form helper missing ${token}`)
}
requireCheck(exists('components/forms/education-form-correction-planner-form.tsx'), 'education form component missing')
for (const token of ['EducationFormCorrectionPlannerForm', 'Copy correction message', 'Official route only', 'buildEducationFormCorrectionPlan']) {
  requireCheck(form.includes(token), `education form component missing ${token}`)
}
requireCheck(exists('app/tools/education-form-correction-planner/page.tsx'), 'education form tool page missing')
requireCheck(page.includes('Education form correction planner') && page.includes('EducationFormCorrectionPlannerForm') && page.includes('Safety note'), 'tool page must include title, form and safety note')
requireCheck(catalog.includes('/tools/education-form-correction-planner') && catalog.includes('Education Form Correction Planner'), 'tools catalog missing education form planner')
requireCheck(sitemap.includes('/tools/education-form-correction-planner'), 'sitemap missing education form planner')
requireCheck(exists('lib/productivity/education-form-readiness.ts'), 'education form readiness helper missing')
for (const token of ['getEducationFormReadinessReport', 'educationFormReadinessLanes', 'EDUCATION_FORM_PLANNER_MODE', 'EDUCATION_FORM_COPY_REVIEWED', 'EDUCATION_FORM_OFFICIAL_ROUTE_REVIEWED', 'EDUCATION_FORM_PRIVACY_REVIEWED']) {
  requireCheck(readiness.includes(token), `readiness helper missing ${token}`)
}
requireCheck(exists('app/admin/education-form-readiness/page.tsx'), 'admin education form page missing')
requireCheck(adminPage.includes('Education form correction readiness') && adminPage.includes('Phase 101') && adminPage.includes('/api/admin/education-form-readiness'), 'admin page must show title, phase and API')
requireCheck(exists('app/api/admin/education-form-readiness/route.ts'), 'education form admin API missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getEducationFormReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/education-form-readiness-local.mjs'), 'education form local evidence script missing')
for (const token of ['education-form-readiness.json', 'education-form-controls.csv', 'education-form-lanes.csv', 'education-form-proof-checklist.md', 'sample-education-form-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/education-form-readiness'), 'admin shell missing education form readiness link')
for (const key of ['EDUCATION_FORM_PLANNER_MODE', 'EDUCATION_FORM_OWNER', 'EDUCATION_FORM_COPY_REVIEWED', 'EDUCATION_FORM_OFFICIAL_ROUTE_REVIEWED', 'EDUCATION_FORM_PRIVACY_REVIEWED', 'EDUCATION_FORM_MOBILE_QA_REVIEWED', 'EDUCATION_FORM_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Education Form Correction Planner Readiness') && launchEvidence.includes('npm run education-form:readiness'), 'launch evidence gate missing education form readiness')
requireCheck(phase100.includes('3.0.71-education-form-correction-planner'), 'phase100 audit must accept v3.0.71')

console.log('\nPhase 101 education form correction planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 101 education form correction readiness checks passed.\n')
