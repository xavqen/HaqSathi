// compatibility ladder: 3.0.60-document-expiry-planner 3.0.61-call-visit-logbook 3.0.62-proof-file-organizer 3.0.63-deadline-appeal-planner 3.0.64-warranty-claim-planner 3.0.65-return-pickup-planner 3.0.66-utility-bill-dispute-planner 3.0.67-rent-deposit-dispute-planner 3.0.68-insurance-claim-planner 3.0.69-loan-app-harassment-planner 3.0.70-job-salary-dispute-planner 3.0.71-education-form-correction-planner 3.0.72-travel-refund-cancellation-planner 3.0.73-medical-bill-dispute-planner 3.0.74-telecom-sim-complaint-planner 3.0.75-courier-parcel-dispute-planner 3.0.76-bank-account-freeze-planner 3.0.77-vehicle-challan-dispute-planner 3.0.78-identity-document-correction-planner 3.0.79-lost-document-report-planner 3.0.80-smooth-motion-ui 3.0.81-motion-reveal-polish 3.0.82-motion-loading-interactions 3.0.83-premium-motion-spotlight 3.0.84-final-stabilization 3.0.85-performance-production-pass newer compatible phase new performance release
import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/deadline-appeal-planner.ts')
const readiness = read('lib/productivity/deadline-appeal-readiness.ts')
const form = read('components/forms/deadline-appeal-planner-form.tsx')
const page = read('app/tools/deadline-appeal-planner/page.tsx')
const adminPage = read('app/admin/deadline-appeal-readiness/page.tsx')
const adminApi = read('app/api/admin/deadline-appeal-readiness/route.ts')
const localScript = read('scripts/deadline-appeal-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase90 = read('scripts/phase90-document-expiry-audit.mjs')
const phase91 = read('scripts/phase91-call-logbook-audit.mjs')
const phase92 = read('scripts/phase92-proof-file-organizer-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.scripts['deadline-appeal:readiness'] === 'node scripts/deadline-appeal-readiness-local.mjs', 'deadline-appeal:readiness script missing')
requireCheck(pkg.scripts['phase93:audit'] === 'node scripts/phase93-deadline-appeal-audit.mjs', 'phase93:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase93:audit'), 'quality:release must include phase93 audit')
requireCheck(exists('lib/productivity/deadline-appeal-planner.ts'), 'deadline appeal planner helper missing')
for (const token of ['deadlineAppealIssueTypes', 'buildDeadlineAppealPlan', 'copyReadyAppealNote', 'proofChecklist', 'safetyWarnings']) {
  requireCheck(helper.includes(token), `deadline helper missing ${token}`)
}
requireCheck(exists('components/forms/deadline-appeal-planner-form.tsx'), 'deadline appeal form missing')
for (const token of ['DeadlineAppealPlannerForm', 'Create deadline plan', 'verify exact appeal/deadline rules', 'Copy appeal', 'buildDeadlineAppealPlan']) {
  requireCheck(form.includes(token), `deadline appeal form missing ${token}`)
}
requireCheck(exists('app/tools/deadline-appeal-planner/page.tsx'), 'deadline appeal tool page missing')
requireCheck(page.includes('Deadline appeal planner') && page.includes('DeadlineAppealPlannerForm'), 'tool page must include title and form')
requireCheck(catalog.includes('/tools/deadline-appeal-planner') && catalog.includes('Deadline Appeal Planner'), 'tools catalog missing deadline appeal planner')
requireCheck(sitemap.includes('/tools/deadline-appeal-planner'), 'sitemap missing deadline appeal planner')
requireCheck(exists('lib/productivity/deadline-appeal-readiness.ts'), 'deadline appeal readiness helper missing')
for (const token of ['getDeadlineAppealReadinessReport', 'deadlineAppealReadinessLanes', 'DEADLINE_APPEAL_PLANNER_MODE', 'DEADLINE_APPEAL_COPY_REVIEWED', 'DEADLINE_APPEAL_LEGAL_REVIEWED', 'DEADLINE_APPEAL_MOBILE_QA_REVIEWED']) {
  requireCheck(readiness.includes(token), `readiness helper missing ${token}`)
}
requireCheck(exists('app/admin/deadline-appeal-readiness/page.tsx'), 'admin deadline appeal page missing')
requireCheck(adminPage.includes('Deadline appeal readiness') && adminPage.includes('Phase 93') && adminPage.includes('/api/admin/deadline-appeal-readiness'), 'admin page must show title, phase and API')
requireCheck(exists('app/api/admin/deadline-appeal-readiness/route.ts'), 'deadline appeal admin API missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getDeadlineAppealReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/deadline-appeal-readiness-local.mjs'), 'deadline appeal local evidence script missing')
for (const token of ['deadline-appeal-readiness.json', 'deadline-appeal-controls.csv', 'deadline-appeal-lanes.csv', 'deadline-appeal-mobile-qa.md', 'sample-appeal-note.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/deadline-appeal-readiness'), 'admin shell missing deadline appeal readiness link')
for (const key of ['DEADLINE_APPEAL_PLANNER_MODE', 'DEADLINE_APPEAL_OWNER', 'DEADLINE_APPEAL_COPY_REVIEWED', 'DEADLINE_APPEAL_LEGAL_REVIEWED', 'DEADLINE_APPEAL_MOBILE_QA_REVIEWED', 'DEADLINE_APPEAL_TRANSLATION_REVIEWED', 'DEADLINE_APPEAL_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Deadline Appeal Planner Readiness') && launchEvidence.includes('npm run deadline-appeal:readiness'), 'launch evidence gate missing deadline appeal readiness')
requireCheck(phase90.includes('3.0.63-deadline-appeal-planner'), 'phase90 audit must accept v3.0.63')
requireCheck(phase91.includes('3.0.63-deadline-appeal-planner'), 'phase91 audit must accept v3.0.63')
requireCheck(phase92.includes('3.0.63-deadline-appeal-planner'), 'phase92 audit must accept v3.0.63')
requireCheck(phase90.includes('3.0.64-warranty-claim-planner') && phase90.includes('3.0.65-return-pickup-planner'), 'phase90 audit must accept v3.0.64 and v3.0.65')
requireCheck(phase91.includes('3.0.64-warranty-claim-planner') && phase91.includes('3.0.65-return-pickup-planner'), 'phase91 audit must accept v3.0.64 and v3.0.65')
requireCheck(phase92.includes('3.0.64-warranty-claim-planner') && phase92.includes('3.0.65-return-pickup-planner'), 'phase92 audit must accept v3.0.64 and v3.0.65')

console.log('\nPhase 93 deadline appeal planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 93 deadline appeal planner readiness checks passed.\n')
