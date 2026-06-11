import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/loan-app-harassment-planner.ts')
const form = read('components/forms/loan-app-harassment-planner-form.tsx')
const page = read('app/tools/loan-app-harassment-planner/page.tsx')
const readiness = read('lib/productivity/loan-app-readiness.ts')
const adminPage = read('app/admin/loan-app-readiness/page.tsx')
const adminApi = read('app/api/admin/loan-app-readiness/route.ts')
const localScript = read('scripts/loan-app-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase98 = read('scripts/phase98-insurance-claim-audit.mjs')

requireCheck(['3.0.69-loan-app-harassment-planner', '3.0.70-job-salary-dispute-planner', '3.0.71-education-form-correction-planner', '3.0.72-travel-refund-cancellation-planner', '3.0.73-medical-bill-dispute-planner', '3.0.74-telecom-sim-complaint-planner', '3.0.75-courier-parcel-dispute-planner', '3.0.76-bank-account-freeze-planner', '3.0.77-vehicle-challan-dispute-planner', '3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.69-loan-app-harassment-planner or 3.0.70-job-salary-dispute-planner')
requireCheck(pkg.scripts['loan-app:readiness'] === 'node scripts/loan-app-readiness-local.mjs', 'loan-app:readiness script missing')
requireCheck(pkg.scripts['phase99:audit'] === 'node scripts/phase99-loan-app-audit.mjs', 'phase99:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase99:audit'), 'quality:release must include phase99 audit')
requireCheck(exists('lib/productivity/loan-app-harassment-planner.ts'), 'loan app planner helper missing')
for (const token of ['loanAppIssueTypes', 'buildLoanAppHarassmentPlan', 'copyReadyMessage', 'proofChecklist', 'safetyWarnings']) {
  requireCheck(helper.includes(token), `loan app helper missing ${token}`)
}
requireCheck(exists('components/forms/loan-app-harassment-planner-form.tsx'), 'loan app form missing')
for (const token of ['LoanAppHarassmentPlannerForm', 'Copy loan app message', 'buildLoanAppHarassmentPlan', 'Immediate safety']) {
  requireCheck(form.includes(token), `loan app form missing ${token}`)
}
requireCheck(exists('app/tools/loan-app-harassment-planner/page.tsx'), 'loan app tool page missing')
requireCheck(page.includes('Loan app harassment planner') && page.includes('LoanAppHarassmentPlannerForm') && page.includes('Safety note'), 'tool page must include title, form and safety note')
requireCheck(catalog.includes('/tools/loan-app-harassment-planner') && catalog.includes('Loan App Harassment Planner'), 'tools catalog missing loan app harassment planner')
requireCheck(sitemap.includes('/tools/loan-app-harassment-planner'), 'sitemap missing loan app harassment planner')
requireCheck(exists('lib/productivity/loan-app-readiness.ts'), 'loan app readiness helper missing')
for (const token of ['getLoanAppReadinessReport', 'loanAppReadinessLanes', 'LOAN_APP_PLANNER_MODE', 'LOAN_APP_COPY_REVIEWED', 'LOAN_APP_SAFETY_REVIEWED', 'LOAN_APP_PRIVACY_REVIEWED']) {
  requireCheck(readiness.includes(token), `readiness helper missing ${token}`)
}
requireCheck(exists('app/admin/loan-app-readiness/page.tsx'), 'admin loan app page missing')
requireCheck(adminPage.includes('Loan app harassment readiness') && adminPage.includes('Phase 99') && adminPage.includes('/api/admin/loan-app-readiness'), 'admin page must show title, phase and API')
requireCheck(exists('app/api/admin/loan-app-readiness/route.ts'), 'loan app admin API missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getLoanAppReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/loan-app-readiness-local.mjs'), 'loan app local evidence script missing')
for (const token of ['loan-app-readiness.json', 'loan-app-controls.csv', 'loan-app-lanes.csv', 'loan-app-proof-checklist.md', 'sample-loan-app-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/loan-app-readiness'), 'admin shell missing loan app readiness link')
for (const key of ['LOAN_APP_PLANNER_MODE', 'LOAN_APP_OWNER', 'LOAN_APP_COPY_REVIEWED', 'LOAN_APP_SAFETY_REVIEWED', 'LOAN_APP_PRIVACY_REVIEWED', 'LOAN_APP_MOBILE_QA_REVIEWED', 'LOAN_APP_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Loan App Harassment Planner Readiness') && launchEvidence.includes('npm run loan-app:readiness'), 'launch evidence gate missing loan app readiness')
requireCheck(phase98.includes('3.0.69-loan-app-harassment-planner'), 'phase98 audit must accept v3.0.69')

console.log('\nPhase 99 loan app harassment planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 99 loan app harassment readiness checks passed.\n')
