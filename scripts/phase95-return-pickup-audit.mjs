import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/return-pickup-planner.ts')
const form = read('components/forms/return-pickup-planner-form.tsx')
const page = read('app/tools/return-pickup-planner/page.tsx')
const readiness = read('lib/productivity/return-pickup-readiness.ts')
const adminPage = read('app/admin/return-pickup-readiness/page.tsx')
const adminApi = read('app/api/admin/return-pickup-readiness/route.ts')
const localScript = read('scripts/return-pickup-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase90 = read('scripts/phase90-document-expiry-audit.mjs')
const phase91 = read('scripts/phase91-call-logbook-audit.mjs')
const phase92 = read('scripts/phase92-proof-file-organizer-audit.mjs')
const phase93 = read('scripts/phase93-deadline-appeal-audit.mjs')
const phase94 = read('scripts/phase94-warranty-claim-audit.mjs')

requireCheck(pkg.version === '3.0.65-return-pickup-planner' || pkg.version === '3.0.66-utility-bill-dispute-planner' || pkg.version === '3.0.67-rent-deposit-dispute-planner' || ['3.0.68-insurance-claim-planner', '3.0.69-loan-app-harassment-planner', '3.0.70-job-salary-dispute-planner', '3.0.71-education-form-correction-planner', '3.0.72-travel-refund-cancellation-planner', '3.0.73-medical-bill-dispute-planner', '3.0.74-telecom-sim-complaint-planner', '3.0.75-courier-parcel-dispute-planner', '3.0.76-bank-account-freeze-planner', '3.0.77-vehicle-challan-dispute-planner', '3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version) || pkg.version === '3.0.69-loan-app-harassment-planner' || ['3.0.70-job-salary-dispute-planner', '3.0.71-education-form-correction-planner', '3.0.72-travel-refund-cancellation-planner', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.65-return-pickup-planner or newer utility bill release')
requireCheck(pkg.scripts['return-pickup:readiness'] === 'node scripts/return-pickup-readiness-local.mjs', 'return-pickup:readiness script missing')
requireCheck(pkg.scripts['phase95:audit'] === 'node scripts/phase95-return-pickup-audit.mjs', 'phase95:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase95:audit'), 'quality:release must include phase95 audit')
requireCheck(exists('lib/productivity/return-pickup-planner.ts'), 'return pickup planner helper missing')
for (const token of ['returnPickupIssueTypes', 'buildReturnPickupPlan', 'copyReadyMessage', 'proofChecklist', 'pickupChecklist', 'safetyWarnings']) {
  requireCheck(helper.includes(token), `return pickup helper missing ${token}`)
}
requireCheck(exists('components/forms/return-pickup-planner-form.tsx'), 'return pickup form missing')
for (const token of ['ReturnPickupPlannerForm', 'Copy return message', 'refund scam', 'buildReturnPickupPlan']) {
  requireCheck(form.includes(token), `return pickup form missing ${token}`)
}
requireCheck(exists('app/tools/return-pickup-planner/page.tsx'), 'return pickup tool page missing')
requireCheck(page.includes('Return pickup planner') && page.includes('ReturnPickupPlannerForm'), 'tool page must include title and form')
requireCheck(catalog.includes('/tools/return-pickup-planner') && catalog.includes('Return Pickup Planner'), 'tools catalog missing return pickup planner')
requireCheck(sitemap.includes('/tools/return-pickup-planner'), 'sitemap missing return pickup planner')
requireCheck(exists('lib/productivity/return-pickup-readiness.ts'), 'return pickup readiness helper missing')
for (const token of ['getReturnPickupReadinessReport', 'returnPickupReadinessLanes', 'RETURN_PICKUP_PLANNER_MODE', 'RETURN_PICKUP_COPY_REVIEWED', 'RETURN_PICKUP_SCAM_WARNING_REVIEWED', 'RETURN_PICKUP_MOBILE_QA_REVIEWED']) {
  requireCheck(readiness.includes(token), `readiness helper missing ${token}`)
}
requireCheck(exists('app/admin/return-pickup-readiness/page.tsx'), 'admin return pickup page missing')
requireCheck(adminPage.includes('Return pickup readiness') && adminPage.includes('Phase 95') && adminPage.includes('/api/admin/return-pickup-readiness'), 'admin page must show title, phase and API')
requireCheck(exists('app/api/admin/return-pickup-readiness/route.ts'), 'return pickup admin API missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getReturnPickupReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/return-pickup-readiness-local.mjs'), 'return pickup local evidence script missing')
for (const token of ['return-pickup-readiness.json', 'return-pickup-controls.csv', 'return-pickup-lanes.csv', 'pickup-proof-checklist.md', 'sample-return-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/return-pickup-readiness'), 'admin shell missing return pickup readiness link')
for (const key of ['RETURN_PICKUP_PLANNER_MODE', 'RETURN_PICKUP_OWNER', 'RETURN_PICKUP_COPY_REVIEWED', 'RETURN_PICKUP_SCAM_WARNING_REVIEWED', 'RETURN_PICKUP_MOBILE_QA_REVIEWED', 'RETURN_PICKUP_TRANSLATION_REVIEWED', 'RETURN_PICKUP_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Return Pickup Planner Readiness') && launchEvidence.includes('npm run return-pickup:readiness'), 'launch evidence gate missing return pickup readiness')
for (const [label, text] of [['phase90', phase90], ['phase91', phase91], ['phase92', phase92], ['phase93', phase93], ['phase94', phase94]]) {
  requireCheck(text.includes('3.0.65-return-pickup-planner'), `${label} audit must accept v3.0.65`)
}

console.log('\nPhase 95 return pickup planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 95 return pickup planner readiness checks passed.\n')

// accepts 3.0.66-utility-bill-dispute-planner
